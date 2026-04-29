const badges = [
  {
    title: "Free delivery",
    sub: "Orders GHS 1,000+ in Accra",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
        <path d="M4 16h2l1-4h9l2 4h2" strokeLinejoin="round" />
        <circle cx="8.5" cy="18.5" r="1.5" />
        <circle cx="17.5" cy="18.5" r="1.5" />
        <path d="M7 16h10l-1-6H8L7 16Z" />
      </svg>
    ),
  },
  {
    title: "Easy returns",
    sub: "Eligible pieces · see policy",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
        <path d="M4 10h6V4" strokeLinecap="round" />
        <path d="M20 14h-6v6" strokeLinecap="round" />
        <path d="M20 10a8 8 0 0 0-14.3-4.3L4 10" />
        <path d="M4 14a8 8 0 0 0 14.3 4.3L20 14" />
      </svg>
    ),
  },
  {
    title: "Secure payment",
    sub: "Paystack",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
        <path d="M12 3 4 7v5c0 5 3.5 9 8 10 4.5-1 8-5 8-10V7l-8-4Z" strokeLinejoin="round" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

export function TrustBadgesSection() {
  return (
    <section className="border-b border-brand-border bg-brand-bg py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col divide-y divide-brand-border border border-brand-border sm:flex-row sm:divide-x sm:divide-y-0">
          {badges.map((b) => (
            <div key={b.title} className="flex flex-1 flex-col items-center gap-3 px-6 py-8 text-center sm:py-10">
              <div className="text-brand-text">{b.icon}</div>
              <p className="font-bebas text-xs tracking-[0.2em] text-brand-pink">{b.title}</p>
              <p className="font-jost text-xs text-brand-muted">{b.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
