import { auth } from "./auth";

const API_BASE = "/api";

function headers() {
  const token = auth.getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseErrorMessage(res: Response) {
  const text = await res.text();
  if (!text) {
    return "Something went wrong";
  }

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error;
    }
  } catch {
    // fall through to raw text
  }

  return text;
}

async function ensureOk(res: Response) {
  if (res.ok) return;
  const error = new Error(await parseErrorMessage(res));
  (error as any).status = res.status;
  throw error;
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

  await ensureOk(res);

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

  await ensureOk(res);

  return res.json();
}

/* =====================
   WATCHLIST
===================== */

export async function getWatchlist() {
  const res = await fetch(`${API_BASE}/watchlist`, {
    headers: headers(),
  });

  await ensureOk(res);

  return res.json();
}

export type Platform = {
  id: number;
  name: string;
};

export async function getPlatforms() {
  const res = await fetch(`${API_BASE}/watchlist/platform`, {
    headers: headers(),
  });

  await ensureOk(res);

  return res.json() as Promise<Platform[]>;
}

export type WatchlistItem = {
  id: number;
  platformId: number;
  platformName: string | null;
  title: string;
  contentType: "movie" | "tv";
  status: "want_to_watch" | "watched";
  rating: number | null;
  notes: string | null;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type WatchlistItemPayload = {
  platformId?: number;
  title?: string;
  contentType?: "movie" | "tv";
  status?: "want_to_watch" | "watched";
  rating?: number | null;
  notes?: string | null;
  imageUrl?: string | null;
};

export async function addWatchlistItem(payload: {
  platformId: number;
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
    body: JSON.stringify(payload),
  });

  await ensureOk(res);

  return res.json() as Promise<WatchlistItem>;
}

export async function updateWatchlistItem(
  id: number,
  payload: WatchlistItemPayload
) {
  const res = await fetch(`${API_BASE}/watchlist/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(payload),
  });

  await ensureOk(res);

  return res.json() as Promise<WatchlistItem>;
}

export async function deleteWatchlistItem(id: number) {
  const res = await fetch(`${API_BASE}/watchlist/${id}`, {
    method: "DELETE",
    headers: headers(),
  });

  await ensureOk(res);
}
