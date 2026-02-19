"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  addWatchlistItem,
  deleteWatchlistItem,
  getWatchlist,
  getPlatforms,
  updateWatchlistItem,
  Platform,
  WatchlistItem,
} from "@/lib/api";
import {
  Plus,
  LogOut,
  Film,
  Tv,
  Trash2,
  Pencil,
  Check,
  X,
  Star,
} from "lucide-react";

const CONTENT_OPTIONS: Array<WatchlistItem["contentType"]> = [
  "movie",
  "tv",
];

export default function HomePage() {
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<"all" | WatchlistItem["status"]>("all");
  const [typeFilter, setTypeFilter] =
    useState<"all" | WatchlistItem["contentType"]>("all");
  const [title, setTitle] = useState("");
  const [platformId, setPlatformId] = useState<number | null>(null);
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
        const platformList = await getPlatforms();
        setPlatforms(platformList);
        if (platformList.length > 0) {
          setPlatformId((current) =>
            current === null ? platformList[0].id : current
          );
        }
      } catch (err: any) {
        if (err?.status === 401 || err?.status === 403) {
          auth.clearToken();
          router.push("/");
        } else {
          setFormError(err?.message || "Failed to load platforms");
        }
      } finally {
        // Watchlist loading is handled in a dedicated effect so filters can refetch.
      }
    }

    load();
  }, [router]);

  useEffect(() => {
    if (!auth.getToken()) {
      router.push("/");
      return;
    }

    async function loadWatchlistItems() {
      setLoading(true);
      setFormError(null);
      try {
        const filters: {
          status?: WatchlistItem["status"];
          contentType?: WatchlistItem["contentType"];
        } = {};

        if (statusFilter !== "all") {
          filters.status = statusFilter;
        }
        if (typeFilter !== "all") {
          filters.contentType = typeFilter;
        }

        const data = await getWatchlist(filters);
        setItems(data);
      } catch (err: unknown) {
        const statusCode =
          typeof err === "object" &&
          err !== null &&
          "status" in err &&
          typeof err.status === "number"
            ? err.status
            : null;
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load watchlist";

        if (statusCode === 401 || statusCode === 403) {
          auth.clearToken();
          router.push("/");
        } else {
          setFormError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }

    loadWatchlistItems();
  }, [router, statusFilter, typeFilter]);

  function itemMatchesFilters(item: WatchlistItem) {
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== "all" && item.contentType !== typeFilter) {
      return false;
    }
    return true;
  }

  useEffect(() => {
    if (!showAddForm) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowAddForm(false);
        setFormError(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAddForm]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  function logout() {
    auth.clearToken();
    router.push("/");
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        throw new Error("Title is required");
      }

      if (!platformId) {
        throw new Error("Platform is required");
      }

      const ratingValue = rating.trim() === "" ? null : Number(rating);
      if (
        ratingValue !== null &&
        (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5)
      ) {
        throw new Error("Rating must be between 1 and 5");
      }

      const newItem = await addWatchlistItem({
        platformId,
        title: trimmedTitle,
        contentType,
        status,
        rating: ratingValue,
        notes: notes.trim() ? notes.trim() : null,
        imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
      });

      if (itemMatchesFilters(newItem)) {
        setItems((prev) => [newItem, ...prev]);
      }
      setTitle("");
      setPlatformId(platforms[0]?.id ?? null);
      setContentType("movie");
      setStatus("want_to_watch");
      setRating("");
      setNotes("");
      setImageUrl("");
      setShowAddForm(false);
      setSuccessMessage("Item successfully saved!");
    } catch (err: any) {
      setFormError(err.message || "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteItem(id: number) {
    setFormError(null);
    setSuccessMessage(null);
    setDeletingId(id);
    try {
      await deleteWatchlistItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSuccessMessage("Item deleted");
    } catch (err: any) {
      setFormError(err.message || "Failed to delete item");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  function handleUpdatedItem(updated: WatchlistItem, statusChanged: boolean) {
    setItems((prev) => {
      if (!itemMatchesFilters(updated)) {
        return prev.filter((item) => item.id !== updated.id);
      }

      return prev.map((item) => (item.id === updated.id ? updated : item));
    });

    if (statusChanged) {
      setSuccessMessage("Status updated successfully!");
    }
  }

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#06142a] via-[#071734] to-[#081938] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        {/* Top Bar */}
        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-200"
          >
            {successMessage}
          </div>
        )}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400">
              <Tv size={28} />
            </div>
            <div>
              <h1 className="text-5xl font-semibold tracking-tight text-white">
                Your Watchlist
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Movies and shows you don&apos;t want to forget
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFormError(null);
                setShowAddForm(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-2.5 text-2 font-semibold text-white shadow-[0_6px_0_0_#0b7435] transition hover:bg-emerald-600"
            >
              <Plus size={16} />
              Add item
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition"
              aria-label="Log out"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </header>

        <section className="p-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <p className="text-2 font-semibold text-slate-100 sm:pb-2">Filter by:</p>
            <div className="w-full sm:w-56">
              <select
                className="w-full rounded-xl border border-slate-500 bg-slate-700/80 px-4 py-3 text-2 font-semibold text-slate-100 shadow-[0_4px_0_0_rgba(51,65,85,0.8)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | WatchlistItem["status"])
                }
              >
                <option value="all">All statuses</option>
                <option value="want_to_watch">Want to watch</option>
                <option value="watched">Watched</option>
              </select>
            </div>
            <div className="w-full sm:w-56">
              <select
                className="w-full rounded-xl border border-slate-500 bg-slate-700/80 px-4 py-3 text-2 font-semibold text-slate-100 shadow-[0_4px_0_0_rgba(51,65,85,0.8)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(
                    e.target.value as "all" | WatchlistItem["contentType"]
                  )
                }
              >
                <option value="all">All types</option>
                <option value="movie">Movies</option>
                <option value="tv">Shows</option>
              </select>
            </div>
          </div>
        </section>

        {/* Content */}
        {loading ? (
          <div className="py-32 text-center text-sm text-slate-300">
            Loading your watchlist...
          </div>
        ) : items.length === 0 ? (
          <EmptyState hasActiveFilters={hasActiveFilters} />
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <WatchlistCard
                key={item.id}
                item={item}
                platforms={platforms}
                onDelete={() => setConfirmDeleteId(item.id)}
                deleting={deletingId === item.id}
                onUpdated={handleUpdatedItem}
              />
            ))}
          </section>
        )}
      </div>

      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          aria-describedby="confirm-delete-description"
        >
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmDeleteId(null)}
            aria-label="Close delete confirmation"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-600 bg-slate-800 p-6 shadow-xl">
            <div>
              <h2 id="confirm-delete-title" className="text-xl font-semibold text-white">
                Delete item?
              </h2>
              <p
                id="confirm-delete-description"
                className="mt-1 text-sm text-slate-300"
              >
                This will remove the item from your watchlist.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-500 px-5 py-2 text-sm text-slate-200 hover:text-white hover:border-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition disabled:opacity-60"
              >
                {deletingId === confirmDeleteId ? "Deleting..." : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-item-title"
          aria-describedby="add-item-description"
        >
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowAddForm(false);
              setFormError(null);
            }}
            aria-label="Close add item form"
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-600 bg-slate-800 p-6 shadow-xl text-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="add-item-title" className="text-xl font-semibold text-white">
                  Add to your watchlist
                </h2>
                <p
                  id="add-item-description"
                  className="mt-1 text-sm text-slate-300"
                >
                  Keep track of what you want to watch next.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormError(null);
                }}
                className="rounded-full p-2 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                aria-label="Close form"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="mt-5 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:w-56">
                  <label className="text-xs font-medium text-slate-300">
                    Platform
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={platformId ?? ""}
                    onChange={(e) => setPlatformId(Number(e.target.value))}
                  >
                    {platforms.length === 0 ? (
                      <option value="">No platforms</option>
                    ) : (
                      platforms.map((platform) => (
                        <option key={platform.id} value={platform.id}>
                          {platform.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-300">
                    Title
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="e.g. The Bear"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    aria-invalid={formError === "Title is required" && title.trim() === ""}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:w-44">
                  <label className="text-xs font-medium text-slate-300">
                    Type
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                  <label className="text-xs font-medium text-slate-300">
                    Status
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                  <label className="text-xs font-medium text-slate-300">
                    Rating
                  </label>
                  <div className="mt-2">
                    <StarRatingInput
                      value={rating === "" ? null : Number(rating)}
                      onChange={(value) =>
                        setRating(value ? String(value) : "")
                      }
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-300">
                    Image URL
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Optional"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">
                  Notes
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                  <span className="text-xs text-slate-400">
                    Add items directly to your watchlist
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormError(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-500 px-5 py-2 text-sm text-slate-200 hover:text-white hover:border-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || platforms.length === 0}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-[0_5px_0_0_#0b7435] hover:bg-emerald-600 transition disabled:opacity-60"
                  >
                    <Plus size={16} />
                    {submitting ? "Adding..." : "Add item"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
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
  platforms,
}: {
  item: WatchlistItem;
  onDelete: () => void;
  deleting: boolean;
  onUpdated: (item: WatchlistItem, statusChanged: boolean) => void;
  platforms: Platform[];
}) {
  const cardAccentClass =
    item.status === "watched"
      ? item.contentType === "movie"
        ? "border-rose-600/60 shadow-[inset_0_-4px_0_0_rgba(190,24,93,0.45)]"
        : "border-emerald-500/60 shadow-[inset_0_-4px_0_0_rgba(16,185,129,0.45)]"
      : item.contentType === "movie"
      ? "border-violet-500/60 shadow-[inset_0_-4px_0_0_rgba(139,92,246,0.45)]"
      : "border-blue-500/60 shadow-[inset_0_-4px_0_0_rgba(59,130,246,0.45)]";

  const platformClass =
    item.contentType === "movie" ? "text-violet-400" : "text-blue-400";

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    platformId: item.platformId,
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
        platformId: item.platformId,
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

    if (!draft.platformId) {
      setError("Platform is required");
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
      const statusChanged = draft.status !== item.status;
      const updated = await updateWatchlistItem(item.id, {
        platformId: draft.platformId,
        title: trimmedTitle,
        contentType: draft.contentType,
        status: draft.status,
        rating: ratingValue,
        notes: draft.notes.trim() ? draft.notes.trim() : null,
        imageUrl: draft.imageUrl.trim() ? draft.imageUrl.trim() : null,
      });
      onUpdated(updated, statusChanged);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`group relative rounded-2xl border bg-[#1b2b45] p-5 text-slate-100 transition ${cardAccentClass}`}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail placeholder */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700 text-slate-300">
          {item.contentType === "movie" ? (
            <Film size={22} />
          ) : (
            <Tv size={22} />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="font-medium leading-tight text-white">{item.title}</div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span>
              {item.contentType === "movie" ? "Movie" : "TV Show"}
            </span>

            {item.platformName && (
              <span className={`font-semibold ${platformClass}`}>
                {item.platformName}
              </span>
            )}

            <StatusBadge status={item.status} />

            {item.rating && (
              <StarRatingDisplay rating={item.rating} />
            )}
          </div>

          {item.notes && (
            <p className="line-clamp-2 pt-1 text-xs text-slate-300">
              {item.notes}
            </p>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-4 text-xs opacity-100 transition">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 rounded-full text-xs text-blue-400 transition hover:text-blue-300"
          >
            <Pencil size={12} />
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={deleting || saving}
          className="inline-flex items-center gap-1 rounded-full text-xs text-rose-500 transition hover:text-rose-400 disabled:opacity-60"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {isEditing && (
        <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-300">
                Platform
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={draft.platformId}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    platformId: Number(e.target.value),
                  }))
                }
              >
                {platforms.length === 0 ? (
                  <option value="">No platforms</option>
                ) : (
                  platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">
                Title
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={draft.title}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-300">
                Type
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
              <label className="text-xs font-medium text-slate-300">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
              <label className="text-xs font-medium text-slate-300">
                Rating
              </label>
              <div className="mt-2">
                <StarRatingInput
                  value={draft.rating === "" ? null : Number(draft.rating)}
                  onChange={(value) =>
                    setDraft((prev) => ({
                      ...prev,
                      rating: value ? String(value) : "",
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">
                Image URL
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={draft.imageUrl}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">
              Notes
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#182941] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              rows={2}
              value={draft.notes}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_0_0_#0b7435] hover:bg-emerald-600 transition disabled:opacity-60"
            >
              <Check size={14} />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-500 px-4 py-2 text-xs text-slate-200 hover:text-white hover:border-slate-300 transition"
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
          ? "bg-emerald-500 text-white"
          : "bg-amber-500 text-white"
      }`}
    >
      {status === "watched" ? "Watched" : "Want to watch"}
    </span>
  );
}

function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={14}
          className={value <= rating ? "text-amber-400" : "text-slate-500"}
          fill={value <= rating ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">{rating} out of 5 stars</span>
    </div>
  );
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((ratingValue) => {
          const isActive = value !== null && ratingValue <= value;
          return (
            <button
              key={ratingValue}
              type="button"
              onClick={() => onChange(ratingValue)}
              className="rounded-full p-1 text-slate-500 hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label={`Set rating to ${ratingValue} star${
                ratingValue === 1 ? "" : "s"
              }`}
            >
              <Star
                size={16}
                className={isActive ? "text-amber-400" : "text-slate-500"}
                fill={isActive ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange(null)}
        className="text-xs text-slate-400 hover:text-slate-200 transition"
      >
        Clear
      </button>
    </div>
  );
}

function EmptyState({ hasActiveFilters }: { hasActiveFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-500 bg-[#1b2b45] py-24 text-center">
      <div className="text-sm text-slate-300">
        {hasActiveFilters
          ? "No items match your current filters"
          : "You haven't added anything yet"}
      </div>
    </div>
  );
}
