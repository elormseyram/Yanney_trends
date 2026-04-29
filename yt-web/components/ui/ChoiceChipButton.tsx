"use client";

import type { ReactNode } from "react";
import { choice } from "@/lib/choiceStyles";

export function ChoiceChipButton({
  active,
  onClick,
  label,
  className = "",
  leading,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
  leading?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${choice.btn(active)} ${className}`}
    >
      <span className="flex items-center gap-3 text-left">
        {leading}
        <span className="min-w-0 flex-1">{label}</span>
      </span>
    </button>
  );
}
