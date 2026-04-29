-- Admin-curated runway / inspo outfit posts (bundle price + linked products).
-- Idempotent.

create table if not exists public.runway_outfit_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  hero_image_url text,
  product_ids uuid[] not null default '{}'::uuid[],
  bundle_price_ghs numeric(10, 2) not null default 0,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists runway_outfit_posts_updated_at on public.runway_outfit_posts;
create trigger runway_outfit_posts_updated_at
  before update on public.runway_outfit_posts
  for each row execute function public.update_updated_at();

alter table public.runway_outfit_posts enable row level security;

drop policy if exists "Anyone can read published runway outfits" on public.runway_outfit_posts;
create policy "Anyone can read published runway outfits"
  on public.runway_outfit_posts for select
  using (is_published = true);

drop policy if exists "Hub staff can manage runway outfit posts" on public.runway_outfit_posts;
create policy "Hub staff can manage runway outfit posts"
  on public.runway_outfit_posts for all
  using (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()))
  with check (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));

comment on table public.runway_outfit_posts is 'Owner-curated full looks for the storefront runway / inspo board.';
