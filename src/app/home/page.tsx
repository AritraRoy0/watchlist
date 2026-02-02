"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWatchlist } from "@/lib/api";
import { Plus, LogOut } from "lucide-react";

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
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              Watchlist
            </h1>
            <p className="text-sm text-zinc-500">
              Everything you want to watch, in one place
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/watchlist/new")}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm hover:border-black hover:bg-zinc-50 transition"
            >
              <Plus size={16} />
              Add
            </button>

            <button
              onClick={logout}
              className="text-sm text-zinc-500 hover:text-black transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-sm text-zinc-400">
            Loading your watchlist…
          </div>
        ) : items.length === 0 ? (
          <EmptyState onAdd={() => router.push("/watchlist/new")} />
        ) : (
          <section className="space-y-3">
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
    <div className="group flex items-center justify-between rounded-2xl border border-zinc-200 px-5 py-4 hover:border-black hover:shadow-sm transition">
      <div className="space-y-1">
        <div className="font-medium">{item.title}</div>
        <div className="text-xs text-zinc-500">
          {item.content_type === "movie" ? "Movie" : "TV"} ·{" "}
          {item.status === "watched" ? "Watched" : "Want to watch"}
          {item.rating && ` · ${item.rating}/5`}
        </div>
        {item.notes && (
          <div className="text-xs text-zinc-400 line-clamp-1">
            {item.notes}
          </div>
        )}
      </div>

      <div className="text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition">
        View →
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-20 space-y-4">
      <p className="text-sm text-zinc-500">
        Your watchlist is empty
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm hover:border-black hover:bg-zinc-50 transition"
      >
        <Plus size={16} />
        Add your first item
      </button>
    </div>
  );
}
