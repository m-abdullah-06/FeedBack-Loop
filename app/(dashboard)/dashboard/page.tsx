"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { formatDate, getScoreColor, truncate } from "@/lib/utils";
import { useRouter } from "next/navigation";

function DeleteModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-3xl mb-3">🗑️</div>
        <h3 className="font-display font-bold text-lg mb-2">Delete review?</h3>
        <p className="text-text-muted text-sm mb-6">
          This review will be permanently deleted. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-border text-text-muted py-2.5 rounded-xl text-sm hover:border-muted hover:text-text-primary transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-severity-critical/90 hover:bg-severity-critical text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const [{ data: reviewsData }, { data: profileData }] = await Promise.all([
        supabase.from("reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("profiles").select("plan, reviews_used, reviews_limit").eq("id", user.id).single(),
      ]);

      setReviews(reviewsData ?? []);
      setProfile(profileData);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget);
    const { error } = await supabase.from("reviews").delete().eq("id", deleteTarget);
    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget));
    }
    setDeletingId(null);
    setDeleteTarget(null);
  }

  const usagePercent = profile
    ? Math.round((profile.reviews_used / profile.reviews_limit) * 100)
    : 0;

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-surface rounded-xl w-48" />
        <div className="h-24 bg-surface rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-surface rounded-2xl" />
          <div className="h-20 bg-surface rounded-2xl" />
        </div>
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-surface rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          loading={!!deletingId}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-1">Dashboard</h1>
          <p className="text-text-muted text-xs truncate">{user?.email}</p>
        </div>
        <Link
          href="/review"
          className="w-full sm:w-auto text-center bg-accent text-bg font-display font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm shrink-0"
        >
          + New Review
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="border border-border bg-surface rounded-2xl p-4">
          <p className="text-text-muted text-xs font-mono mb-2">REVIEWS THIS MONTH</p>
          <div className="flex items-end justify-between">
            <span className="font-display font-bold text-3xl">{profile?.reviews_used ?? 0}</span>
            <span className="text-text-muted text-xs shrink-0">/ {profile?.reviews_limit ?? 5}</span>
          </div>
          <div className="mt-3 bg-border rounded-full h-1.5">
            <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border bg-surface rounded-2xl p-4">
            <p className="text-text-muted text-xs font-mono mb-2">TOTAL REVIEWS</p>
            <span className="font-display font-bold text-3xl">{reviews.length}</span>
          </div>
          <div className="border border-border bg-surface rounded-2xl p-4">
            <p className="text-text-muted text-xs font-mono mb-2">PLAN</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-3xl capitalize">{profile?.plan ?? "Free"}</span>
              {profile?.plan === "free" && (
                <Link href="/pricing" className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-1 rounded-lg hover:bg-accent/20 transition-colors">
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div>
        <h2 className="font-display font-semibold text-base mb-3">
          Recent Reviews
          <span className="text-text-muted font-normal text-sm ml-2">({reviews.length})</span>
        </h2>

        {reviews.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-display font-semibold text-lg mb-2">No reviews yet</h3>
            <p className="text-text-muted text-sm mb-6">Submit your first URL or code snippet to get AI feedback.</p>
            <Link href="/review" className="inline-block bg-accent text-bg font-display font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
              Start your first review →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map((review) => (
              <div key={review.id} className="relative group">
                <Link
                  href={`/results/${review.id}`}
                  className="flex items-center border border-border bg-surface rounded-xl px-4 py-3 hover:border-muted transition-colors gap-2"
                >
                  {/* Icon + text */}
                  <span className="text-base shrink-0">{review.type === "url" ? "🌐" : "📝"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary text-sm font-medium group-hover:text-accent transition-colors truncate">
                      {truncate(review.input, 38)}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5 font-mono">{formatDate(review.created_at)}</p>
                  </div>

                  {/* Delete btn — sits between text and score, visible on hover */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteTarget(review.id);
                    }}
                    title="Delete review"
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-severity-critical/10 hover:bg-severity-critical/25 text-severity-critical text-xs px-2 py-1 rounded-lg border border-severity-critical/20 mr-2"
                  >
                    🗑️
                  </button>

                  {/* Score + arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-display font-bold text-xl ${getScoreColor(review.score)}`}>
                      {review.score}
                    </span>
                    <span className="text-text-muted group-hover:text-accent transition-colors text-sm">→</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}