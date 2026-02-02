"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWatchlist } from "@/lib/api";
import { Plus, LogOut, Film, Tv } from "lucide-react";

type WatchlistItem = {
  id: number;
  user_id: number;
  title: string;
  content_type: "movie" | "tv";
  status: "want_to_watch" | "watched";
  rating: number | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export default function HomePage() {
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.getToken()) {
      router.push("/");
      return;
    }

    async function load() {
      try {
        const data = await getWatchlist();
        setItems(data);
      } catch {
        auth.clearToken();
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  function logout() {
    auth.clearToken();
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        {/* Top Bar */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Your Watchlist
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Movies and shows you don’t want to forget
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/watchlist/new")}
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-zinc-800 transition"
            >
              <Plus size={16} />
              Add item
            </button>

            <button
              onClick={logout}
              className="rounded-full p-2 text-zinc-500 hover:text-black hover:bg-zinc-200 transition"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <div className="py-32 text-center text-sm text-zinc-400">
            Loading your watchlist…
          </div>
        ) : items.length === 0 ? (
          <EmptyState onAdd={() => router.push("/watchlist/new")} />
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <WatchlistCard key={item.id} item={item} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

/* =========================
   UI Components
========================= */

function WatchlistCard({ item }: { item: WatchlistItem }) {
  return (
    <div className="group relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        {/* Thumbnail placeholder */}
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
          {item.content_type === "movie" ? (
            <Film size={22} />
          ) : (
            <Tv size={22} />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="font-medium leading-tight">
            {item.title}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>
              {item.content_type === "movie" ? "Movie" : "TV Show"}
            </span>

            <StatusBadge status={item.status} />

            {item.rating && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                {item.rating}/5
              </span>
            )}
          </div>

          {item.notes && (
            <p className="text-xs text-zinc-400 line-clamp-2 pt-1">
              {item.notes}
            </p>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-5 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition">
        View →
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "want_to_watch" | "watched";
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 ${
        status === "watched"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status === "watched" ? "Watched" : "Want to watch"}
    </span>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-24 space-y-4 text-center">
      <div className="text-sm text-zinc-500">
        You haven’t added anything yet
      </div>

      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm text-white hover:bg-zinc-800 transition"
      >
        <Plus size={16} />
        Add your first item
      </button>
    </div>
  );
}
