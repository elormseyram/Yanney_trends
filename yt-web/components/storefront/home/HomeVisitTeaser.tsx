import Link from "next/link";

export function HomeVisitTeaser() {
  return (
    <section className="border-y border-brand-border bg-brand-surface py-14">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <p className="font-jost text-[10px] uppercase tracking-[0.28em] text-brand-muted">
            Visit
          </p>
          <h2 className="mt-2 font-playfair text-2xl text-brand-text sm:text-3xl">
            The boutique in Dansoman
          </h2>
          <p className="mt-2 max-w-xl font-jost text-sm text-brand-muted">
            Hours, directions, and a look inside — everything for your in-person fitting.
          </p>
        </div>
        <Link
          href="/find-us"
          className="inline-flex items-center rounded-xl border border-brand-border bg-brand-elevated px-6 py-3 font-jost text-sm font-medium text-brand-text transition-colors hover:border-brand-pink/50"
        >
          Find us
        </Link>
      </div>
    </section>
  );
}
