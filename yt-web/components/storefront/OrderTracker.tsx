"use client";

import { motion } from "framer-motion";

export type TrackerFulfillment = "DELIVERY" | "PICKUP" | "RIDER";

const DELIVERY_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PACKAGED",
  "RIDER_ASSIGNED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

const PICKUP_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PACKAGED",
  "READY_FOR_PICKUP",
  "COLLECTED",
] as const;

function labels(status: string): string {
  return status.replace(/_/g, " ");
}

interface OrderTrackerProps {
  fulfillment: TrackerFulfillment;
  currentStatus: string;
  surprise?: boolean;
}

export function OrderTracker({ fulfillment, currentStatus, surprise }: OrderTrackerProps) {
  const flow =
    fulfillment === "PICKUP"
      ? PICKUP_FLOW
      : DELIVERY_FLOW;
  const idx = Math.max(
    0,
    flow.findIndex((s) => s === currentStatus),
  );
  const activeIndex = idx === -1 ? 0 : idx;

  return (
    <div className="mx-auto max-w-lg rounded-lg border border-brand-border bg-brand-elevated/85 p-8 backdrop-blur-xl">
      {currentStatus === "OUT_FOR_DELIVERY" ? (
        <motion.div
          className="mb-6 font-jost text-2xl"
          animate={{ x: [0, 120, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          🛵
        </motion.div>
      ) : null}
      <ol className="relative space-y-0">
        {flow.map((status, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <li key={status} className="flex gap-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    done
                      ? "border-brand-pink bg-brand-pink text-[10px] text-black"
                      : active
                        ? "border-brand-pink bg-brand-pink-muted"
                        : "border-brand-border bg-brand-bg"
                  }`}
                >
                  {done ? "✓" : ""}
                </span>
                {i < flow.length - 1 ? (
                  <span
                    className={`mt-1 w-0.5 flex-1 min-h-[24px] ${
                      i < activeIndex ? "bg-brand-pink" : "bg-brand-border"
                    }`}
                  />
                ) : null}
              </div>
              <div>
                <p className="font-jost text-sm font-medium text-brand-text">{labels(status)}</p>
                {active ? (
                  <p className="mt-1 font-jost text-xs text-brand-pink">Current</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      {surprise ? (
        <p className="mt-6 border-t border-brand-border pt-6 text-center font-jost text-xs text-brand-muted">
          Totals hidden — gift order
        </p>
      ) : null}
    </div>
  );
}
