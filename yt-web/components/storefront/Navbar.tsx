"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HangerCartIcon } from "@/components/storefront/HangerCartIcon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { useWishlistStore } from "@/store/wishlistStore";

function IconShop({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function IconSpark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
      <path d="m5.6 5.6 2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" strokeLinecap="round" />
    </svg>
  );
}

function IconInspo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 20 9.5 5.5 12 12l2.5-6.5L20 20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" />
    </svg>
  );
}

function IconCheckout({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 6h16v12H4z" strokeLinejoin="round" />
      <path d="m4 7 8 5 8-5" strokeLinejoin="round" />
    </svg>
  );
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10Z" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

const navLink =
  "nav-link-ui inline-flex items-center gap-1.5 font-jost text-sm text-brand-muted transition-colors hover:text-brand-text";

const mobileLinks = [
  { href: "/shop", label: "Shop", Icon: IconShop },
  { href: "/stylist", label: "Style me", Icon: IconSpark },
  { href: "/runway", label: "Inspo", Icon: IconInspo },
  { href: "/find-us", label: "Find us", Icon: IconMapPin },
  { href: "/contact", label: "Contact", Icon: IconMail },
  { href: "/checkout", label: "Cart", Icon: IconCheckout },
] as const;

export function Navbar() {
  const openCart = useCartStore((s) => s.openCart);
  const giftActive = useUiStore((s) => s.giftCheckoutActive);
  const wishCount = useWishlistStore((s) => s.ids.length);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-brand-border bg-brand-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 font-playfair text-base tracking-tight text-brand-text sm:text-lg"
        >
          Yanney <span className="text-brand-pink">Trends</span>
        </Link>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border md:hidden"
          aria-expanded={menuOpen}
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
        <nav className="hidden flex-1 items-center justify-center gap-5 md:flex lg:gap-7">
          <Link href="/shop" className={navLink}>
            <IconShop className="h-4 w-4 opacity-80" />
            Shop
          </Link>
          <Link href="/stylist" className={navLink}>
            <IconSpark className="h-4 w-4 opacity-80" />
            Style me
          </Link>
          <Link href="/runway" className={navLink}>
            <IconInspo className="h-4 w-4 opacity-80" />
            Inspo
          </Link>
          <Link href="/checkout" className={navLink}>
            <IconCheckout className="h-4 w-4 opacity-80" />
            Cart
          </Link>
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Link
            href="/shop"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-brand-muted transition-colors hover:border-brand-border hover:text-brand-pink"
            title="Saved pieces"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M12 21s-7-4.35-7-10a5 5 0 0 1 9.9-1 5 5 0 0 1 9.1 1c0 5.65-7 10-7 10Z" strokeLinejoin="round" />
            </svg>
            {wishCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded border border-brand-border bg-brand-elevated px-0.5 text-[8px] font-bold text-brand-text">
                {wishCount > 9 ? "9+" : wishCount}
              </span>
            ) : null}
          </Link>
          {giftActive ? (
            <span className="hidden text-xs font-jost text-brand-pink sm:inline" title="Gift checkout">
              Gift
            </span>
          ) : null}
          <HangerCartIcon onClick={openCart} />
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[110] bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="fixed left-0 top-0 z-[120] flex h-[100dvh] min-h-[100dvh] w-[min(100vw-1rem,22rem)] max-w-full flex-col overflow-y-auto overscroll-contain border-r border-brand-border bg-brand-bg p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] pt-[max(1.5rem,env(safe-area-inset-top))] shadow-xl md:hidden"
              style={{ maxHeight: "100dvh" }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 36 }}
            >
              <div className="mb-6 flex shrink-0 items-center justify-between">
                <span className="font-playfair text-lg text-brand-text">Menu</span>
                <button
                  type="button"
                  className="rounded-lg border border-brand-border px-3 py-1 font-jost text-sm text-brand-text"
                  onClick={() => setMenuOpen(false)}
                >
                  Close
                </button>
              </div>
              <ul className="flex min-h-0 flex-1 flex-col gap-1">
                {mobileLinks.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 font-jost text-sm text-brand-muted hover:bg-brand-surface"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4 opacity-80" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
