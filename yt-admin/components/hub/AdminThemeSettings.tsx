"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const STORAGE_KEY = "yt-admin-theme";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export function AdminThemeSettings() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme: ThemeMode = saved === "light" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const onChange = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
      <h2 className="font-semibold text-stone-900 dark:text-stone-100">Admin theme</h2>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
        Choose how the admin dashboard looks on this device.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onChange("dark")}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            theme === "dark"
              ? "border-rose-500 bg-rose-500 text-white"
              : "border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
          }`}
        >
          Dark (default)
        </button>
        <button
          type="button"
          onClick={() => onChange("light")}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            theme === "light"
              ? "border-rose-500 bg-rose-500 text-white"
              : "border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
          }`}
        >
          Light
        </button>
      </div>
    </section>
  );
}
