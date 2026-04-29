# Yanney Hub (`yt-admin`)

Admin and **owner** workspaces for Yanney Trends. Pair it with the storefront in `yt-web`.

## Run locally

Copy `.env.example` to `.env.local` and fill Supabase keys (same project as the shop). Set `NEXT_PUBLIC_SHOP_URL` to the storefront URL (default example uses port **3003**).

```bash
npm install
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001). Sign in is **Supabase email + password**. Only users with a row in `public.hub_staff` can use the hub after authentication.

### First hub user

Creating a user under **Authentication → Users** is not enough. The hub checks **`public.hub_staff`**: your `user_id` must appear there (RLS only lets you read your own row).

1. Enable the **Email** provider under **Authentication → Providers** (and turn off “Confirm email” temporarily if you want to test without verifying).
2. Grant access using **one** of these:

**A — SQL editor (simplest)**  
Open `../supabase/sql/grant_hub_access_by_email.sql` in the repo, set your email and `owner` / `admin`, paste into **Supabase → SQL → New query → Run**.

**B — By user id**

```sql
insert into public.hub_staff (user_id, role)
values ('YOUR_USER_UUID'::uuid, 'owner')
on conflict (user_id) do update set role = excluded.role;
```

**C — Local API (needs service role + secret)**  
Set `HUB_GRANT_SECRET` in `.env.local`, restart dev, then:

```bash
curl -sS -X POST http://localhost:3001/api/hub/grant-access ^
  -H "Authorization: Bearer YOUR_HUB_GRANT_SECRET" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"you@example.com\",\"role\":\"owner\"}"
```

If sign-in returns **“not registered for Yanney Hub”**, the Auth user exists but **`hub_staff` is still empty** for that account — run A or C.

Confirm **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** in `yt-admin/.env.local` match the same Supabase project where the user was created.

## Layout

- **Admin**: overview, orders, products, customers, settings.
- **Owner**: same plus owner-only routes (`/dashboard/owner/*`) — reports, team & access.

## Stack

Next.js 15 (App Router), Tailwind v4, Supabase client helpers under `lib/supabase/` (`client`, `server`, `admin` service role).

## Supabase

- Hub middleware refreshes the session and enforces `hub_staff` for `/dashboard` routes.
- After setting `.env.local`, open `GET /api/health/supabase` to verify the project URL and anon key.
- SQL migrations for shared tables live in the monorepo: `../supabase/migrations/`.
