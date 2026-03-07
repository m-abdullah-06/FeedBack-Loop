import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, AnalyzeRequest, FeedbackItem } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are FeedbackLoop, an expert code and UX reviewer.
Your job is to analyze websites (by URL) or code snippets and provide structured, actionable feedback.

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
      "line": <optional: line number for code reviews, or omit>
    }
  ]
}

Be specific, technical, and actionable. Aim for 6-12 feedback items. Score harshly but fairly.
Return ONLY raw JSON — no markdown fences, no preamble, no explanation.`;

export async function analyzeWithGemini(
  request: AnalyzeRequest,
  existingId?: string
): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const userMessage =
    request.type === "url"
      ? `Review this website URL. Provide UX, performance, SEO, and accessibility feedback: ${request.input}`
      : `Review this ${request.language || "code"} code. Provide code quality, security, performance, and best practices feedback:\n\n\`\`\`${request.language || ""}\n${request.input}\n\`\`\``;

  const result = await model.generateContent(userMessage);
  const rawText = result.response.text().trim();

  // Strip markdown fences if Gemini adds them anyway
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
