-- OTP tokens for Arkesel-based phone verification at checkout

create table if not exists public.otp_tokens (
  id          uuid        primary key default gen_random_uuid(),
  phone       text        not null,
  code        text        not null,
  expires_at  timestamptz not null,
  used        boolean     not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists otp_tokens_phone_idx on public.otp_tokens (phone, used, expires_at);

-- Service role only — no RLS needed since only admin client accesses this table
alter table public.otp_tokens enable row level security;
