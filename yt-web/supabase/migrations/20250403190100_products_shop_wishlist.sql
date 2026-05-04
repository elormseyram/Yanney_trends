-- Products (inventory in sizes JSONB), shop_settings, wishlists — master prompt + hub_staff RLS

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  category public.product_category not null,
  price numeric(10, 2) not null,
  sale_price numeric(10, 2),
  sizes jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  mood_tags text[] not null default '{}',
  occasion_tags text[] not null default '{}',
  outfit_group_id uuid,
  pairing_ids uuid[] not null default '{}',
  popularity_score integer not null default 0,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_unique unique (slug)
);

create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_is_published on public.products (is_published) where is_published = true;
create index if not exists idx_products_outfit_group on public.products (outfit_group_id);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at();

alter table public.products enable row level security;

drop policy if exists "Anyone can read published products" on public.products;
create policy "Anyone can read published products"
  on public.products for select
  using (is_published = true);

drop policy if exists "Hub staff can manage products" on public.products;
create policy "Hub staff can manage products"
  on public.products for all
  using (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()))
  with check (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Shop settings (singleton-style; master prompt)
-- ---------------------------------------------------------------------------
create table if not exists public.shop_settings (
  id uuid primary key default gen_random_uuid(),
  shop_name text not null default 'Yanney Trendss',
  tagline text default 'Style That Speaks Before You Do',
  shop_address text,
  whatsapp_number text,
  instagram_handle text,
  delivery_days text[] default array['Monday', 'Wednesday', 'Friday']::text[],
  delivery_cutoff_day text default 'Sunday',
  delivery_cutoff_time time default time '20:00',
  zone_a_fee numeric(10, 2) default 15,
  zone_b_fee numeric(10, 2) default 25,
  zone_c_fee numeric(10, 2) default 40,
  max_pod_amount numeric(10, 2) default 200,
  pickup_hours text default 'Mon–Sat: 9AM–6PM',
  shop_is_open boolean not null default true,
  delivery_available boolean not null default true,
  pickup_available boolean not null default true,
  notify_email boolean not null default true,
  notify_sms boolean not null default true,
  notify_whatsapp boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.shop_settings (shop_name)
select 'Yanney Trendss'
where not exists (select 1 from public.shop_settings limit 1);

alter table public.shop_settings enable row level security;

drop policy if exists "Anyone can read shop settings" on public.shop_settings;
create policy "Anyone can read shop settings"
  on public.shop_settings for select
  using (true);

drop policy if exists "Hub owners can update shop settings" on public.shop_settings;
create policy "Hub owners can update shop settings"
  on public.shop_settings for update
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

-- ---------------------------------------------------------------------------
-- Wishlists (session-based; tighten later with RLS matching session claim)
-- ---------------------------------------------------------------------------
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint wishlists_session_product unique (session_id, product_id)
);

create index if not exists idx_wishlists_session on public.wishlists (session_id);

alter table public.wishlists enable row level security;

drop policy if exists "Wishlist open by session MVP" on public.wishlists;
-- MVP: matches master prompt; replace with signed session / user id when auth wishlists ship
create policy "Wishlist open by session MVP"
  on public.wishlists for all
  using (true)
  with check (true);
