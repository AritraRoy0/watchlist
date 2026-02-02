import { auth } from "./auth";

const API_BASE = "/api";

function headers() {
  const token = auth.getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* =====================
   AUTH
===================== */

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

/* =====================
   WATCHLIST
===================== */

export async function getWatchlist() {
  const res = await fetch(`${API_BASE}/watchlist`, {
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
