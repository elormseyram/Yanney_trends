import Link from "next/link";
import { SHOP_ADDRESS, SHOP_WHATSAPP } from "@/lib/constants";
import { formatGhSpaced } from "@/lib/ghPhone";
import { FOOTER_NAV, SHOP_WHATSAPP_CHAT_URL, SITE_CREDIT, SITE_EMAIL } from "@/lib/site";
import { FooterNewsletter } from "@/components/storefront/FooterNewsletter";
import { FooterSocialCards } from "@/components/storefront/FooterSocialCards";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-brand-border bg-brand-bg">
      <div className="border-b border-brand-pink/30 bg-[var(--surface-tint)] py-3 text-center">
        <a
          href={SHOP_WHATSAPP_CHAT_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 font-jost text-sm font-medium text-brand-text"
        >
          <svg className="h-5 w-5 shrink-0 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp us · {formatGhSpaced(SHOP_WHATSAPP)}
        </a>
      </div>
      <FooterNewsletter />
      <FooterSocialCards />

      <div className="mx-auto max-w-7xl border-t border-brand-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-playfair text-lg text-brand-text">Yanney Trends</p>
            <p className="mt-2 font-jost text-sm text-brand-muted">
              Style that speaks before you do — luxury fashion, Ghana-first service.
            </p>
          </div>
          <div>
            <p className="font-bebas text-sm tracking-widest text-brand-pink">SHOP</p>
            <ul className="mt-3 space-y-2 font-jost text-sm">
              {FOOTER_NAV.shop.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="nav-link-ui text-brand-muted hover:text-brand-pink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bebas text-sm tracking-widest text-brand-pink">ASSISTANCE</p>
            <ul className="mt-3 space-y-2 font-jost text-sm">
              {FOOTER_NAV.help.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="nav-link-ui text-brand-muted hover:text-brand-pink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bebas text-sm tracking-widest text-brand-pink">CONTACT</p>
            <p className="mt-3 font-bebas text-xs tracking-widest text-brand-muted">EMAIL</p>
            <p className="mt-1 font-jost text-sm text-brand-muted">
              <a href={`mailto:${SITE_EMAIL}`} className="text-brand-pink hover:underline">
                {SITE_EMAIL}
              </a>
            </p>
            <p className="mt-4 font-bebas text-xs tracking-widest text-brand-muted">LOCATION</p>
            <p className="mt-1 font-jost text-sm text-brand-muted">{SHOP_ADDRESS}</p>
            <p className="mt-4 font-bebas text-sm tracking-widest text-brand-pink">PAYMENT</p>
            <p className="mt-2 font-jost text-sm text-brand-muted">
              Momo Payments only
            </p>
            <p className="mt-2 font-jost text-xs text-brand-dimmed">
              Ghana nationwide delivery · International shipping available on request
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-brand-border pt-10 md:grid-cols-2">
          <div id="terms" className="scroll-mt-28">
            <p className="font-bebas text-xs tracking-widest text-brand-muted">TERMS</p>
            <p className="mt-2 font-jost text-xs leading-relaxed text-brand-dimmed">
              By using this site you agree to our order, delivery, and returns policies. Full order
              terms appear before payment. Yanney Trends may update these terms; continued use
              constitutes acceptance.
            </p>
          </div>
          <div id="privacy" className="scroll-mt-28">
            <p className="font-bebas text-xs tracking-widest text-brand-muted">PRIVACY</p>
            <p className="mt-2 font-jost text-xs leading-relaxed text-brand-dimmed">
              We process contact and order data to fulfill purchases and send service messages.
              Marketing is optional. For data requests, email {SITE_EMAIL}.
            </p>
          </div>
        </div>

        <p className="mt-10 border-t border-brand-border pt-8 text-center font-jost text-xs text-brand-dimmed">
          © {new Date().getFullYear()} Yanney Trends · Website by {SITE_CREDIT.name} · WhatsApp{" "}
          <a href={SHOP_WHATSAPP_CHAT_URL} className="hover:text-brand-pink" target="_blank" rel="noreferrer">
            {formatGhSpaced(SHOP_WHATSAPP)}
          </a>{" "}
          · Call{" "}
          <a href={`tel:${SITE_CREDIT.phoneTel}`} className="hover:text-brand-pink">
            {SITE_CREDIT.phoneDisplay}
          </a>
        </p>
      </div>
    </footer>
  );
}
