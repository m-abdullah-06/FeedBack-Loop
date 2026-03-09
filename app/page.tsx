"use client";
import Link from "next/link";
import { useState } from "react";

const FEATURES = [
  { icon: "⚡", title: "URL Review", desc: "Paste any live URL and get instant UX, SEO, and performance critique." },
  { icon: "🔍", title: "Code Review", desc: "Submit code in any language — get security, quality, and best-practice feedback." },
  { icon: "📊", title: "Severity Scoring", desc: "Every issue rated Critical → Info so you know exactly what to fix first." },
  { icon: "💾", title: "Review History", desc: "All past reviews saved. Track improvements over time." },
  { icon: "🎯", title: "Actionable Fixes", desc: "Not just 'what's wrong' — we tell you exactly how to fix it." },
  { icon: "🚀", title: "Instant Results", desc: "Powered by Groq AI. Results in seconds, not minutes." },
];

const PREMIUM_FEATURES = [
  { icon: "⚡", title: "Full JS Rendering", description: "Analyzes React, Next.js, and Vue apps by running real JavaScript — not just static HTML.", label: "Developer+", labelStyle: "bg-severity-info/10 border border-severity-info/20 text-severity-info", cardStyle: "border-severity-info/20 bg-severity-info/5" },
  { icon: "🎯", title: "SPA & Dynamic App Support", description: "Reviews apps that load content dynamically — dashboards, single page apps, and more.", label: "Developer+", labelStyle: "bg-severity-info/10 border border-severity-info/20 text-severity-info", cardStyle: "border-severity-info/20 bg-severity-info/5" },
  { icon: "📋", title: "WordPress Fix Guides", description: "Step-by-step Dashboard instructions for every issue — no coding knowledge needed.", label: "Pro Only", labelStyle: "bg-accent/10 border border-accent/20 text-accent", cardStyle: "border-accent/20 bg-accent/5" },
  { icon: "🔌", title: "Plugin Recommendations", description: "Get the best free WordPress plugin to fix each issue instantly.", label: "Pro Only", labelStyle: "bg-accent/10 border border-accent/20 text-accent", cardStyle: "border-accent/20 bg-accent/5" },
  { icon: "🌍", title: "Platform Detection", description: "Automatically detects WordPress, React, Next.js and tailors feedback for your stack.", label: "Pro Only", labelStyle: "bg-accent/10 border border-accent/20 text-accent", cardStyle: "border-accent/20 bg-accent/5" },
  { icon: "🏢", title: "Agency-Ready Reports", description: "Audit client sites in seconds and share detailed professional feedback with ease.", label: "Pro Only", labelStyle: "bg-accent/10 border border-accent/20 text-accent", cardStyle: "border-accent/20 bg-accent/5" },
];

const CATEGORIES = ["UX", "Performance", "Security", "Accessibility", "SEO", "Code Quality"];

const MOCK_ISSUES = [
  { sev: "critical", label: "CRITICAL", title: "No HTTPS redirect configured", cat: "Security" },
  { sev: "high", label: "HIGH", title: "Images missing alt attributes", cat: "Accessibility" },
  { sev: "medium", label: "MEDIUM", title: "Render-blocking JavaScript in <head>", cat: "Performance" },
];

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-severity-critical/10 text-severity-critical",
  high: "bg-severity-high/10 text-severity-high",
  medium: "bg-severity-medium/10 text-severity-medium",
  low: "bg-severity-low/10 text-severity-low",
};

type PreviewResult = {
  score: number;
  totalIssues: number;
  feedbackItems: { title: string; category: string; severity: string }[];
};

export default function LandingPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [previewError, setPreviewError] = useState("");

  async function handlePreview() {
    if (!previewUrl.trim()) return;
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewResult(null);

    try {
      const url = previewUrl.startsWith("http") ? previewUrl : `https://${previewUrl}`;
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreviewError(data.error || "Something went wrong. Try again.");
      } else {
        setPreviewResult(data);
      }
    } catch {
      setPreviewError("Something went wrong. Try again.");
    } finally {
      setPreviewLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg font-body">

      {/* ── Early Bird Banner ── */}
      <div className="bg-accent text-bg text-xs md:text-sm font-mono py-2.5 text-center px-4">
        🎉 Early Bird — First 100 users get <strong>Pro plan free for 3 months</strong> · No credit card needed ·{" "}
        <Link href="/signup" className="underline underline-offset-2 font-bold hover:opacity-80">
          Claim your spot →
        </Link>
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="font-display font-bold text-xl tracking-tight">
            feedback<span className="text-accent">loop</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/pricing" className="text-text-muted hover:text-text-primary text-sm transition-colors">Pricing</Link>
            <Link href="/login" className="text-text-muted hover:text-text-primary text-sm transition-colors">Login</Link>
            <Link href="/signup" className="bg-accent text-bg text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Get Started Free
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-3">
            <Link href="/login" className="text-text-muted text-sm">Login</Link>
            <Link href="/signup" className="bg-accent text-bg text-xs font-semibold px-3 py-2 rounded-lg">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-16 md:pt-24 pb-16 md:pb-24 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[200px] md:h-[300px] bg-accent/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 border border-border bg-surface px-3 md:px-4 py-2 rounded-full text-xs text-text-muted mb-6 md:mb-8">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse-slow shrink-0" />
            Powered by Groq AI — free tier available
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight mb-4 md:mb-6">
            Your code deserves<br />
            <span className="text-accent">brutal honesty.</span>
          </h1>
          <p className="text-text-muted text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 px-2">
            Paste a URL or code snippet. Get instant AI feedback on UX, performance, security, and accessibility — with severity scores and exact fixes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <Link href="/signup" className="w-full sm:w-auto bg-accent text-bg font-display font-bold text-base px-8 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] text-center">
              Start reviewing for free →
            </Link>
            <Link href="/login" className="w-full sm:w-auto border border-border text-text-primary text-base px-8 py-4 rounded-xl hover:border-muted transition-colors text-center">
              Sign in
            </Link>
          </div>
          <p className="text-text-muted text-xs md:text-sm mt-4">No credit card required · 5 free reviews/month</p>
        </div>
      </section>

      {/* ── Category badges ── */}
      <section className="pb-12 md:pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <span key={cat} className="border border-border bg-surface text-text-muted text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full font-mono">
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* ── Mock result preview ── */}
      <section className="pb-16 md:pb-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="border border-border rounded-2xl bg-surface overflow-hidden">
            <div className="border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-severity-critical" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-severity-medium" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-severity-low" />
              <span className="text-text-muted text-xs font-mono ml-1 md:ml-2 truncate">feedbackloop — review #a1b2c3</span>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-text-muted text-xs font-mono mb-1">OVERALL SCORE</p>
                  <div className="font-display font-bold text-4xl md:text-5xl text-severity-medium">64</div>
                </div>
                <div className="text-right">
                  <p className="text-text-muted text-xs font-mono mb-1">ISSUES FOUND</p>
                  <div className="font-display font-bold text-4xl md:text-5xl text-text-primary">8</div>
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                {MOCK_ISSUES.map((item, i) => (
                  <div key={i} className="border border-border rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded shrink-0 ${
                      item.sev === "critical" ? "bg-severity-critical/10 text-severity-critical"
                      : item.sev === "high" ? "bg-severity-high/10 text-severity-high"
                      : "bg-severity-medium/10 text-severity-medium"
                    }`}>{item.label}</span>
                    <div className="min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{item.title}</p>
                      <p className="text-text-muted text-xs mt-0.5">{item.cat}</p>
                    </div>
                  </div>
                ))}
                <div className="border border-dashed border-border rounded-xl p-3 md:p-4 text-center text-text-muted text-xs md:text-sm">
                  + 5 more issues — sign up to view
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Teaser ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-block bg-accent/10 border border-accent/20 text-accent text-xs font-mono px-4 py-1.5 rounded-full mb-4">
              TRY IT FREE — NO SIGNUP NEEDED
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">
              See what's wrong with your site
            </h2>
            <p className="text-text-muted text-base">
              Paste any URL and get a free instant preview — no account required.
            </p>
          </div>

          {/* Input */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePreview()}
              placeholder="https://yourwebsite.com"
              className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors font-mono"
            />
            <button
              onClick={handlePreview}
              disabled={previewLoading || !previewUrl.trim()}
              className="bg-accent text-bg font-display font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0 flex items-center gap-2 justify-center"
            >
              {previewLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : "Analyze →"}
            </button>
          </div>

          {/* Error */}
          {previewError && (
            <div className="border border-severity-critical/20 bg-severity-critical/5 text-severity-critical text-sm rounded-xl px-4 py-3 mb-4">
              {previewError}
            </div>
          )}

          {/* Results */}
          {previewResult && (
            <div className="border border-border bg-surface rounded-2xl overflow-hidden">
              {/* Score bar */}
              <div className="border-b border-border px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-xs font-mono mb-1">SCORE</p>
                  <span className={`font-display font-bold text-4xl ${
                    previewResult.score >= 80 ? "text-severity-low"
                    : previewResult.score >= 60 ? "text-severity-medium"
                    : "text-severity-critical"
                  }`}>{previewResult.score}</span>
                </div>
                <div className="text-right">
                  <p className="text-text-muted text-xs font-mono mb-1">ISSUES DETECTED</p>
                  <span className="font-display font-bold text-4xl text-text-primary">{previewResult.totalIssues}</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <p className="text-text-muted text-xs font-mono mb-1">TOP ISSUES FOUND</p>

                {/* Visible issues (first 2) */}
                {previewResult.feedbackItems.slice(0, 2).map((item, i) => (
                  <div key={i} className="border border-border rounded-xl p-3 flex items-start gap-3">
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded shrink-0 ${SEVERITY_STYLES[item.severity] ?? "bg-surface text-text-muted"}`}>
                      {item.severity.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-text-primary text-sm font-medium">{item.title}</p>
                      <p className="text-text-muted text-xs mt-0.5">{item.category}</p>
                    </div>
                  </div>
                ))}

                {/* Blurred issue (3rd) */}
                {previewResult.feedbackItems[2] && (
                  <div className="relative">
                    <div className="border border-border rounded-xl p-3 flex items-start gap-3 select-none pointer-events-none">
                      <span className={`text-xs font-mono font-bold px-2 py-1 rounded shrink-0 blur-sm ${SEVERITY_STYLES[previewResult.feedbackItems[2].severity] ?? "bg-surface text-text-muted"}`}>
                        {previewResult.feedbackItems[2].severity.toUpperCase()}
                      </span>
                      <div className="min-w-0 blur-sm">
                        <p className="text-text-primary text-sm font-medium">{previewResult.feedbackItems[2].title}</p>
                        <p className="text-text-muted text-xs mt-0.5">{previewResult.feedbackItems[2].category}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blurred CTA */}
                <div className="relative border border-dashed border-accent/30 bg-accent/5 rounded-xl p-4 text-center">
                  <p className="text-text-primary text-sm font-semibold mb-1">
                    + {previewResult.totalIssues - 2} more issues found
                  </p>
                  <p className="text-text-muted text-xs mb-3">
                    Sign up free to see all issues, severity scores, and exact fixes.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-block bg-accent text-bg font-display font-semibold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
                  >
                    See full report — it's free →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Premium Features ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-block bg-accent/10 border border-accent/20 text-accent text-xs font-mono px-4 py-1.5 rounded-full mb-4">
              DEVELOPER & PRO PLANS
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">Unlock more powerful analysis</h2>
            <p className="text-text-muted text-base max-w-xl mx-auto">
              Free plan covers the basics. Upgrade to go deeper — full JS rendering, WordPress guides, and platform-specific fixes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PREMIUM_FEATURES.map((feature) => (
              <div key={feature.title} className={`relative border rounded-2xl p-5 ${feature.cardStyle}`}>
                <div className="absolute top-4 right-4 text-lg opacity-40">🔒</div>
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-display font-semibold text-base mb-2 pr-6">{feature.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-3">{feature.description}</p>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-lg ${feature.labelStyle}`}>{feature.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/pricing" className="inline-block bg-accent text-bg font-display font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm">
              See Developer & Pro plans →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-3">Everything you need to ship better</h2>
          <p className="text-text-muted text-center mb-10 md:mb-16 text-base md:text-lg">One tool, all the feedback you'd get from a senior dev review.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`border rounded-2xl p-5 md:p-6 transition-all duration-300 cursor-default ${
                  hovered === i ? "border-accent/30 bg-accent/5" : "border-border bg-surface"
                }`}
              >
                <div className="text-2xl md:text-3xl mb-3 md:mb-4">{f.icon}</div>
                <h3 className="font-display font-semibold text-base md:text-lg mb-2">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Start reviewing <span className="text-accent">today.</span>
          </h2>
          <p className="text-text-muted text-base md:text-lg mb-2">5 free reviews every month. No credit card. No nonsense.</p>
          <p className="text-accent text-sm font-mono mb-8">🎉 First 100 users get Pro free for 3 months</p>
          <Link href="/signup" className="inline-block bg-accent text-bg font-display font-bold text-base md:text-lg px-8 md:px-10 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-[1.02]">
            Create free account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-text-muted text-xs md:text-sm">
          <div className="font-display font-bold text-base">feedback<span className="text-accent">loop</span></div>
          <p>Built with Next.js · Groq AI · Supabase</p>
        </div>
      </footer>

    </div>
  );
}