"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="font-display font-bold text-2xl mb-3">Check your email</h1>
          <p className="text-text-muted">
            We sent a confirmation link to <span className="text-text-primary">{email}</span>.
            Click it to activate your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center font-display font-bold text-2xl mb-10 tracking-tight">
          feedback<span className="text-accent">loop</span>
        </Link>

        <div className="border border-border bg-surface rounded-2xl p-8">
          <h1 className="font-display font-bold text-2xl mb-1">Create account</h1>
          <p className="text-text-muted text-sm mb-8">
            Start with 5 free reviews/month
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono text-text-muted block mb-2">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-text-muted block mb-2">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="bg-severity-critical/10 border border-severity-critical/20 rounded-xl px-4 py-3 text-severity-critical text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSignup}
              disabled={loading || !email || password.length < 8}
              className="w-full bg-accent text-bg font-display font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>

            <p className="text-text-muted text-xs text-center">
              By signing up you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>

        <p className="text-center text-text-muted text-sm mt-6">
          Have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
