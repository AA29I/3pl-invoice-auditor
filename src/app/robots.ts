import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/how-it-works",
          "/pricing",
          "/faq",
          "/contact",
          "/privacy",
          "/terms",
          "/3pl-invoice-audit",
          "/fulfillment-invoice-checker",
          "/3pl-billing-errors",
          "/pick-and-pack-calculator",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/audits",
          "/audits/*",
          "/providers",
          "/providers/*",
          "/settings",
          "/settings/*",
          "/api/*",
          "/login",
          "/register",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
