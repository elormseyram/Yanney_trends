import Link from "next/link";

export function HomeContactTeaser() {
  return (
    <section className="border-t border-brand-border bg-brand-bg py-14">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <p className="font-jost text-[10px] uppercase tracking-[0.28em] text-brand-muted">
            Concierge
          </p>
          <h2 className="mt-2 font-playfair text-2xl text-brand-text sm:text-3xl">
            Questions, press, or bulk orders
          </h2>
          <p className="mt-2 max-w-xl font-jost text-sm text-brand-muted">
            One dedicated page for topics, styling help, and wholesale-style buys — we reply with care.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center rounded-lg border border-brand-pink/40 bg-brand-elevated px-6 py-3 font-jost text-sm font-medium text-brand-text transition-colors hover:bg-brand-pink-muted"
        >
          Contact us
        </Link>
      </div>
    </section>
  );
}
