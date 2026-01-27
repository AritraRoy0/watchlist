"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";
import { auth } from "@/lib/auth";

type Mode = "login" | "register";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function HomePage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("register");

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register-only field (optional)
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (mode === "register" ? "Create your account" : "Welcome back"),
    [mode]
  );

  const subtitle = useMemo(
    () =>
      mode === "register"
        ? "Sign up to start building your watchlist."
        : "Log in to manage your watchlist.",
    [mode]
  );

  const canSubmit = useMemo(() => {
    if (!isEmail(email)) return false;
    if (password.trim().length < 6) return false;
    if (mode === "register" && fullName.trim().length > 0 && fullName.trim().length < 2)
      return false;
    return true;
  }, [email, password, fullName, mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Please enter a valid email and a password of at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === "register"
          ? await register(email.trim(), password, fullName.trim() || undefined)
          : await login(email.trim(), password);

      auth.setToken(result.token);
      router.push("/watchlist");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10">
        <div className="grid w-full gap-6 md:grid-cols-2">
          {/* Left: Brand / copy */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-8 shadow-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Watchlist Tracker
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight">
              Keep every recommendation in one place.
            </h1>
            <p className="mt-3 text-zinc-300">
              Save movies and shows, mark them watched, add ratings and notes, and
              filter your list fast.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-zinc-300">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-zinc-500" />
                Create, update, and delete watchlist items
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-zinc-500" />
                Track watched status, ratings, and personal notes
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-zinc-500" />
                Smart filters by type and status
              </li>
            </ul>

            <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-400">
              Tip: Set <span className="font-mono">NEXT_PUBLIC_API_BASE_URL</span> in{" "}
              <span className="font-mono">.env.local</span> for local dev and in Vercel
              for deployment.
            </div>
          </section>

          {/* Right: Auth card */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-lg">
            {/* Mode switch */}
            <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/40 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={[
                  "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition",
                  mode === "register"
                    ? "bg-zinc-950 text-zinc-100"
                    : "text-zinc-300 hover:text-zinc-100",
                ].join(" ")}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={[
                  "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition",
                  mode === "login"
                    ? "bg-zinc-950 text-zinc-100"
                    : "text-zinc-300 hover:text-zinc-100",
                ].join(" ")}
              >
                Login
              </button>
            </div>

            <h2 className="mt-6 text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-zinc-300">{subtitle}</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === "register" && (
                <div>
                  <label className="mb-1 block text-sm text-zinc-300">
                    Full name <span className="text-zinc-500">(optional)</span>
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600"
                    placeholder="Roy Mazumder"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  type="password"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600"
                  placeholder="At least 6 characters"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className={[
                  "w-full rounded-xl px-4 py-3 text-sm font-semibold transition",
                  "border border-zinc-800",
                  loading || !canSubmit
                    ? "cursor-not-allowed bg-zinc-900 text-zinc-500"
                    : "bg-zinc-100 text-zinc-950 hover:bg-white",
                ].join(" ")}
              >
                {loading
                  ? "Please wait..."
                  : mode === "register"
                  ? "Create account"
                  : "Log in"}
              </button>

              <p className="text-center text-xs text-zinc-400">
                By continuing, you agree to store your session token locally for this demo.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
