-- Delivery riders: hub assigns orders; owner manages roster.

create table if not exists public.delivery_riders (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  phone text,
  vehicle_note text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_delivery_riders_active on public.delivery_riders (is_active) where is_active = true;

drop trigger if exists delivery_riders_updated_at on public.delivery_riders;
create trigger delivery_riders_updated_at
  before update on public.delivery_riders
  for each row execute function public.update_updated_at();

alter table public.orders add column if not exists delivery_rider_id uuid references public.delivery_riders (id) on delete set null;

create index if not exists idx_orders_delivery_rider_id on public.orders (delivery_rider_id);

alter table public.delivery_riders enable row level security;

drop policy if exists "hub_staff_select_riders" on public.delivery_riders;
create policy "hub_staff_select_riders"
  on public.delivery_riders for select
  using (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));

drop policy if exists "hub_owner_insert_riders" on public.delivery_riders;
create policy "hub_owner_insert_riders"
  on public.delivery_riders for insert
  with check (
    exists (
      select 1 from public.hub_staff h
      where h.user_id = auth.uid() and h.role = 'owner'::public.hub_role
    )
  );

drop policy if exists "hub_owner_update_riders" on public.delivery_riders;
create policy "hub_owner_update_riders"
  on public.delivery_riders for update
  using (
    exists (
      select 1 from public.hub_staff h
      where h.user_id = auth.uid() and h.role = 'owner'::public.hub_role
    )
  )
  with check (
    exists (
      select 1 from public.hub_staff h
      where h.user_id = auth.uid() and h.role = 'owner'::public.hub_role
    )
  );

comment on table public.delivery_riders is 'Boutique delivery riders; owner CRUD, hub staff read + assign on orders';
