-- Yanney Trends — core tables shared by yt-web (storefront) and yt-admin (hub).
-- Apply in Supabase: SQL Editor → New query → paste → Run
-- Or: supabase db push (if using Supabase CLI linked to this project)

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Hub staff (admin / owner) — for yt-admin after Supabase Auth replaces demo cookie
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.hub_role as enum ('admin', 'owner');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.hub_staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.hub_role not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.hub_staff enable row level security;

drop policy if exists "hub_staff_select_self" on public.hub_staff;
create policy "hub_staff_select_self"
  on public.hub_staff for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Site config (feature flags, public copy) — optional reads from storefront
-- ---------------------------------------------------------------------------
create table if not exists public.site_config (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_config enable row level security;

drop policy if exists "site_config_public_read" on public.site_config;
create policy "site_config_public_read"
  on public.site_config for select
  using (key in ('health', 'storefront_meta'));

insert into public.site_config (key, value)
values
  ('health', '{"status": "ok"}'::jsonb),
  ('storefront_meta', '{"name": "Yanney Trends", "tagline": "Style that speaks before you do"}'::jsonb)
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();
