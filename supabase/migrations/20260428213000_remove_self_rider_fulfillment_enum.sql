-- =====================================================================
-- Yanney Trendss — remediate legacy databases that contain SELF_RIDER
-- =====================================================================
-- The master spec defines public.fulfillment_type as exactly:
--   ('PICKUP', 'DELIVERY', 'RIDER')
-- Earlier migrations accidentally introduced a fourth value 'SELF_RIDER'.
-- Per spec, self-arranged-rider orders are tagged via:
--   fulfillment_type = 'RIDER'  AND  self_arranged_service = '<service>'
--
-- This script:
--   1. Backfills any existing rows that use 'SELF_RIDER' to 'RIDER'.
--   2. Recreates the enum without 'SELF_RIDER' (Postgres can't drop a
--      single enum value, so we rename + create + alter + drop).
--
-- Idempotent: safe to run on a database that never had 'SELF_RIDER'.
-- Run once in the Supabase SQL Editor.
-- =====================================================================

begin;

-- 1) Move data off the deprecated value (only if both column and value exist).
do $$
declare
  has_value boolean;
begin
  select exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'fulfillment_type'
      and e.enumlabel = 'SELF_RIDER'
  ) into has_value;

  if has_value then
    update public.orders
       set fulfillment_type = 'RIDER',
           self_arranged_service = coalesce(self_arranged_service, 'self')
     where fulfillment_type::text = 'SELF_RIDER';
  end if;
end $$;

-- 2) Recreate the enum without SELF_RIDER (only if SELF_RIDER is present).
do $$
declare
  has_value boolean;
begin
  select exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'fulfillment_type'
      and e.enumlabel = 'SELF_RIDER'
  ) into has_value;

  if has_value then
    -- Rename old enum out of the way.
    execute 'alter type public.fulfillment_type rename to fulfillment_type__legacy_self_rider';

    -- Create the spec-compliant enum.
    execute $sql$
      create type public.fulfillment_type as enum ('PICKUP', 'DELIVERY', 'RIDER')
    $sql$;

    -- Switch column default off old enum -> cast type -> re-apply default.
    -- Without this, Postgres can error:
    --   "default for column fulfillment_type cannot be cast automatically"
    execute $sql$
      alter table public.orders
        alter column fulfillment_type drop default,
        alter column fulfillment_type type public.fulfillment_type
        using fulfillment_type::text::public.fulfillment_type
    $sql$;
    execute $sql$
      alter table public.orders
        alter column fulfillment_type set default 'PICKUP'::public.fulfillment_type
    $sql$;

    -- Drop the legacy enum.
    execute 'drop type public.fulfillment_type__legacy_self_rider';
  end if;
end $$;

-- Reload PostgREST so the cache picks up the new enum.
notify pgrst, 'reload schema';

commit;
