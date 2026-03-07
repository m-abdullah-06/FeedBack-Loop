import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { formatDate, getScoreColor, truncate } from "@/lib/utils";
import { AnalysisResult } from "@/types";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch recent reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch usage info
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, reviews_used, reviews_limit")
    .eq("id", user?.id)
    .single();

  const usagePercent = profile
    ? Math.round((profile.reviews_used / profile.reviews_limit) * 100)
    : 0;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1">Dashboard</h1>
          <p className="text-text-muted text-sm">
            {user?.email}
          </p>
        </div>
        <Link
          href="/review"
          className="bg-accent text-bg font-display font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
        >
          + New Review
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-border bg-surface rounded-2xl p-5">
          <p className="text-text-muted text-xs font-mono mb-2">REVIEWS THIS MONTH</p>
          <div className="flex items-end justify-between">
            <span className="font-display font-bold text-4xl">
              {profile?.reviews_used ?? 0}
            </span>
            <span className="text-text-muted text-sm">/ {profile?.reviews_limit ?? 5}</span>
          </div>
          <div className="mt-3 bg-border rounded-full h-1.5">
            <div
              className="bg-accent h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="border border-border bg-surface rounded-2xl p-5">
          <p className="text-text-muted text-xs font-mono mb-2">TOTAL REVIEWS</p>
          <span className="font-display font-bold text-4xl">
            {reviews?.length ?? 0}
          </span>
        </div>

        <div className="border border-border bg-surface rounded-2xl p-5">
          <p className="text-text-muted text-xs font-mono mb-2">PLAN</p>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-4xl capitalize">
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

      {/* Reviews list */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Recent Reviews</h2>

        {!reviews || reviews.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-16 text-center">
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
          <div className="space-y-3">
            {reviews.map((review: AnalysisResult & { user_id: string; created_at: string }) => (
              <Link
                key={review.id}
                href={`/results/${review.id}`}
                className="flex items-center justify-between border border-border bg-surface rounded-xl px-5 py-4 hover:border-muted transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">{review.type === "url" ? "🌐" : "📝"}</span>
                  <div>
                    <p className="text-text-primary text-sm font-medium group-hover:text-accent transition-colors">
                      {truncate(review.input, 60)}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5 font-mono">
                      {formatDate(review.created_at)} · {review.type.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-display font-bold text-2xl ${getScoreColor(review.score)}`}>
                    {review.score}
                  </span>
                  <span className="text-text-muted text-sm">{review.feedbackItems?.length ?? 0} issues</span>
                  <span className="text-text-muted group-hover:text-accent transition-colors">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
