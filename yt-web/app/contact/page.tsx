import { ContactPageForm } from "@/components/storefront/contact/ContactPageForm";
import { SHOP_ADDRESS, SHOP_PHONE_CALL, SHOP_WHATSAPP } from "@/lib/constants";
import { formatGhSpaced } from "@/lib/ghPhone";
import { SHOP_WHATSAPP_CHAT_URL } from "@/lib/site";

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinejoin="round" />
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

export default function ContactPage() {
  const callDigits = SHOP_PHONE_CALL.replace(/\D/g, "");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-jost text-[10px] uppercase tracking-[0.28em] text-brand-muted">
        Write to us
      </p>
      <h1 className="mt-2 font-playfair text-3xl text-brand-text md:text-4xl">
        Let&apos;s start a conversation
      </h1>
      <p className="mt-4 font-jost text-sm leading-relaxed text-brand-muted">
        From a single sizing question to a full rail for your team — tell us what you need. We read
        every message.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a
          href={SHOP_WHATSAPP_CHAT_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-brand-border bg-brand-surface p-5 transition-colors hover:border-brand-pink/40"
        >
          <p className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.2em] text-brand-muted">
            <IconWhatsApp className="h-4 w-4 shrink-0 text-brand-pink" />
            WhatsApp
          </p>
          <p className="mt-2 font-jost text-lg font-medium text-brand-text">
            {formatGhSpaced(SHOP_WHATSAPP)}
          </p>
          <p className="mt-1 font-jost text-xs text-brand-dimmed">
            Fast replies for orders &amp; styling
          </p>
        </a>
        <a
          href={`tel:+${callDigits}`}
          className="rounded-xl border border-brand-border bg-brand-surface p-5 transition-colors hover:border-brand-pink/40"
        >
          <p className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.2em] text-brand-muted">
            <IconPhone className="h-4 w-4 shrink-0 text-brand-pink" />
            Call
          </p>
          <p className="mt-2 font-jost text-lg font-medium text-brand-text">
            {formatGhSpaced(SHOP_PHONE_CALL)}
          </p>
          <p className="mt-1 font-jost text-xs text-brand-dimmed">
            Boutique line — leave a message if we miss you
          </p>
        </a>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-brand-border/80 bg-[var(--surface-card-soft)] p-5">
        <p className="flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.2em] text-brand-muted">
          <IconMapPin className="h-4 w-4 shrink-0 text-brand-pink" />
          Visit
        </p>
        <p className="mt-2 font-playfair text-xl font-semibold text-brand-text">{SHOP_ADDRESS}</p>
        <p className="mt-2 font-jost text-xs text-brand-dimmed">
          Prefer to pop in? Message us first so we can expect you.
        </p>
      </div>

      <ContactPageForm />
    </div>
  );
}
