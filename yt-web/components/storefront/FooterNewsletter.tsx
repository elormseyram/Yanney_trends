"use client";

import { useState } from "react";
import { useUiStore } from "@/store/uiStore";

export function FooterNewsletter() {
  const showToast = useUiStore((s) => s.showToast);
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast("Enter a valid email to join the list.");
      return;
    }
    showToast("You are on the list. (Connect your ESP when ready.)");
    setEmail("");
  };

  return (
    <div className="border-b border-brand-border bg-brand-elevated px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-brand-dimmed">Newsletter</p>
        <p className="mt-2 max-w-md font-playfair text-xl text-brand-text">
          First access to restocks and runway previews.
        </p>
        <form onSubmit={onSubmit} className="mt-8 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-stretch">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-lg border border-brand-border bg-brand-bg px-4 py-3 font-jost text-sm text-brand-text outline-none transition placeholder:text-brand-dimmed focus:border-brand-pink/50"
            />
          </label>
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-brand-pink bg-brand-pink px-8 py-3 font-jost text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-brand-pink-hover"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
