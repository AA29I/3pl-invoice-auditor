import React from "react";
import { Metadata } from "next";
import { getFaqStructuredData } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | 3PL Invoice Auditor",
  description:
    "Common questions about 3PL warehouse invoice auditing, rate cards, CSV formats, data privacy, and discrepancy recovery.",
  alternates: {
    canonical: "/faq",
  },
};

const FAQS = [
  {
    question: "Why do you call flagged charges 'potential discrepancies' instead of 'recovered savings'?",
    answer:
      "Because true financial recovery requires presenting the dispute to your 3PL representative and obtaining a signed credit memo or revised billing statement. We provide the mathematical proof and contract citations, but we do not make inflated promises about guaranteed refunds until your warehouse approves the adjustment.",
  },
  {
    question: "Do you verify whether warehouse workers actually packed the box or shipped the order?",
    answer:
      "No. Unless physical operational logs or WMS telemetry are provided, an invoice auditor cannot independently prove physical labor occurred. We audit whether the fees, rates, calculations, and line item references on the invoice match your signed contracted agreements.",
  },
  {
    question: "How do you handle different CSV formats from various 3PL warehouses?",
    answer:
      "Our interactive column mapper allows you to map whatever column headers your 3PL exports (e.g. 'Order ID', 'Unit Price', 'Charge Total', 'Fee Code') to our standardized audit fields. Once mapped, you can audit the invoice in seconds.",
  },
  {
    question: "Why do you use integer minor units (cents) instead of standard floating-point numbers?",
    answer:
      "Standard floating-point numbers in computer memory are subject to IEEE 754 precision errors (e.g., 0.1 + 0.2 = 0.30000000000000004). In enterprise financial auditing, any fraction-of-a-cent drift creates unacceptable reporting errors. We represent all money in exact integer cents to guarantee mathematical accuracy.",
  },
  {
    question: "Is my warehouse billing data kept private and isolated?",
    answer:
      "Yes. Every workspace is completely isolated at the database level. Data from your 3PL cannot be viewed by any other account, and you have complete control to permanently delete all uploaded invoices and rate cards at any time.",
  },
  {
    question: "What billing providers do you support for subscriptions?",
    answer:
      "We use Lemon Squeezy as our Merchant of Record to handle global subscription payments, sales taxes, and customer billing portals securely.",
  },
];

export default function FaqPage() {
  const structuredData = getFaqStructuredData(FAQS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="py-16 md:py-24 bg-[#FBFAF6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-mono font-bold text-[#B8892D] uppercase tracking-wider">
              Answers &amp; Clarity
            </span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-serif font-bold text-[#090908] tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#777268] max-w-xl mx-auto leading-relaxed">
              Everything you need to know about our deterministic auditing methodology and boundaries.
            </p>
          </div>

          <div className="mt-14 space-y-5">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded border border-[#DCD5C8] bg-[#FBFAF6] hover:border-[#B8892D]/40 transition shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              >
                <h2 className="text-base font-serif font-bold text-[#090908]">
                  {faq.question}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#777268] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
