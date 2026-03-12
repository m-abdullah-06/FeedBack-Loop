<div align="center">

<br />

```
  __           _ _                 _     _
 / _|___  ___ | | |__   __ _  ___| | __| | ___   ___  _ __
| |_/ _ \/ _ \| | '_ \ / _` |/ __| |/ /| |/ _ \ / _ \| '_ \
|  _  __/  __/| | |_) | (_| | (__|   < | | (_) | (_) | |_) |
|_|  \___|\___||_|_.__/ \__,_|\___|_|\_\|_|\___/ \___/| .__/
                                                        |_|
```

**AI-powered web & code reviewer. Find what's broken in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=flat-square)](https://groq.com)
[![Browserless](https://img.shields.io/badge/Browserless-JS%20Rendering-4A90D9?style=flat-square)](https://browserless.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[**Live Demo →**](https://feedbackloopai.vercel.app) · [**Report Bug**](https://github.com/m-abdullah-06/feedbackloop/issues) · [**Request Feature**](https://github.com/m-abdullah-06/feedbackloop/issues)

<br />

</div>

---

## 🔍 What is FeedbackLoop?

FeedbackLoop is a full-stack SaaS app that uses AI to analyze websites and code snippets for real issues — scored by severity, with exact fixes you can apply immediately.

Paste a URL or code snippet → get back a structured report with **SEO, Performance, Security, Accessibility, and UX scores** in seconds.

> **For WordPress site owners** — plain English fix guides and plugin recommendations included on the Pro plan. No technical knowledge needed.

> **For developers** — full JavaScript rendering via Browserless means React, Next.js, and Vue apps get properly analyzed, not just their static HTML shell.

---

## ✨ Features

| Feature | Free | Developer | Pro |
|---|:---:|:---:|:---:|
| URL & Code Review | ✅ | ✅ | ✅ |
| Severity Scoring (Critical → Info) | ✅ | ✅ | ✅ |
| SEO / Performance / Security / Accessibility / UX Scores | ✅ | ✅ | ✅ |
| Downloadable Score Card | ✅ | ✅ | ✅ |
| Review History | ✅ | ✅ | ✅ |
| Full JS Rendering (React / Next.js / Vue) | ❌ | ✅ | ✅ |
| SPA & Dynamic App Support | ❌ | ✅ | ✅ |
| WordPress Step-by-Step Fix Guides | ❌ | ❌ | ✅ |
| Plugin Recommendations | ❌ | ❌ | ✅ |
| Platform Auto-Detection | ❌ | ❌ | ✅ |
| Reviews per month | 5 | 30 | 100 |

---

## 🛠️ Tech Stack

```
Frontend      Next.js 14 (App Router) · React 18 · Tailwind CSS · TypeScript
Backend       Next.js API Routes · Supabase (Postgres + Auth + RLS)
AI            Groq API — Llama 3.3 70B (fast + free tier)
Rendering     Browserless.io — full headless Chrome for JS rendering
Payments      Lemon Squeezy (subscription billing)
Hosting       Vercel
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account
- A [Groq](https://console.groq.com) API key (free)
- A [Browserless](https://browserless.io) API key (free tier available)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/feedbackloop.git
cd feedbackloop
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
# Groq AI
GROQ_API_KEY=gsk_xxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Browserless (for Developer/Pro JS rendering)
BROWSERLESS_API_KEY=your_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Lemon Squeezy (payments)
LEMONSQUEEZY_API_KEY=your_key
LEMONSQUEEZY_WEBHOOK_SECRET=your_secret
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_DEVELOPER_VARIANT_ID=your_variant_id
LEMONSQUEEZY_PRO_VARIANT_ID=your_variant_id
```

### 3. Set up the database

Run the SQL in `supabase/schema.sql` in your Supabase SQL Editor.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
feedbackloop/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── review/page.tsx
│   │   └── results/[id]/page.tsx
│   ├── api/
│   │   ├── analyze/route.ts       ← main AI analysis endpoint
│   │   ├── preview/route.ts       ← public preview (no auth)
│   │   └── lemonsqueezy/
│   │       └── webhook/route.ts   ← payment webhook
│   ├── pricing/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── page.tsx                   ← landing page
│   └── layout.tsx
├── lib/
│   ├── groq.ts                    ← AI + HTML fetcher + prompts
│   ├── supabase.ts
│   ├── supabase-server.ts
│   └── utils.ts
├── types/index.ts
├── middleware.ts                   ← rate limiting
├── supabase/schema.sql
└── .env.example
```

---

## 🧠 How the AI Analysis Works

```
User submits URL
       │
       ▼
  Free plan?  ──yes──▶  Basic HTML fetch (fast)
       │
       no
       │
       ▼
Developer/Pro ──────▶  Browserless headless Chrome
                        (full JS render, waits 2s)
       │
       ▼
  Strip scripts/styles/SVGs to minimize tokens
       │
       ▼
  Send to Groq (Llama 3.3 70B)
  with plan-specific system prompt
       │
       ▼
  Free/Dev: standard feedback
  Pro: + WordPress fix guides + plugin recommendations
       │
       ▼
  Parse JSON response
  Save to Supabase
  Return to client
```

---

## 🔐 Security

- Row Level Security (RLS) on all Supabase tables
- Users can only access their own reviews
- SSRF protection on URL fetcher
- Input size limits (20k chars max)
- Rate limiting middleware (10 req/min per IP)
- Environment variables never exposed to client

---

## 🌍 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add all environment variables
4. Deploy

### After deploying

Update Supabase Auth settings:
- **Site URL** → `https://your-domain.vercel.app`
- **Redirect URLs** → `https://your-domain.vercel.app/**`

---

## 📊 Plans & Pricing

| Plan | Price | Reviews/month |
|---|---|---|
| Free | $0 | 5 |
| Developer | $9/mo | 30 |
| Pro | $19/mo | 100 |

> 🎉 **Early Bird** — First 100 users get Pro free for 3 months automatically on signup.

---

## 🤝 Contributing

Pull requests are welcome! For major changes please open an issue first.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---


<div align="center">

Built by **Muhammad Abdullah** · [feedbackloopai.vercel.app](https://feedbackloopai.vercel.app)

⭐ Star this repo if you found it useful!

</div>
