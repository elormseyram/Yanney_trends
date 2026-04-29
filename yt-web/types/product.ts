export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  /** Short line under the title on cards / PDP (from hub `card_subtitle`) */
  cardSubtitle?: string | null;
  /** Display SKU for receipts & support */
  sku?: string;
  description: string;
  fabricCare?: string;
  /** Optional colourways shown on PDP & filters */
  colors?: string[];
  /** Hub dress merchandising: CASUAL | DINNER | EVENING | BOTH */
  dressOccasion?: string | null;
  /** Hub bag merchandising, e.g. tote, clutch */
  bagStyle?: string | null;
  /** Optional headline stock figure from hub; cart logic still uses per-size stock */
  totalStockUnits?: number | null;
  category: string;
  price: number;
  sale_price: number | null;
  sizes: ProductSize[];
  images: ProductImage[];
  tags: string[];
  mood_tags: string[];
  occasion_tags: string[];
  outfit_group_id: string | null;
  pairing_ids: string[];
  popularity_score: number;
  is_featured: boolean;
  is_new?: boolean;
}
