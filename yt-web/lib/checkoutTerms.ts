/** Checkout terms — legal review recommended before production */

export const CHECKOUT_TERMS_SECTIONS = [
  {
    title: "Orders & pricing",
    body: `Prices are shown in Ghana Cedis (GHS) and include applicable taxes unless stated otherwise. We reserve the right to correct pricing errors before payment is captured. Once you confirm an order, a binding contract is formed subject to payment authorisation and stock availability.`,
  },
  {
    title: "Delivery & pickup",
    body: `Delivery windows and fees are estimates. Rural or peak-period orders may take longer. For pickup, bring a valid ID and your order reference. Risk passes to you on handover to the carrier or at boutique collection.`,
  },
  {
    title: "Returns & exchanges",
    body: `Eligible returns must be unworn, with tags attached, within the period stated in your order confirmation. Sale items may be final sale. Refunds are processed to the original payment method where possible.`,
  },
  {
    title: "Payments",
    body: `We may offer Paystack, mobile money, cards, or cash on delivery where available. You authorise us to charge your selected method for the order total plus any agreed delivery fees.`,
  },
  {
    title: "Communications",
    body: `By entering your email at checkout you agree to receive transactional messages about your order. Marketing emails are optional and can be unsubscribed from at any time.`,
  },
  {
    title: "Limitation",
    body: `To the extent permitted by law, Yanney Trendss is not liable for indirect or consequential loss. Nothing in these terms limits liability for death, personal injury caused by negligence, or fraud.`,
  },
] as const;

export function formatCheckoutTermsPlain(): string {
  return CHECKOUT_TERMS_SECTIONS.map(
    (s) => `${s.title.toUpperCase()}\n\n${s.body}`,
  ).join("\n\n—\n\n");
}
