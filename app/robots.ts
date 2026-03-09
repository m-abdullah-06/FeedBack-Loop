import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://feedbackloop.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/signup", "/login", "/privacy", "/terms"],
        disallow: ["/dashboard", "/review", "/results/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}