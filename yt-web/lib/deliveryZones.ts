/** Yanney Trendss boutique delivery — zone + rider fee (GHS) */

export interface DeliveryZone {
  id: string;
  label: string;
  area: string;
  riderFeeGhs: number;
  eta: string;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: "accra-core", label: "Central Accra", area: "Osu, Ridge, Airport Residential", riderFeeGhs: 25, eta: "24-48 hours" },
  { id: "east", label: "East Accra", area: "East Legon, Madina, Adenta", riderFeeGhs: 35, eta: "24-48 hours" },
  { id: "west", label: "West Accra", area: "Dansoman, Kaneshie, Laterbiokorshie", riderFeeGhs: 20, eta: "24-48 hours" },
  { id: "north", label: "North Accra", area: "Achimota, Dome, Haatso", riderFeeGhs: 30, eta: "24-48 hours" },
  { id: "tema", label: "Tema & surrounds", area: "Tema, Ashaiman", riderFeeGhs: 45, eta: "2–3 days" },
  { id: "nationwide", label: "Outside Greater Accra", area: "Other regions — standard courier", riderFeeGhs: 55, eta: "3–5 days" },
];

export function getDeliveryZone(id: string): DeliveryZone | undefined {
  return DELIVERY_ZONES.find((z) => z.id === id);
}
