-- Checkout payment intents (strict mode):
-- store checkout payload before redirecting to Paystack,
-- then create final orders only after payment success.

create table if not exists public.checkout_payment_intents (
  reference text primary key,
  amount_pesewas integer not null,
  currency text not null default 'GHS',
  customer_email text,
  status text not null default 'INITIATED',
  payload jsonb not null default '{}'::jsonb,
  paystack_reference text,
  paid_at timestamptz,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_checkout_payment_intents_status
  on public.checkout_payment_intents (status);

create index if not exists idx_checkout_payment_intents_created_at
  on public.checkout_payment_intents (created_at desc);

drop trigger if exists checkout_payment_intents_updated_at on public.checkout_payment_intents;
create trigger checkout_payment_intents_updated_at
before update on public.checkout_payment_intents
for each row execute function public.update_updated_at();

alter table public.checkout_payment_intents enable row level security;

drop policy if exists "Service role full access intents" on public.checkout_payment_intents;
create policy "Service role full access intents"
on public.checkout_payment_intents
for all
to service_role
using (true)
with check (true);
