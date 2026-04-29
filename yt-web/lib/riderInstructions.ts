/** Auto text for riders / third-party drivers (gift-aware). */
export function buildRiderInstructions(params: {
  recipientName: string;
  recipientPhone: string;
  orderRef: string;
}): string {
  return [
    `Deliver to: ${params.recipientName}`,
    `Call: ${params.recipientPhone}`,
    "From: Yanney Trends",
    `Order Ref: ${params.orderRef}`,
  ].join("\n");
}
