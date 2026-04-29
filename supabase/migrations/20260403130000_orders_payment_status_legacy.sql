-- Hub + storefront expect public.orders.payment_status (enum).
-- Older databases may have orders without this column (e.g. partial migrations).

do $$
begin
  create type public.payment_status as enum ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
exception
  when duplicate_object then null;
end $$;

alter table public.orders add column if not exists payment_status public.payment_status;

update public.orders
set payment_status = 'PENDING'::public.payment_status
where payment_status is null;

alter table public.orders
  alter column payment_status set default 'PENDING'::public.payment_status;

alter table public.orders
  alter column payment_status set not null;

create index if not exists idx_orders_payment_status on public.orders (payment_status);
