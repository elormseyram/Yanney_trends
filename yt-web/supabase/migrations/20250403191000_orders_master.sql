-- Orders — full shape from YANNEY_TRENDS_MASTER_CURSOR_PROMPT.md + Yanney Hub + gift columns
-- Requires: core (hub_staff), master enums, products optional for line items (separate migration).
-- If public.orders already exists from an older baseline, back up data and migrate manually or drop orders (cascade) on a dev DB before re-running.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null,
  customer_name text not null default '',
  customer_email text,
  customer_phone text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  fulfillment_type public.fulfillment_type not null default 'PICKUP',
  delivery_address text,
  delivery_zone text,
  scheduled_date date,
  scheduled_slot text,
  rider_service text,
  pickup_date date,
  pickup_time_slot text,
  payment_method public.payment_method not null default 'PAYSTACK_CARD',
  payment_status public.payment_status not null default 'PENDING',
  paystack_reference text,
  paystack_verified boolean not null default false,
  momo_number text,
  status public.order_status not null default 'PENDING',
  source public.order_source not null default 'WEBSITE',
  channel_ref text,
  user_id uuid references auth.users (id) on delete set null,
  currency text not null default 'GHS',
  metadata jsonb not null default '{}'::jsonb,
  is_gift_order boolean not null default false,
  gift_message text,
  hide_price boolean not null default false,
  relationship text,
  self_arranged_service text,
  buyer_email_snapshot text,
  buyer_name_snapshot text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_order_number_key unique (order_number)
);

create index if not exists idx_orders_user_id on public.orders (user_id);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_payment_status on public.orders (payment_status);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();

alter table public.orders enable row level security;

-- Master: public tracking reads (scope sensitive fields in app / use service role for production hardening)
drop policy if exists "Public can read orders for tracking" on public.orders;
create policy "Public can read orders for tracking"
  on public.orders for select
  using (true);

drop policy if exists "hub_staff_select_orders" on public.orders;
create policy "hub_staff_select_orders"
  on public.orders for select
  using (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));

drop policy if exists "hub_staff_update_orders" on public.orders;
create policy "hub_staff_update_orders"
  on public.orders for update
  using (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));

drop policy if exists "hub_staff_insert_orders" on public.orders;
create policy "hub_staff_insert_orders"
  on public.orders for insert
  with check (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));

drop policy if exists "customers_select_own_orders" on public.orders;
create policy "customers_select_own_orders"
  on public.orders for select
  using (auth.uid() is not null and user_id is not null and auth.uid() = user_id);

drop policy if exists "customers_insert_own_orders" on public.orders;
create policy "customers_insert_own_orders"
  on public.orders for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "customers_update_own_orders" on public.orders;
create policy "customers_update_own_orders"
  on public.orders for update
  using (auth.uid() is not null and user_id is not null and auth.uid() = user_id);

drop policy if exists "guest_insert_orders" on public.orders;
create policy "guest_insert_orders"
  on public.orders for insert
  with check (user_id is null);
