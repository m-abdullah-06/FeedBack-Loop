"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // Supabase sends the user here with a session already set via the email link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User is ready to reset — do nothing, just show the form
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset() {
    if (!password || !confirm) return;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
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

        {done ? (
          /* Success state */
          <div className="border border-border bg-surface rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h1 className="font-display font-bold text-xl mb-2">Password updated!</h1>
            <p className="text-text-muted text-sm leading-relaxed">
              Your password has been reset. Redirecting you to the dashboard...
            </p>
          </div>
        ) : (
          /* Form state */
          <div className="border border-border bg-surface rounded-2xl p-8">
            <h1 className="font-display font-bold text-2xl mb-1">Reset password</h1>
            <p className="text-text-muted text-sm mb-6">
              Enter your new password below.
            </p>

            {error && (
              <div className="border border-severity-critical/20 bg-severity-critical/5 text-severity-critical text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-text-muted block mb-1.5">NEW PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-muted block mb-1.5">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                  placeholder="Repeat your password"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <button
                onClick={handleReset}
                disabled={loading || !password || !confirm}
                className="w-full bg-accent text-bg font-display font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                    Updating...
                  </>
                ) : "Update password →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}