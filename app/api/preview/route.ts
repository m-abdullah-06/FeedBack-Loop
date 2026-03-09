import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const PREVIEW_PROMPT = `You are FeedbackLoop, an expert web reviewer.
Analyze the provided HTML and return ONLY 3 of the most critical issues found.

Respond ONLY with raw JSON — no markdown, no backticks, no preamble:
{
  "score": <0-100>,
  "totalIssues": <estimated total number of issues if fully analyzed, between 6-14>,
  "feedbackItems": [
    {
      "title": "<short title>",
      "category": "<UX|Performance|Security|Accessibility|SEO>",
      "severity": "<critical|high|medium>"
    }
  ]
}

Return exactly 3 items. Be honest about what you see.`;

function truncateHTML(html: string): string {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (cleaned.length <= 4000) return cleaned;

  const headMatch = cleaned.match(/<head[\s\S]*?<\/head>/i)?.[0]?.slice(0, 1500) ?? "";
  const bodyStart = cleaned.substring(cleaned.indexOf("<body"), cleaned.indexOf("<body") + 2500);
  return `${headMatch}\n${bodyStart}`;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic URL validation
    if (!/^https?:\/\/.+/.test(url)) {
      return NextResponse.json({ error: "Please enter a valid URL starting with http:// or https://" }, { status: 400 });
    }

    // SSRF protection
    if (/localhost|127\.0\.0\.1|192\.168|10\.\d|0\.0\.0\.0/.test(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Fetch HTML
    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        return NextResponse.json({ error: "Could not reach that website. Check the URL and try again." }, { status: 400 });
      }

      html = truncateHTML(await response.text());
    } catch {
      return NextResponse.json({ error: "Could not reach that website. Check the URL and try again." }, { status: 400 });
    }

    // Call Groq
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: PREVIEW_PROMPT },
          { role: "user", content: `Preview this website (${url}):\n\n${html}` },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!groqResponse.ok) {
      return NextResponse.json({ error: "AI analysis failed. Please try again." }, { status: 500 });
    }

    const data = await groqResponse.json();
    const rawText = data.choices?.[0]?.message?.content?.trim() ?? "";

    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      score: Math.min(100, Math.max(0, parsed.score)),
      totalIssues: parsed.totalIssues || 8,
      feedbackItems: parsed.feedbackItems?.slice(0, 3) || [],
    });
  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}