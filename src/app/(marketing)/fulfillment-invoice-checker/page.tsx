import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fulfillment Invoice Checker | Audit DTC Warehouse Bills Online",
  description:
    "An online fulfillment invoice checker for e-commerce brands. Automatically verify warehouse charges, receiving fees, item picks, and storage rates.",
  alternates: {
    canonical: "/fulfillment-invoice-checker",
  },
};

export default function FulfillmentInvoiceCheckerPage() {
  return (
    <article className="py-16 md:py-24 bg-[#FBFAF6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <span className="text-xs font-mono font-bold text-[#B8892D] uppercase tracking-wider">
            Operational Accounting
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#090908] tracking-tight leading-tight">
            Fulfillment Invoice Checker: Protect Your E-Commerce Margins
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#777268] leading-relaxed">
            As your e-commerce order volume scales, warehouse billing complexity explodes. A fulfillment invoice checker acts as an independent auditing firewall between your 3PL’s billing department and your bank account.
          </p>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-[#090908]">
            What Does an Automated Fulfillment Invoice Checker Inspect?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-6 rounded border border-[#DCD5C8] bg-[#FBFAF6] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="font-serif font-bold text-[#090908]">Order Pick &amp; Pack Tiers</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#777268] leading-relaxed">
                Verifies base order pick fees and confirms that second and third items are charged at the lower incremental item rate rather than full order pricing.
              </p>
            </div>
            <div className="p-6 rounded border border-[#DCD5C8] bg-[#FBFAF6] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="font-serif font-bold text-[#090908]">Inbound Receiving Accuracy</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#777268] leading-relaxed">
                Checks whether container de-stuffing, pallet putaways, and carton breakdown rates match contracted inbound receiving schedules.
              </p>
            </div>
            <div className="p-6 rounded border border-[#DCD5C8] bg-[#FBFAF6] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="font-serif font-bold text-[#090908]">Storage Billing Periods</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#777268] leading-relaxed">
                Confirms whether pallet or bin storage was billed pro-rata, by calendar month, or daily, avoiding double storage charges during pallet re-stacking.
              </p>
            </div>
            <div className="p-6 rounded border border-[#DCD5C8] bg-[#FBFAF6] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="font-serif font-bold text-[#090908]">Return Restocking Fees</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#777268] leading-relaxed">
                Ensures customer returns are billed according to contracted inspection and restock pricing without inflated manual handling fees.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-[#090908]">
            The Difference Between Freight Auditing and 3PL Fulfillment Auditing
          </h2>
          <p className="text-xs sm:text-sm text-[#777268] leading-relaxed">
            Many brands confuse carrier freight auditing (FedEx/UPS late delivery tracking) with 3PL warehouse fulfillment auditing. Freight auditors only inspect carrier tracking events. <strong>3PL Invoice Auditor</strong> specializes in what happens inside the 4 walls of the warehouse: labor, picking, materials, storage, and handling.
          </p>
        </section>

        <div className="p-8 sm:p-10 rounded bg-[#121210] border border-[#090908] text-[#FBFAF6] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider block mb-1">
              Immediate Verification
            </span>
            <h3 className="text-xl font-serif font-bold text-[#FBFAF6]">Check Your 3PL Invoice Today</h3>
            <p className="mt-1 text-xs text-[#777268]">
              Use our downloadable template or upload your warehouse statement.
            </p>
          </div>
          <Link
            href="/register"
            className="px-6 py-2.5 rounded bg-[#B8892D] text-[#090908] font-bold text-xs uppercase tracking-wider shrink-0 hover:bg-[#E0BC68] transition shadow"
          >
            Run Free Audit
          </Link>
        </div>
      </div>
    </article>
  );
}
