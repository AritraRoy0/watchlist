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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === "login"
          ? await login({ email, password })
          : await register({ email, password, fullName });

      auth.setToken(result.token);
      router.push("/watchlist");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-zinc-900 p-6 shadow"
      >
        <h1 className="text-2xl font-semibold text-center">
          {mode === "login" ? "Log in" : "Create an account"}
        </h1>

        {mode === "register" && (
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
            <input
              className="w-full rounded bg-zinc-800 pl-10 pr-3 py-2"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
          <input
            className="w-full rounded bg-zinc-800 pl-10 pr-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
          <input
            type={showPassword ? "text" : "password"}
            className="w-full rounded bg-zinc-800 pl-10 pr-10 py-2"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-3 text-zinc-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded bg-indigo-600 py-2 font-medium hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Log in" : "Register"}
        </button>

        <p className="text-center text-sm text-zinc-400">
          {mode === "login" ? "No account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() =>
              setMode(mode === "login" ? "register" : "login")
            }
            className="text-indigo-400 hover:underline"
          >
            {mode === "login" ? "Register" : "Log in"}
          </button>
        </p>
      </form>
    </main>
  );
}
