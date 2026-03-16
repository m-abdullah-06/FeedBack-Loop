"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Severity } from "@/types";

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

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

function getScoreColorHex(score: number) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Good";
  if (score >= 60) return "Needs Work";
  return "Poor";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SharePage({ params }: { params: { id: string } }) {
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", params.id)
        .eq("is_public", true)
        .single();
      setReview(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="font-display font-bold text-2xl mb-2">Report not found</h1>
          <p className="text-text-muted text-sm mb-6">This report may have been deleted or made private.</p>
          <Link href="/" className="bg-accent text-bg font-display font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
            Analyze your site free →
          </Link>
        </div>
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

  return (
    <div className="min-h-screen bg-bg text-text-primary">

      {/* Top bar */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            feedback<span className="text-accent">loop</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="text-xs font-mono border border-border text-text-muted px-3 py-1.5 rounded-lg hover:border-accent hover:text-accent transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy link"}
            </button>
            <Link
              href="/signup"
              className="text-xs font-display font-semibold bg-accent text-bg px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Analyze your site free →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono bg-surface border border-border px-3 py-1 rounded-full text-text-muted uppercase">
                {review.type} review
              </span>
              <span className="text-xs text-text-muted font-mono">{formatDate(review.created_at)}</span>
            </div>
            <p className="font-mono text-xs md:text-sm text-text-muted break-all">{review.input}</p>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="text-xs font-mono text-text-muted mb-1">OVERALL SCORE</p>
            <div className={`font-display font-bold text-5xl ${getScoreColor(review.score)}`}>
              {review.score}
            </div>
            <p className={`text-xs font-mono mt-1 ${getScoreColor(review.score)}`}>
              {getScoreLabel(review.score)}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="border border-border bg-surface rounded-2xl p-5 mb-5">
          <p className="text-xs font-mono text-text-muted mb-2">SUMMARY</p>
          <p className="text-text-primary leading-relaxed text-sm">{review.summary}</p>
        </div>

        {/* Category scores */}
        {categoryScores && (
          <div className="border border-border bg-surface rounded-2xl p-5 mb-5">
            <p className="text-xs font-mono text-text-muted mb-4">CATEGORY SCORES</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const score = categoryScores[key];
                if (score === null || score === undefined) return null;
                return (
                  <div key={key} className="text-center">
                    <div className={`font-display font-bold text-3xl mb-1 ${getScoreColor(score)}`}>
                      {score}
                    </div>
                    <p className="text-xs font-mono text-text-muted">{label}</p>
                    <div className="mt-2 bg-border rounded-full h-1">
                      <div
                        className="h-1 rounded-full transition-all"
                        style={{ width: `${score}%`, backgroundColor: getScoreColorHex(score) }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Severity breakdown */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {SEVERITY_ORDER.map((sev) => (
            <div key={sev} className={`border rounded-xl p-3 text-center ${SEVERITY_STYLES[sev]}`}>
              <div className="font-display font-bold text-2xl">{counts[sev]}</div>
              <div className="text-xs font-mono mt-0.5 uppercase opacity-80 hidden sm:block">{sev}</div>
              <div className="text-xs font-mono mt-0.5 uppercase opacity-80 sm:hidden">{sev.slice(0, 4)}</div>
            </div>
          ))}
        </div>

        {/* Issues */}
        <h2 className="font-display font-semibold text-lg mb-4">
          {items.length} Issue{items.length !== 1 ? "s" : ""} Found
        </h2>

        <div className="space-y-3 mb-10">
          {sorted.map((item) => (
            <div key={item.id} className="border border-border bg-surface rounded-2xl p-5">
              <div className="flex flex-wrap items-start gap-2 mb-3">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border shrink-0 ${SEVERITY_STYLES[item.severity as Severity] ?? ""}`}>
                  {item.severity.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary text-sm">{item.title}</h3>
                  <span className="text-xs text-text-muted font-mono">{item.category}</span>
                </div>
              </div>

              <p className="text-text-muted text-sm leading-relaxed mb-3">{item.description}</p>

              <div className="bg-bg border border-border rounded-xl px-4 py-3 mb-2">
                <p className="text-xs font-mono text-accent mb-1">FIX</p>
                <p className="text-text-primary text-sm">{item.suggestion}</p>
              </div>

              {isPro && item.wordpressFix && (
                <div className="bg-bg border border-accent/20 rounded-xl px-4 py-3 mb-2">
                  <p className="text-xs font-mono text-accent mb-1">📋 WORDPRESS FIX</p>
                  <p className="text-text-primary text-sm">{item.wordpressFix}</p>
                </div>
              )}

              {isPro && item.plugin && (
                <div className="bg-bg border border-severity-info/20 rounded-xl px-4 py-3">
                  <p className="text-xs font-mono text-severity-info mb-1">🔌 RECOMMENDED PLUGIN</p>
                  <p className="text-text-primary text-sm font-medium">{item.plugin}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="border border-accent/20 bg-accent/5 rounded-2xl p-6 text-center">
          <h3 className="font-display font-bold text-xl mb-2">
            Find out what's wrong with your site
          </h3>
          <p className="text-text-muted text-sm mb-4">
            Free AI analysis — no signup needed. SEO, performance, security, accessibility and UX in seconds.
          </p>
          <Link
            href="/"
            className="inline-block bg-accent text-bg font-display font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Analyze your site free →
          </Link>
          <p className="text-xs text-text-muted mt-3">
            Powered by <span className="text-accent font-semibold">feedbackloop</span>
          </p>
        </div>

      </div>
    </div>
  );
}