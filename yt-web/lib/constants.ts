/** Pickup address for self-arranged rider flows */
export const SHOP_ADDRESS =
  "Yanney Trendss Boutique, Dansoman, Accra, Ghana";

/** E.164 without + — WhatsApp & routing */
export const SHOP_WHATSAPP = process.env.NEXT_PUBLIC_SHOP_WHATSAPP ?? "233546894821";
export const SHOP_PHONE_CALL = process.env.NEXT_PUBLIC_SHOP_PHONE ?? "233538453675";

export type SelfArrangedServiceId =
  | "yango"
  | "uber_flash"
  | "sherides"
  | "bolt";

export const SELF_ARRANGED_SERVICES: {
  id: SelfArrangedServiceId;
  name: string;
  logoLetter: string;
  url?: string;
}[] = [
  { id: "yango", name: "Yango Delivery", logoLetter: "Y", url: "https://yango.com" },
  {
    id: "uber_flash",
    name: "Uber Flash / Uber Connect",
    logoLetter: "U",
    url: "https://www.uber.com",
  },
  { id: "sherides", name: "SheRides", logoLetter: "S" },
  {
    id: "bolt",
    name: "Bolt Food / Bolt Delivery",
    logoLetter: "B",
    url: "https://bolt.eu",
  },
];

export const ORDER_SOURCES = [
  "WEBSITE",
  "INSTAGRAM",
  "WHATSAPP",
  "IN_STORE",
  "PHONE",
] as const;

export type OrderSource = (typeof ORDER_SOURCES)[number];

export const RELATIONSHIPS = [
  "Friend",
  "Partner",
  "Sister",
  "Mother",
  "Client",
  "Other",
] as const;

export type Relationship = (typeof RELATIONSHIPS)[number];

export const BODY_DESCRIPTIONS = [
  "Petite",
  "Slim",
  "Curvy",
  "Tall",
  "Plus Size",
  "Not Sure",
] as const;

export type BodyDescription = (typeof BODY_DESCRIPTIONS)[number];
