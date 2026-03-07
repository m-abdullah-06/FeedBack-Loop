"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewType } from "@/types";

const LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "PHP", "Go",
  "Rust", "Java", "C#", "C++", "Ruby", "Swift", "Kotlin",
];

export default function ReviewPage() {
  const [type, setType] = useState<ReviewType>("url");
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit() {
    if (!input.trim()) return;

    if (input.length > 20000) {
      setError("Input too large. Max 20,000 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, input: input.trim(), language }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      router.push(`/results/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl w-full">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">New Review</h1>
        <p className="text-text-muted text-sm md:text-base">
          Submit a URL or code snippet for instant AI feedback.
        </p>
      </div>

      {/* Type selector */}
      <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
        {(["url", "code"] as ReviewType[]).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setInput(""); }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              type === t
                ? "bg-accent text-bg border-accent font-semibold"
                : "border-border text-text-muted hover:border-muted hover:text-text-primary"
            }`}
          >
            {t === "url" ? "🌐 URL Review" : "📝 Code Review"}
          </button>
        ))}
      </div>

      <div className="border border-border bg-surface rounded-2xl p-4 md:p-6 space-y-4 md:space-y-5">
        {type === "url" ? (
          <div>
            <label className="text-xs font-mono text-text-muted block mb-2">WEBSITE URL</label>
            <input
              type="url"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors font-mono text-sm"
            />
            <p className="text-text-muted text-xs mt-2">
              We'll fetch the real HTML and analyze it for UX, SEO, performance and accessibility.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="text-xs font-mono text-text-muted block mb-2">LANGUAGE</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full sm:w-auto bg-bg border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent/50 transition-colors text-sm"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-text-muted block mb-2">CODE</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`// Paste your ${language} code here...`}
                rows={12}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors font-mono text-sm resize-none"
              />
              <p className="text-text-muted text-xs mt-1">
                {input.length.toLocaleString()} / 20,000 characters
              </p>
            </div>
          </>
        )}

        {error && (
          <div className="bg-severity-critical/10 border border-severity-critical/20 rounded-xl px-4 py-3 text-severity-critical text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="w-full bg-accent text-bg font-display font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            "Analyze →"
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 md:gap-6 text-xs text-text-muted">
        <span>⚡ Results in ~5 seconds</span>
        <span>🔒 Inputs not stored beyond review</span>
        <span>🎯 6–12 actionable items</span>
      </div>
    </div>
  );
}