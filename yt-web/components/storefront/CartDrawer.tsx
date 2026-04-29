"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { slideInRight } from "@/lib/motion";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { useWishlistStore } from "@/store/wishlistStore";

function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const total = useCartStore((s) =>
    s.items.reduce((t, i) => t + i.unitPrice * i.quantity, 0),
  );
  const giftActive = useUiStore((s) => s.giftCheckoutActive);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wishHas = useWishlistStore((s) => s.has);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart overlay"
            className="fixed inset-0 z-[150] bg-black/30 dark:bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed bottom-0 right-0 top-0 z-[160] flex w-full max-w-[400px] flex-col border-l border-brand-border bg-brand-bg text-brand-text shadow-2xl"
            initial={slideInRight.initial}
            animate={slideInRight.animate}
            exit={slideInRight.exit}
            transition={slideInRight.transition}
          >
            <header className="flex items-center justify-between border-b border-brand-border px-5 py-4 dark:border-stone-800">
              <div>
                <p className="font-bebas text-lg tracking-wide text-brand-pink">Your bag</p>
                <p className="font-jost text-xs text-brand-muted dark:text-stone-500">
                  {giftActive ? "Gift order" : "Review your cart"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-lg border border-transparent px-3 py-1.5 font-jost text-sm text-brand-muted transition-colors hover:border-brand-border hover:text-brand-text dark:hover:border-stone-600"
              >
                Close
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <p className="py-16 text-center font-jost text-sm text-brand-muted dark:text-stone-500">
                  Nothing here yet — add a piece from the shop.
                </p>
              ) : (
                <ul className="space-y-0 divide-y divide-brand-border dark:divide-stone-800">
                  {items.map((i) => (
                    <li
                      key={`${i.productId}-${i.size}-${i.color ?? ""}`}
                      className="flex gap-3 py-4 first:pt-0"
                    >
                      <div className="relative h-[72px] w-[56px] shrink-0 overflow-hidden rounded-lg border border-brand-border bg-brand-elevated dark:border-stone-700 dark:bg-stone-900">
                        <Image
                          src={i.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        {i.slug ? (
                          <Link
                            href={`/product/${i.slug}`}
                            onClick={closeCart}
                            className="font-playfair text-sm text-brand-text hover:text-brand-pink dark:text-stone-100"
                          >
                            {i.name}
                          </Link>
                        ) : (
                          <p className="font-playfair text-sm text-brand-text dark:text-stone-100">{i.name}</p>
                        )}
                        <p className="font-jost text-xs text-brand-muted dark:text-stone-500">
                          {i.color ? `${i.color} · ` : ""}
                          {i.size} · GHS {i.unitPrice}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-brand-border px-2.5 py-1 font-jost text-xs dark:border-stone-600"
                            onClick={() =>
                              updateQuantity(i.productId, i.size, i.quantity - 1, i.color)
                            }
                          >
                            −
                          </button>
                          <span className="min-w-[1.5rem] text-center font-jost text-sm">{i.quantity}</span>
                          <button
                            type="button"
                            className="rounded-lg border border-brand-border px-2.5 py-1 font-jost text-xs dark:border-stone-600"
                            onClick={() =>
                              updateQuantity(i.productId, i.size, i.quantity + 1, i.color)
                            }
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="ml-auto inline-flex items-center gap-1 rounded-lg font-jost text-xs text-brand-pink hover:underline"
                            onClick={() => toggleWish(i.productId)}
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                              <path d="M12 21s-7-4.35-7-10a5 5 0 0 1 9.9-1 5 5 0 0 1 9.1 1c0 5.65-7 10-7 10Z" strokeLinejoin="round" />
                            </svg>
                            {wishHas(i.productId) ? "Saved" : "Add to wishlist"}
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg font-jost text-xs text-brand-pink hover:underline"
                            onClick={() => removeItem(i.productId, i.size, i.color)}
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <footer className="border-t border-brand-border px-5 py-4 dark:border-stone-800">
              <div className="mb-4 flex justify-between font-jost text-sm">
                <span className="text-brand-muted dark:text-stone-500">Subtotal</span>
                <span className="text-brand-text dark:text-stone-100">GHS {total.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                aria-disabled={items.length === 0}
                className={`group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl bg-brand-pink py-3.5 pl-5 pr-3 font-jost text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-pink-hover hover:pr-2 ${
                  items.length === 0 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-white/90"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden
                  >
                    <path d="M5 7h14l-1.4 9.4a2 2 0 0 1-2 1.6H8.4a2 2 0 0 1-2-1.6L5 7Z" strokeLinejoin="round" />
                    <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinejoin="round" />
                  </svg>
                  Checkout
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 transition-transform duration-300 ease-out group-hover:translate-x-1">
                  <svg
                    className="h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </span>
              </Link>
              <p className="mt-2 text-center font-jost text-[11px] text-brand-muted dark:text-stone-500">
                Swipe to pay with Mobile Money
              </p>
            </footer>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
