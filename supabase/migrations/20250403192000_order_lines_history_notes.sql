-- Normalized order line items + status history + internal notes
-- References auth.users for staff actions (Yanney Hub) — not admin_users from master prompt.

create table if not exists public.order_line_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name_snapshot text not null,
  image_url_snapshot text,
  category text,
  size text,
  color text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10, 2) not null,
  line_subtotal numeric(10, 2) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_line_items_order_id on public.order_line_items (order_id);
create index if not exists idx_order_line_items_product_id on public.order_line_items (product_id);

alter table public.order_line_items enable row level security;

drop policy if exists "Hub staff manage order line items" on public.order_line_items;
create policy "Hub staff manage order line items"
  on public.order_line_items for all
  using (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()))
  with check (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));

drop policy if exists "Customers read own order line items" on public.order_line_items;
create policy "Customers read own order line items"
  on public.order_line_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_line_items.order_id
        and o.user_id is not null
        and o.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Status history (master prompt; public read matches spec — tighten if needed)
-- ---------------------------------------------------------------------------
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references auth.users (id) on delete set null,
  changed_by_name text,
  note text,
  changed_at timestamptz not null default now()
);

create index if not exists idx_order_status_history_order on public.order_status_history (order_id, changed_at desc);

alter table public.order_status_history enable row level security;

drop policy if exists "Hub staff manage status history" on public.order_status_history;
create policy "Hub staff manage status history"
  on public.order_status_history for all
  using (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()))
  with check (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));

drop policy if exists "Public read status history" on public.order_status_history;
create policy "Public read status history"
  on public.order_status_history for select
  using (true);

-- ---------------------------------------------------------------------------
-- Order notes (hub only — never exposed to anonymous clients)
-- ---------------------------------------------------------------------------
create table if not exists public.order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_notes_order on public.order_notes (order_id, created_at desc);

alter table public.order_notes enable row level security;

drop policy if exists "Hub staff manage order notes" on public.order_notes;
create policy "Hub staff manage order notes"
  on public.order_notes for all
  using (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()))
  with check (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));
