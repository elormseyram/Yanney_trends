export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKAGED"
  | "RIDER_ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "COLLECTED"
  | "CANCELLED"
  | "REFUNDED";

export type ProductCategory =
  | "DRESS"
  | "TWO_PIECE_SET"
  | "OUTFIT"
  | "BAG"
  | "HEELS"
  | "SLIPPERS"
  | "ACCESSORY";

export type ScheduleStatus = "PENDING" | "APPROVED" | "DECLINED";

export type HubOrderListRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  status: string;
  total: number;
  currency: string;
  payment_status: string;
  created_at: string;
  fulfillment_type: string;
  scheduled_date: string | null;
  scheduled_slot: string | null;
  schedule_status: ScheduleStatus | null;
  is_gift_order?: boolean;
  delivery_rider_id?: string | null;
  rider_display_name?: string | null;
};

export type HubOrderDetail = HubOrderListRow & {
  customer_phone: string;
  items: unknown;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  delivery_address: string | null;
  delivery_zone: string | null;
  schedule_decision_note: string | null;
  payment_method: string;
  source?: string | null;
  metadata?: unknown;
  gift_message: string | null;
  relationship: string | null;
  updated_at: string;
  rider?: { id: string; display_name: string; phone: string | null } | null;
};

export type RunwayOutfitPostRow = {
  id: string;
  title: string;
  subtitle: string | null;
  hero_image_url: string | null;
  product_ids: string[];
  bundle_price_ghs: number;
  sort_order: number;
  is_published: boolean;
  created_at: string;
};

export type HubRiderRow = {
  id: string;
  display_name: string;
  phone: string | null;
  vehicle_note: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export type HubProductRow = {
  id: string;
  name: string;
  slug: string;
  card_subtitle?: string | null;
  category: string;
  price: number;
  sale_price: number | null;
  is_published: boolean;
  sizes: unknown;
  colors?: string[] | null;
  updated_at: string;
};

export type HubProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type ShopSettingsRow = {
  id: string;
  shop_name: string;
  tagline: string | null;
  shop_address: string | null;
  whatsapp_number: string | null;
  instagram_handle: string | null;
  zone_a_name: string;
  zone_b_name: string;
  zone_c_name: string;
  zone_a_fee: number | null;
  zone_b_fee: number | null;
  zone_c_fee: number | null;
  shop_is_open: boolean;
  delivery_available: boolean;
  pickup_available: boolean;
  announcement_text: string | null;
  announcement_active: boolean;
  marquee_ticker_text?: string | null;
  marquee_ticker_active?: boolean;
  delivery_cutoff_time?: string | null;
};

export type ProductCategoryRow = {
  slug: string;
  label: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
};

export type HubStaffMember = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "owner";
  created_at: string;
};

export type FrequentCustomer = {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  order_count: number;
  total_spent: number;
  currency: string;
  last_order_at: string;
};
