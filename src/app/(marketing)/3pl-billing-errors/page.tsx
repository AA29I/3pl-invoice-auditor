import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top 3PL Billing Errors: How E-Commerce Brands Get Overcharged",
  description:
    "Explore the most common 3PL warehouse billing errors: rate card drift, duplicate order picks, ghost surcharges, and storage calculation errors.",
  alternates: {
    canonical: "/3pl-billing-errors",
  },
};

export default function ThreePlBillingErrorsPage() {
  const errors = [
    {
      title: "1. Rate Card Drift & Missed Amendments",
      desc: "When you renegotiate lower pick fees after hitting an order milestone (e.g., drops from $3.10 to $2.85 after 5,000 orders), warehouse billing managers often forget to update their ERP. Months can pass while you are quietly billed at the old rates.",
    },
    {
      title: "2. Duplicate Order Reference Charges",
      desc: "Order cancellations, address re-routes, or batch reprocessing can cause the warehouse WMS to register two distinct fulfillment events for a single tracking number, billing your brand twice for the same physical package.",
    },
    {
      title: "3. Ghost Surcharges & Uncontracted Peak Fees",
      desc: "Line items like 'Warehouse Operational Maintenance Fee', 'Seasonal Facility Surcharge', or 'Cardboard Recovery Adjustment' frequently appear on monthly invoices without contractual backing.",
    },
    {
      title: "4. Misclassified Packaging Materials",
      desc: "If your contract specifies that custom branded mailers or boxes are provided by your brand, warehouses may still erroneously bill for their generic standard RSC cartons and dunnage.",
    },
    {
      title: "5. Pallet Storage Calculation Creep",
      desc: "Storage billed based on maximum peak pallets rather than average daily or weekly pallet counts, inflating monthly warehousing expenses by 15% to 30%.",
    },
  ];

  return (
    <article className="py-16 md:py-24 bg-[#FBFAF6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <span className="text-xs font-mono font-bold text-[#B8892D] uppercase tracking-wider">
            Risk Analysis
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#090908] tracking-tight leading-tight">
            The 5 Most Common 3PL Warehouse Billing Errors
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#777268] leading-relaxed">
            Most fulfillment billing errors are not intentional deception; they are the byproduct of disjointed warehouse software, high warehouse turnover, and legacy spreadsheet accounting. Here is what to inspect on every statement.
          </p>
        </div>

        <div className="space-y-5">
          {errors.map((err, i) => (
            <div key={i} className="p-6 sm:p-7 rounded border border-[#DCD5C8] bg-[#FBFAF6] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h2 className="text-base font-serif font-bold text-[#090908]">{err.title}</h2>
              <p className="mt-2 text-xs sm:text-sm text-[#777268] leading-relaxed">{err.desc}</p>
            </div>
          ))}
        </div>

        <section className="p-6 rounded bg-[#F3F0E8] border border-[#B8892D]/40 space-y-2 text-[#121210] text-xs sm:text-sm">
          <h3 className="font-serif font-bold text-[#090908]">How to Prevent Future Billing Drift</h3>
          <p className="text-[#777268] leading-relaxed">
            Conduct a deterministic audit on every invoice before issuing wire or ACH payments. By maintaining an immutable history of past rate cards and historical benchmarks, you ensure compliance throughout your 3PL relationship.
          </p>
        </section>

        <div className="text-center pt-4">
          <Link
            href="/register"
            className="inline-flex px-8 py-3 rounded bg-[#121210] hover:bg-[#090908] text-[#FBFAF6] border border-[#B8892D]/40 font-bold text-xs uppercase tracking-wider transition shadow"
          >
            Audit Your 3PL Invoice for These Errors
          </Link>
        </div>
      </div>
    </article>
  );
}
