import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FeedbackLoop — AI Code & UX Reviewer",
  description:
    "Get instant AI-powered feedback on your website URLs and code. Identify UX issues, performance bottlenecks, security vulnerabilities, and more.",
  keywords: ["code review", "UX review", "AI feedback", "developer tools"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
