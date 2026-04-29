"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * Full-screen “fabric wave” celebration after order confirm (pink folds, no gradients).
 */
export function OrderFabricWave({ show, onDone }: { show: boolean; onDone?: () => void }) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[100] flex flex-col justify-end overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-[12.5vh] w-full origin-left bg-brand-pink"
              initial={{ scaleX: 0, opacity: 0.15 }}
              animate={{
                scaleX: 1,
                opacity: [0.12, 0.35, 0.2],
                x: [0, i % 2 === 0 ? 6 : -6, 0],
              }}
              transition={{
                duration: 0.85,
                delay: i * 0.06,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{ transformOrigin: i % 2 === 0 ? "left" : "right" }}
            />
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
