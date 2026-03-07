# FeedbackLoop

**AI-powered code & UX reviewer. Get instant, structured feedback on your websites and code.**

FeedbackLoop analyzes your URL or code snippet and returns severity-rated issues across security, performance, accessibility, UX, and best practices — with specific, actionable fixes for each one.

---

## Features

- **URL Review** — fetches and analyzes real website HTML for UX, SEO, performance, and accessibility issues
- **Code Review** — deep analysis of code in any language including security vulnerabilities, bad patterns, and optimizations
- **Severity Scoring** — every issue rated Critical, High, Medium, Low, or Info so you know what to fix first
- **Overall Score** — 0–100 quality score per review
- **Review History** — all past reviews saved and accessible from your dashboard
- **Usage Limits** — free tier with 5 reviews/month, Pro tier with 100/month
- **Auth & Accounts** — full signup/login with email confirmation via Supabase

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| AI | Groq API — Llama 3.3 70B |
| Database & Auth | Supabase (Postgres + RLS) |
| Payments | Stripe (ready to activate) |
| Styling | Tailwind CSS |
| Fonts | Syne · DM Sans · JetBrains Mono |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/feedbackloop.git
cd feedbackloop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your keys — see the table below.

### 4. Set up the database

- Create a project at [supabase.com](https://supabase.com)
- Go to **SQL Editor** and run the contents of `supabase/schema.sql`
- That's it — tables, triggers, and RLS policies are all created automatically

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) — free |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `STRIPE_SECRET_KEY` | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe → Product catalog |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

> Stripe is optional for local development. The app works fully without it.

---

## Project Structure

```
feedbackloop/
├── app/
│   ├── (auth)/
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar layout
│   │   ├── dashboard/          # Review history + usage stats
│   │   ├── review/             # Submit new review
│   │   └── results/[id]/       # View review results
│   ├── api/
│   │   ├── analyze/            # Main AI analysis endpoint
│   │   ├── auth/signout/       # Sign out route
│   │   └── stripe/webhook/     # Stripe billing webhook
│   ├── pricing/                # Pricing page
│   ├── page.tsx                # Landing page
│   └── globals.css
├── lib/
│   ├── groq.ts                 # Groq AI integration + HTML fetcher
│   ├── supabase.ts             # Client-side Supabase
│   ├── supabase-server.ts      # Server-side Supabase
│   ├── stripe.ts               # Stripe + plan config
│   └── utils.ts                # Helpers
├── types/
│   └── index.ts                # Shared TypeScript types
├── supabase/
│   └── schema.sql              # Full DB schema — run this in Supabase
└── .env.example                # Environment variable template
```

---

## Plans

| Plan | Reviews / month | Price |
|---|---|---|
| Free | 5 | $0 |
| Pro | 100 | $19 / month |

---

## How It Works

1. User submits a URL or code snippet
2. If URL — the server fetches the real HTML source of the website
3. The HTML or code is sent to Groq's Llama 3.3 70B model with a structured prompt
4. The model returns JSON with a score, summary, and list of feedback items
5. Results are saved to Supabase and displayed with severity ratings and fix suggestions

---

## License

MIT
