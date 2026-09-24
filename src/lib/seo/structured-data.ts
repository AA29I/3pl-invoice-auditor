export function getSoftwareStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "3PL Invoice Auditor",
    operatingSystem: "Web Application",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "USD",
    },
    description:
      "Deterministic 3PL warehouse invoice auditing software for e-commerce brands to verify contracted fulfillment rates and identify discrepancies.",
    url: baseUrl,
  };
}

export function getFaqStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
