-- =====================================================================
-- Yanney Trends — orders schema alignment (idempotent / safe to re-run)
-- =====================================================================
-- The API in /api/paystack/initialize writes a wide row when a customer
-- checks out. If your live database was created from an older baseline,
-- some of the optional columns may be missing — Supabase will then error
-- with messages like:
--    "Could not find the 'delivery_address' column of 'orders' in the
--     schema cache"
-- Run this once in the Supabase SQL editor to add anything missing.
-- Safe to re-run; uses ADD COLUMN IF NOT EXISTS.
-- =====================================================================

alter table public.orders add column if not exists delivery_address text;
alter table public.orders add column if not exists delivery_zone text;
alter table public.orders add column if not exists scheduled_date date;
alter table public.orders add column if not exists scheduled_slot text;
alter table public.orders add column if not exists rider_service text;
alter table public.orders add column if not exists pickup_date date;
alter table public.orders add column if not exists pickup_time_slot text;
alter table public.orders add column if not exists paystack_reference text;
alter table public.orders add column if not exists paystack_verified boolean not null default false;
alter table public.orders add column if not exists momo_number text;
alter table public.orders add column if not exists channel_ref text;
alter table public.orders add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.orders add column if not exists currency text not null default 'GHS';
alter table public.orders add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.orders add column if not exists is_gift_order boolean not null default false;
alter table public.orders add column if not exists gift_message text;
alter table public.orders add column if not exists hide_price boolean not null default false;
alter table public.orders add column if not exists relationship text;
alter table public.orders add column if not exists self_arranged_service text;
alter table public.orders add column if not exists buyer_email_snapshot text;
alter table public.orders add column if not exists buyer_name_snapshot text;
alter table public.orders add column if not exists discount_amount numeric(10, 2) not null default 0;
alter table public.orders add column if not exists customer_email text;

-- Schedule approval workflow (admin can accept/decline pickup / delivery slot)
alter table public.orders add column if not exists schedule_status text not null default 'PENDING';
alter table public.orders add column if not exists schedule_decision_note text;
alter table public.orders add column if not exists schedule_decided_at timestamptz;
alter table public.orders add column if not exists schedule_decided_by uuid;

-- Reload PostgREST so the new columns appear in the Supabase schema cache
notify pgrst, 'reload schema';
