# FeedbackLoop 🔍

> AI-powered code & UX reviewer. Get instant structured feedback on websites and code.

Built with **Next.js 15** · **Gemini 1.5 Flash (free)** · **Supabase** · **Stripe** · **TypeScript** · **Tailwind CSS**

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in all values (see below).

### 3. Set up Supabase
- Create a project at [supabase.com](https://supabase.com)
- Go to **SQL Editor** and run `supabase/schema.sql`
- Copy your project URL and anon key into `.env.local`

### 4. Get your FREE Gemini API key
- Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- Create an API key (100% free, no credit card)
- Add it as `GEMINI_API_KEY` in `.env.local`

### 5. Set up Stripe (optional for billing)
- Create account at [stripe.com](https://stripe.com)
- Get your keys from the Stripe dashboard
- Create a product + price, copy the Price ID

### 6. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
feedbackloop/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← sidebar layout
│   │   ├── dashboard/page.tsx  ← review history + stats
│   │   ├── review/page.tsx     ← submit new review
│   │   └── results/[id]/page.tsx ← view results
│   ├── api/
│   │   ├── analyze/route.ts    ← main AI endpoint
│   │   ├── auth/signout/route.ts
│   │   └── stripe/webhook/route.ts
│   ├── pricing/page.tsx
│   ├── layout.tsx
│   ├── page.tsx                ← landing page
│   └── globals.css
├── lib/
│   ├── gemini.ts               ← Gemini AI integration
│   ├── supabase.ts             ← client-side Supabase
│   ├── supabase-server.ts      ← server-side Supabase
│   ├── stripe.ts               ← Stripe + plan definitions
│   └── utils.ts
├── types/index.ts
├── supabase/schema.sql         ← run this in Supabase SQL editor
└── .env.example
```

---

## 🔑 Environment Variables

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) — **FREE** |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings (secret) |
| `STRIPE_SECRET_KEY` | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook settings |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe product price ID |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally |

---

## 💳 Plans

| Plan | Reviews/month | Price |
|---|---|---|
| Free | 5 | $0 |
| Pro | 100 | $19/month |

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **AI**: Google Gemini 1.5 Flash — free tier, no credit card
- **Database & Auth**: Supabase (Postgres + RLS)
- **Payments**: Stripe
- **Styling**: Tailwind CSS + custom design system
- **Fonts**: Syne (display) + DM Sans (body) + JetBrains Mono (code)
