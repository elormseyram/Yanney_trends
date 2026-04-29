-- Landing / shop marquee strip (separate from short announcement banner).
alter table public.shop_settings
  add column if not exists marquee_ticker_text text,
  add column if not exists marquee_ticker_active boolean not null default false;

comment on column public.shop_settings.marquee_ticker_text is 'When marquee_ticker_active, scrolling ticker on home uses this text (repeat for marquee).';
comment on column public.shop_settings.marquee_ticker_active is 'When true, marquee_ticker_text replaces the default marketing strip on the home ticker.';

notify pgrst, 'reload schema';
