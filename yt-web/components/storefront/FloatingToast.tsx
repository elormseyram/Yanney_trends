"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "@/store/uiStore";

export function FloatingToast() {
  const msg = useUiStore((s) => s.toastMessage);

  return (
    <AnimatePresence>
      {msg ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="pointer-events-none fixed bottom-8 left-1/2 z-[60] w-[min(92vw,360px)] -translate-x-1/2"
        >
          <div className="rounded-lg border border-brand-border bg-brand-bg px-5 py-3 text-center font-jost text-sm text-brand-text shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
            {msg}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
