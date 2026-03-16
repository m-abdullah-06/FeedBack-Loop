"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
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

const CATEGORY_LABELS: Record<string, string> = {
  seo: "SEO",
  performance: "Performance",
  security: "Security",
  accessibility: "Accessibility",
  ux: "UX/UI",
};

function getScoreColorHex(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}



export default function ResultsPage() {
  const { id } = useParams();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sharecopied, setShareCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();
      setReview(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleShare() {
  const shareUrl = `${window.location.origin}/share/${review.id}`;
  await navigator.clipboard.writeText(shareUrl);
  setShareCopied(true);
  setTimeout(() => setShareCopied(false), 2000);
}

  async function handleDownloadCard() {
    if (!cardRef.current || !review) return;
    setDownloading(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `feedbackloop-${review.score}-score.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-surface rounded-xl w-48" />
        <div className="h-32 bg-surface rounded-2xl" />
        <div className="h-24 bg-surface rounded-2xl" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="font-display font-bold text-xl mb-2">Review not found</h2>
        <Link href="/dashboard" className="text-accent text-sm">← Back to dashboard</Link>
      </div>
    );
  }

  const items: any[] = review.feedback_items || review.feedbackItems || [];
  const sorted = [...items].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  const counts = SEVERITY_ORDER.reduce((acc, sev) => {
    acc[sev] = items.filter((i) => i.severity === sev).length;
    return acc;
  }, {} as Record<Severity, number>);

  const categoryScores = review.category_scores || null;
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

      {/* JS render badge */}
      {isDeveloperOrPro && review.type === "url" && (
        <div className="border border-severity-info/20 bg-severity-info/5 rounded-xl px-4 py-3 mb-5 flex items-center gap-2 text-sm text-severity-info">
          <span>⚡</span>
          <span>Full JavaScript rendering — React, Next.js, and dynamic content was analyzed.</span>
        </div>
      )}

      {/* Category scores */}
      {categoryScores && (
        <div className="border border-border bg-surface rounded-2xl p-4 md:p-6 mb-5">
          <p className="text-xs font-mono text-text-muted mb-4">CATEGORY SCORES</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const score = categoryScores[key];
              if (score === null || score === undefined) return null;
              return (
                <div key={key} className="text-center">
                  <div className={`font-display font-bold text-2xl md:text-3xl mb-1 ${getScoreColor(score)}`}>
                    {score}
                  </div>
                  <p className="text-xs font-mono text-text-muted">{label}</p>
                  <div className="mt-2 bg-border rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{
                        width: `${score}%`,
                        backgroundColor: getScoreColorHex(score),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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

                <p className="text-text-muted text-sm leading-relaxed mb-3">{item.description}</p>

                <div className="bg-bg border border-border rounded-xl px-3 md:px-4 py-3 mb-2">
                  <p className="text-xs font-mono text-accent mb-1">FIX</p>
                  <p className="text-text-primary text-sm">{item.suggestion}</p>
                </div>

                {isPro && item.wordpressFix && (
                  <div className="bg-bg border border-accent/20 rounded-xl px-3 md:px-4 py-3 mb-2">
                    <p className="text-xs font-mono text-accent mb-1">📋 WORDPRESS FIX</p>
                    <p className="text-text-primary text-sm">{item.wordpressFix}</p>
                  </div>
                )}

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
        <button
  onClick={handleShare}
  className="text-center border border-border text-text-muted font-display font-semibold px-6 py-3 rounded-xl text-sm hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
>
  {sharecopied ? "✓ Link copied!" : "🔗 Share Report"}
</button>
        <button
          onClick={handleDownloadCard}
          disabled={downloading}
          className="text-center border border-accent text-accent font-display font-semibold px-6 py-3 rounded-xl text-sm hover:bg-accent/10 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {downloading ? (
            <>
              <span className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              Generating...
            </>
          ) : "⬇️ Download Score Card"}
        </button>
        <Link href="/dashboard" className="text-center border border-border text-text-muted px-6 py-3 rounded-xl text-sm hover:border-muted hover:text-text-primary transition-colors">
          Back to dashboard
        </Link>
      </div>

      {/* Hidden downloadable card */}
      <div className="mt-12">
        <div
          ref={cardRef}
          style={{
            width: "600px",
            backgroundColor: "#0a0a0a",
            border: "1px solid #1a1a1a",
            borderRadius: "20px",
            padding: "40px",
            fontFamily: "Arial, sans-serif",
            position: "absolute",
            left: "-9999px",
          }}
        >
          {/* Card Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <span style={{ color: "#ffffff", fontWeight: 800, fontSize: "22px", letterSpacing: "-0.5px" }}>
                feedback<span style={{ color: "#00ff88" }}>loop</span>
              </span>
              <p style={{ color: "#555", fontSize: "12px", marginTop: "4px", fontFamily: "monospace" }}>
                feedbackloopai.vercel.app
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#555", fontSize: "11px", fontFamily: "monospace", marginBottom: "4px" }}>OVERALL SCORE</p>
              <span style={{ color: getScoreColorHex(review.score), fontWeight: 800, fontSize: "56px", lineHeight: 1 }}>
                {review.score}
              </span>
              <p style={{ color: getScoreColorHex(review.score), fontSize: "12px", fontFamily: "monospace", marginTop: "4px" }}>
                {getScoreLabel(review.score)}
              </p>
            </div>
          </div>

          {/* URL */}
          <div style={{ backgroundColor: "#111", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "10px 14px", marginBottom: "24px" }}>
            <p style={{ color: "#555", fontSize: "10px", fontFamily: "monospace", marginBottom: "2px" }}>ANALYZED URL</p>
            <p style={{ color: "#aaa", fontSize: "12px", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {review.input}
            </p>
          </div>

          {/* Category scores */}
          {categoryScores && (
            <div style={{ marginBottom: "24px" }}>
              <p style={{ color: "#555", fontSize: "10px", fontFamily: "monospace", marginBottom: "12px" }}>CATEGORY SCORES</p>
              <div style={{ display: "flex", gap: "10px" }}>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                  const score = categoryScores[key];
                  if (score === null || score === undefined) return null;
                  return (
                    <div key={key} style={{ flex: 1, backgroundColor: "#111", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "12px 8px", textAlign: "center" }}>
                      <p style={{ color: getScoreColorHex(score), fontWeight: 700, fontSize: "22px", marginBottom: "4px" }}>{score}</p>
                      <p style={{ color: "#555", fontSize: "9px", fontFamily: "monospace" }}>{label.toUpperCase()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Severity breakdown */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {SEVERITY_ORDER.map((sev) => {
              const colors: Record<string, string> = {
                critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#22c55e", info: "#3b82f6"
              };
              return (
                <div key={sev} style={{ flex: 1, backgroundColor: `${colors[sev]}15`, border: `1px solid ${colors[sev]}30`, borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                  <p style={{ color: colors[sev], fontWeight: 700, fontSize: "18px" }}>{counts[sev]}</p>
                  <p style={{ color: colors[sev], fontSize: "8px", fontFamily: "monospace", opacity: 0.8 }}>{sev.toUpperCase().slice(0, 4)}</p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "#333", fontSize: "11px", fontFamily: "monospace" }}>
              Analyze your site free at feedbackloopai.vercel.app
            </p>
            <p style={{ color: "#333", fontSize: "10px", fontFamily: "monospace" }}>
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}