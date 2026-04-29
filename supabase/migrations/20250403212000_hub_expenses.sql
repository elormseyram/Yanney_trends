-- Operational expenses (admin / owner tracking)

create table if not exists public.hub_expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'general',
  amount numeric(10, 2) not null,
  currency text not null default 'GHS',
  incurred_on date not null default (current_date at time zone 'utc'),
  vendor text,
  notes text,
  receipt_url text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_hub_expenses_incurred on public.hub_expenses (incurred_on desc);

alter table public.hub_expenses enable row level security;

drop policy if exists "hub_staff_manage_expenses" on public.hub_expenses;
create policy "hub_staff_manage_expenses"
  on public.hub_expenses for all
  using (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()))
  with check (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));
