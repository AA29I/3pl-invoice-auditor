import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Comprehensive 3PL Invoice Audit Guide for E-Commerce Brands",
  description:
    "Learn how to audit 3PL warehouse fulfillment invoices, cross-reference contracted rate cards, and spot duplicate billing and uncontracted surcharges.",
  alternates: {
    canonical: "/3pl-invoice-audit",
  },
};

export default function ThreePlInvoiceAuditGuide() {
  return (
    <article className="py-16 md:py-24 bg-[#FBFAF6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-[#B8892D] uppercase tracking-wider mb-2">
            <span>Fulfillment Financial Operations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#090908] tracking-tight leading-tight">
            How to Audit a 3PL Warehouse Invoice: Step-by-Step Methodology
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#777268] leading-relaxed">
            Warehouse fulfillment is often the second largest line item on an e-commerce brand&apos;s P&amp;L after product COGS. Yet many brands pay monthly invoices without verifying whether the charges match their contracted agreements.
          </p>
        </div>

        <div className="p-6 rounded bg-[#F3F0E8] border border-[#DCD5C8] space-y-3">
          <h2 className="text-base font-serif font-bold text-[#090908]">Why Manual 3PL Audits Fail</h2>
          <p className="text-xs sm:text-sm text-[#777268] leading-relaxed">
            A mid-sized brand shipping 5,000 orders a month receives an invoice containing 15,000+ line items: order pick fees, extra item picks, carton receiving, pallet storage by day, return inspections, and software licenses. Manually verifying every row in Excel is slow, error-prone, and mathematically impractical.
          </p>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-[#090908]">
            The 4-Pillar Audit Checklist
          </h2>

          <div className="space-y-6">
            <div className="border-l-2 border-[#B8892D] pl-4 space-y-1">
              <h3 className="text-base font-serif font-bold text-[#090908]">1. Effective-Dated Rate Card Alignment</h3>
              <p className="text-xs sm:text-sm text-[#777268] leading-relaxed">
                Warehouses frequently update rate cards for general rate increases (GRI) or peak season surcharges. Invoices must be audited against the specific rate schedule effective on the service date, not the date the invoice was printed.
              </p>
            </div>

            <div className="border-l-2 border-[#B8892D] pl-4 space-y-1">
              <h3 className="text-base font-serif font-bold text-[#090908]">2. Duplicate Line Item &amp; Order Reference Detection</h3>
              <p className="text-xs sm:text-sm text-[#777268] leading-relaxed">
                WMS glitching can produce duplicate billing events. For example, if Order #10492 had an address correction and was re-queued in the warehouse system, both automated runs may generate a Base Pick &amp; Pack charge.
              </p>
            </div>

            <div className="border-l-2 border-[#B8892D] pl-4 space-y-1">
              <h3 className="text-base font-serif font-bold text-[#090908]">3. Verification of Miscellaneous &amp; Custom Surcharges</h3>
              <p className="text-xs sm:text-sm text-[#777268] leading-relaxed">
                Watch for line items labeled &quot;Warehouse Maintenance&quot;, &quot;Peak Handling Surcharge&quot;, or &quot;Special Project Labor&quot; that were never negotiated or agreed to in writing.
              </p>
            </div>

            <div className="border-l-2 border-[#B8892D] pl-4 space-y-1">
              <h3 className="text-base font-serif font-bold text-[#090908]">4. Exact Decimal Arithmetic Validation</h3>
              <p className="text-xs sm:text-sm text-[#777268] leading-relaxed">
                Billing systems occasionally suffer rounding errors when multiplying quantities by fractional rates (e.g. 1,482 item picks at $0.65 each). Every calculation must be checked with exact integer precision.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-[#090908]">
            How to Submit a Professional Dispute Claim
          </h2>
          <p className="text-xs sm:text-sm text-[#777268] leading-relaxed">
            When communicating billing errors to your warehouse accounting team, maintain a constructive, evidence-based tone:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-[#777268]">
            <li>Cite the exact invoice number, line number, and order/shipment reference.</li>
            <li>Quote the specific clause or rate table from your signed agreement.</li>
            <li>Provide a dispute claim PDF summarizing total billed vs. contracted amounts.</li>
            <li>Request a formal credit memo applied against the subsequent billing cycle.</li>
          </ul>
        </section>

        <div className="p-8 sm:p-10 rounded bg-[#121210] border border-[#090908] text-[#FBFAF6] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider block mb-1">
              Deterministic Verification
            </span>
            <h3 className="text-xl font-serif font-bold text-[#FBFAF6]">Automate Your Next 3PL Invoice Audit</h3>
            <p className="mt-1 text-xs text-[#777268]">
              Upload your CSV statement and detect contract discrepancies automatically.
            </p>
          </div>
          <Link
            href="/register"
            className="px-6 py-2.5 rounded bg-[#B8892D] text-[#090908] font-bold text-xs uppercase tracking-wider shrink-0 hover:bg-[#E0BC68] transition shadow"
          >
            Start Free Audit
          </Link>
        </div>
      </div>
    </article>
  );
}
