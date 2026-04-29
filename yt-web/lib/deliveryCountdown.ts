import { useEffect, useState } from "react";

export function getNextDispatchCutoff(hour = 18, minute = 0): Date {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

export function formatDispatchRemaining(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function useDeliveryCountdown(cutoffHour = 18, cutoffMinute = 0): string {
  const [left, setLeft] = useState("");

  useEffect(() => {
    const tick = () => {
      const t = getNextDispatchCutoff(cutoffHour, cutoffMinute).getTime() - Date.now();
      setLeft(formatDispatchRemaining(t));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cutoffHour, cutoffMinute]);

  return left;
}
