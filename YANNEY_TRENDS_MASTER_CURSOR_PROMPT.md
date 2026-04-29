# 👑 YANNEY TRENDS — ULTRA MASTER BUILD PROMPT (CURSOR ROOT INSTRUCTION)

> Paste this file as your **root project instruction** in Cursor.
> Every component, page, and system must comply with every rule written here.
> If Cursor generates something generic → reject it and regenerate with these constraints.

---

## 🎯 PROJECT IDENTITY

```
PROJECT NAME : YANNEY TRENDS
TYPE         : Luxury Fashion Commerce Platform
REGION       : Ghana-first (Mobile Money + WhatsApp optimized)
AUDIENCE     : Modern Ghanaian women (18–45), fashion-forward, mobile-native
SELLS        : Dresses · Female Outfits · Sets · Bags · Slippers · Heels
MISSION      : Build a cinematic, high-fashion ecommerce experience that feels
               like a luxury editorial boutique — not a typical online store.
```

The platform must feel like:
- A fashion runway merged with a curated boutique
- Instagram + Vogue editorial + Apple interaction quality
- Premium, smooth, emotional, feminine, modern

**If UI looks like a template → reject it and redesign.**
**If animation snaps instantly → slow it down.**
**If layout feels crowded → add space.**

---

## 🌍 BUSINESS CONTEXT (CRITICAL — READ BEFORE BUILDING ANYTHING)

Yanney Trends operates in a **hybrid Ghana commerce environment**.

This means customers will:
- Order directly on the website (full checkout)
- Chat on WhatsApp before or instead of paying online
- Request delivery riders manually (self-arranged)
- Pay via Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo Money)
- Pay by card (Paystack)
- Pick up in-store in Kumasi
- Browse on mobile 80%+ of the time (low-to-mid range Android devices)

The system **must** support **hybrid commerce flows** — not just a standard checkout tunnel.

---

## 🧱 TECH STACK (MANDATORY — DO NOT DEVIATE)

```
Framework        : Next.js 14 (App Router, Server Components where possible)
Language         : TypeScript (strict mode)
Styling          : Tailwind CSS (utility-first, no CSS modules)
Animations       : Framer Motion (all motion)
Database         : Supabase (PostgreSQL under the hood)
ORM              : Supabase Client SDK + Supabase Auth (NO Prisma)
Auth             : Supabase Auth (admin only — email/password)
                   Row-Level Security (RLS) enforced on all tables
State            : Zustand (cart, wishlist, drawer state, quiz state)
Image Storage    : Supabase Storage (product images bucket)
Image Rendering  : next/image with Supabase Storage URLs
Payments         : Paystack (primary) — MoMo, Cards, Bank Transfer
Email            : Resend (transactional HTML emails)
SMS              : Africa's Talking (Ghana-optimized, cheaper than Twilio)
WhatsApp         : wa.me deep links (instant, no API approval needed)
                   + optional WhatsApp Business API (if configured)
Hosting          : Vercel (zero-config Next.js deployment)
Analytics        : Vercel Analytics + custom event tracking in Supabase
```

---

## 🗄 SUPABASE SETUP & ARCHITECTURE

### Connection

```typescript
// lib/supabase/client.ts  — browser client
import { createBrowserClient } from '@supabase/ssr'
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// lib/supabase/server.ts  — server component client
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  )
}

// lib/supabase/admin.ts  — service role (bypasses RLS, server-only)
import { createClient } from '@supabase/supabase-js'
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
RESEND_API_KEY=
AFRICAS_TALKING_API_KEY=
AFRICAS_TALKING_USERNAME=
WHATSAPP_API_TOKEN=              # optional
WHATSAPP_PHONE_NUMBER_ID=        # optional
NEXT_PUBLIC_SHOP_WHATSAPP=+233XXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://yanneytrends.com
```

---

## 🗄 FULL DATABASE SCHEMA (SUPABASE SQL)

Run these migrations in Supabase Studio SQL editor in order.

### 1. ENUMS

```sql
CREATE TYPE user_role AS ENUM ('OWNER', 'STAFF');
CREATE TYPE order_status AS ENUM (
  'PENDING', 'CONFIRMED', 'PACKAGED',
  'RIDER_ASSIGNED', 'OUT_FOR_DELIVERY',
  'READY_FOR_PICKUP', 'DELIVERED', 'COLLECTED',
  'CANCELLED', 'REFUNDED'
);
CREATE TYPE fulfillment_type AS ENUM ('PICKUP', 'DELIVERY', 'RIDER');
CREATE TYPE payment_method AS ENUM (
  'PAYSTACK_CARD', 'MOBILE_MONEY', 'PAY_ON_DELIVERY', 'WHATSAPP_MANUAL'
);
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE order_source AS ENUM (
  'WEBSITE', 'WHATSAPP', 'INSTAGRAM', 'IN_STORE', 'PHONE'
);
CREATE TYPE product_category AS ENUM (
  'DRESS', 'TWO_PIECE_SET', 'OUTFIT', 'BAG', 'HEELS', 'SLIPPERS', 'ACCESSORY'
);
```

### 2. ADMIN USERS TABLE

```sql
CREATE TABLE admin_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_uid    UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  role            user_role NOT NULL DEFAULT 'STAFF',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_login_at   TIMESTAMPTZ
);

-- RLS: Only authenticated admin users can read their own row
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin users can read own row"
  ON admin_users FOR SELECT
  USING (supabase_uid = auth.uid());
CREATE POLICY "Owners can read all admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE supabase_uid = auth.uid() AND role = 'OWNER'
    )
  );
CREATE POLICY "Owners can manage admin users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE supabase_uid = auth.uid() AND role = 'OWNER'
    )
  );
```

### 3. PRODUCTS TABLE

```sql
CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT,
  category         product_category NOT NULL,
  price            NUMERIC(10,2) NOT NULL,
  sale_price       NUMERIC(10,2),
  sizes            JSONB NOT NULL DEFAULT '[]',
  -- Example: [{"size":"S","stock":5},{"size":"M","stock":3}]
  images           JSONB NOT NULL DEFAULT '[]',
  -- Example: [{"url":"...","alt":"...","isPrimary":true}]
  tags             TEXT[] DEFAULT '{}',
  mood_tags        TEXT[] DEFAULT '{}',
  occasion_tags    TEXT[] DEFAULT '{}',
  outfit_group_id  UUID,
  pairing_ids      UUID[] DEFAULT '{}',
  popularity_score INTEGER DEFAULT 0,
  is_published     BOOLEAN DEFAULT false,
  is_featured      BOOLEAN DEFAULT false,
  meta_title       TEXT,
  meta_description TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published products"
  ON products FOR SELECT
  USING (is_published = true);
CREATE POLICY "Admin can manage products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 4. ORDERS TABLE

```sql
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        TEXT UNIQUE NOT NULL,
  -- Format: YT-YYYYMMDD-XXXX (e.g. YT-20250403-0142)

  -- Customer
  customer_name       TEXT NOT NULL,
  customer_email      TEXT,
  customer_phone      TEXT NOT NULL,

  -- Items (snapshot at time of order)
  items               JSONB NOT NULL,
  -- [{productId, name, imageUrl, category, size, quantity, unitPrice, subtotal}]

  -- Financials
  subtotal            NUMERIC(10,2) NOT NULL,
  delivery_fee        NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total               NUMERIC(10,2) NOT NULL,

  -- Fulfillment
  fulfillment_type    fulfillment_type NOT NULL,
  delivery_address    TEXT,
  delivery_zone       TEXT,
  scheduled_date      DATE,
  scheduled_slot      TEXT,
  rider_service       TEXT,
  pickup_date         DATE,
  pickup_time_slot    TEXT,

  -- Payment
  payment_method      payment_method NOT NULL,
  payment_status      payment_status NOT NULL DEFAULT 'PENDING',
  paystack_reference  TEXT,
  paystack_verified   BOOLEAN DEFAULT false,
  momo_number         TEXT,

  -- Status & tracking
  status              order_status NOT NULL DEFAULT 'PENDING',
  source              order_source NOT NULL DEFAULT 'WEBSITE',
  channel_ref         TEXT,
  -- e.g. Instagram post ID, WhatsApp conversation ref

  -- Meta
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Customers access via order_number (public tracking, no auth needed)
CREATE POLICY "Public can read own order by order_number"
  ON orders FOR SELECT
  USING (true); -- further scoped in application layer
CREATE POLICY "Admin can manage orders"
  ON orders FOR ALL
  USING (auth.role() = 'authenticated');

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 5. ORDER STATUS HISTORY TABLE

```sql
CREATE TABLE order_status_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status  order_status,
  to_status    order_status NOT NULL,
  changed_by   UUID REFERENCES admin_users(id),
  changed_by_name TEXT,
  note         TEXT,
  changed_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage status history"
  ON order_status_history FOR ALL
  USING (auth.role() = 'authenticated');
CREATE POLICY "Public can read status history"
  ON order_status_history FOR SELECT
  USING (true);
```

### 6. ORDER NOTES TABLE

```sql
CREATE TABLE order_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES admin_users(id),
  author_name TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage order notes"
  ON order_notes FOR ALL
  USING (auth.role() = 'authenticated');
-- Notes are NEVER returned to unauthenticated requests
```

### 7. SHOP SETTINGS TABLE

```sql
CREATE TABLE shop_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name             TEXT NOT NULL DEFAULT 'Yanney Trends',
  tagline               TEXT DEFAULT 'Style That Speaks Before You Do',
  shop_address          TEXT,
  whatsapp_number       TEXT,
  instagram_handle      TEXT,
  delivery_days         TEXT[] DEFAULT '{Monday,Wednesday,Friday}',
  delivery_cutoff_day   TEXT DEFAULT 'Sunday',
  delivery_cutoff_time  TIME DEFAULT '20:00',
  zone_a_fee            NUMERIC(10,2) DEFAULT 15,
  zone_b_fee            NUMERIC(10,2) DEFAULT 25,
  zone_c_fee            NUMERIC(10,2) DEFAULT 40,
  max_pod_amount        NUMERIC(10,2) DEFAULT 200,
  -- Max order value for Pay on Delivery
  pickup_hours          TEXT DEFAULT 'Mon–Sat: 9AM–6PM',
  shop_is_open          BOOLEAN DEFAULT true,
  delivery_available    BOOLEAN DEFAULT true,
  pickup_available      BOOLEAN DEFAULT true,
  notify_email          BOOLEAN DEFAULT true,
  notify_sms            BOOLEAN DEFAULT true,
  notify_whatsapp       BOOLEAN DEFAULT true,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Seed one row
INSERT INTO shop_settings DEFAULT VALUES;

ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shop settings"
  ON shop_settings FOR SELECT USING (true);
CREATE POLICY "Owners can update shop settings"
  ON shop_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE supabase_uid = auth.uid() AND role = 'OWNER'
    )
  );
```

### 8. WISHLISTS TABLE

```sql
CREATE TABLE wishlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage their wishlist"
  ON wishlists FOR ALL USING (true);
```

### 9. SUPABASE STORAGE BUCKETS

```sql
-- Run in Supabase Storage UI or via management API
-- Bucket: product-images (public)
-- Bucket: order-attachments (private)
```

---

## 🎨 DESIGN SYSTEM — YANNEY TRENDS IDENTITY

### Color Tokens (define in tailwind.config.ts)

```typescript
colors: {
  brand: {
    bg:        '#0A0A0A',
    surface:   '#111111',
    elevated:  '#1A1A1A',
    border:    '#2A2A2A',
    pink:      '#FF2E88',
    'pink-hover': '#FF4D9A',
    'pink-muted': '#FF2E8820',
    text:      '#FFFFFF',
    muted:     '#A1A1AA',
    dimmed:    '#6B7280',
    success:   '#4ADE80',
    warning:   '#FBBF24',
    danger:    '#F87171',
    info:      '#60A5FA',
  }
}
```

### Typography (next/font setup)

```typescript
// In layout.tsx
import { Playfair_Display, Bebas_Neue, Jost } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})
const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})
const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
})
```

Usage rules:
- `font-playfair` → ALL hero headlines, product names, section titles
- `font-bebas` → Section labels (SHOP, TRENDING, NEW IN), category names
- `font-jost` → All UI text, buttons, prices, body copy, inputs

### Spacing System

```
Section vertical padding:   py-24 md:py-36 (never less than py-16)
Container max width:        max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
Card internal padding:      p-6 md:p-8
Grid gap:                   gap-6 md:gap-8
```

### Design Hard Rules

```
✗ NO gradients — anywhere, ever
✗ NO border-radius > 8px (rounded-lg max)
✗ NO box shadows with color (only rgba(0,0,0,x))
✗ NO generic stock illustration icons
✗ NO blue focus rings — replace with pink (#FF2E88)
✓ Glassmorphism only in: admin panels, drawers, modals, overlays
✓ Grain overlay on hero section (2% SVG noise texture)
✓ Large typography where possible
✓ Minimum 2 units of negative space per section
✓ Max 2 CTAs per section
```

### Animation Constants

```typescript
// lib/motion.ts
export const EASING = [0.25, 0.1, 0.25, 1] as const
export const EASING_OUT = [0.0, 0.0, 0.2, 1] as const

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -12 },
  transition: { duration: 0.6, ease: EASING }
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: EASING }
}

export const slideInRight = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit:    { x: '100%' },
  transition: { duration: 0.45, ease: EASING_OUT }
}

export const HOVER_SCALE = { whileHover: { scale: 1.04 }, whileTap: { scale: 0.97 } }
export const HOVER_LIFT  = { whileHover: { y: -4, transition: { duration: 0.3 } } }
```

---

## 🏠 LANDING PAGE — FULL SECTION SPECIFICATION

### SECTION 1: HERO — Boutique Entrance

Full viewport height (`min-h-screen`). Two columns on desktop, stacked on mobile.

**Left column:**
- Eyebrow label (Bebas Neue, tracked): "KUMASI · GHANA · EST. 2024"
- Headline (Playfair Display, 72px desktop): "Style That Speaks Before You Do"
- Sub-copy (Jost, muted): 1 line about the brand
- Two CTA buttons:
  - Primary: "Shop Collection" → /shop
  - Secondary: "Chat on WhatsApp" → wa.me link with pre-filled message
- Staggered fade-up animation (each element 120ms delay apart)

**Right column:**
- Hero image: full-bleed model photo
- Slow Ken Burns zoom: `scale: 1 → 1.06` over 14 seconds, looping
- Pink accent bar on left edge of image (4px wide, full height)

**Background:**
- `#0A0A0A` base
- 2% grain SVG overlay (fixed, pointer-events none)
- Subtle radial glow behind text: `radial-gradient(ellipse at 20% 50%, #FF2E880A 0%, transparent 60%)`

---

### SECTION 2: MARQUEE TICKER

Horizontal infinite scroll ticker between hero and categories.

Content (repeating):
`NEW ARRIVALS · FREE KUMASI PICKUP · MOBILE MONEY ACCEPTED · DRESS BOLD MOVE DIFFERENT ·`

Style: Bebas Neue, small caps, pink text on near-black background strip.

Animation: CSS `animation: scroll 30s linear infinite`.

---

### SECTION 3: CATEGORY SHOWCASE

Grid: 5 editorial cards.
- Dresses
- Bags
- Heels
- Slippers
- Complete Looks

Each card:
- Full-bleed image (use next/image, aspect-ratio: 3/4)
- Category name overlaid (Bebas Neue, bottom-left)
- Hover: image scales 1.06, pink underline grows from center under text
- Click → /shop?category=[slug]

Layout: 5-column desktop, 2-column mobile (last card full-width on mobile).

---

### SECTION 4: BEST SELLERS GRID

Section header: "BEST SELLERS" (Bebas Neue, large) + pink horizontal rule.

Grid: 4 columns desktop, 2 mobile.

Each product card:
- Image (aspect 3/4, `object-fit: cover`)
- On hover: overlay appears with:
  - "Quick View" button (glass pill, white text)
  - "Add to Cart" button (pink, black text)
  - "Style With AI ✨" link
- Product name (Playfair Display, below image)
- Price in GHS (Jost semi-bold)
- "NEW" or "LOW STOCK" badge (top-left, flat colored)
- Wishlist heart icon (top-right, toggles pink)

Animate into view with `staggerChildren: 0.06` on scroll.

---

### SECTION 5: RUNWAY MODE ENTRY

Full-width dark section.

Centered:
- Large label (Bebas Neue): "THE RUNWAY"
- Sub-copy: "Experience the collection like never before"
- Button: "Enter Runway Mode →"

Background: subtle animated gradient breath — `#111111 → #181818` cycling 4s ease-in-out.

Button click → triggers Runway Mode (see Section below).

---

### SECTION 6: AI STYLIST TEASER

Two columns:
- Left: Phone mockup wireframe showing quiz cards
- Right: Copy + CTA
  - Headline: "Your Personal Stylist, Available 24/7"
  - Body: brief description
  - CTA: "Get Styled Now →" → /stylist

---

### SECTION 7: LOOKBOOK CAROUSEL

Instagram-style horizontal scroll of lifestyle photos.

Each photo: square ratio, slight scale-up on hover.
Caption overlay on hover: product name + "Shop This Look" link.

Mobile: native scroll snap. Desktop: custom arrow controls.

---

### SECTION 8: DELIVERY PROMISE STRIP

4 icons in a row (or 2×2 on mobile):

```
🚚  Nationwide Delivery     →  "We deliver anywhere in Ghana"
📍  Kumasi Pickup           →  "Free in-store collection"
💬  WhatsApp Ordering       →  "Order via chat anytime"
💳  Mobile Money            →  "MTN, Telecel, AirtelTigo"
```

Style: dark glassmorphism cards, centered icon + label + subtext.

---

### SECTION 9: FOOTER

Columns:
- Brand logo + tagline + social icons
- Quick links: Shop, AI Stylist, Track Order, About
- Contact: WhatsApp number, email, Kumasi address
- Payment icons: Paystack, MTN MoMo, Telecel, AirtelTigo

Bottom bar: copyright + "Designed in Kumasi 🇬🇭"

---

## 🧥 VISUAL QUANTITY STACKING — DETAILED IMPLEMENTATION

This is the most technically precise UI feature. Implement in `components/storefront/QuantityStack.tsx`.

```typescript
// Component receives: productImageUrl, quantity, productName
// Renders a visually stacked set of garment images

const rotations = ['-2deg', '0deg', '+2deg', '-1deg', '+1deg']
const offsets   = [0, 12, 24, 36, 48] // px horizontal offset

// For each index 0..min(quantity-1, 4):
// - Render product image positioned absolutely
// - Apply rotation from rotations[i]
// - Apply xOffset from offsets[i]
// - zIndex decreases per layer (front item z-50)
// - boxShadow increases per layer: 0→4px, 1→8px, 2→12px...

// Framer Motion AnimatePresence wraps each image
// Each image animates:
//   initial: { opacity: 0, scale: 0.95, y: 20 }
//   animate: { opacity: 1, scale: 1,    y: 0  }
//   exit:    { opacity: 0, scale: 0.95, y: -10 }
//   transition: { duration: 0.4, ease: [0.25,0.1,0.25,1], delay: index * 0.12 }

// Hanger rod:
// SVG hanger rod above image stack (visible when qty >= 2)
// On new item add: hanger sways
//   keyframes: rotate [0, -3, 2, -1, 0] degrees over 600ms

// Qty > 5: render badge "+X more" (pink, top-right)
```

Cart icon behavior: when item added, cart icon in navbar does a subtle
`rotate: [0, -8, 6, -3, 0]` spring animation over 500ms.

---

## 🛍 PRODUCT PAGE — FULL SPECIFICATION

### URL: `/product/[slug]`

### Layout: 2-column (sticky right panel)

**Left column — Gallery:**
- Primary image full-width, click to open fullscreen lightbox
- Thumbnail strip below (horizontal scroll)
- Mobile: swipeable image carousel with dot indicators
- Hover on desktop: subtle parallax shift (mouse position → translate ±8px)

**Right column — Sticky Purchase Panel** (sticks on scroll past gallery):
- Breadcrumb: Home > Category > Product Name
- Category badge (Bebas Neue, pink)
- Product name (Playfair Display, 32px)
- Price: GHS [price] (Jost semi-bold, white)
  - If sale_price exists: strikethrough original, pink sale price
- Stock indicator:
  - ≥10 items: green dot "In Stock"
  - 3–9: amber dot "Low Stock — [n] left"
  - 0: red dot "Sold Out" (disable purchase)
- **Size Selector:**
  - Pills for each size (S, M, L, XL, etc.)
  - Selected: pink border + background tint
  - Out-of-stock sizes: strikethrough, disabled
- **AI Size Recommendation:**
  - "Not sure of your size? Get a recommendation ✨"
  - Mini modal: Height (cm/ft) + usual size elsewhere + fit preference
  - Returns: "We recommend **Medium** for your measurements"
  - Stored in localStorage, persists across pages
- **Quantity Visual Stack** (QuantityStack component above)
  - +/- buttons with animated counter
- **Action Buttons:**
  1. "Add to Cart" → black bg, white text, full-width
  2. "Chat to Order on WhatsApp →" → pink bg, black text, full-width
     Generates pre-filled message (see WhatsApp section)
- Wishlist: heart icon below buttons, toggles with bounce animation
- Delivery estimate: mini calculator (enter area → shows delivery zone + ETA)

**Below the fold:**
- **Description tab / Fabric & Care tab** (tabbed, Jost body text)
- **"Styled With" section:**
  - Products sharing same `outfit_group_id` or in `pairing_ids[]`
  - Horizontal scroll cards
  - "Add Entire Outfit to Cart" CTA
- **Recently Viewed:** last 6 products (stored in Zustand + localStorage)
- **Social Proof bar:**
  - "🔥 12 people viewed this today" (simulated engagement, seeded from popularityScore)
  - "✅ Last purchased 2 hours ago" (if popularityScore > 50)
- **Reviews placeholder:** "Be the first to review this piece →"

---

## 🧠 AI STYLIST — COMPLETE SYSTEM

### Route: `/stylist`

This is a multi-step wizard. Build as a single-page experience with smooth transitions between steps.

### Step 1: Welcome Screen

Full-screen intro:
- Headline (Playfair): "Let's Find Your Perfect Look"
- Sub-copy: "Answer 5 quick questions and we'll style you personally"
- CTA: "Start My Style Quiz →"
- Background: slow-moving fabric texture animation

### Step 2: Quiz (5 Questions)

Progress bar at top (pink fill, animated).
Each question slides in from the right (Framer Motion).
Back button for navigation.

**Question 1 — Occasion**
Select one:
- Casual Day Out
- Party / Night Out
- Wedding / Event
- Work / Office
- Date Night
- Photoshoot

**Question 2 — Mood**
Select one:
- Elegant & Refined
- Bold & Daring
- Minimal & Clean
- Cute & Feminine
- Luxurious & Rich

**Question 3 — Fit Preference**
Select one:
- Fitted (shows my curves)
- Relaxed (comfortable, easy)
- Flowing (loose, free)

**Question 4 — Colour Vibe**
Multi-select (up to 3):
- Neutrals (Black, White, Beige)
- Bold (Red, Orange, Yellow)
- Cool (Blue, Green, Purple)
- Earth (Brown, Rust, Olive)
- Pastels (Pink, Lilac, Mint)

**Question 5 — Budget**
Slider:
- Min: GHS 50 / Max: GHS 1000
- Pink range slider with live price display

### Step 3: "Styling Your Look…" Loading Screen

3-second animated screen:
- Animated fashion silhouette
- Typewriter text: "Matching your vibe..." → "Curating your looks..." → "Almost there..."

### Step 4: Results Page

Header: "Styled For You 💖" (Playfair, large)
Sub: "Based on your style profile — [Occasion] · [Mood]"

**Scoring Algorithm (lib/stylist.ts):**

```typescript
function scoreProduct(product: Product, quiz: QuizAnswers): number {
  let score = 0

  // Tag matching (highest weight)
  quiz.occasion && product.occasion_tags.includes(quiz.occasion)
    ? score += 30 : null
  quiz.mood && product.mood_tags.includes(quiz.mood)
    ? score += 25 : null

  // Fit matching
  quiz.fit && product.tags.includes(quiz.fit.toLowerCase())
    ? score += 20 : null

  // Color matching
  quiz.colors.forEach(color => {
    product.tags.includes(color) ? score += 10 : null
  })

  // Budget filter (hard cut)
  const price = product.sale_price ?? product.price
  if (price > quiz.budget_max) return -999

  // Popularity boost (small)
  score += Math.min(product.popularity_score / 10, 5)

  return score
}

// Returns top 12 products sorted by score descending
// Then groups into outfit bundles using outfit_group_id
```

**Results layout:**
- 3 "Featured Outfit" bundles at top (full-width cards):
  - Complete look (dress + bag + shoes)
  - "Add Entire Outfit — GHS [total]" button
  - Individual items listed below each
- Then grid of single-item recommendations (4-column desktop, 2 mobile)

Each result card:
- Product image, name, price, "Add to Cart" + "Quick View"
- Match reason badge: "Perfect for [Occasion] ✨"

**Bottom CTA:**
"Want personal styling advice? Chat our stylist on WhatsApp →"

---

## 💳 PAYMENT SYSTEM — PAYSTACK + GHANA

### Checkout Flow (`/checkout`)

Step 1: Customer Details
- Name (required)
- Phone (required, Ghana format validation: +233XXXXXXXXX)
- Email (optional)
- Auto-format phone on input

Step 2: Fulfillment Choice

**A) In-Store Pickup**
- Show shop address
- Date picker: only admin-configured pickup days selectable
- Time slot selector (morning/afternoon)

**B) Scheduled Delivery**
- Address input (free text + optional GPS pin)
- Area zone auto-detection (based on keywords: "Kumasi" → Zone A, etc.)
- Delivery day selector (only admin-configured delivery days)
- Time slot: Morning (8–12) / Afternoon (12–5) / Evening (5–8)
- Fee calculated and displayed instantly

**C) Self-Arranged Rider**
- Customer arranges their own rider
- System shows: shop address, order ID, contact number
- One-click "Share Pickup Details on WhatsApp" button

Step 3: Payment Method

```
[ ] Pay Now (Online)
    ↓ Sub-options:
    • Mobile Money (MTN, Telecel, AirtelTigo)
    • Debit/Credit Card
    • Bank Transfer

[ ] Pay on Delivery
    ↓ Shown only if:
    • Fulfillment = DELIVERY or PICKUP
    • Order total ≤ shop_settings.max_pod_amount
    • Delivery zone is allowed
    Note: "GHS 20 COD fee applies"

[ ] WhatsApp Assisted Payment
    ↓ For manual MoMo transfers, bank transfers
    • "We'll send you payment instructions on WhatsApp"
    • Order created with status PENDING
```

Step 4: Order Summary + Confirm

Full breakdown: items, subtotal, delivery fee, total.
"Place Order" button → pink, full-width, large.

### Paystack Integration

```typescript
// lib/paystack.ts

// INITIALIZE PAYMENT
export async function initializePaystackPayment({
  email, amount, reference, metadata
}: PaystackInit) {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email || 'customer@yanneytrends.com',
      amount: amount * 100, // Paystack uses pesewas
      reference,
      currency: 'GHS',
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/verify`
    })
  })
  return res.json()
}

// VERIFY PAYMENT (always server-side, NEVER trust frontend)
export async function verifyPaystackPayment(reference: string) {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  )
  const data = await res.json()
  return {
    success: data.data?.status === 'success',
    amount: data.data?.amount / 100,
    reference: data.data?.reference
  }
}
```

**Webhook handler: `app/api/webhooks/paystack/route.ts`**

- Verify Paystack signature (HMAC SHA512)
- On `charge.success`: update order payment_status → PAID, order status → CONFIRMED
- Trigger notifyCustomer(order, 'CONFIRMED')
- Return 200 immediately

---

## 🚚 DELIVERY SYSTEM — GHANA ZONES

### Zone Calculation (`lib/delivery.ts`)

```typescript
const ZONE_KEYWORDS = {
  A: ['kumasi', 'nhyiaeso', 'asokwa', 'suame', 'bantama', 'manhyia', 'oforikrom'],
  B: ['ejisu', 'juaben', 'ashanti', 'ksi', 'bekwai', 'mampong'],
  C: [] // nationwide fallback
}

export function detectZone(address: string): 'A' | 'B' | 'C' {
  const lower = address.toLowerCase()
  for (const kw of ZONE_KEYWORDS.A) if (lower.includes(kw)) return 'A'
  for (const kw of ZONE_KEYWORDS.B) if (lower.includes(kw)) return 'B'
  return 'C'
}

export function getDeliveryFee(zone: string, settings: ShopSettings) {
  return zone === 'A' ? settings.zone_a_fee
       : zone === 'B' ? settings.zone_b_fee
       : settings.zone_c_fee
}

export function getEstimatedDelivery(zone: string): string {
  return zone === 'A' ? 'Same day or next day'
       : zone === 'B' ? '1–2 business days'
       : '2–5 business days'
}
```

---

## 📦 ORDER NUMBER GENERATOR

```typescript
// lib/orderUtils.ts
export function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 9000 + 1000)
  return `YT-${dateStr}-${random}`
  // Example: YT-20250403-4821
}
```

---

## 📣 NOTIFICATION SYSTEM — ALL 3 CHANNELS

### File: `lib/notificationService.ts`

```typescript
export async function notifyCustomer(order: Order, newStatus: OrderStatus) {
  const settings = await getShopSettings()

  await Promise.allSettled([
    settings.notify_email    ? sendEmail(order, newStatus)    : Promise.resolve(),
    settings.notify_sms      ? sendSMS(order, newStatus)      : Promise.resolve(),
    settings.notify_whatsapp ? sendWhatsApp(order, newStatus) : Promise.resolve(),
  ])
  // allSettled: one failing channel never blocks the others
}
```

### EMAIL (Resend)

```typescript
async function sendEmail(order: Order, status: OrderStatus) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Notify] Resend not configured — skipping email')
    return
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'Yanney Trends <orders@yanneytrends.com>',
    to: order.customer_email,
    subject: `Your order ${order.order_number} is now ${statusLabel(status)} — Yanney Trends`,
    html: generateEmailHTML(order, status),
    // Full branded HTML: black bg (#0A0A0A), pink accents (#FF2E88)
    // Sections: status badge, order items, fulfillment details,
    //           tracking link (/track/[orderNumber]), WhatsApp contact button
  })
}
```

### SMS (Africa's Talking)

```typescript
async function sendSMS(order: Order, status: OrderStatus) {
  if (!process.env.AFRICAS_TALKING_API_KEY) {
    console.warn('[Notify] Africa\'s Talking not configured — skipping SMS')
    return
  }

  const AfricasTalking = (await import('africastalking')).default
  const at = AfricasTalking({
    apiKey: process.env.AFRICAS_TALKING_API_KEY,
    username: process.env.AFRICAS_TALKING_USERNAME!,
  })

  const message = buildSMSMessage(order, status)
  // Max 160 chars:
  // "Hi [Name]! Your Yanney Trends order [YT-XXXXXX-XXXX] is
  //  now [STATUS]. Track: yanneytrends.com/track/[num] 💖"

  await at.SMS.send({
    to: [normalizeGhanaPhone(order.customer_phone)],
    message,
    from: 'YanneyTrnds',
  })
}

function normalizeGhanaPhone(phone: string): string {
  // Converts: 0241234567 → +233241234567
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) return '+233' + cleaned.slice(1)
  if (cleaned.startsWith('233')) return '+' + cleaned
  return phone
}
```

### WhatsApp

```typescript
async function sendWhatsApp(order: Order, status: OrderStatus) {
  // Strategy 1: WhatsApp Business API (if configured)
  if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    await sendWhatsAppAPI(order, status)
    return
  }

  // Strategy 2: wa.me fallback link (stored on order for admin to click)
  const message = buildWhatsAppMessage(order, status)
  const link = `https://wa.me/${normalizeGhanaPhone(order.customer_phone)}?text=${encodeURIComponent(message)}`

  // Store the wa.me link in order metadata so admin can click it from the drawer
  await supabaseAdmin.from('orders').update({
    channel_ref: link
  }).eq('id', order.id)

  console.log(`[Notify] WhatsApp fallback link generated for ${order.order_number}`)
}

function buildWhatsAppMessage(order: Order, status: OrderStatus): string {
  const statusMessages: Record<OrderStatus, string> = {
    CONFIRMED:        "✅ Your order has been confirmed!",
    PACKAGED:         "📦 Your items are packed and ready!",
    RIDER_ASSIGNED:   "🛵 A rider has been assigned to your order!",
    OUT_FOR_DELIVERY: "🛵 Your order is on its way to you!",
    READY_FOR_PICKUP: "🏪 Your order is ready for pickup at our shop!",
    DELIVERED:        "🎉 Your order has been delivered. Enjoy your new look! ✨",
    COLLECTED:        "🎉 You've collected your order. Enjoy! ✨",
    CANCELLED:        "❌ Your order was cancelled. Questions? Reply here.",
    REFUNDED:         "💸 Your refund has been processed.",
    PENDING:          "⏳ We've received your order!",
  }

  return `Hello ${order.customer_name} 👗

Your Yanney Trends order *${order.order_number}* has been updated:

*${statusLabel(status)}*

${statusMessages[status]}

Track your order: ${process.env.NEXT_PUBLIC_SITE_URL}/track/${order.order_number}

Thank you for shopping with us 🖤
— Yanney Trends Team`
}
```

---

## 📍 ORDER TRACKING PAGE — `/track/[orderNumber]`

**No authentication required.** Customer uses the link from email/SMS.

**Data fetching:**
```typescript
// Fetch order + status history by order_number (not UUID — safer for public)
const { data: order } = await supabase
  .from('orders')
  .select('*, order_status_history(*)')
  .eq('order_number', params.orderNumber)
  .single()
```

**Layout:**
- Full `#0A0A0A` page
- Yanney Trends logo top-center
- Glass card centered (`max-w-lg`, `backdrop-blur-xl`, border `#2A2A2A`)

**Vertical Stepper:**

Steps shown differ by fulfillment type:

```
DELIVERY: Pending → Confirmed → Packaged → Rider Assigned → Out for Delivery → Delivered
PICKUP:   Pending → Confirmed → Packaged → Ready for Pickup → Collected
```

Each step node:
- Completed: pink filled circle (16px) + white checkmark
- Active: pink circle with pulsing ring animation (`animate-ping` Tailwind)
- Upcoming: `#2A2A2A` hollow circle

Connecting line: `#2A2A2A` base, pink fill up to active step height (animated on load).

Step label: status name (Jost, 14px) + timestamp if completed (muted, 12px).

**Animated delivery scooter:**
If status is OUT_FOR_DELIVERY: SVG scooter icon moves horizontally across the card top. Looping.

**Below stepper:**
- Collapsible "Order Items" section (click to expand)
  - Each item: name, size, qty, price
- Fulfillment summary block
- "Questions? Chat with us on WhatsApp →" (pre-filled wa.me link)
- "View full order details →" (mailto-style — just shows order summary)

---

## 🔐 ADMIN PANEL — FULL SPECIFICATION

### Route: `/admin` (separate layout group `(admin)`)

### Supabase Auth Setup

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (req.nextUrl.pathname.startsWith('/admin') &&
      !req.nextUrl.pathname.startsWith('/admin/login')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }
  return res
}
```

### Admin Login Page (`/admin/login`)

- Full `#0A0A0A` screen
- Centered glass card (480px wide, `backdrop-blur-2xl`, border `#2A2A2A`)
- Yanney Trends logo (SVG, top of card)
- Form:
  - Email input (glass style, pink focus ring)
  - Password input with show/hide toggle
  - "Sign In" button (full-width, `#FF2E88` bg, black text)
- Error state: red-tinted card message (`#2A0A0A` bg, `#F87171` text, border `#991B1B`)
- On success: redirect to `/admin/dashboard`

**Seed owner account:**
```typescript
// scripts/seedAdmin.ts — run once
const { data } = await supabaseAdmin.auth.admin.createUser({
  email: 'owner@yanneytrends.com',
  password: 'ChangeMe123!',
  email_confirm: true
})
await supabaseAdmin.from('admin_users').insert({
  supabase_uid: data.user.id,
  name: 'Shop Owner',
  email: 'owner@yanneytrends.com',
  role: 'OWNER'
})
```

---

### Admin Sidebar (`components/admin/AdminSidebar.tsx`)

Left sidebar, 260px wide on desktop, collapsible to icon-only (60px) on tablet, bottom nav on mobile.

Top: Yanney Trends logo + "Admin" label.

Navigation links:

```
📊  Dashboard      /admin/dashboard         (all roles)
📦  Orders         /admin/orders            (all roles)
🕓  Order History  /admin/history           (all roles)
👗  Products       /admin/products          (OWNER only)
👥  Staff          /admin/staff             (OWNER only)
⚙️   Settings       /admin/settings          (OWNER only)
📊  Analytics      /admin/analytics         (OWNER only)
```

Active link: pink left border + pink text.
OWNER-only links: hidden entirely from STAFF sessions (not just disabled).

Bottom: role badge ("Owner" / "Staff"), user name, "Sign Out" button.

---

### Dashboard (`/admin/dashboard`)

**Top stats grid (4 glassmorphism cards):**

| Card | Data | Color |
|------|------|-------|
| Total Orders | COUNT(*) from orders | White |
| Pending Orders | COUNT where status=PENDING | Red indicator |
| Revenue This Week | SUM(total) last 7 days | Pink |
| Deliveries Today | COUNT where status=OUT_FOR_DELIVERY/DELIVERED AND DATE=today | Green |

Real-time with Supabase Realtime subscription:
```typescript
supabase.channel('orders-dashboard')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
    () => refetchStats())
  .subscribe()
```

**Recent Orders Table (last 10):**

Columns: `Order ID | Customer | Items | Fulfillment | Status | Date | Actions`

Status: colored pill badge (all 10 status colors defined below).
Actions: "View →" button opens Order Detail Drawer.

---

### Orders Page (`/admin/orders`)

**Filter tabs (glass pill buttons):**
```
All | Pending | Confirmed | Packaged | Out for Delivery |
Ready for Pickup | Delivered | Collected | Cancelled | Refunded
```

Active tab: pink bg, black text.

**Search bar:** searches `order_number`, `customer_name`, `customer_phone` (ILIKE query).

**Bulk actions (OWNER only):** Select multiple → bulk status update or CSV export.

**Order table columns:**
`Order ID | Customer Name | Phone | Items | Total (GHS) | Fulfillment | Status | Date | Actions`

Fulfillment icons:
- 🏪 In-Store Pickup
- 📦 Scheduled Delivery
- 🛵 Self-Arranged Rider

**Status Badge Colors (flat, no gradients):**

```typescript
const STATUS_STYLES = {
  PENDING:          { bg: '#1A1A1A', text: '#AAAAAA', border: '#444444' },
  CONFIRMED:        { bg: '#0A2A0A', text: '#4ADE80', border: '#166534' },
  PACKAGED:         { bg: '#1A1A2E', text: '#60A5FA', border: '#1D4ED8' },
  RIDER_ASSIGNED:   { bg: '#1A1A2E', text: '#818CF8', border: '#4338CA' },
  OUT_FOR_DELIVERY: { bg: '#2A1A00', text: '#FBBF24', border: '#92400E' },
  READY_FOR_PICKUP: { bg: '#2A002A', text: '#E879F9', border: '#86198F' },
  DELIVERED:        { bg: '#0A2A0A', text: '#FFFFFF', border: '#166534' },
  COLLECTED:        { bg: '#0A2A0A', text: '#FFFFFF', border: '#166534' },
  CANCELLED:        { bg: '#2A0A0A', text: '#F87171', border: '#991B1B' },
  REFUNDED:         { bg: '#1A1A00', text: '#FDE047', border: '#854D0E' },
}
```

---

### Order Detail Drawer (`components/admin/OrderDetailDrawer.tsx`)

Slides in from right. Width: 600px desktop, full-width mobile.
`AnimatePresence` + `slideInRight` variant.
Glassmorphism background. Backdrop overlay dims the orders page.

**SECTION 1 — Order Header**
- Large order number (Playfair, 28px): "#YT-20250403-4821"
- Date + time placed (Jost, muted)
- Large status badge (current status color scheme, prominent)
- Source badge (WEBSITE / WHATSAPP / INSTAGRAM / IN_STORE / PHONE)

**SECTION 2 — Customer Info**
- Name, Phone, Email (with copy icons)
- Two action buttons:
  - "Message on WhatsApp" → opens wa.me link (pre-filled: "Hi [Name], regarding your order [ID]...")
  - "Send SMS" → opens `sms:[phone]` link on mobile, copies phone on desktop

**SECTION 3 — Order Items**
- Each row: product image thumbnail (40×40px), name, category, size, qty, unit price, line total
- Horizontal rule
- Subtotal, Delivery Fee, Discount, **Grand Total (pink, bold)**

**SECTION 4 — Fulfillment Details**
Contextual block based on `fulfillment_type`:
- PICKUP: shop address + scheduled pickup date/time
- DELIVERY: delivery address + zone + scheduled date/slot + delivery fee
- RIDER: instructions + shop address + "Share on WhatsApp" button

**SECTION 5 — Update Order Status**

Grid of all 10 status buttons (2 rows × 5 cols on desktop).
Current status: pink border + pink background tint.

Clicking new status → micro-confirmation modal:
```
"Change order #YT-XXXX-XXXX to PACKAGED?"
[Cancel]  [Confirm ✓]
```
On confirm:
1. Update `orders.status` in Supabase
2. Insert row into `order_status_history`
3. Call `notifyCustomer(order, newStatus)`
4. Drawer status badge updates instantly (optimistic UI)

**SECTION 6 — Admin Notes**

Feed of all notes (newest first):
```
[Avatar initials] [Staff Name]          [2 hours ago]
"Customer called to confirm size — prefers a relaxed M"
```

Text area: "Add a note about this order..."
"Add Note" button (pink). On submit:
- Insert to `order_notes` in Supabase
- Note appears instantly (optimistic)
- Notes are internal ONLY — never exposed to customer

**SECTION 7 — Status History Log**

Vertical timeline (oldest first):
```
● Apr 3, 10:22 AM  — Order placed (PENDING)
● Apr 3, 11:05 AM  — Confirmed by Abena (PENDING → CONFIRMED)
● Apr 3, 2:30 PM   — Packed by Kwame  (CONFIRMED → PACKAGED)
🔄 Apr 4, 9:00 AM  — Out for Delivery  (PACKAGED → OUT_FOR_DELIVERY)
```

Pink dots for completed, animated pulse for current.

---

### Order History Page (`/admin/history`)

- Only shows: DELIVERED, COLLECTED, CANCELLED, REFUNDED
- Date range filter (from/to date pickers)
- Status filter + Fulfillment type filter
- Same table layout as Orders page
- Rows are **read-only** in the drawer (no status update, only view)
- **Export to CSV** button (OWNER only):

```typescript
// Generates CSV: OrderID,Customer,Phone,Items,Total,Status,Date,Fulfillment
function exportToCSV(orders: Order[]) {
  const rows = orders.map(o => [
    o.order_number, o.customer_name, o.customer_phone,
    o.items.length, o.total, o.status,
    new Date(o.created_at).toLocaleDateString('en-GH'),
    o.fulfillment_type
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  downloadFile(csv, `yanney-orders-${Date.now()}.csv`, 'text/csv')
}
```

---

### Products Management (`/admin/products`) — OWNER ONLY

**Table columns:** Image | Name | Category | Price | Stock | Published | Updated | Actions

**"Add Product" button** → full-page form (not modal, too much content):

Fields:
- Name (text)
- Slug (auto-generated from name, editable)
- Description (rich textarea)
- Category (select enum)
- Price (GHS, number)
- Sale Price (optional)
- Sizes + Stock (dynamic rows: add/remove size, set stock count)
- Images (Supabase Storage uploader, drag-and-drop, multiple images, reorder)
- Tags (comma-separated, free text)
- Mood Tags (checkboxes: Elegant, Bold, Minimal, Cute, Luxurious)
- Occasion Tags (checkboxes: Casual, Party, Wedding, Work, Date Night, Photoshoot)
- Outfit Group ID (optional, to link with paired products)
- Pairing IDs (product search autocomplete, multiple)
- Published toggle
- Featured toggle
- Meta title + Meta description (SEO)

**Edit:** same form pre-populated.
**Mark Sold Out:** sets all size stocks to 0 + toast confirmation.

---

### Staff Management (`/admin/staff`) — OWNER ONLY

**Table:** Name | Email | Role | Last Active | Status (Active/Inactive) | Actions

**"Add Staff" glass modal:**
- Name, Email, Temporary Password, Role (Owner/Staff)
- On submit: creates Supabase auth user + admin_users row
- Temporary password sent via email (using Resend)

**Actions:**
- Deactivate (sets `is_active = false`, cannot login)
- Reactivate
- Reset Password (sends Supabase password reset email)
- View Activity Log (filtered order status history by this staff member)

**IMPORTANT:** Cannot delete accounts. Deactivate only. Preserves audit history.

---

### Settings Page (`/admin/settings`) — OWNER ONLY

Sections (tabbed):

**1. Shop Info:**
- Shop name, tagline, address, WhatsApp number, Instagram handle

**2. Delivery Configuration:**
- Delivery days (multi-select checkboxes: Mon–Sun)
- Delivery cutoff day + time
- Zone A fee (GHS), Zone B fee (GHS), Zone C fee (GHS)
- Max Pay-on-Delivery order value (GHS)

**3. Pickup Configuration:**
- Pickup hours (text)
- Is shop currently open? (toggle) — affects storefront pickup option
- Is delivery available? (toggle) — affects storefront delivery option

**4. Notifications:**
Toggle matrix (status × channel):

```
Status                  | Email | SMS | WhatsApp
Confirmed               |  ✓   |  ✓  |    ✓
Packaged                |  ✓   |  ✗  |    ✓
Out for Delivery        |  ✓   |  ✓  |    ✓
Ready for Pickup        |  ✓   |  ✓  |    ✓
Delivered/Collected     |  ✓   |  ✓  |    ✓
Cancelled               |  ✓   |  ✓  |    ✓
Refunded                |  ✓   |  ✓  |    ✗
```

All settings saved to `shop_settings` table via PATCH API route.

---

### Analytics Page (`/admin/analytics`) — OWNER ONLY

**1. Revenue Chart:**
- Line chart: daily revenue for last 30 days
- Toggle: 7 days / 30 days / 90 days
- Data: `SELECT DATE(created_at), SUM(total) FROM orders WHERE payment_status='PAID' GROUP BY date`

**2. Best Sellers:**
- Bar chart: top 10 products by units sold
- Derived from: count occurrences of each productId across all order `items` JSONB arrays

**3. Order Sources Pie Chart:**
- WEBSITE vs WHATSAPP vs INSTAGRAM vs IN_STORE vs PHONE

**4. Delivery Performance:**
- Average time from CONFIRMED → DELIVERED
- Orders per fulfillment type

**5. Key KPI Numbers:**
- Total revenue (all time)
- Average order value
- Total customers (unique phones)
- Repeat customer rate (phone appears in 2+ orders)

Build charts using **Recharts** (`npm install recharts`).

---

## 🛒 CART SYSTEM (ZUSTAND)

```typescript
// store/cartStore.ts
interface CartItem {
  productId: string
  name: string
  imageUrl: string
  category: string
  size: string
  quantity: number
  unitPrice: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  get total(): number
  get itemCount(): number
}
```

Cart state persisted to `localStorage` via Zustand middleware.
Cart drawer: glass panel, slides from right, 420px wide.

---

## 💬 WHATSAPP DEEP LINK SYSTEM

Every product generates:

```typescript
export function buildWhatsAppOrderLink(
  product: Product,
  size: string,
  quantity: number,
  shopPhone: string
): string {
  const message = `Hello Yanney Trends 👗

I'd like to order:

*Product:* ${product.name}
*Size:* ${size}
*Quantity:* ${quantity}
*Price:* GHS ${(product.sale_price ?? product.price) * quantity}

Could you please assist me with this order?`

  return `https://wa.me/${shopPhone}?text=${encodeURIComponent(message)}`
}
```

---

## 🎬 RUNWAY MODE

Activated by: navbar toggle button "Runway ✦" or homepage section CTA.

```typescript
// Runway mode: converted from vertical scroll to horizontal
// Uses Framer Motion drag + carousel

// State: isRunwayMode (global Zustand)
// Effect: body overflow-x hidden, enable horizontal swipe

// Each slide = full viewport product card:
// - Full-bleed image (object-cover, 100vh)
// - Bottom overlay with: category (Bebas, large), product name (Playfair), price, "Wear This →" CTA
// - Navigation: left/right arrow buttons + keyboard arrows
// - Swipe gesture support (Framer Motion drag constraints)

// Exit: "✕ Exit Runway" button top-right
// Transition: horizontal slide with spring physics
```

---

## 🧩 COMPONENT LIBRARY (`/components`)

### Storefront Components (`/components/storefront/`)

```
Navbar.tsx               — logo, search, wishlist, cart icon, runway toggle
Footer.tsx               — full footer
HeroSection.tsx          — homepage hero
MarqueeTicker.tsx        — scrolling ticker
CategoryCard.tsx         — editorial category card
ProductCard.tsx          — grid product card with hover overlay
ProductGallery.tsx       — product page image gallery + lightbox
QuantityStack.tsx        — visual quantity stacking (CORE FEATURE)
StickyPurchasePanel.tsx  — right column on product page
SizeSelector.tsx         — size pills with stock awareness
AISizeHelper.tsx         — size recommendation mini-modal
OutfitBundle.tsx         — "Styled With" section
QuickView.tsx            — fullscreen quick view modal
CartDrawer.tsx           — slide-in cart
WishlistButton.tsx       — heart toggle
DeliveryEstimator.tsx    — delivery zone + fee + ETA calculator
RunwayMode.tsx           — horizontal full-screen shopping mode
OrderTracker.tsx         — vertical stepper for /track page
```

### Admin Components (`/components/admin/`)

```
AdminSidebar.tsx         — collapsible nav sidebar
DashboardCard.tsx        — glassmorphism stat card
OrdersTable.tsx          — paginated, filterable orders table
OrderDetailDrawer.tsx    — full-detail slide-in drawer
StatusBadge.tsx          — colored status pill
StatusUpdater.tsx        — status change grid + confirmation modal
NotesTimeline.tsx        — internal notes feed
StatusHistoryLog.tsx     — timeline of status changes
ProductForm.tsx          — add/edit product form
StaffTable.tsx           — staff management table
SettingsForm.tsx         — shop configuration form
AnalyticsChart.tsx       — Recharts wrapper components
```

### Shared Components (`/components/ui/`)

```
GlassCard.tsx            — reusable glassmorphism card
PinkButton.tsx           — primary CTA button
GhostButton.tsx          — secondary outlined button
Input.tsx                — styled input with pink focus ring
Modal.tsx                — centered modal with backdrop
Toast.tsx                — notification toast
ConfirmModal.tsx         — "Are you sure?" micro-modal
Skeleton.tsx             — loading skeleton
```

---

## 📁 COMPLETE FILE STRUCTURE

```
yanney-trends/
├── app/
│   ├── (storefront)/
│   │   ├── layout.tsx                 → storefront layout (navbar, footer)
│   │   ├── page.tsx                   → homepage
│   │   ├── shop/
│   │   │   └── page.tsx               → shop grid with filters
│   │   ├── product/
│   │   │   └── [slug]/
│   │   │       └── page.tsx           → product detail page
│   │   ├── checkout/
│   │   │   ├── page.tsx               → checkout steps
│   │   │   └── verify/
│   │   │       └── page.tsx           → Paystack callback verification
│   │   ├── stylist/
│   │   │   └── page.tsx               → AI stylist quiz + results
│   │   └── track/
│   │       └── [orderNumber]/
│   │           └── page.tsx           → public order tracking
│   ├── (admin)/
│   │   ├── layout.tsx                 → admin layout (sidebar, auth guard)
│   │   └── admin/
│   │       ├── login/
│   │       │   └── page.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── orders/
│   │       │   └── page.tsx
│   │       ├── history/
│   │       │   └── page.tsx
│   │       ├── products/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── staff/
│   │       │   └── page.tsx
│   │       ├── settings/
│   │       │   └── page.tsx
│   │       └── analytics/
│   │           └── page.tsx
│   └── api/
│       ├── orders/
│       │   ├── route.ts               → POST: create order
│       │   └── [id]/
│       │       ├── route.ts           → GET/PATCH order
│       │       └── status/
│       │           └── route.ts       → PATCH: update status + notify
│       ├── products/
│       │   └── route.ts
│       ├── stylist/
│       │   └── recommend/
│       │       └── route.ts          → POST: quiz → product recommendations
│       ├── delivery/
│       │   └── estimate/
│       │       └── route.ts          → POST: address → zone + fee + ETA
│       ├── payments/
│       │   ├── initialize/
│       │   │   └── route.ts          → POST: initialize Paystack payment
│       │   └── verify/
│       │       └── route.ts          → POST: verify Paystack payment
│       └── webhooks/
│           └── paystack/
│               └── route.ts          → POST: Paystack webhook handler
├── components/
│   ├── storefront/                    → (see component list above)
│   ├── admin/                         → (see component list above)
│   └── ui/                            → (see component list above)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── paystack.ts
│   ├── notificationService.ts
│   ├── orderUtils.ts
│   ├── stylist.ts
│   ├── delivery.ts
│   ├── motion.ts
│   └── utils.ts
├── store/
│   ├── cartStore.ts
│   ├── wishlistStore.ts
│   ├── runwayStore.ts
│   └── stylistStore.ts
├── types/
│   └── index.ts                       → all TypeScript interfaces
├── scripts/
│   └── seedAdmin.ts
├── middleware.ts                       → Supabase auth guard
├── tailwind.config.ts
├── next.config.js
├── .env.local
└── package.json
```

---

## ⚡ PERFORMANCE RULES

```
✓ All product images served via Supabase Storage + next/image
✓ Convert all uploaded images to WebP in Supabase Storage
✓ Lazy load all below-fold sections (intersection observer)
✓ Code split every route (automatic with App Router)
✓ Skeleton loaders on all data-fetching components
✓ Static generation (SSG) for product pages where possible
✓ Server Components for all non-interactive sections
✓ Minimize client-side JS — only use "use client" when necessary
✓ Target Lighthouse score ≥ 90 on mobile
✓ Font display: swap on all Google Fonts
✓ Preload hero image
```

---

## 🧠 MICRO-LUXURY DETAILS (MANDATORY)

These details separate a luxury boutique from a template. Every single one must be implemented:

```
✓ Custom cursor: 12px dot that expands to 40px ring on hover over links/buttons
✓ Pink scrollbar: ::-webkit-scrollbar (6px, #FF2E88 thumb)
✓ Grain overlay: fixed SVG noise texture, 2% opacity, pointer-events none, z-index max
✓ Underline animations: all nav links, hover underline grows from center (scaleX 0→1)
✓ Image hover scale: max 1.05, transition 500ms ease, never more
✓ Cinematic page transitions: Framer Motion AnimatePresence, opacity fade + y: 10 shift
✓ Pink focus glow: all inputs get box-shadow: 0 0 0 2px #FF2E8840 on focus
✓ Cart hanger swing: cart icon rotates on item add
✓ Toast notifications: fade in from bottom-right, 3s duration, auto-dismiss
✓ Number animations: stat counters count up on first view (dashboard + analytics)
✓ Skeleton loaders: dark (#1A1A1A) with shimmer animation, match exact layout
✓ Empty states: styled illustrations, never just "No items found" plain text
✓ 404 page: branded, on-theme, with "Shop the Collection" CTA
```

---

## 🔮 FUTURE-READY ARCHITECTURE

The schema and codebase must be structured to allow these WITHOUT a rebuild:

```
→ shopId column on products and orders (multi-vendor)
→ Influencer storefronts (/[handle]/shop — separate layout)
→ Loyalty points (points field on a future customers table)
→ Flash sales (sale_starts_at, sale_ends_at on products)
→ Discount codes (coupons table, apply at checkout)
→ Gift cards (gift_cards table)
→ Mobile app (all logic in /api routes, reusable as REST API)
→ Multi-currency (currency field on orders, currently default GHS)
```

---

## 🏁 FINAL DIRECTIVE

```
This platform is not a store — it's a fashion destination.

Every pixel must communicate quality.
Every animation must create desire.
Every interaction must feel effortless.

Build it as if it's going to be featured in a Ghana tech magazine
as the best fashion ecommerce platform in West Africa.

If it looks like any other Next.js ecommerce starter → start over.
```
