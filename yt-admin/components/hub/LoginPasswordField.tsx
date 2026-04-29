"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/hub/HubIcons";

const inputClassName =
  "w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-3 pr-10 text-stone-900 outline-none ring-rose-500/30 focus:border-rose-400 focus:ring-2 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100";

export function LoginPasswordField({
  id,
  name,
  autoComplete = "current-password",
  required,
}: {
  id: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mt-1">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        className={inputClassName}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
