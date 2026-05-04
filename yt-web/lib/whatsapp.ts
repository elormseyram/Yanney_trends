import type { CatalogProduct } from "@/types/product";

export function buildWhatsAppOrderLink(
  product: Pick<CatalogProduct, "name" | "price" | "sale_price">,
  size: string,
  quantity: number,
  shopPhone: string,
): string {
  const unit = product.sale_price ?? product.price;
  const message = `Hello Yanney Trendss 👗

I'd like to order:

*Product:* ${product.name}
*Size:* ${size}
*Quantity:* ${quantity}
*Price:* GHS ${unit * quantity}

Could you please assist me with this order?`;

  const digits = shopPhone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppPrefill(message: string, shopPhone: string): string {
  const digits = shopPhone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
