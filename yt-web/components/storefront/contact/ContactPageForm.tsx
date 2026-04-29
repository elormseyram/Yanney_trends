"use client";

import { useState } from "react";
import { choice } from "@/lib/choiceStyles";
import { useUiStore } from "@/store/uiStore";

const topics = [
  "General",
  "Press & partnerships",
  "Styling help",
  "Order support",
  "Bulk / wholesale order",
] as const;

const budgets = ["Under GHS 5,000", "GHS 5,000 – 15,000", "GHS 15,000 – 50,000", "GHS 50,000+"] as const;

const collectionTypes = ["Capsule", "Event / one-off", "Retail restock", "Custom / made-to-order"] as const;

const dressCategories = [
  { id: "dress-casual", label: "Dresses · Casual" },
  { id: "dress-office", label: "Dresses · Office" },
  { id: "dress-dinner", label: "Dresses · Dinner" },
  { id: "dress-party", label: "Dresses · Club / party" },
] as const;

const otherCategories = [
  { id: "tops", label: "Tops" },
  { id: "denim", label: "Denim" },
  { id: "trousers", label: "Trousers" },
  { id: "shorts", label: "Shorts" },
] as const;

export function ContactPageForm() {
  const showToast = useUiStore((s) => s.showToast);
  const [topic, setTopic] = useState<(typeof topics)[number]>("General");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState<(typeof budgets)[number]>(budgets[0]);
  const [collectionType, setCollectionType] = useState<(typeof collectionTypes)[number]>(
    collectionTypes[0],
  );
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast("Name, email, and message are required.");
      return;
    }
    showToast("Message received. (Demo — wire to email or CRM.)");
  };

  const bulk = topic === "Bulk / wholesale order";

  return (
    <form onSubmit={submit} className="mt-10 space-y-10">
      <div>
        <p className="font-jost text-[10px] uppercase tracking-[0.2em] text-brand-muted">
          Topic
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={choice.chip(topic === t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="font-jost text-[10px] uppercase tracking-wider text-brand-muted">
            Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-brand-border bg-brand-elevated px-3 py-2.5 font-jost text-sm text-brand-text outline-none focus:border-brand-pink/50"
          />
        </label>
        <label className="block">
          <span className="font-jost text-[10px] uppercase tracking-wider text-brand-muted">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-brand-border bg-brand-elevated px-3 py-2.5 font-jost text-sm text-brand-text outline-none focus:border-brand-pink/50"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="font-jost text-[10px] uppercase tracking-wider text-brand-muted">
            Phone (optional)
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-brand-border bg-brand-elevated px-3 py-2.5 font-jost text-sm text-brand-text outline-none focus:border-brand-pink/50"
          />
        </label>
      </div>

      <label className="block">
        <span className="font-jost text-[10px] uppercase tracking-wider text-brand-muted">
          Message
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="mt-1.5 w-full resize-y rounded-lg border border-brand-border bg-brand-elevated px-3 py-2.5 font-jost text-sm text-brand-text outline-none focus:border-brand-pink/50"
        />
      </label>

      {bulk ? (
        <div className="space-y-6 rounded-xl border border-brand-border bg-brand-surface p-6">
          <div>
            <p className="font-playfair text-lg text-brand-text">Bulk purchase</p>
            <p className="mt-1 font-jost text-xs text-brand-muted">
              Tell us about budget and what you want to build — we&apos;ll follow up with a tailored
              line sheet.
            </p>
          </div>
          <div>
            <p className="font-jost text-[10px] uppercase tracking-[0.2em] text-brand-muted">
              Budget range
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {budgets.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={choice.chip(budget === b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-jost text-[10px] uppercase tracking-[0.2em] text-brand-muted">
              Type of collection
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {collectionTypes.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCollectionType(c)}
                  className={choice.chip(collectionType === c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-jost text-[10px] uppercase tracking-[0.2em] text-brand-muted">
              Categories &amp; focus
            </p>
            <p className="mt-1 font-jost text-xs text-brand-dimmed">
              Dresses by occasion, then add other categories as needed.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[...dressCategories, ...otherCategories].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={choice.chip(!!selected[c.id])}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <button type="submit" className={`${choice.cta} w-full py-3.5 sm:w-auto sm:px-10`}>
        Send message
      </button>
    </form>
  );
}
