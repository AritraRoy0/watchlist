export type WatchlistType = "MOVIE" | "TV";

export type WatchlistStatus = "WANT_TO_WATCH" | "WATCHED";

export interface WatchlistItem {
  id: string;
  userId: string;

  title: string;
  type: WatchlistType;
  status: WatchlistStatus;

  rating?: number; // 1–5
  notes?: string;
  imageUrl?: string;

  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
