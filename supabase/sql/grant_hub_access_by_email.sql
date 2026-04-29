-- Grant Yanney Hub (yt-admin) access for an existing Supabase Auth user.
-- Run in Supabase Dashboard → SQL Editor (runs as postgres; bypasses RLS).
--
-- 1) Replace the email with the one you use in Authentication → Users.
-- 2) Use 'owner' or 'admin' for hub_role.
-- 3) Run the whole block.

insert into public.hub_staff (user_id, role)
select id, 'owner'::public.hub_role
from auth.users
where lower(trim(email)) = lower(trim('your-email@example.com'))
on conflict (user_id) do update set role = excluded.role;

-- Verify:
-- select * from public.hub_staff hs
-- join auth.users u on u.id = hs.user_id;
