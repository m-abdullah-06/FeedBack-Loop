export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type ReviewType = "url" | "code";

export interface FeedbackItem {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: Severity;
  suggestion: string;
  line?: number; // for code reviews
  element?: string; // for URL reviews
}

export interface AnalysisResult {
  id: string;
  type: ReviewType;
  input: string;
  language?: string;
  summary: string;
  score: number;
  categoryScores?: Record<string, number | null> | null;
  feedbackItems: FeedbackItem[];
  createdAt: string;
  userId?: string;
}

export interface AnalyzeRequest {
  type: ReviewType;
  input: string;
  language?: string;
}

export interface User {
  id: string;
  email: string;
  plan: "free" | "pro";
  reviewsUsed: number;
  reviewsLimit: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  reviewsPerMonth: number;
  priceId: string;
}
