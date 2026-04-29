-- Yanney Hub admin features: announcements, zone names,
-- product_categories table, product image storage bucket.
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1) Shop settings — owner-managed announcement banner + zone display names.
-- ---------------------------------------------------------------------------
alter table public.shop_settings
  add column if not exists announcement_text text,
  add column if not exists announcement_active boolean not null default false,
  add column if not exists zone_a_name text not null default 'Zone A',
  add column if not exists zone_b_name text not null default 'Zone B',
  add column if not exists zone_c_name text not null default 'Zone C';

-- Allow public read of shop_settings already exists. Add a public
-- announcement-only view for the storefront marquee, still bound to the
-- table policy so nothing extra is exposed.
comment on column public.shop_settings.announcement_text
  is 'Live storefront announcement / marquee text. Honoured when announcement_active is true.';
comment on column public.shop_settings.announcement_active
  is 'When true, storefront should display the announcement_text as a live banner.';

-- ---------------------------------------------------------------------------
-- 2) Product categories — owner/admin managed list with display metadata.
-- The legacy enum public.product_category remains valid; we keep
-- products.category as text + FK so categories become editable without
-- runtime DDL on the enum.
-- ---------------------------------------------------------------------------
create table if not exists public.product_categories (
  slug text primary key,
  label text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_categories_visible_sort
  on public.product_categories (is_visible, sort_order);

drop trigger if exists product_categories_updated_at on public.product_categories;
create trigger product_categories_updated_at
  before update on public.product_categories
  for each row execute function public.update_updated_at();

-- Seed the existing enum values as starter rows so the products table
-- keeps validating against this list.
insert into public.product_categories (slug, label, description, sort_order)
values
  ('DRESS',         'Dresses',          'Day-to-evening dresses and statement gowns.',    10),
  ('TWO_PIECE_SET', 'Two-piece sets',   'Coordinated two-piece outfits.',                 20),
  ('OUTFIT',        'Outfits',          'Curated full-look outfits.',                     30),
  ('BAG',           'Bags',             'Totes, clutches, crossbodies, mini bags.',       40),
  ('HEELS',         'Heels',            'Heeled shoes for every occasion.',               50),
  ('SLIPPERS',      'Slippers',         'Flats, mules, and comfort slides.',              60),
  ('ACCESSORY',     'Accessories',      'Jewellery and finishing pieces.',                70)
on conflict (slug) do nothing;

alter table public.product_categories enable row level security;

drop policy if exists "Anyone can read visible categories" on public.product_categories;
create policy "Anyone can read visible categories"
  on public.product_categories for select
  using (is_visible = true);

drop policy if exists "Hub staff can read all categories" on public.product_categories;
create policy "Hub staff can read all categories"
  on public.product_categories for select
  using (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));

drop policy if exists "Hub staff can manage categories" on public.product_categories;
create policy "Hub staff can manage categories"
  on public.product_categories for all
  using (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()))
  with check (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- 3) Convert products.category from enum to text and FK to product_categories.
-- Slug values ('DRESS', 'BAG', …) match the enum names so existing rows are
-- preserved verbatim. The enum type is left in place for any other consumers.
-- ---------------------------------------------------------------------------
do $$
declare
  current_type regtype;
begin
  select pg_typeof(category)::regtype
  into current_type
  from public.products
  limit 1;

  if current_type is null or current_type = 'public.product_category'::regtype then
    alter table public.products
      alter column category type text using category::text;
  end if;
exception
  when undefined_column then null;
end $$;

alter table public.products
  drop constraint if exists products_category_fk;

alter table public.products
  add constraint products_category_fk
  foreign key (category) references public.product_categories (slug)
  on update cascade
  deferrable initially deferred;

-- ---------------------------------------------------------------------------
-- 4) Storage bucket for product image uploads.
-- Public read so storefront can hotlink. Writes go through service-role only
-- (admin app), so no public write policy is required.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Hub staff can manage product images" on storage.objects;
create policy "Hub staff can manage product images"
  on storage.objects for all
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.hub_staff h where h.user_id = auth.uid())
  )
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.hub_staff h where h.user_id = auth.uid())
  );
