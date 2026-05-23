"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { CatalogProduct } from "@/types/product";
import type { QuizAnswers } from "@/lib/stylist";
import { groupByOutfitGroup, rankProductsForQuiz } from "@/lib/stylist";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ChoiceChipButton } from "@/components/ui/ChoiceChipButton";
import { choice } from "@/lib/choiceStyles";
import { buildWhatsAppPrefill } from "@/lib/whatsapp";
import { SHOP_WHATSAPP } from "@/lib/constants";

const occasions = [
  "Casual Day Out",
  "Party / Night Out",
  "Wedding / Event",
  "Work / Office",
  "Date Night",
  "Photoshoot",
];
const moods = [
  "Elegant & Refined",
  "Bold & Daring",
  "Minimal & Clean",
  "Cute & Feminine",
  "Luxurious & Rich",
];
const fits: { id: string; label: string }[] = [
  { id: "fitted", label: "Fitted (shows my curves)" },
  { id: "relaxed", label: "Relaxed (comfortable, easy)" },
  { id: "flowing", label: "Flowing (loose, free)" },
];
const colorOpts = [
  { id: "neutral", label: "Neutrals (Black, White, Beige)" },
  { id: "bold", label: "Bold (Red, Orange, Yellow)" },
  { id: "cool", label: "Cool (Blue, Green, Purple)" },
  { id: "earth", label: "Earth (Brown, Rust, Olive)" },
  { id: "pastel", label: "Pastels (Pink, Lilac, Mint)" },
];

function resolveOccasionFromUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim().replace(/\+/g, " ");
  const lower = t.toLowerCase();
  const exact = occasions.find((o) => o.toLowerCase() === lower);
  if (exact) return exact;
  const partial = occasions.find(
    (o) =>
      lower.includes(o.toLowerCase().slice(0, 8)) ||
      o.toLowerCase().includes(lower.slice(0, 10)),
  );
  return partial ?? null;
}

type Step = "intro" | "q1" | "q2" | "q3" | "q4" | "q5" | "loading" | "results";

const loadingLines = ["Matching your vibe...", "Curating your looks...", "Almost there..."];

function moodAvatarSrc(mood: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mood)}&backgroundColor=fdf2f8&radius=50`;
}

function IconZap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconSparkleOutline({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
      <path d="m5.6 5.6 2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" strokeLinecap="round" />
    </svg>
  );
}

function IconCircleCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2 2 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const introTraitChips: { label: string; Icon: typeof IconZap }[] = [
  { label: "Fast", Icon: IconZap },
  { label: "Playful", Icon: IconSparkleOutline },
  { label: "Actually useful", Icon: IconCircleCheck },
];

export function StylistQuiz({
  products,
  initialOccasion,
}: {
  products: CatalogProduct[];
  initialOccasion?: string | null;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({
    colors: [],
    budget_max: 600,
  });
  const [loadIdx, setLoadIdx] = useState(0);

  useEffect(() => {
    const o = resolveOccasionFromUrl(initialOccasion ?? undefined);
    if (o) setAnswers((a) => ({ ...a, occasion: o }));
  }, [initialOccasion]);

  useEffect(() => {
    if (step !== "loading") return;
    const t = window.setInterval(() => {
      setLoadIdx((i) => (i + 1) % loadingLines.length);
    }, 1000);
    const done = window.setTimeout(() => setStep("results"), 3000);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [step]);

  const ranked = useMemo(() => {
    if (step !== "results") return [];
    const full: QuizAnswers = {
      occasion: answers.occasion ?? null,
      mood: answers.mood ?? null,
      fit: answers.fit ?? null,
      colors: answers.colors ?? [],
      budget_max: answers.budget_max ?? 600,
    };
    return rankProductsForQuiz(products, full, 12);
  }, [step, answers, products]);

  const outfitGroups = useMemo(() => {
    if (step !== "results") return [];
    const m = groupByOutfitGroup(ranked);
    return Array.from(m.values()).filter((g) => g.length >= 2).slice(0, 3);
  }, [step, ranked]);

  const wa = buildWhatsAppPrefill(
    "Hi Yanney Trendss, I loved my style quiz results and want a stylist to help me choose!",
    SHOP_WHATSAPP,
  );

  const progress =
    step === "intro"
      ? 0
      : step.startsWith("q")
        ? (Number(step[1]) / 5) * 100
        : step === "loading"
          ? 100
          : 100;

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {step !== "intro" && step !== "results" ? (
          <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-brand-border">
            <motion.div
              className="h-full bg-brand-pink"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {step === "intro" ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="relative min-h-[78vh] overflow-hidden rounded-3xl border border-[var(--border-pink)] bg-gradient-to-br from-[var(--surface-card-soft)] via-[var(--surface-tint-deep)] to-[var(--surface-tint)] px-6 py-16 text-center md:py-24"
            >
              <div
                className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-brand-pink/25 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-violet-200/40 blur-3xl"
                aria-hidden
              />
              <p className="relative font-bebas text-sm tracking-[0.4em] text-brand-pink">
                YANNEY STYLIST AI ✦
              </p>
              <h1 className="relative mt-4 font-playfair text-[clamp(2rem,5vw,3.5rem)] leading-tight text-brand-text">
               Dress-up energy, zero guesswork
              </h1>
              <p className="relative mx-auto mt-5 max-w-lg font-jost text-base text-brand-muted md:text-lg">
                Five snappy questions · outfits ranked for your vibe · bundles that actually go together.
              </p>
              <motion.div
                className="relative mt-8 flex flex-wrap justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {introTraitChips.map(({ label, Icon }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-border/80 bg-brand-elevated/80 px-4 py-1.5 font-jost text-xs text-brand-text shadow-sm"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-brand-pink" aria-hidden />
                    {label}
                  </span>
                ))}
              </motion.div>
              <button
                type="button"
                onClick={() => setStep("q1")}
                className={`relative mt-12 ${choice.cta} px-10 py-4 text-base`}
              >
                Start my style quiz →
              </button>
            </motion.div>
          ) : null}

          {step === "q1" ? (
            <QuestionShell
              key="q1"
              title="What’s the occasion?"
              onBack={() => setStep("intro")}
              onNext={() => setStep("q2")}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {occasions.map((o) => (
                  <ChoiceChipButton
                    key={o}
                    active={answers.occasion === o}
                    onClick={() => setAnswers((a) => ({ ...a, occasion: o }))}
                    label={o}
                  />
                ))}
              </div>
            </QuestionShell>
          ) : null}

          {step === "q2" ? (
            <QuestionShell
              key="q2"
              title="What’s your mood?"
              onBack={() => setStep("q1")}
              onNext={() => setStep("q3")}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {moods.map((m) => (
                  <ChoiceChipButton
                    key={m}
                    active={answers.mood === m}
                    onClick={() => setAnswers((a) => ({ ...a, mood: m }))}
                    label={m}
                    leading={
                      <Image
                        src={moodAvatarSrc(m)}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 shrink-0 rounded-full border border-brand-border/60 bg-brand-elevated"
                        unoptimized
                      />
                    }
                  />
                ))}
              </div>
            </QuestionShell>
          ) : null}

          {step === "q3" ? (
            <QuestionShell
              key="q3"
              title="How do you like pieces to fit?"
              onBack={() => setStep("q2")}
              onNext={() => setStep("q4")}
            >
              <div className="flex justify-start items-end gap-4 border-none">
                {fits.map((f) => (
                  <ChoiceChipButton
                    key={f.id}
                    active={answers.fit === f.id}
                    onClick={() => setAnswers((a) => ({ ...a, fit: f.id }))}
                    label={f.label}
                  />
                ))}
              </div>
            </QuestionShell>
          ) : null}

          {step === "q4" ? (
            <QuestionShell
              key="q4"
              title="Colour vibe (pick up to 3)"
              onBack={() => setStep("q3")}
              onNext={() => setStep("q5")}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {colorOpts.map((c) => {
                  const sel = answers.colors?.includes(c.id) ?? false;
                  return (
                    <ChoiceChipButton
                      key={c.id}
                      active={sel}
                      onClick={() =>
                        setAnswers((a) => {
                          const cur = a.colors ?? [];
                          if (cur.includes(c.id))
                            return { ...a, colors: cur.filter((x) => x !== c.id) };
                          if (cur.length >= 3) return a;
                          return { ...a, colors: [...cur, c.id] };
                        })
                      }
                      label={c.label}
                    />
                  );
                })}
              </div>
            </QuestionShell>
          ) : null}

          {step === "q5" ? (
            <QuestionShell
              key="q5"
              title="Budget ceiling"
              onBack={() => setStep("q4")}
              onNext={() => setStep("loading")}
            >
              <div className="space-y-4 px-2">
                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={10}
                  value={answers.budget_max ?? 600}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, budget_max: Number(e.target.value) }))
                  }
                  className="w-full accent-brand-pink"
                />
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
                  <p className="text-center font-jost text-lg text-brand-text">
                    Up to GHS {answers.budget_max ?? 600}
                  </p>
                  <label className="flex items-center gap-2 font-jost text-sm text-brand-muted">
                    <span className="whitespace-nowrap">Or enter max (GHS)</span>
                    <input
                      type="number"
                      min={50}
                      max={1000}
                      step={10}
                      value={answers.budget_max ?? 600}
                      onChange={(e) => {
                        const n = Math.max(50, Math.min(1000, Number(e.target.value) || 600));
                        setAnswers((a) => ({ ...a, budget_max: n }));
                      }}
                      className="w-28 rounded-lg border border-brand-border bg-brand-elevated px-3 py-2 text-center font-jost text-sm text-brand-text outline-none focus:border-brand-pink/60"
                    />
                  </label>
                </div>
              </div>
            </QuestionShell>
          ) : null}

          {step === "loading" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex min-h-[60vh] flex-col items-center justify-center"
            >
              <motion.div
                className="h-24 w-16 rounded-full border-2 border-brand-pink/30 border-t-brand-pink"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
              <p className="mt-8 font-jost text-brand-muted">{loadingLines[loadIdx]}</p>
            </motion.div>
          ) : null}

          {step === "results" ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-20"
            >
              <h2 className="font-playfair text-3xl text-brand-text">Styled for you</h2>
              <p className="mt-2 font-jost text-sm text-brand-muted">
                Based on your profile — {answers.occasion} · {answers.mood}
              </p>

              {outfitGroups.map((group, gi) => {
                const total = group.reduce((t, p) => t + (p.sale_price ?? p.price), 0);
                return (
                  <section key={gi} className="mt-12 rounded-lg border border-brand-border bg-brand-surface p-6">
                    <p className="font-bebas text-xl text-brand-pink">FEATURED OUTFIT</p>
                    <div className="mt-4 flex gap-4 overflow-x-auto">
                      {group.map((p) => (
                        <div key={p.id} className="w-36 shrink-0">
                          <Link href={`/product/${p.slug}`} className="block">
                            <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                              <Image
                                src={p.images[0]?.url ?? ""}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="144px"
                              />
                            </div>
                            <p className="mt-2 font-jost text-xs text-brand-text line-clamp-2">
                              {p.name}
                            </p>
                          </Link>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 font-jost text-sm text-brand-muted">
                      Bundle from GHS {total}
                    </p>
                  </section>
                );
              })}

              <h3 className="mt-14 font-bebas text-2xl text-brand-text">YOUR PICKS</h3>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {ranked.map((p) => (
                  <div key={p.id}>
                    <ProductCard product={p} />
                    <p className="mt-2 text-center font-jost text-[10px] text-brand-pink">
                      {answers.occasion
                        ? `Match: ${answers.occasion.split("/")[0].trim()}`
                        : "Curated for you"}
                    </p>
                  </div>
                ))}
              </div>

              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="mt-12 block text-center font-jost text-sm text-brand-pink hover:underline"
              >
                Want personal advice? Chat our stylist on WhatsApp →
              </a>
              <div className="mt-8 text-center">
                <Link href="/shop" className="font-jost text-sm text-brand-muted hover:text-brand-pink">
                  Browse full collection
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function QuestionShell({
  title,
  children,
  onBack,
  onNext,
}: {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="font-playfair text-2xl text-brand-text">{title}</h2>
      <div className="mt-8">{children}</div>
      <div className="mt-10 flex justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-brand-border bg-brand-bg px-6 py-3 font-jost text-sm text-brand-muted transition-colors hover:border-brand-pink/40 hover:text-brand-text"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className={`${choice.cta} px-8 py-3`}
        >
          Next
        </button>
      </div>
    </motion.div>
  );
}
