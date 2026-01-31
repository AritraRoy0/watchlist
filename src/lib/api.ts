import type { WatchlistItem } from "../types/watchlist";
import { auth } from "./auth";

/**
 * Always use the Vercel proxy.
 * Browser talks to HTTPS (/api),
 * Vercel talks to EC2 over HTTP.
 */
const API_BASE = "/api";

function headers() {
  const token = auth.getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* =========================
   AUTH
========================= */

export async function register(payload: {
  email: string;
  password: string;
  fullName?: string;
}) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function login(payload: {
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/* =========================
   WATCHLIST
========================= */

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const res = await fetch(`${API_BASE}/watchlist`, {
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function addWatchlistItem(item: {
  title: string;
  contentType: "movie" | "tv";
  status?: "want_to_watch" | "watched";
  rating?: number | null;
  notes?: string | null;
  imageUrl?: string | null;
}) {
  const res = await fetch(`${API_BASE}/watchlist`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(item),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function deleteWatchlistItem(id: number) {
  const res = await fetch(`${API_BASE}/watchlist/${id}`, {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
}
