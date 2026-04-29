"use client";

import { useState, useTransition } from "react";
import { updateHubStaffRole } from "@/app/actions/hub-team";

export function HubStaffRoleSelect({
  userId,
  defaultRole,
  disabled,
}: {
  userId: string;
  defaultRole: "admin" | "owner";
  disabled?: boolean;
}) {
  const [role, setRole] = useState<"admin" | "owner">(defaultRole);
  const [isPending, startTransition] = useTransition();

  const submit = (next: "admin" | "owner") => {
    setRole(next);
    const fd = new FormData();
    fd.set("user_id", userId);
    fd.set("role", next);
    startTransition(() => {
      void updateHubStaffRole(fd);
    });
  };

  return (
    <select
      value={role}
      disabled={disabled || isPending}
      onChange={(e) => submit(e.target.value === "owner" ? "owner" : "admin")}
      className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs disabled:opacity-60 dark:border-stone-600 dark:bg-stone-950"
    >
      <option value="admin">Admin</option>
      <option value="owner">Owner</option>
    </select>
  );
}
