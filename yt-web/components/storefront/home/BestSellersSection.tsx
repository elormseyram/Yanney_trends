"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { CatalogProduct } from "@/types/product";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function BestSellersSection({ products }: { products: CatalogProduct[] }) {
  return (
    <section className="bg-brand-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <motion.h2
            className="font-bebas text-4xl tracking-wide text-brand-text md:text-5xl"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            BEST SELLING
          </motion.h2>
          <div className="h-1 w-24 shrink-0 bg-brand-pink md:mb-2" />
        </div>
        <motion.div
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {products.map((p) => (
            <motion.div key={p.id} variants={item}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
