/** Public site copy — swap for CMS later */

export const SITE_EMAIL = "hello@yanneytrends.com";

export const SHOP_HOURS =
  "Mon–Fri 9:00 AM – 6:00 PM · Sat 10:00 AM – 5:00 PM · Sun by appointment";

export const SHOP_PHONE_DISPLAY = "053 845 3675";

/** WhatsApp for display (matches SHOP_WHATSAPP local part) */
export const SHOP_WHATSAPP_DISPLAY = "054 689 4821";

/** Primary WhatsApp business / click-to-chat (footer, social, contact) */
export const SHOP_WHATSAPP_CHAT_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_CHAT_URL ??
  "https://api.whatsapp.com/message/XOVIAPUL24NVI1?autoload=1&app_absent=0";

export const SITE_CREDIT = {
  name: "Elorm Seyram",
  phoneDisplay: "053 845 3675",
  phoneTel: "+233538453675",
  wa: "233546894821",
};

export const SOCIAL_CARDS: {
  id: string;
  label: string;
  href: string;
}[] = [
  {
    id: "ig",
    label: "Instagram",
    href:
      process.env.NEXT_PUBLIC_IG_URL ??
      "https://www.instagram.com/bold_fly?igsh=cWsxN2tjOHkxaHJw&utm_source=qr",
  },
  {
    id: "tt",
    label: "TikTok",
    href:
      process.env.NEXT_PUBLIC_TIKTOK_URL ??
      "https://www.tiktok.com/@yanney_trends?_r=1&_t=ZS-95ELBQCP7Sv",
  },
  {
    id: "sc",
    label: "Snapchat",
    href:
      process.env.NEXT_PUBLIC_SNAPCHAT_URL ??
      "https://www.snapchat.com/@yanney_trendss?invite_id=1hq5IC-P&locale=en_US&share_id=KnfT-DsmTnOah4CGCJeoww&sid=8967774c9a034a10b2b3d3c9234eee4f&locale=en-GH",
  },
  {
    id: "wa",
    label: "WhatsApp",
    href: SHOP_WHATSAPP_CHAT_URL,
  },
];

export const FOOTER_NAV = {
  shop: [
    { href: "/shop", label: "Shop all" },
    { href: "/runway", label: "Runway" },
    { href: "/stylist", label: "AI stylist" },
  ],
  help: [
    { href: "/track", label: "Track order" },
    { href: "/find-us", label: "Find us" },
    { href: "/contact", label: "Contact" },
  ],
  policies: [
    { href: "/#terms", label: "Terms" },
    { href: "/#privacy", label: "Privacy" },
  ],
};
