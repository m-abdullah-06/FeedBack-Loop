import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { formatDate, getScoreColor, truncate } from "@/lib/utils";
import { AnalysisResult } from "@/types";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, reviews_used, reviews_limit")
    .eq("id", user?.id)
    .single();

  const usagePercent = profile
    ? Math.round((profile.reviews_used / profile.reviews_limit) * 100)
    : 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
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

      {/* Stats — always single column on mobile */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="border border-border bg-surface rounded-2xl p-4">
          <p className="text-text-muted text-xs font-mono mb-2">REVIEWS THIS MONTH</p>
          <div className="flex items-end justify-between">
            <span className="font-display font-bold text-3xl">
              {profile?.reviews_used ?? 0}
            </span>
            <span className="text-text-muted text-xs shrink-0">
              / {profile?.reviews_limit ?? 5}
            </span>
          </div>
          <div className="mt-3 bg-border rounded-full h-1.5">
            <div
              className="bg-accent h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border bg-surface rounded-2xl p-4">
            <p className="text-text-muted text-xs font-mono mb-2">TOTAL REVIEWS</p>
            <span className="font-display font-bold text-3xl">
              {reviews?.length ?? 0}
            </span>
          </div>

          <div className="border border-border bg-surface rounded-2xl p-4">
            <p className="text-text-muted text-xs font-mono mb-2">PLAN</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-3xl capitalize">
                {profile?.plan ?? "Free"}
              </span>
              {profile?.plan === "free" && (
                <Link
                  href="/pricing"
                  className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-1 rounded-lg hover:bg-accent/20 transition-colors"
                >
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div>
        <h2 className="font-display font-semibold text-base mb-3">Recent Reviews</h2>

        {!reviews || reviews.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-display font-semibold text-lg mb-2">No reviews yet</h3>
            <p className="text-text-muted text-sm mb-6">
              Submit your first URL or code snippet to get AI feedback.
            </p>
            <Link
              href="/review"
              className="inline-block bg-accent text-bg font-display font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              Start your first review →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map((review: AnalysisResult & { user_id: string; created_at: string; feedback_items: [] }) => (
              <Link
                key={review.id}
                href={`/results/${review.id}`}
                className="flex items-center justify-between border border-border bg-surface rounded-xl px-4 py-3 hover:border-muted transition-colors group gap-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-base shrink-0">
                    {review.type === "url" ? "🌐" : "📝"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm font-medium group-hover:text-accent transition-colors truncate">
                      {truncate(review.input, 40)}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5 font-mono">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-display font-bold text-xl ${getScoreColor(review.score)}`}>
                    {review.score}
                  </span>
                  <span className="text-text-muted group-hover:text-accent transition-colors text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}