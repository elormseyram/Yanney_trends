import { signInWithEmailPassword } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; detail?: string; next?: string }>;
}) {
  const { error, detail, next } = await searchParams;
  const safeNext =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "";

  let errorMessage: string | null = null;
  if (error === "forbidden") {
    errorMessage =
      "Your password worked, but this account is not on the back-office team list yet. Until someone adds you, the hub will keep you out (that is expected).";
  } else if (error === "missing") {
    errorMessage = "Enter both email and password.";
  } else if (error === "auth") {
    errorMessage = detail?.trim()
      ? `Could not sign in: ${detail}`
      : "Could not sign in. Check your email and password.";
  } else if (error === "invalid") {
    errorMessage = "Something went wrong. Try again.";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fdf8fa] px-4 dark:bg-stone-950">
      <div className="w-full max-w-md rounded-2xl border border-rose-200/80 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
          Yanney Trends
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold text-stone-900 dark:text-stone-100">
          Hub sign-in
        </h1>
        <p className="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
          Admin and owner access with your Yanney Hub email and password.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-left text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            <p>{errorMessage}</p>
            {error === "forbidden" ? (
              <details className="mt-3 text-xs leading-relaxed text-red-800/90 dark:text-red-200/90">
                <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200">
                  How to fix this
                </summary>
                <ul className="mt-2 list-disc space-y-2 pl-4">
                  <li>
                    The email you typed must be the same one listed in Supabase under Authentication → Users.
                  </li>
                  <li>
                    Someone with access should run{" "}
                    <code className="rounded bg-red-100/80 px-1 dark:bg-red-900/40">
                      supabase/sql/grant_hub_access_by_email.sql
                    </code>{" "}
                    and replace the sample email with yours.
                  </li>
                  <li>Choose either <strong>owner</strong> or <strong>admin</strong>, run it, then sign in again.</li>
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}

        <form action={signInWithEmailPassword} className="mt-8 flex flex-col gap-4">
          {safeNext ? <input type="hidden" name="next" value={safeNext} /> : null}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-stone-600 dark:text-stone-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-stone-900 outline-none ring-rose-500/30 focus:border-rose-400 focus:ring-2 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-stone-900 outline-none ring-rose-500/30 focus:border-rose-400 focus:ring-2 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-500 dark:text-stone-500">
          Use the same email and password as your shop account. The owner needs to add your email to the team before you
          can sign in here.
        </p>
      </div>
    </div>
  );
}
