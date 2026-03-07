import { AnalysisResult, AnalyzeRequest, FeedbackItem } from "@/types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are FeedbackLoop, an expert code and UX reviewer.
Your job is to analyze real website HTML/CSS or code snippets and provide structured, actionable feedback.

Always respond with a valid JSON object in exactly this format — no markdown, no backticks, raw JSON only:
{
  "summary": "A 2-3 sentence overview of the main findings",
  "score": <number 0-100, overall quality score>,
  "feedbackItems": [
    {
      "id": "<short unique id like f1, f2, f3>",
      "category": "<UX|Performance|Security|Accessibility|Code Quality|Best Practices|SEO>",
      "title": "<short title>",
      "description": "<detailed description of the issue>",
      "severity": "<critical|high|medium|low|info>",
      "suggestion": "<specific, actionable fix>",
      "element": "<optional: the HTML element or selector>",
      "line": <optional: line number for code reviews, or omit this field entirely>
    }
  ]
}

IMPORTANT: Base your feedback ONLY on what you actually see in the provided HTML/code.
Do NOT assume or invent issues that are not visible in the code.
If something is implemented correctly, do not flag it as an issue.
Be specific, technical, and actionable. Aim for 6-12 feedback items. Score fairly based on actual code.
Return ONLY raw JSON — no markdown fences, no preamble, no explanation.`;

async function fetchWebsiteHTML(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();

    // Keep head + start of body to stay within token limits
    if (html.length > 15000) {
      const headMatch = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? "";
      const bodyStart = html.substring(
        html.indexOf("<body"),
        html.indexOf("<body") + 8000
      );
      return `${headMatch}\n\n<!-- Body (truncated for analysis) -->\n${bodyStart}`;
    }

    return html;
  } catch (error) {
    throw new Error(
      `Could not fetch the website. Make sure the URL is correct and publicly accessible. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function analyzeWithGroq(
  request: AnalyzeRequest,
  existingId?: string
): Promise<AnalysisResult> {
  let userMessage: string;

  if (request.type === "url") {
    console.log("Fetching HTML for:", request.input);
    const html = await fetchWebsiteHTML(request.input);
    console.log("HTML fetched, length:", html.length);

    userMessage = `Review this website (URL: ${request.input}) based on its actual HTML source code below.
Analyze it for UX, responsiveness, performance hints, SEO, and accessibility.
Only flag real issues you can see in the code — do not assume problems that are not there.

HTML Source:
\`\`\`html
${html}
\`\`\``;
  } else {
    userMessage = `Review this ${request.language || "code"} code. Provide code quality, security, performance, and best practices feedback based on what you actually see:

\`\`\`${request.language || ""}
${request.input}
\`\`\``;
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content?.trim() ?? "";

  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: {
    summary: string;
    score: number;
    feedbackItems: FeedbackItem[];
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Raw Groq response:", rawText);
    throw new Error("Failed to parse AI response. Please try again.");
  }

  const analysis: AnalysisResult = {
    id: existingId || crypto.randomUUID(),
    type: request.type,
    input: request.input,
    language: request.language,
    summary: parsed.summary,
    score: Math.min(100, Math.max(0, parsed.score)),
    feedbackItems: parsed.feedbackItems || [],
    createdAt: new Date().toISOString(),
  };

  return analysis;
}