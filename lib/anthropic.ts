import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResult, AnalyzeRequest, FeedbackItem } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are FeedbackLoop, an expert code and UX reviewer. 
Your job is to analyze websites (by URL description) or code snippets and provide structured, actionable feedback.

Always respond with a valid JSON object in exactly this format:
{
  "summary": "A 2-3 sentence overview of the main findings",
  "score": <number 0-100, overall quality score>,
  "feedbackItems": [
    {
      "id": "<uuid-like string>",
      "category": "<UX|Performance|Security|Accessibility|Code Quality|Best Practices|SEO>",
      "title": "<short title>",
      "description": "<detailed description of the issue>",
      "severity": "<critical|high|medium|low|info>",
      "suggestion": "<specific, actionable fix>",
      "element": "<optional: the HTML element or selector>",
      "line": <optional: line number for code reviews>
    }
  ]
}

Be specific, technical, and actionable. Aim for 6-12 feedback items. Score harshly but fairly.
Return ONLY the JSON, no markdown, no preamble.`;

export async function analyzeWithClaude(
  request: AnalyzeRequest,
  existingId?: string
): Promise<AnalysisResult> {
  const userMessage =
    request.type === "url"
      ? `Please review this website URL and provide UX, performance, SEO, and accessibility feedback: ${request.input}`
      : `Please review this ${request.language || "code"} code and provide code quality, security, performance, and best practices feedback:\n\n\`\`\`${request.language || ""}\n${request.input}\n\`\`\``;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  let parsed: { summary: string; score: number; feedbackItems: FeedbackItem[] };
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Failed to parse AI response");
  }

  const result: AnalysisResult = {
    id: existingId || crypto.randomUUID(),
    type: request.type,
    input: request.input,
    language: request.language,
    summary: parsed.summary,
    score: parsed.score,
    feedbackItems: parsed.feedbackItems,
    createdAt: new Date().toISOString(),
  };

  return result;
}
