-- Extra product fields for storefront cards + PDP (hub forms mirror customer view)

alter table public.products add column if not exists card_subtitle text;
alter table public.products add column if not exists fabric_care text;
alter table public.products add column if not exists colors text[] not null default '{}';
alter table public.products add column if not exists dress_occasion text;
alter table public.products add column if not exists bag_style text;
alter table public.products add column if not exists total_stock_units integer;

comment on column public.products.card_subtitle is 'Short line under name on product cards';
comment on column public.products.fabric_care is 'Care instructions (PDP)';
comment on column public.products.colors is 'Colour names shown on cards/filters';
comment on column public.products.dress_occasion is 'CASUAL | DINNER | EVENING | BOTH or null';
comment on column public.products.bag_style is 'Tote, clutch, etc. when category is bag';
comment on column public.products.total_stock_units is 'Optional headline quantity; else sum sizes[].stock';
