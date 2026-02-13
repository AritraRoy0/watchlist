"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Mail, Lock, User, Eye, AlertCircle, Tv } from "lucide-react";

type Mode = "signup" | "login";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (auth.getToken()) {
      router.push("/home");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result =
        mode === "login"
          ? await login({ email, password })
          : await register({ email, password, fullName });

      auth.setToken(result.token);
      router.push("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border bg-[#182941] px-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-400/70 focus:ring-red-400/60"
        : "border-slate-600 focus:ring-emerald-400/70"
    }`;

  return (
    <main className="min-h-screen bg-[#06142a] px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mx-auto mb-8 flex w-fit flex-col items-center">
          <div className="rounded-2xl bg-emerald-700 p-5 shadow-[0_10px_0_0_#0b7435]">
            <Tv className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-center text-5xl font-semibold tracking-tight">
            My Watchlist
          </h1>
          <p className="mt-3 text-center text-sm text-slate-300">
            Track your favorite movies and TV shows
          </p>
        </div>

        <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-700 bg-[#1a2a43] p-8 shadow-xl">
          <h2 className="text-4xl font-semibold">
            {mode === "signup" ? "Create Account" : "Sign In"}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {mode === "signup"
              ? "Create an account to track what to watch next."
              : "Welcome back. Sign in to your watchlist."}
          </p>

          {/* Segmented Toggle */}
          <div className="relative mt-6 flex rounded-lg border border-slate-600 bg-[#15253c] p-1">
            <div
              className={`absolute inset-y-1 left-1 w-1/2 rounded-md bg-emerald-700 shadow-[0_4px_0_0_#0b7435] transition-transform duration-300 ${
                mode === "login" ? "translate-x-full" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`relative z-10 w-1/2 py-2 text-sm font-semibold ${
                mode === "signup" ? "text-white" : "text-slate-300"
              }`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`relative z-10 w-1/2 py-2 text-sm font-semibold ${
                mode === "login" ? "text-white" : "text-slate-300"
              }`}
            >
              Sign in
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  className={inputClass(Boolean(error))}
                  placeholder="Full name (optional)"
                  value={fullName}
                  onChange={(e) => {
                    if (error) setError(null);
                    setFullName(e.target.value);
                  }}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                className={inputClass(Boolean(error))}
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  if (error) setError(null);
                  setEmail(e.target.value);
                }}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                className={`${inputClass(Boolean(error))} pr-10`}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => {
                  if (error) setError(null);
                  setPassword(e.target.value);
                }}
              />
              <Eye className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
            </div>

            {mode === "login" && (
              <div className="text-right text-sm">
                <button
                  type="button"
                  className="font-medium text-emerald-400 hover:text-emerald-300 transition"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div
                className="flex items-center gap-2 rounded-lg border border-red-500/70 bg-red-950/30 px-3 py-2 text-xs text-red-200"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4 text-red-300" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-700 py-2.5 text-lg font-semibold text-white shadow-[0_7px_0_0_#0b7435] transition hover:bg-emerald-600 disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "signup"
                ? "Sign up"
                : "Sign In"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-slate-400">
            <div className="h-px flex-1 bg-slate-600" />
            <span className="text-sm">or</span>
            <div className="h-px flex-1 bg-slate-600" />
          </div>

          <p className="mt-6 text-center text-sm text-slate-300">
            {mode === "signup"
              ? "Already have an account?"
              : "Don&apos;t have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "login" : "signup");
                setError(null);
              }}
              className="font-semibold text-emerald-400 hover:text-emerald-300"
            >
              {mode === "signup" ? "Sign in" : "Sign up"}
            </button>
          </p>

          <p className="mt-4 text-center text-xs text-slate-400">
            Session stored locally for demo purposes
          </p>
        </div>
      </div>
    </main>
  );
}
