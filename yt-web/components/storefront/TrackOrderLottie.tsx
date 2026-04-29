"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

type LottieJson = Record<string, unknown>;

export function TrackOrderLottie({ className }: { className?: string }) {
  const [data, setData] = useState<LottieJson | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/lottie/track-order.json")
      .then((r) => r.json())
      .then((json: LottieJson) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return (
      <div
        className={`mx-auto aspect-[3/4] w-full max-w-[200px] animate-pulse rounded-2xl bg-brand-pink/10 dark:bg-brand-pink/5 ${className ?? ""}`}
        aria-hidden
      />
    );
  }

  return (
    <div className={`mx-auto w-full max-w-[220px] ${className ?? ""}`}>
      <Lottie animationData={data} loop className="h-44 w-full [&_svg]:max-h-44" />
    </div>
  );
}
