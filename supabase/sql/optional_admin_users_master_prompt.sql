-- OPTIONAL — from YANNEY_TRENDS_MASTER_CURSOR_PROMPT.md §2
-- Yanney Hub uses public.hub_staff + auth.users instead. Only run this if you add
-- features that query admin_users directly.

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  supabase_uid uuid unique references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'STAFF',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

alter table public.admin_users enable row level security;

drop policy if exists "Admin users can read own row" on public.admin_users;
create policy "Admin users can read own row"
  on public.admin_users for select
  using (supabase_uid = auth.uid());

drop policy if exists "Hub owners read admin_users" on public.admin_users;
create policy "Hub owners read admin_users"
  on public.admin_users for select
  using (
    exists (
      select 1 from public.hub_staff h
      where h.user_id = auth.uid() and h.role = 'owner'
    )
  );

drop policy if exists "Hub owners manage admin_users" on public.admin_users;
create policy "Hub owners manage admin_users"
  on public.admin_users for all
  using (
    exists (
      select 1 from public.hub_staff h
      where h.user_id = auth.uid() and h.role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.hub_staff h
      where h.user_id = auth.uid() and h.role = 'owner'
    )
  );
