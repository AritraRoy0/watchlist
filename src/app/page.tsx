"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";
import { auth } from "@/lib/auth";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

type Mode = "login" | "register";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function HomePage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = isEmail(email);
  const passwordValid = password.length >= 6;

  const canSubmit =
    emailValid &&
    passwordValid &&
    (mode === "login" ||
      fullName.trim().length === 0 ||
      fullName.trim().length >= 2);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) return;

    setLoading(true);
    try {
      const result =
        mode === "register"
          ? await register(email.trim(), password, fullName.trim() || undefined)
          : await login(email.trim(), password);

      auth.setToken(result.token);
      router.push("/watchlist");
    } catch (err: any) {
      setError(err?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 text-black">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Watchlist
          </h1>
          <p className="mt-2 text-sm text-black/60">
            {mode === "register"
              ? "Create an account to track what to watch"
              : "Log in to your watchlist"}
          </p>
        </div>

        {/* Toggle */}
        <div className="mb-6 grid grid-cols-2 rounded-lg border border-black/10 p-1">
          {(["register", "login"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`rounded-md py-2 text-sm font-medium transition-all ${
                mode === m
                  ? "bg-black text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              {m === "register" ? "Sign up" : "Log in"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "register" && (
            <Field
              icon={<User size={18} />}
              value={fullName}
              onChange={setFullName}
              placeholder="Full name (optional)"
            />
          )}

          <Field
            icon={<Mail size={18} />}
            value={email}
            onChange={setEmail}
            placeholder="Email"
            error={
              email.length > 0 && !emailValid
                ? "Please enter a valid email"
                : undefined
            }
          />

          <Field
            icon={<Lock size={18} />}
            value={password}
            onChange={setPassword}
            placeholder="Password (min 6 characters)"
            type={showPassword ? "text" : "password"}
            error={
              password.length > 0 && !passwordValid
                ? "Password must be at least 6 characters"
                : undefined
            }
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-black/40 hover:text-black"
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            }
          />

          {error && (
            <div className="rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 text-sm font-semibold text-white transition disabled:opacity-50"
          >
            {loading && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {mode === "register" ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-black/50">
          Session stored locally for demo purposes
        </p>
      </div>
    </main>
  );
}

/* ---------- Reusable Input Field ---------- */

function Field({
  icon,
  rightIcon,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  icon: React.ReactNode;
  rightIcon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 focus-within:border-black">
        <span className="text-black/40">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
        />
        {rightIcon}
      </div>
      {error && (
        <p className="mt-1 text-xs text-black/60">{error}</p>
      )}
    </div>
  );
}
