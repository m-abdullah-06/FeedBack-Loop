import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Severity } from "@/types";
import { formatDate, getScoreColor, getScoreLabel } from "@/lib/utils";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "bg-severity-critical/10 text-severity-critical border-severity-critical/20",
  high: "bg-severity-high/10 text-severity-high border-severity-high/20",
  medium: "bg-severity-medium/10 text-severity-medium border-severity-medium/20",
  low: "bg-severity-low/10 text-severity-low border-severity-low/20",
  info: "bg-severity-info/10 text-severity-info border-severity-info/20",
};

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: review } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", id)
    .single();

  if (!review) notFound();

  const items: any[] = review.feedback_items || review.feedbackItems || [];
  const sorted = [...items].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  const counts = SEVERITY_ORDER.reduce((acc, sev) => {
    acc[sev] = items.filter((i) => i.severity === sev).length;
    return acc;
  }, {} as Record<Severity, number>);

  const isPro = review.plan_used === "pro";
  const isDeveloperOrPro = review.plan_used === "developer" || review.plan_used === "pro";

  return (
    <div className="max-w-4xl w-full">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors">
        ← Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono bg-surface border border-border px-3 py-1 rounded-full text-text-muted uppercase">
              {review.type} review
            </span>
            {review.plan_used && (
              <span className={`text-xs font-mono px-3 py-1 rounded-full border ${
                isPro ? "bg-accent/10 text-accent border-accent/20"
                : isDeveloperOrPro ? "bg-severity-info/10 text-severity-info border-severity-info/20"
                : "bg-surface text-text-muted border-border"
              }`}>
                {review.plan_used?.toUpperCase()} ANALYSIS
              </span>
            )}
            <span className="text-xs text-text-muted font-mono">{formatDate(review.created_at)}</span>
          </div>
          <p className="font-mono text-xs md:text-sm text-text-muted break-all">{review.input}</p>
        </div>

        <div className="shrink-0 sm:text-right">
          <p className="text-xs font-mono text-text-muted mb-1">SCORE</p>
          <div className={`font-display font-bold text-4xl md:text-5xl ${getScoreColor(review.score)}`}>
            {review.score}
          </div>
          <p className={`text-xs font-mono mt-1 ${getScoreColor(review.score)}`}>
            {getScoreLabel(review.score)}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="border border-border bg-surface rounded-2xl p-4 md:p-6 mb-5">
        <p className="text-xs font-mono text-text-muted mb-2">AI SUMMARY</p>
        <p className="text-text-primary leading-relaxed text-sm md:text-base">{review.summary}</p>
      </div>

      {/* JS render badge for developer/pro */}
      {isDeveloperOrPro && review.type === "url" && (
        <div className="border border-severity-info/20 bg-severity-info/5 rounded-xl px-4 py-3 mb-5 flex items-center gap-2 text-sm text-severity-info">
          <span>⚡</span>
          <span>Full JavaScript rendering — React, Next.js, and dynamic content was analyzed.</span>
        </div>
      )}

      {/* Severity breakdown */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
        {SEVERITY_ORDER.map((sev) => (
          <div key={sev} className={`border rounded-xl p-2 md:p-3 text-center ${SEVERITY_STYLES[sev]}`}>
            <div className="font-display font-bold text-xl md:text-2xl">{counts[sev]}</div>
            <div className="text-xs font-mono mt-0.5 uppercase opacity-80 hidden sm:block">{sev}</div>
            <div className="text-xs font-mono mt-0.5 uppercase opacity-80 sm:hidden">{sev.slice(0, 4)}</div>
          </div>
        ))}
      </div>

      {/* Feedback items */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">
          {items.length} Issue{items.length !== 1 ? "s" : ""} Found
        </h2>

        {items.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-display font-semibold text-lg mb-2">No issues found!</h3>
            <p className="text-text-muted text-sm">Your code looks clean. Great work!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((item) => (
              <div key={item.id} className="border border-border bg-surface rounded-2xl p-4 md:p-5 hover:border-muted transition-colors">
                {/* Title row */}
                <div className="flex flex-wrap items-start gap-2 md:gap-3 mb-3">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border shrink-0 ${SEVERITY_STYLES[item.severity as Severity] ?? ""}`}>
                    {item.severity.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm md:text-base">{item.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-text-muted font-mono">{item.category}</span>
                      {item.element && (
                        <span className="text-xs font-mono bg-bg border border-border px-2 py-0.5 rounded text-text-muted">
                          {item.element}
                        </span>
                      )}
                      {item.line && (
                        <span className="text-xs font-mono bg-bg border border-border px-2 py-0.5 rounded text-text-muted">
                          Line {item.line}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-muted text-sm leading-relaxed mb-3">{item.description}</p>

                {/* Fix */}
                <div className="bg-bg border border-border rounded-xl px-3 md:px-4 py-3 mb-2">
                  <p className="text-xs font-mono text-accent mb-1">FIX</p>
                  <p className="text-text-primary text-sm">{item.suggestion}</p>
                </div>

                {/* WordPress fix — Pro only */}
                {isPro && item.wordpressFix && (
                  <div className="bg-bg border border-accent/20 rounded-xl px-3 md:px-4 py-3 mb-2">
                    <p className="text-xs font-mono text-accent mb-1">📋 WORDPRESS FIX</p>
                    <p className="text-text-primary text-sm">{item.wordpressFix}</p>
                  </div>
                )}

                {/* Plugin recommendation — Pro only */}
                {isPro && item.plugin && (
                  <div className="bg-bg border border-severity-info/20 rounded-xl px-3 md:px-4 py-3">
                    <p className="text-xs font-mono text-severity-info mb-1">🔌 RECOMMENDED PLUGIN</p>
                    <p className="text-text-primary text-sm font-medium">{item.plugin}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link href="/review" className="text-center bg-accent text-bg font-display font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
          + New Review
        </Link>
        <Link href="/dashboard" className="text-center border border-border text-text-muted px-6 py-3 rounded-xl text-sm hover:border-muted hover:text-text-primary transition-colors">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}