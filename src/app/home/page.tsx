"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWatchlist } from "@/lib/api";
import type { WatchlistItem } from "@/types/watchlist";
import { Plus, LogOut } from "lucide-react";

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
    <main className="min-h-screen bg-white flex justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Watchlist</h1>
            <p className="text-sm text-zinc-500">
              Your saved movies and shows
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/watchlist/new")}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:border-black transition"
            >
              <Plus size={16} />
              Add item
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
          <div className="text-center text-zinc-400 py-20">
            Loading your watchlist...
          </div>
        ) : items.length === 0 ? (
          <EmptyState onAdd={() => router.push("/watchlist/new")} />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => (
              <WatchlistRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function WatchlistRow({ item }: { item: WatchlistItem }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 hover:border-black transition">
      <div className="space-y-1">
        <div className="font-medium">{item.title}</div>
        <div className="text-xs text-zinc-500">
          {item.contentType === "movie" ? "Movie" : "TV"} {" - "}
          {item.status === "watched" ? "Watched" : "Want to watch"}
          {item.rating && ` - Rating: ${item.rating}/5`}
        </div>
        {item.notes && (
          <div className="text-xs text-zinc-400 line-clamp-1">
            {item.notes}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border border-dashed border-zinc-300 rounded-xl p-12 text-center space-y-4">
      <p className="text-zinc-500">
        Your watchlist is empty.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:border-black transition"
      >
        <Plus size={16} />
        Add your first item
      </button>
    </div>
  );
}


