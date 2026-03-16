import { AnalysisResult, AnalyzeRequest, FeedbackItem } from "@/types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ─── Shared accuracy rules ───────────────────────────────────────────────────

const ACCURACY_RULES = `
CRITICAL ACCURACY RULES — you MUST follow all of these strictly.
Only flag an issue if you can 100% confirm it from the HTML provided.
If you are not sure, skip it entirely. It is better to report fewer issues than to hallucinate.

HTTPS & PROTOCOL:
- Do NOT flag HTTPS as missing if the URL starts with https://
- Do NOT flag video or media links as HTTP unless you see explicit http:// in a src attribute
- The note before the HTML will tell you if the site is on HTTPS — trust that note

API KEYS & SECURITY:
- Do NOT flag Firebase apiKey, Algolia searchOnlyApiKey, Mapbox accessToken, Google Analytics IDs, 
  Google OAuth clientId, Amplitude projectId, or any similar frontend config values as security issues
  — these are intentionally public and safe to expose in frontend HTML
- Do NOT flag CSRF tokens as security issues — they are intentionally placed in HTML by frameworks
- Only flag API keys if you see an obvious private secret like a stripe secret key (sk_live_) or AWS secret

META TAGS & SEO:
- Do NOT flag missing meta description if you can see a <meta name="description"> tag anywhere in the HTML
- Do NOT flag missing title if you can see a <title> tag anywhere in the HTML
- Do NOT flag missing canonical if you can see a <link rel="canonical"> tag
- Do NOT flag missing Open Graph tags if you can see og: meta tags
- Always check the FULL head section before flagging any missing meta tags

CSS & PERFORMANCE:
- Do NOT flag multiple CSS files on Next.js, React, Vite, Ember, Angular, or any modern framework
- Do NOT flag /_next/ static files as issues — Next.js optimizes these automatically
- Do NOT flag unused CSS — you cannot see inside CSS files from HTML
- Do NOT flag image optimization — you cannot see image file sizes from HTML
- Do NOT flag HTTP request count — you cannot measure network requests from HTML
- Do NOT flag color contrast — you cannot see rendered colors from HTML source
- Do NOT flag inline CSS from third party tools like OneTrust, cookie banners, or consent SDKs

VIDEOS & MEDIA:
- Do NOT flag missing captions unless you confirm there is no <track> element inside the <video> tag
- Do NOT flag video links as HTTP unless you see explicit http:// in the src attribute

FRAMEWORK & PLATFORM:
- Do NOT flag WordPress itself as a security issue
- Do NOT flag /wp-admin as a security issue unless there is clear evidence of vulnerability
- Do NOT flag WordPress plugins unless you can confirm they are outdated from the HTML
- Do NOT flag RSS feeds or WordPress meta tags — they are normal and expected
- Do NOT flag WordPress comment forms as security issues
- Do NOT flag Ember.js, React, Vue, Angular, or any modern framework as a performance or security issue
- Do NOT flag cookie consent banners (OneTrust, Cookiebot, etc.) as issues — they are legal requirements
- Do NOT flag third party analytics scripts (Google Analytics, Amplitude, etc.) as security issues

GENERAL:
- Do NOT flag CTA button design — you cannot see visual styling from HTML
- Do NOT flag issues you cannot directly confirm from the HTML
- Do NOT invent or assume issues not visible in the HTML
- Do NOT flag favicon as missing unless you confirm there is no favicon link in the head
- Do NOT flag header tags as missing if you can see any H1, H2, or H3 in the HTML
- Modern frameworks handle many optimizations automatically — never flag these as issues
- Do NOT flag duplicate stylesheets unless you can see the exact same href appearing more than once
- Do NOT reference URLs or elements that are not actually present in the HTML provided
`;

// ─── Prompts ─────────────────────────────────────────────────────────────────

const FREE_SYSTEM_PROMPT = `You are FeedbackLoop, an expert web reviewer with a sense of humor.
Analyze the provided HTML source code and return structured feedback.
Only report issues you can directly confirm from the HTML. Quality over quantity.

Respond ONLY with raw JSON — no markdown, no backticks, no preamble:
{
  "summary": "3 sentences. Sentence 1: what the site is and what it genuinely does well based on what you see. Sentence 2: the main real confirmed problems found. Sentence 3: mention this was analyzed using the Free plan (basic HTML analysis). End the summary with one short punchy witty roast line based on the actual issues found — make it funny and specific to this site, not generic.",
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

${ACCURACY_RULES}

Aim for 5-10 confirmed issues only. Do not pad results with guesses.`;

const DEVELOPER_SYSTEM_PROMPT = `You are FeedbackLoop, an expert web reviewer for developers with a sense of humor.
Analyze the fully-rendered HTML and return structured technical feedback.
Only report issues you can directly confirm from the HTML. Quality over quantity.

Respond ONLY with raw JSON — no markdown, no backticks, no preamble:
{
  "summary": "3 sentences. Sentence 1: what the site is and what it genuinely does well technically. Sentence 2: the main real confirmed technical problems found. Sentence 3: mention this was analyzed using the Developer plan with full JavaScript rendering via Browserless. End the summary with one short punchy witty roast line based on the actual issues found — make it funny and specific to this site, not generic.",
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

${ACCURACY_RULES}

This is fully rendered HTML — React, Next.js, Vue apps are properly visible.
Aim for 5-10 confirmed issues only. Do not pad results with guesses.`;

const PRO_SYSTEM_PROMPT = `You are FeedbackLoop, an expert web reviewer specializing in WordPress and non-technical users, with a friendly sense of humor.
Analyze the fully-rendered HTML and return plain English feedback with step by step fixes.
Only report issues you can directly confirm from the HTML. Quality over quantity.

Respond ONLY with raw JSON — no markdown, no backticks, no preamble:
{
  "summary": "3 sentences in plain English, no jargon. Sentence 1: what the site is and what it does well in simple terms. Sentence 2: the main real confirmed problems in plain English. Sentence 3: mention this was analyzed using the Pro plan with full JavaScript rendering and WordPress-specific fix guides. End with one short friendly funny roast based on the actual issues — keep it light, not mean.",
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
      "description": "<explain in simple terms a non-developer understands>",
      "severity": "<critical|high|medium|low|info>",
      "suggestion": "<step by step fix in plain English>",
      "wordpressFix": "<ONLY if WordPress site: exact Dashboard steps. OMIT entirely if not WordPress>",
      "plugin": "<ONLY if WordPress site: best free plugin to fix this. OMIT entirely if not WordPress>",
      "element": "<optional: HTML element>"
    }
  ]
}

WORDPRESS RULES:
- Only include wordpressFix and plugin fields if you see wp-content or wp-includes in the HTML
- Completely omit those fields for React, Next.js, Vue, Ember, or any non-WordPress site

${ACCURACY_RULES}

Aim for 5-10 confirmed issues only. Do not pad results with guesses.`;

const CODE_SYSTEM_PROMPT = `You are FeedbackLoop, an expert code reviewer with a sense of humor.
Analyze the provided code and return structured feedback.
Only report issues you can directly confirm from the code.

Respond ONLY with raw JSON — no markdown, no backticks, no preamble:
{
  "summary": "3 sentences. Sentence 1: what the code does and what it does well. Sentence 2: the main confirmed problems found. Sentence 3: mention this was a code review by FeedbackLoop. End with one short witty roast based on the actual issues found.",
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

Be specific, technical, and actionable. Aim for 5-10 confirmed issues only.`;

// ─── HTML Cleaner ─────────────────────────────────────────────────────────────

function truncateHTML(html: string, isHttps: boolean): string {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<div[^>]*onetrust[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/data:[a-z]+\/[a-z]+;base64,[A-Za-z0-9+/=]{100,}/gi, "data:REMOVED")
    .replace(/(<meta[^>]*content=")[^"]{500,}("[^>]*>)/gi, "$1[CONFIG_BLOB_REMOVED]$2")
    .replace(/<meta[^>]*name="[^"]*config[^"]*"[^>]*>/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const headMatch = cleaned.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? "";

  const importantHeadTags = [
    headMatch.match(/<title[^>]*>[\s\S]*?<\/title>/i)?.[0] ?? "",
    headMatch.match(/<meta name="description"[^>]*>/i)?.[0] ?? "",
    headMatch.match(/<meta name="viewport"[^>]*>/i)?.[0] ?? "",
    headMatch.match(/<link rel="canonical"[^>]*>/i)?.[0] ?? "",
    headMatch.match(/<meta property="og:title"[^>]*>/i)?.[0] ?? "",
    headMatch.match(/<meta property="og:description"[^>]*>/i)?.[0] ?? "",
    headMatch.match(/<link rel="icon"[^>]*>/gi)?.join("") ?? "",
    headMatch.match(/<link rel="stylesheet"[^>]*>/gi)?.slice(0, 5).join("") ?? "",
    headMatch.slice(0, 1000),
  ].filter(Boolean).join("\n");

  const bodyStart = cleaned.indexOf("<body");
  const bodyContent = bodyStart !== -1
    ? cleaned.substring(bodyStart, bodyStart + 4000)
    : cleaned.slice(0, 4000);

  const httpsNote = isHttps
    ? "<!-- NOTE: This site IS on HTTPS. Do NOT flag HTTPS as missing. -->"
    : "<!-- NOTE: This site is NOT on HTTPS. This is a real issue. -->";

  return `${httpsNote}\n\n<!-- HEAD TAGS -->\n${importantHeadTags}\n\n<!-- BODY CONTENT -->\n${bodyContent}`;
}

// ─── Framework detector ───────────────────────────────────────────────────────

function detectFramework(html: string): string {
  if (
    html.includes("wp-content") ||
    html.includes("wp-includes") ||
    html.includes("wp-json") ||
    html.includes("wpengine") ||
    html.includes("wordpress") ||
    html.includes("wp-embed") ||
    html.includes("/wp/") ||
    html.includes("xmlrpc.php")
  ) return "WordPress";
  if (html.includes("__next") || html.includes("_next/")) return "Next.js";
  if (html.includes("ember") || html.includes("ember-cli")) return "Ember.js";
  if (html.includes("ng-version") || html.includes("angular")) return "Angular";
  if (html.includes("data-reactroot") || html.includes("react")) return "React";
  if (html.includes("data-v-") || html.includes("__vue")) return "Vue.js";
  return "Unknown";
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

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

  return response.text();
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

  return response.text();
}

// ─── Groq API call ────────────────────────────────────────────────────────────

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
      temperature: 0.2,
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

// ─── Main export ──────────────────────────────────────────────────────────────

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
    const isHttps = request.input.startsWith("https://");

    let rawHtml: string;
    if (plan === "developer" || plan === "pro") {
      console.log(`[${plan}] Fetching with Browserless:`, request.input);
      rawHtml = await fetchWithBrowserless(request.input);
    } else {
      console.log(`[free] Fetching basic HTML:`, request.input);
      rawHtml = await fetchBasicHTML(request.input);
    }

    const framework = detectFramework(rawHtml);
    const cleanedHtml = truncateHTML(rawHtml, isHttps);

    console.log("Cleaned HTML length:", cleanedHtml.length);
    console.log("Detected framework:", framework);

    systemPrompt = plan === "pro"
      ? PRO_SYSTEM_PROMPT
      : plan === "developer"
      ? DEVELOPER_SYSTEM_PROMPT
      : FREE_SYSTEM_PROMPT;

    const planDescriptions = {
      free: "Free plan (basic HTML analysis only)",
      developer: "Developer plan (full JS rendering via Browserless)",
      pro: "Pro plan (full JS rendering + WordPress fix guides)",
    };

    userMessage = `Review this website.

URL: ${request.input}
HTTPS: ${isHttps ? "YES — do NOT flag HTTPS as missing" : "NO — this is a real issue"}
Framework detected: ${framework}
Analysis plan: ${planDescriptions[plan]}
${framework !== "Unknown" ? `NOTE: This is a ${framework} site. Do NOT flag ${framework}-specific files or patterns as issues.` : ""}

HTML source:
\`\`\`html
${cleanedHtml}
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