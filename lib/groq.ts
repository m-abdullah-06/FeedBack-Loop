import { AnalysisResult, AnalyzeRequest, FeedbackItem } from "@/types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ─── Shared accuracy rules injected into every prompt ───────────────────────

const ACCURACY_RULES = `
CRITICAL ACCURACY RULES — follow these strictly:

HTTPS & SECURITY:
- Do NOT flag HTTPS as missing if the URL provided starts with https://
- Do NOT flag video links as HTTP unless you can see actual http:// in the src attribute
- Do NOT flag WordPress itself as a security issue
- Do NOT flag wp-admin as a security issue unless there is clear evidence of vulnerability
- Do NOT flag WordPress plugins as issues unless you can confirm they are outdated from the HTML
- Do NOT flag WordPress theme files as issues unless you see actual problems in the HTML
- Do NOT flag RSS feeds or WordPress meta tags as issues — they are normal and expected
- Do NOT flag WordPress comment forms as security issues — they are standard functionality

CSS & PERFORMANCE:
- Do NOT flag multiple CSS files on Next.js, React, Vite or any modern framework
- Do NOT flag /_next/ static files as issues — Next.js optimizes these automatically
- Do NOT flag Next.js CSS files like /_next/static/css/*.css as having unused CSS — you cannot see inside these files
- Do NOT flag image optimization unless you can confirm oversized images from the HTML
- Do NOT assume images need compression — you cannot see file sizes from HTML

VIDEOS:
- Do NOT flag missing captions unless you confirm there is no <track> element inside the <video> tag
- Do NOT flag video HTTP links unless you see explicit http:// in the src attribute

HEADER TAGS:
- Do NOT flag missing header tags if you can see H1, H2, or H3 elements anywhere in the HTML

FAVICON:
- Do NOT flag missing favicon if you cannot confirm it is actually missing from the HTML head

GENERAL:
- Do NOT flag issues you cannot directly confirm from the HTML provided
- Do NOT invent or assume issues that are not visible in the HTML
- Only flag an issue if you are 100% confident it exists based on what you can see
- If unsure whether something is an issue, skip it entirely
- Modern frameworks handle many optimizations automatically — do not flag them
- Do NOT make assumptions about file contents you cannot read
`;

// ─── Prompts ────────────────────────────────────────────────────────────────

const FREE_SYSTEM_PROMPT = `You are FeedbackLoop, an expert web reviewer.
Analyze the provided HTML source code and return structured feedback.

Respond ONLY with raw JSON — no markdown, no backticks, no preamble:
{
  "summary": "2-3 sentence overview",
  "score": <0-100 overall score>,
  "categoryScores": {
    "seo": <0-100>,
    "performance": <0-100>,
    "security": <0-100>,
    "accessibility": <0-100>,
    "ux": <0-100>
  },
  "feedbackItems": [
    {
      "id": "f1",
      "category": "<UX|Performance|Security|Accessibility|Code Quality|Best Practices|SEO>",
      "title": "<short title>",
      "description": "<what is wrong and why it matters>",
      "severity": "<critical|high|medium|low|info>",
      "suggestion": "<specific actionable fix>",
      "element": "<optional: HTML element or selector>"
    }
  ]
}

Category scores must reflect the actual issues found in each category.
Base feedback ONLY on what you see in the HTML. Aim for 6-12 items.
${ACCURACY_RULES}`;

const DEVELOPER_SYSTEM_PROMPT = `You are FeedbackLoop, an expert web reviewer.
Analyze the provided fully-rendered HTML (including JavaScript-generated content) and return structured feedback.

Respond ONLY with raw JSON — no markdown, no backticks, no preamble:
{
  "summary": "2-3 sentence overview",
  "score": <0-100 overall score>,
  "categoryScores": {
    "seo": <0-100>,
    "performance": <0-100>,
    "security": <0-100>,
    "accessibility": <0-100>,
    "ux": <0-100>
  },
  "feedbackItems": [
    {
      "id": "f1",
      "category": "<UX|Performance|Security|Accessibility|Code Quality|Best Practices|SEO>",
      "title": "<short title>",
      "description": "<what is wrong and why it matters>",
      "severity": "<critical|high|medium|low|info>",
      "suggestion": "<specific actionable fix for a developer>",
      "element": "<optional: HTML element, CSS selector, or component name>"
    }
  ]
}

Category scores must reflect the actual issues found in each category.
This is fully rendered HTML so you can analyze React/Next.js/Vue apps properly.
Base feedback ONLY on what you see. Aim for 6-12 items.
${ACCURACY_RULES}`;

const PRO_SYSTEM_PROMPT = `You are FeedbackLoop, an expert web reviewer specializing in WordPress and non-technical users.
Analyze the provided fully-rendered HTML and return structured feedback with beginner-friendly fix instructions.

Respond ONLY with raw JSON — no markdown, no backticks, no preamble:
{
  "summary": "2-3 sentence overview in plain English, no jargon",
  "score": <0-100 overall score>,
  "categoryScores": {
    "seo": <0-100>,
    "performance": <0-100>,
    "security": <0-100>,
    "accessibility": <0-100>,
    "ux": <0-100>
  },
  "feedbackItems": [
    {
      "id": "f1",
      "category": "<UX|Performance|Security|Accessibility|SEO|WordPress>",
      "title": "<short plain English title>",
      "description": "<explain what is wrong in simple terms a non-developer understands>",
      "severity": "<critical|high|medium|low|info>",
      "suggestion": "<step by step fix in plain English>",
      "wordpressFix": "<ONLY add this field if the site is WordPress. Exact Dashboard steps to fix it. If NOT WordPress, do NOT include this field at all>",
      "plugin": "<ONLY add this field if the site is WordPress. Best free plugin to fix this. If NOT WordPress, do NOT include this field at all>",
      "element": "<optional: HTML element>"
    }
  ]
}

Category scores must reflect the actual issues found in each category.
CRITICAL RULES:
- wordpressFix and plugin fields MUST be completely omitted for React, Next.js, Vue, or any non-WordPress site
- Only include wordpressFix and plugin when you find wp-content or wp-includes in the HTML
- Write as if explaining to someone who has never touched code
- Base feedback ONLY on what you see in the HTML. Aim for 6-12 items.
${ACCURACY_RULES}`;

const CODE_SYSTEM_PROMPT = `You are FeedbackLoop, an expert code reviewer.
Analyze the provided code and return structured feedback.

Respond ONLY with raw JSON — no markdown, no backticks, no preamble:
{
  "summary": "2-3 sentence overview",
  "score": <0-100 overall score>,
  "categoryScores": {
    "seo": null,
    "performance": <0-100>,
    "security": <0-100>,
    "accessibility": null,
    "ux": null
  },
  "feedbackItems": [
    {
      "id": "f1",
      "category": "<Code Quality|Security|Performance|Best Practices|Accessibility>",
      "title": "<short title>",
      "description": "<what is wrong and why it matters>",
      "severity": "<critical|high|medium|low|info>",
      "suggestion": "<specific actionable fix>",
      "line": <optional line number as integer>
    }
  ]
}

Be specific, technical, and actionable. Aim for 6-12 items.
${ACCURACY_RULES}`;

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchWithBrowserless(url: string): Promise<string> {
  const response = await fetch(
    `https://production-sfo.browserless.io/content?token=${process.env.BROWSERLESS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        waitForTimeout: 2000,
        rejectResourceTypes: ["image", "media", "font"],
        bestAttempt: true,
      }),
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!response.ok) {
    throw new Error(`Browserless error: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return truncateHTML(html);
}

async function fetchBasicHTML(url: string): Promise<string> {
  if (/localhost|127\.0\.0\.1|192\.168|10\.\d|0\.0\.0\.0/.test(url)) {
    throw new Error("Invalid URL");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Could not fetch website: ${response.status}`);
  }

  const html = await response.text();
  return truncateHTML(html);
}

function truncateHTML(html: string): string {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (cleaned.length <= 6000) return cleaned;

  const headMatch = cleaned.match(/<head[\s\S]*?<\/head>/i)?.[0]?.slice(0, 2000) ?? "";
  const bodyStart = cleaned.substring(
    cleaned.indexOf("<body"),
    cleaned.indexOf("<body") + 4000
  );

  return `${headMatch}\n\n<!-- Body truncated for analysis -->\n${bodyStart}`;
}

// ─── Groq call ───────────────────────────────────────────────────────────────

async function callGroq(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function analyzeWithGroq(
  request: AnalyzeRequest,
  plan: "free" | "developer" | "pro" = "free",
  existingId?: string
): Promise<AnalysisResult> {
  let systemPrompt: string;
  let userMessage: string;

  if (request.type === "code") {
    systemPrompt = CODE_SYSTEM_PROMPT;
    userMessage = `Review this ${request.language || "code"}:\n\n\`\`\`${request.language || ""}\n${request.input}\n\`\`\``;
  } else {
    let html: string;

    if (plan === "developer" || plan === "pro") {
      console.log(`[${plan}] Fetching with Browserless (full JS render):`, request.input);
      html = await fetchWithBrowserless(request.input);
    } else {
      console.log(`[free] Fetching basic HTML:`, request.input);
      html = await fetchBasicHTML(request.input);
    }

    console.log("HTML length after trimming:", html.length);

    systemPrompt = plan === "pro"
      ? PRO_SYSTEM_PROMPT
      : plan === "developer"
      ? DEVELOPER_SYSTEM_PROMPT
      : FREE_SYSTEM_PROMPT;

    // Pass HTTPS context explicitly so AI never flags it as missing
    const isHttps = request.input.startsWith("https://");
    userMessage = `Review this website (URL: ${request.input}) based on its HTML source.
Note: This site is ${isHttps ? "already on HTTPS — do NOT flag HTTPS as missing or insecure" : "not on HTTPS — this is a real issue worth flagging"}.

\`\`\`html
${html}
\`\`\``;
  }

  const rawText = await callGroq(systemPrompt, userMessage);

  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: {
    summary: string;
    score: number;
    categoryScores: Record<string, number | null>;
    feedbackItems: FeedbackItem[];
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Raw Groq response:", rawText);
    throw new Error("Failed to parse AI response. Please try again.");
  }

  return {
    id: existingId || crypto.randomUUID(),
    type: request.type,
    input: request.input,
    language: request.language,
    summary: parsed.summary,
    score: Math.min(100, Math.max(0, parsed.score)),
    categoryScores: parsed.categoryScores || null,
    feedbackItems: parsed.feedbackItems || [],
    createdAt: new Date().toISOString(),
  };
}