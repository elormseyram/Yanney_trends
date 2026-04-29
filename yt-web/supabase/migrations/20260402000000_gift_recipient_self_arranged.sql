-- Yanney Trends: gift orders, recipients, self-arranged rider metadata
-- Run in Supabase: SQL Editor → New query → paste → Run
-- Prerequisite: public.orders must already exist (your storefront order schema).

-- Self-arranged logistics: set fulfillment_type = 'RIDER' and self_arranged_service to e.g. 'yango'.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS is_gift_order BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gift_message TEXT,
  ADD COLUMN IF NOT EXISTS hide_price BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS relationship TEXT,
  ADD COLUMN IF NOT EXISTS self_arranged_service TEXT,
  ADD COLUMN IF NOT EXISTS buyer_email_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS buyer_name_snapshot TEXT;

CREATE TABLE IF NOT EXISTS recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipients_order_id ON recipients(order_id);

ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage recipients" ON recipients;
DROP POLICY IF EXISTS "Hub staff manage recipients" ON recipients;
CREATE POLICY "Hub staff manage recipients"
  ON recipients FOR ALL
  USING (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()))
  WITH CHECK (exists (select 1 from public.hub_staff h where h.user_id = auth.uid()));
