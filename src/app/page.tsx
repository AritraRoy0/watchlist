"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Mail, Lock, User, Eye, AlertCircle } from "lucide-react";

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
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const errorTitle =
    mode === "login" ? "Login failed" : "Sign up failed";
  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-10 py-2 text-sm focus:outline-none focus:ring-1 ${
      hasError
        ? "border-red-300 focus:ring-red-400"
        : "border-zinc-200 focus:ring-black"
    }`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 shadow-sm p-8">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-center">Watchlist</h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          {mode === "signup"
            ? "Create an account to track what to watch"
            : "Log in to your watchlist"}
        </p>

        {/* Segmented Toggle */}
        <div className="relative mt-6 flex rounded-lg border border-zinc-200 p-1">
          <div
            className={`absolute inset-y-1 left-1 w-1/2 rounded-md bg-black transition-transform duration-300 ${
              mode === "login" ? "translate-x-full" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`relative z-10 w-1/2 py-2 text-sm font-medium ${
              mode === "signup" ? "text-white" : "text-zinc-500"
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
            className={`relative z-10 w-1/2 py-2 text-sm font-medium ${
              mode === "login" ? "text-white" : "text-zinc-500"
            }`}
          >
            Log in
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
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
            <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
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
            <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
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
            <Eye className="absolute right-3 top-3 h-5 w-5 text-zinc-400" />
          </div>

          {error && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-medium">{errorTitle}</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-400 py-2 text-sm font-medium text-white hover:bg-zinc-500 disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
              ? "Create account"
              : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-400">
          Session stored locally for demo purposes
        </p>
      </div>
    </main>
  );
}
