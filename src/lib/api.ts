import type { WatchlistItem } from "../types/watchlist";
import { auth } from "./auth";

function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    return "/api";
  }
  if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL must include http(s):// or start with / (e.g. /api or http://ec2-54-242-212-23.compute-1.amazonaws.com:4000)"
    );
  }
  return url.replace(/\/+$/, "");
}

function headers() {
  const token = auth.getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function login(email: string, password: string) {
  const res = await fetch(`${getBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function register(
  email: string,
  password: string,
  fullName?: string
) {
  const res = await fetch(`${getBaseUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName }),
  });

  if (!res.ok) throw new Error("Register failed");
  return res.json();
}

export async function listWatchlist(): Promise<WatchlistItem[]> {
  const res = await fetch(`${getBaseUrl()}/watchlist`, {
    headers: headers(),
  });

  if (!res.ok) throw new Error("Failed to load watchlist");
  return res.json();
}
