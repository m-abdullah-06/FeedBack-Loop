import Link from "next/link";
import { PLANS } from "@/lib/stripe";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg px-6 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="font-display font-bold text-2xl tracking-tight block mb-12">
            feedback<span className="text-accent">loop</span>
          </Link>
          <h1 className="font-display font-bold text-5xl mb-4">Simple pricing.</h1>
          <p className="text-text-muted text-lg">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-2xl p-8 relative ${
                plan.id === "pro"
                  ? "border-accent bg-accent/5"
                  : "border-border bg-surface"
              }`}
            >
              {plan.id === "pro" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg text-xs font-mono font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <h2 className="font-display font-bold text-2xl mb-1">{plan.name}</h2>
              <div className="flex items-end gap-1 mb-6">
                <span className="font-display font-bold text-5xl">
                  ${plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-text-muted text-sm mb-2">/{plan.interval}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                    <span className="text-accent mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.id === "free" ? "/signup" : "/signup?plan=pro"}
                className={`block text-center font-display font-semibold py-3 rounded-xl transition-all text-sm ${
                  plan.id === "pro"
                    ? "bg-accent text-bg hover:opacity-90"
                    : "border border-border text-text-primary hover:border-muted"
                }`}
              >
                {plan.id === "free" ? "Get started free" : "Start Pro trial →"}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-text-muted text-sm mt-8">
          Cancel anytime. No hidden fees. Billed securely via Stripe.
        </p>
      </div>
    </div>
  );
}
