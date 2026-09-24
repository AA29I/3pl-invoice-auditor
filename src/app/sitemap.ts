import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = new Date();

  const publicRoutes = [
    { url: `${baseUrl}`, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/how-it-works`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/pricing`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/3pl-invoice-audit`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/fulfillment-invoice-checker`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/3pl-billing-errors`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/pick-and-pack-calculator`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/privacy`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/terms`, changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  return publicRoutes.map((route) => ({
    ...route,
    lastModified: now,
  }));
}
