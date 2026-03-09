import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg px-4 md:px-6 py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="font-display font-bold text-xl tracking-tight block mb-10">
          feedback<span className="text-accent">loop</span>
        </Link>

        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Privacy Policy</h1>
        <p className="text-text-muted text-sm font-mono mb-10">Last updated: March 2025</p>

        <div className="prose prose-invert max-w-none space-y-8 text-text-muted leading-relaxed">

          <section>
            <h2 className="font-display font-semibold text-xl text-text-primary mb-3">1. Who we are</h2>
            <p>FeedbackLoop ("we", "us", "our") is an AI-powered web and code review tool. We are operated as an independent product. If you have any questions about this policy, contact us at <span className="text-accent"><a href="mailto:abdullah.muhammad.xyz@gmail.com">support</a></span>.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl text-text-primary mb-3">2. What data we collect</h2>
            <p>We collect only what is necessary to provide the service:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong className="text-text-primary">Account data</strong> — your email address when you sign up.</li>
              <li><strong className="text-text-primary">Review data</strong> — URLs and code snippets you submit for analysis, and the AI-generated results.</li>
              <li><strong className="text-text-primary">Usage data</strong> — number of reviews used, your plan type, and timestamps.</li>
              <li><strong className="text-text-primary">Payment data</strong> — handled entirely by Lemon Squeezy. We never see or store your card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl text-text-primary mb-3">3. How we use your data</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and improve the FeedbackLoop service</li>
              <li>To enforce usage limits based on your plan</li>
              <li>To send essential account emails (signup confirmation, password reset)</li>
              <li>We do <strong className="text-text-primary">not</strong> sell your data to third parties</li>
              <li>We do <strong className="text-text-primary">not</strong> use your submitted URLs or code to train AI models</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl text-text-primary mb-3">4. Third-party services</h2>
            <p>We use the following third-party services to operate FeedbackLoop:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong className="text-text-primary">Supabase</strong> — database and authentication (supabase.com)</li>
              <li><strong className="text-text-primary">Groq</strong> — AI analysis engine (groq.com)</li>
              <li><strong className="text-text-primary">Browserless</strong> — website rendering for Developer and Pro plans (browserless.io)</li>
              <li><strong className="text-text-primary">Lemon Squeezy</strong> — payment processing (lemonsqueezy.com)</li>
              <li><strong className="text-text-primary">Vercel</strong> — hosting (vercel.com)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl text-text-primary mb-3">5. Data retention</h2>
            <p>Your reviews are stored until you delete them or close your account. You can delete individual reviews from your dashboard at any time. To delete your account and all associated data, contact us at support@feedbackloop.app.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl text-text-primary mb-3">6. Cookies</h2>
            <p>We use only essential cookies required for authentication (managed by Supabase). We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl text-text-primary mb-3">7. Your rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. Contact us at support@feedbackloop.app and we will respond within 7 days.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl text-text-primary mb-3">8. Changes to this policy</h2>
            <p>We may update this policy from time to time. We will notify you of significant changes via email or a notice on the app. Continued use of FeedbackLoop after changes means you accept the updated policy.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-sm text-text-muted">
          <Link href="/" className="hover:text-text-primary transition-colors">← Home</Link>
          <Link href="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
          <Link href="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
        </div>
      </div>
    </div>
  );
}