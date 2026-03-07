"use client";
import Link from "next/link";
import { useState } from "react";

const FEATURES = [
  {
    icon: "⚡",
    title: "URL Review",
    desc: "Paste any live URL and get instant UX, SEO, and performance critique.",
  },
  {
    icon: "🔍",
    title: "Code Review",
    desc: "Submit code in any language — get security, quality, and best-practice feedback.",
  },
  {
    icon: "📊",
    title: "Severity Scoring",
    desc: "Every issue rated Critical → Info so you know exactly what to fix first.",
  },
  {
    icon: "💾",
    title: "Review History",
    desc: "All past reviews saved. Track improvements over time.",
  },
  {
    icon: "🎯",
    title: "Actionable Fixes",
    desc: "Not just 'what's wrong' — we tell you exactly how to fix it.",
  },
  {
    icon: "🚀",
    title: "Instant Results",
    desc: "Powered by Groq AI. Results in seconds, not minutes.",
  },
];

const CATEGORIES = ["UX", "Performance", "Security", "Accessibility", "SEO", "Code Quality"];

const MOCK_ISSUES = [
  { sev: "critical", label: "CRITICAL", title: "No HTTPS redirect configured", cat: "Security" },
  { sev: "high", label: "HIGH", title: "Images missing alt attributes", cat: "Accessibility" },
  { sev: "medium", label: "MEDIUM", title: "Render-blocking JavaScript in <head>", cat: "Performance" },
];

export default function LandingPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg font-body">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="font-display font-bold text-xl tracking-tight">
            feedback<span className="text-accent">loop</span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/pricing" className="text-text-muted hover:text-text-primary text-sm transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-text-muted hover:text-text-primary text-sm transition-colors">
              Login
            </Link>
            <Link href="/signup" className="bg-accent text-bg text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Get Started Free
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-3">
            <Link href="/login" className="text-text-muted text-sm">Login</Link>
            <Link href="/signup" className="bg-accent text-bg text-xs font-semibold px-3 py-2 rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[200px] md:h-[300px] bg-accent/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 border border-border bg-surface px-3 md:px-4 py-2 rounded-full text-xs text-text-muted mb-6 md:mb-8">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse-slow shrink-0" />
            Powered by Groq AI — free tier available
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight mb-4 md:mb-6">
            Your code deserves
            <br />
            <span className="text-accent">brutal honesty.</span>
          </h1>

          <p className="text-text-muted text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 px-2">
            Paste a URL or code snippet. Get instant AI feedback on UX, performance, security, and accessibility — with severity scores and exact fixes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-accent text-bg font-display font-bold text-base px-8 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
            >
              Start reviewing for free →
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border border-border text-text-primary text-base px-8 py-4 rounded-xl hover:border-muted transition-colors text-center"
            >
              Sign in
            </Link>
          </div>

          <p className="text-text-muted text-xs md:text-sm mt-4">
            No credit card required · 5 free reviews/month
          </p>
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
            {/* Title bar */}
            <div className="border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-severity-critical" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-severity-medium" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-severity-low" />
              <span className="text-text-muted text-xs font-mono ml-1 md:ml-2 truncate">
                feedbackloop — review #a1b2c3
              </span>
            </div>
            <div className="p-4 md:p-6">
              {/* Score row */}
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
              {/* Issues */}
              <div className="space-y-2 md:space-y-3">
                {MOCK_ISSUES.map((item, i) => (
                  <div key={i} className="border border-border rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded shrink-0 ${
                      item.sev === "critical" ? "bg-severity-critical/10 text-severity-critical"
                      : item.sev === "high" ? "bg-severity-high/10 text-severity-high"
                      : "bg-severity-medium/10 text-severity-medium"
                    }`}>
                      {item.label}
                    </span>
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

      {/* ── Features ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-3">
            Everything you need to ship better
          </h2>
          <p className="text-text-muted text-center mb-10 md:mb-16 text-base md:text-lg">
            One tool, all the feedback you'd get from a senior dev review.
          </p>
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
          <p className="text-text-muted text-base md:text-lg mb-8">
            5 free reviews every month. No credit card. No nonsense.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-accent text-bg font-display font-bold text-base md:text-lg px-8 md:px-10 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-[1.02]"
          >
            Create free account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-text-muted text-xs md:text-sm">
          <div className="font-display font-bold text-base">
            feedback<span className="text-accent">loop</span>
          </div>
          <p>Built with Next.js · Groq AI · Supabase</p>
        </div>
      </footer>

    </div>
  );
}