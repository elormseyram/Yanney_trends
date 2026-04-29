import { signOut } from "@/app/actions/auth";
import type { HubRole } from "@/lib/hub-role";
import { MobileMenuButton } from "@/components/hub/MobileMenuButton";

export function HubTopBar({ title, role }: { title: string; role: HubRole }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 sm:px-6 print:hidden dark:border-stone-800 dark:bg-stone-900">
      <div className="flex min-w-0 items-center gap-2">
        <MobileMenuButton />
        <h1 className="truncate text-base font-semibold text-stone-900 sm:text-lg dark:text-stone-100">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-800 sm:inline-block dark:bg-rose-500/20 dark:text-rose-200">
          {role === "owner" ? "Owner" : "Admin"}
        </span>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50 sm:text-sm dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
