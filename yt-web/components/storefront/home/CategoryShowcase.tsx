"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const categories = [
  { slug: "dresses", label: "DRESSES", src: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop" },
  { slug: "bags", label: "BAGS", src: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop" },
  { slug: "heels", label: "HEELS", src: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop" },
  { slug: "slippers", label: "SLIPPERS", src: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&h=800&fit=crop" },
  { slug: "looks", label: "COMPLETE LOOKS", src: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&h=800&fit=crop" },
] as const;

export function CategoryShowcase({
  counts,
}: {
  counts: Record<(typeof categories)[number]["slug"], number>;
}) {
  return (
    <section className="bg-brand-bg py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="font-bebas text-3xl tracking-wide text-brand-text md:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          SHOP BY CATEGORY
        </motion.h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
          {categories.map((c, i) => {
            const count = counts[c.slug] ?? 0;
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={i === 4 ? "col-span-2 md:col-span-1" : ""}
              >
                <Link
                  href={`/shop?category=${c.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden border border-transparent bg-brand-elevated transition-colors hover:border-brand-border"
                >
                  <Image
                    src={c.src}
                    alt={c.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width:768px) 50vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="font-bebas text-lg tracking-widest text-white md:text-xl">{c.label}</span>
                    <p className="mt-1 font-jost text-[11px] uppercase tracking-wider text-white/80">
                      {count} {count === 1 ? "piece" : "pieces"}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
