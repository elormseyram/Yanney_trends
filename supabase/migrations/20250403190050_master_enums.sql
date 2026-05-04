-- Yanney Trendss — enums from YANNEY_TRENDS_MASTER_CURSOR_PROMPT.md (+ app extras)
-- Run after 20250403190000_core.sql (hub_role stays separate for Yanney Hub).

-- Optional legacy enum if you add admin_users later
do $$ begin
  create type public.user_role as enum ('OWNER', 'STAFF');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum (
    'PENDING', 'CONFIRMED', 'PACKAGED',
    'RIDER_ASSIGNED', 'OUT_FOR_DELIVERY',
    'READY_FOR_PICKUP', 'DELIVERED', 'COLLECTED',
    'CANCELLED', 'REFUNDED'
  );
exception
  when duplicate_object then null;
end $$;

-- Per master spec (line 141): exactly three values. Self-arranged-rider orders
-- are flagged via fulfillment_type = 'RIDER' + the orders.self_arranged_service
-- text column (e.g. 'yango'), never via a separate enum value.
do $$ begin
  create type public.fulfillment_type as enum (
    'PICKUP', 'DELIVERY', 'RIDER'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_method as enum (
    'PAYSTACK_CARD', 'MOBILE_MONEY', 'PAY_ON_DELIVERY', 'WHATSAPP_MANUAL'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_source as enum (
    'WEBSITE', 'WHATSAPP', 'INSTAGRAM', 'IN_STORE', 'PHONE'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.product_category as enum (
    'DRESS', 'TWO_PIECE_SET', 'OUTFIT', 'BAG', 'HEELS', 'SLIPPERS', 'ACCESSORY'
  );
exception
  when duplicate_object then null;
end $$;

-- Shared trigger helper (master prompt)
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
