export type WatchlistType = "movie" | "tv";

export type WatchlistStatus = "want_to_watch" | "watched";

export interface WatchlistItem {
  id: number;
  platformId: number;
  platformName?: string | null;

  title: string;
  contentType: WatchlistType;
  status: WatchlistStatus;

  rating?: number; // 1-5
  notes?: string;
  imageUrl?: string;

  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
