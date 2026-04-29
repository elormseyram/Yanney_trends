-- Pickup / scheduled-delivery approval workflow.
-- Adds schedule_status + schedule_decision_* fields to orders so admins/owners
-- can approve or decline customer-booked pickup or delivery time slots.
-- Idempotent: safe to re-run.

alter table public.orders
  add column if not exists schedule_status text not null default 'PENDING',
  add column if not exists schedule_decision_note text,
  add column if not exists schedule_decided_at timestamptz,
  add column if not exists schedule_decided_by uuid references auth.users (id) on delete set null;

-- Constrain the values we accept; keep idempotent.
do $$
begin
  alter table public.orders drop constraint if exists orders_schedule_status_check;
exception when undefined_object then null;
end $$;

alter table public.orders
  add constraint orders_schedule_status_check
  check (schedule_status in ('PENDING', 'APPROVED', 'DECLINED'));

-- Backfill: any existing scheduled orders default to PENDING already.
-- Orders without a scheduled_date keep PENDING but the UI hides the
-- approval section for them.

create index if not exists idx_orders_schedule_pending
  on public.orders (created_at desc)
  where schedule_status = 'PENDING' and scheduled_date is not null;

comment on column public.orders.schedule_status
  is 'PENDING / APPROVED / DECLINED — admin/owner decision on the customer''s scheduled pickup or delivery slot.';
comment on column public.orders.schedule_decision_note
  is 'Optional note from the admin/owner explaining the decision.';
