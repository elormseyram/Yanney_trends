-- Patch legacy `orders` rows that used total_cents / subtotal_cents (older baseline) so hub queries
-- using `total`, `subtotal`, `delivery_fee`, `discount_amount`, `items` work.
-- Safe to run on fresh DBs (IF NOT EXISTS / no-op updates).

alter table public.orders add column if not exists subtotal numeric(10, 2);
alter table public.orders add column if not exists delivery_fee numeric(10, 2);
alter table public.orders add column if not exists discount_amount numeric(10, 2);
alter table public.orders add column if not exists total numeric(10, 2);
alter table public.orders add column if not exists items jsonb not null default '[]'::jsonb;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'total_cents'
  ) then
    update public.orders
    set
      total = coalesce(total, total_cents::numeric / 100)
    where total is null and total_cents is not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'subtotal_cents'
  ) then
    update public.orders
    set subtotal = coalesce(subtotal, subtotal_cents::numeric / 100)
    where subtotal is null and subtotal_cents is not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'delivery_fee_cents'
  ) then
    update public.orders
    set delivery_fee = coalesce(delivery_fee, delivery_fee_cents::numeric / 100)
    where delivery_fee is null and delivery_fee_cents is not null;
  end if;
end $$;

update public.orders set subtotal = coalesce(subtotal, 0) where subtotal is null;
update public.orders set delivery_fee = coalesce(delivery_fee, 0) where delivery_fee is null;
update public.orders set discount_amount = coalesce(discount_amount, 0) where discount_amount is null;
update public.orders set total = coalesce(total, 0) where total is null;

alter table public.orders alter column subtotal set default 0;
alter table public.orders alter column delivery_fee set default 0;
alter table public.orders alter column discount_amount set default 0;
alter table public.orders alter column total set default 0;
