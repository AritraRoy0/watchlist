"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  addWatchlistItem,
  deleteWatchlistItem,
  getWatchlist,
  updateWatchlistItem,
  WatchlistItem,
} from "@/lib/api";
import { Plus, LogOut, Film, Tv, Trash2, Pencil, Check, X } from "lucide-react";

const CONTENT_OPTIONS: Array<WatchlistItem["contentType"]> = [
  "movie",
  "tv",
];

export default function HomePage() {
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [contentType, setContentType] =
    useState<WatchlistItem["contentType"]>("movie");
  const [status, setStatus] =
    useState<WatchlistItem["status"]>("want_to_watch");
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

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

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const ratingValue = rating.trim() === "" ? null : Number(rating);
      if (
        ratingValue !== null &&
        (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5)
      ) {
        throw new Error("Rating must be between 1 and 5");
      }

      const newItem = await addWatchlistItem({
        title: title.trim(),
        contentType,
        status,
        rating: ratingValue,
        notes: notes.trim() ? notes.trim() : null,
        imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
      });

      setItems((prev) => [newItem, ...prev]);
      setTitle("");
      setContentType("movie");
      setStatus("want_to_watch");
      setRating("");
      setNotes("");
      setImageUrl("");
    } catch (err: any) {
      setFormError(err.message || "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteItem(id: number) {
    setFormError(null);
    setDeletingId(id);
    try {
      await deleteWatchlistItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setFormError(err.message || "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  }

  function handleUpdatedItem(updated: WatchlistItem) {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
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
              Movies and shows you don't want to forget
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="rounded-full p-2 text-zinc-500 hover:text-black hover:bg-zinc-200 transition"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label className="text-xs font-medium text-zinc-500">
                  Title
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="e.g. The Bear"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="w-full sm:w-44">
                <label className="text-xs font-medium text-zinc-500">
                  Type
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  value={contentType}
                  onChange={(e) =>
                    setContentType(
                      e.target.value as WatchlistItem["contentType"]
                    )
                  }
                >
                  {CONTENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "movie" ? "Movie" : "TV Show"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-48">
                <label className="text-xs font-medium text-zinc-500">
                  Status
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as WatchlistItem["status"])
                  }
                >
                  <option value="want_to_watch">Want to watch</option>
                  <option value="watched">Watched</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-zinc-500">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Optional"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-500">
                  Image URL
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Optional"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500">
                Notes
              </label>
              <textarea
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                rows={2}
                placeholder="Optional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {formError ? (
                <p className="text-sm text-red-600">{formError}</p>
              ) : (
                <span className="text-xs text-zinc-400">
                  Add items directly to your watchlist
                </span>
              )}
              <button
                type="submit"
                disabled={submitting || title.trim() === ""}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm text-white hover:bg-zinc-800 transition disabled:opacity-60"
              >
                <Plus size={16} />
                {submitting ? "Adding..." : "Add item"}
              </button>
            </div>
          </form>
        </section>

        {/* Content */}
        {loading ? (
          <div className="py-32 text-center text-sm text-zinc-400">
            Loading your watchlist...
          </div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <WatchlistCard
                key={item.id}
                item={item}
                onDelete={() => handleDeleteItem(item.id)}
                deleting={deletingId === item.id}
                onUpdated={handleUpdatedItem}
              />
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

function WatchlistCard({
  item,
  onDelete,
  deleting,
  onUpdated,
}: {
  item: WatchlistItem;
  onDelete: () => void;
  deleting: boolean;
  onUpdated: (item: WatchlistItem) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: item.title,
    contentType: item.contentType,
    status: item.status,
    rating: item.rating?.toString() ?? "",
    notes: item.notes ?? "",
    imageUrl: item.imageUrl ?? "",
  });

  useEffect(() => {
    if (!isEditing) {
      setDraft({
        title: item.title,
        contentType: item.contentType,
        status: item.status,
        rating: item.rating?.toString() ?? "",
        notes: item.notes ?? "",
        imageUrl: item.imageUrl ?? "",
      });
    }
  }, [item, isEditing]);

  async function handleSave() {
    setError(null);
    const trimmedTitle = draft.title.trim();
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    const ratingValue =
      draft.rating.trim() === "" ? null : Number(draft.rating);
    if (
      ratingValue !== null &&
      (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5)
    ) {
      setError("Rating must be between 1 and 5");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateWatchlistItem(item.id, {
        title: trimmedTitle,
        contentType: draft.contentType,
        status: draft.status,
        rating: ratingValue,
        notes: draft.notes.trim() ? draft.notes.trim() : null,
        imageUrl: draft.imageUrl.trim() ? draft.imageUrl.trim() : null,
      });
      onUpdated(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="group relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        {/* Thumbnail placeholder */}
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
          {item.contentType === "movie" ? (
            <Film size={22} />
          ) : (
            <Tv size={22} />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="font-medium leading-tight">{item.title}</div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>
              {item.contentType === "movie" ? "Movie" : "TV Show"}
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

      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition"
          >
            <Pencil size={12} />
            Edit
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={deleting || saving}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition disabled:opacity-60"
        >
          <Trash2 size={12} />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {isEditing && (
        <div className="mt-4 border-t border-zinc-100 pt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-500">
                Title
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                value={draft.title}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500">
                Type
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                value={draft.contentType}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    contentType: e.target.value as WatchlistItem["contentType"],
                  }))
                }
              >
                {CONTENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "movie" ? "Movie" : "TV Show"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-zinc-500">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                value={draft.status}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    status: e.target.value as WatchlistItem["status"],
                  }))
                }
              >
                <option value="want_to_watch">Want to watch</option>
                <option value="watched">Watched</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500">
                Rating (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                value={draft.rating}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, rating: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500">
                Image URL
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                value={draft.imageUrl}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500">
              Notes
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              rows={2}
              value={draft.notes}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs text-white hover:bg-zinc-800 transition disabled:opacity-60"
            >
              <Check size={14} />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-xs text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-24 space-y-4 text-center">
      <div className="text-sm text-zinc-500">
        You haven't added anything yet
      </div>
    </div>
  );
}
