"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center font-display font-bold text-2xl mb-10 tracking-tight">
          feedback<span className="text-accent">loop</span>
        </Link>

        <div className="border border-border bg-surface rounded-2xl p-8">
          <h1 className="font-display font-bold text-2xl mb-1">Welcome back</h1>
          <p className="text-text-muted text-sm mb-8">Sign in to your account</p>

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
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="bg-severity-critical/10 border border-severity-critical/20 rounded-xl px-4 py-3 text-severity-critical text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-accent text-bg font-display font-bold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </div>
        </div>

        <p className="text-center text-text-muted text-sm mt-6">
          No account?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up free
          </Link>
          <div className="">
  <Link href="/forgot-password" className="text-xs text-text-muted hover:text-accent transition-colors">
    Forgot password?
  </Link>
</div>

        </p>
      </div>
    </div>
  );
}
