import Link from "next/link";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: null,
    badge: null,
    reviews: 5,
    features: [
      { text: "5 reviews per month", included: true },
      { text: "HTML-based analysis", included: true },
      { text: "URL & code review", included: true },
      { text: "Severity scoring", included: true },
      { text: "7-day review history", included: true },
      { text: "Full JS rendering (React/Next.js)", included: false },
      { text: "WordPress fix guides", included: false },
      { text: "Plugin recommendations", included: false },
    ],
    cta: "Get started free",
    href: "/signup",
    highlight: false,
  },
  {
    id: "developer",
    name: "Developer",
    price: 9,
    interval: "month",
    badge: "NEW",
    reviews: 30,
    features: [
      { text: "30 reviews per month", included: true },
      { text: "Full JS rendering (React/Next.js/Vue)", included: true },
      { text: "URL & code review", included: true },
      { text: "Severity scoring", included: true },
      { text: "Unlimited review history", included: true },
      { text: "Analyzes SPAs & dynamic apps", included: true },
      { text: "WordPress fix guides", included: false },
      { text: "Plugin recommendations", included: false },
    ],
    cta: "Start Developer plan →",
    href: "/signup?plan=developer",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    interval: "month",
    badge: "MOST POPULAR",
    reviews: 100,
    features: [
      { text: "100 reviews per month", included: true },
      { text: "Full JS rendering (React/Next.js/Vue)", included: true },
      { text: "URL & code review", included: true },
      { text: "Severity scoring", included: true },
      { text: "Unlimited review history", included: true },
      { text: "Analyzes SPAs & dynamic apps", included: true },
      { text: "WordPress step-by-step fix guides", included: true },
      { text: "Plugin recommendations", included: true },
    ],
    cta: "Start Pro plan →",
    href: "/signup?plan=pro",
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg px-4 md:px-6 py-16 md:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <Link href="/" className="font-display font-bold text-2xl tracking-tight block mb-10">
            feedback<span className="text-accent">loop</span>
          </Link>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Simple pricing.
          </h1>
          <p className="text-text-muted text-base md:text-lg">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-2xl p-6 md:p-8 flex flex-col ${
                plan.highlight
                  ? "border-accent bg-accent/5"
                  : "border-border bg-surface"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-mono font-bold px-4 py-1 rounded-full ${
                  plan.highlight
                    ? "bg-accent text-bg"
                    : "bg-surface border border-border text-accent"
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Plan name + price */}
              <div className="mb-6">
                <h2 className="font-display font-bold text-xl mb-1">{plan.name}</h2>
                <div className="flex items-end gap-1">
                  <span className="font-display font-bold text-5xl">${plan.price}</span>
                  {plan.interval && (
                    <span className="text-text-muted text-sm mb-2">/{plan.interval}</span>
                  )}
                </div>
                <p className="text-text-muted text-xs font-mono mt-1">
                  {plan.reviews} reviews / month
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className={`mt-0.5 shrink-0 text-base ${f.included ? "text-accent" : "text-muted"}`}>
                      {f.included ? "✓" : "✕"}
                    </span>
                    <span className={f.included ? "text-text-primary" : "text-text-muted"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`block text-center font-display font-semibold py-3 rounded-xl transition-all text-sm ${
                  plan.highlight
                    ? "bg-accent text-bg hover:opacity-90"
                    : "border border-border text-text-primary hover:border-muted"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison note */}
        <div className="mt-10 md:mt-14 border border-border bg-surface rounded-2xl p-6 md:p-8">
          <h3 className="font-display font-semibold text-lg mb-4 text-center">
            Which plan is right for me?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-muted">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">🧑‍💻</div>
              <p className="font-medium text-text-primary mb-1">Free</p>
              <p>Perfect if you're just testing the tool or reviewing simple static sites and WordPress blogs.</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">⚡</div>
              <p className="font-medium text-text-primary mb-1">Developer</p>
              <p>Best for developers building React, Next.js, or Vue apps who need full JavaScript rendering.</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">🏆</div>
              <p className="font-medium text-text-primary mb-1">Pro</p>
              <p>Best for freelancers and agencies managing WordPress client sites who need plain English fix guides.</p>
            </div>
          </div>
        </div>

        <p className="text-center text-text-muted text-sm mt-6 md:mt-8">
          Cancel anytime · No hidden fees · Billed securely
        </p>
      </div>
    </div>
  );
}