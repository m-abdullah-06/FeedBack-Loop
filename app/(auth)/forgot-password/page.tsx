"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <Link href="/" className="font-display font-bold text-2xl tracking-tight block text-center mb-8">
          feedback<span className="text-accent">loop</span>
        </Link>

        {sent ? (
          /* Success state */
          <div className="border border-border bg-surface rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">📬</div>
            <h1 className="font-display font-bold text-xl mb-2">Check your email</h1>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              We sent a password reset link to <span className="text-text-primary font-medium">{email}</span>. Check your inbox and click the link to reset your password.
            </p>
            <Link
              href="/login"
              className="text-accent text-sm hover:opacity-80 transition-opacity"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          /* Form state */
          <div className="border border-border bg-surface rounded-2xl p-8">
            <h1 className="font-display font-bold text-2xl mb-1">Forgot password?</h1>
            <p className="text-text-muted text-sm mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="border border-severity-critical/20 bg-severity-critical/5 text-severity-critical text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-text-muted block mb-1.5">EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="you@example.com"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !email.trim()}
                className="w-full bg-accent text-bg font-display font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                    Sending...
                  </>
                ) : "Send reset link →"}
              </button>
            </div>

            <p className="text-center text-text-muted text-sm mt-6">
              Remember your password?{" "}
              <Link href="/login" className="text-accent hover:opacity-80 transition-opacity">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}