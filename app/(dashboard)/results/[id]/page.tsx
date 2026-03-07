import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FeedbackItem, Severity } from "@/types";
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

  const items: FeedbackItem[] = review.feedback_items || [];
  const sorted = [...items].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  const counts = SEVERITY_ORDER.reduce((acc, sev) => {
    acc[sev] = items.filter((i) => i.severity === sev).length;
    return acc;
  }, {} as Record<Severity, number>);

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-8 transition-colors"
      >
        ← Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono bg-surface border border-border px-3 py-1 rounded-full text-text-muted uppercase">
              {review.type} review
            </span>
            <span className="text-xs text-text-muted font-mono">
              {formatDate(review.created_at)}
            </span>
          </div>
          <p className="font-mono text-sm text-text-muted truncate">{review.input}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs font-mono text-text-muted mb-1">SCORE</p>
          <div className={`font-display font-bold text-5xl ${getScoreColor(review.score)}`}>
            {review.score}
          </div>
          <p className={`text-xs font-mono mt-1 ${getScoreColor(review.score)}`}>
            {getScoreLabel(review.score)}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="border border-border bg-surface rounded-2xl p-6 mb-6">
        <p className="text-xs font-mono text-text-muted mb-2">AI SUMMARY</p>
        <p className="text-text-primary leading-relaxed">{review.summary}</p>
      </div>

      {/* Severity breakdown */}
      <div className="grid grid-cols-5 gap-2 mb-8">
        {SEVERITY_ORDER.map((sev) => (
          <div key={sev} className={`border rounded-xl p-3 text-center ${SEVERITY_STYLES[sev]}`}>
            <div className="font-display font-bold text-2xl">{counts[sev]}</div>
            <div className="text-xs font-mono mt-0.5 uppercase opacity-80">{sev}</div>
          </div>
        ))}
      </div>

      {/* Feedback items */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">
          {items.length} Issues Found
        </h2>
        <div className="space-y-3">
          {sorted.map((item) => (
            <div
              key={item.id}
              className="border border-border bg-surface rounded-2xl p-5 hover:border-muted transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border shrink-0 ${SEVERITY_STYLES[item.severity]}`}
                >
                  {item.severity.toUpperCase()}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">{item.title}</h3>
                  <span className="text-xs text-text-muted font-mono">{item.category}</span>
                  {item.element && (
                    <span className="text-xs font-mono bg-bg border border-border px-2 py-0.5 rounded ml-2 text-text-muted">
                      {item.element}
                    </span>
                  )}
                  {item.line && (
                    <span className="text-xs font-mono bg-bg border border-border px-2 py-0.5 rounded ml-2 text-text-muted">
                      Line {item.line}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-text-muted text-sm leading-relaxed mb-3">
                {item.description}
              </p>
              <div className="bg-bg border border-border rounded-xl px-4 py-3">
                <p className="text-xs font-mono text-accent mb-1">FIX</p>
                <p className="text-text-primary text-sm">{item.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Link
          href="/review"
          className="bg-accent text-bg font-display font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          + New Review
        </Link>
        <Link
          href="/dashboard"
          className="border border-border text-text-muted px-6 py-3 rounded-xl text-sm hover:border-muted hover:text-text-primary transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
