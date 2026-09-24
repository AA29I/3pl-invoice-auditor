import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { PickAndPackCalculator } from "@/components/marketing/calculator";
import { getSoftwareStructuredData } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Mett Global | 3PL Warehouse Invoice Audit Software",
  description:
    "Deterministic warehouse fulfillment invoice audit software. Cross-reference contracted rate cards against line items to detect overcharges, duplicates, and uncontracted fees.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const structuredData = getSoftwareStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section */}
      <section className="bg-[#FBFAF6] border-b border-[#DCD5C8] pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[#F3F0E8] border border-[#DCD5C8] text-[11px] font-mono text-[#777268] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8892D]"></span>
            <span>Commercial Fulfillment Contract Auditing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#121210] tracking-tight leading-[1.15] max-w-4xl">
            Systematic Verification of 3PL Fulfillment Invoices Against Contracted Rates.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#777268] max-w-3xl leading-relaxed">
            E-commerce logistics statements contain thousands of granular fee entries. 3PL Invoice Auditor runs deterministic mathematical rules against your signed rate schedules to surface line-item rate discrepancies, duplicate order references, and uncontracted surcharges.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 text-xs font-semibold text-[#090908] bg-[#B8892D] hover:bg-[#a67a26] border border-[#a67a26] rounded transition"
            >
              Start Free Audit (1 Sample Included)
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center px-6 py-3 text-xs font-medium text-[#121210] bg-[#F3F0E8] hover:bg-[#e9e4d8] border border-[#DCD5C8] rounded transition"
            >
              Review Audit Methodology
            </Link>
          </div>

          <div className="mt-6 text-[11px] font-mono text-[#777268]">
            Format: Standard CSV upload • Engine: Exact integer minor units • Security: Isolated tenant storage
          </div>
        </div>
      </section>

      {/* Operational Boundary Disclosure */}
      <section className="bg-[#F3F0E8] border-b border-[#DCD5C8] py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#777268]">
          <div>
            <strong className="text-[#121210] font-mono uppercase text-[11px] mr-1.5">
              Auditing Boundary:
            </strong>
            Flagged items are designated as <strong className="text-[#B8892D]">potential discrepancies</strong> until confirmed with warehouse operations. We verify billing math and contracted schedules; we do not claim to verify physical warehouse labor without operational telemetry.
          </div>
          <Link href="/faq" className="underline hover:text-[#121210] font-mono text-[11px] shrink-0">
            Standard FAQ →
          </Link>
        </div>
      </section>

      {/* 4 Deterministic Rules */}
      <section className="py-20 bg-[#FBFAF6] border-b border-[#DCD5C8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-[#DCD5C8] pb-4 mb-10 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono font-semibold text-[#B8892D] uppercase tracking-wider">
                Deterministic Specification
              </span>
              <h2 className="mt-1 text-2xl font-serif font-bold text-[#121210]">
                Core Audit Rules
              </h2>
            </div>
            <p className="text-xs text-[#777268] max-w-md">
              Evaluations execute exact integer cents arithmetic against effective-dated rate schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded bg-white border border-[#DCD5C8]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-[#B8892D] uppercase tracking-wider">
                  Rule 01
                </span>
                <span className="text-[11px] font-mono text-[#777268]">Contract Compliance</span>
              </div>
              <h3 className="text-base font-serif font-bold text-[#121210]">
                Contracted Rate Exceeded
              </h3>
              <p className="mt-2 text-xs text-[#777268] leading-relaxed">
                Matches the fee category on the invoice to the rate card effective for that service date. Flags any line where the billed unit rate or total charge exceeds contracted terms (e.g. billed $3.45 vs agreed $2.85).
              </p>
            </div>

            <div className="p-6 rounded bg-white border border-[#DCD5C8]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-[#B8892D] uppercase tracking-wider">
                  Rule 02
                </span>
                <span className="text-[11px] font-mono text-[#777268]">Deduplication</span>
              </div>
              <h3 className="text-base font-serif font-bold text-[#121210]">
                Duplicate Line / Order Reference
              </h3>
              <p className="mt-2 text-xs text-[#777268] leading-relaxed">
                Tracks repeated order references, tracking IDs, or identical line entries billed multiple times across the billing cycle, preventing double charges from automated WMS batch re-runs.
              </p>
            </div>

            <div className="p-6 rounded bg-white border border-[#DCD5C8]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-[#B8892D] uppercase tracking-wider">
                  Rule 03
                </span>
                <span className="text-[11px] font-mono text-[#777268]">Scope Control</span>
              </div>
              <h3 className="text-base font-serif font-bold text-[#121210]">
                Uncontracted Fee Category
              </h3>
              <p className="mt-2 text-xs text-[#777268] leading-relaxed">
                Surfaces unauthorized line-item additions, such as unilateral seasonal surcharges, facility maintenance line items, or unlisted accessorial charges absent from the signed schedule.
              </p>
            </div>

            <div className="p-6 rounded bg-white border border-[#DCD5C8]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-[#B8892D] uppercase tracking-wider">
                  Rule 04
                </span>
                <span className="text-[11px] font-mono text-[#777268]">Baseline Comparison</span>
              </div>
              <h3 className="text-base font-serif font-bold text-[#121210]">
                Month-over-Month Rate Surge
              </h3>
              <p className="mt-2 text-xs text-[#777268] leading-relaxed">
                Compares unit rates against historical trailing averages for that provider. Flags volumetric or unit rate surges exceeding 25% where no contract amendment was recorded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tool Section */}
      <section className="py-20 bg-[#F3F0E8]/50 border-b border-[#DCD5C8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-[11px] font-mono font-semibold text-[#B8892D] uppercase tracking-wider">
              Working Utility
            </span>
            <h2 className="mt-1 text-2xl font-serif font-bold text-[#121210]">
              Pick &amp; Pack Contract Calculator
            </h2>
            <p className="text-xs text-[#777268] mt-1">
              Model contracted fulfillment expenditure by setting order volumes, item picks, pallet footprints, and returns.
            </p>
          </div>

          <PickAndPackCalculator />
        </div>
      </section>

      {/* Commercial Plans */}
      <section className="py-20 bg-[#FBFAF6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-[#DCD5C8] pb-4 mb-10 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono font-semibold text-[#B8892D] uppercase tracking-wider">
                Subscriptions
              </span>
              <h2 className="mt-1 text-2xl font-serif font-bold text-[#121210]">
                Commercial Tiers &amp; Processing Quotas
              </h2>
            </div>
            <p className="text-xs text-[#777268] max-w-sm">
              Server-enforced row and audit limits. Processed via Lemon Squeezy Merchant of Record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="p-6 rounded bg-white border border-[#DCD5C8] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-semibold text-[#777268] uppercase">
                  Evaluation
                </span>
                <h3 className="text-lg font-serif font-bold text-[#121210] mt-1">Free Tier</h3>
                <div className="mt-4 text-3xl font-mono font-bold text-[#121210]">
                  $0
                </div>
                <p className="text-[11px] text-[#777268] mt-1">Single evaluation audit per calendar month</p>

                <ul className="mt-6 space-y-2.5 text-xs text-[#777268]">
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-[#121210]">01.</span> 1 sample audit / month
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-[#121210]">02.</span> Up to 50 rows per invoice
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-[#121210]">03.</span> CSV column mapper
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-[#121210]">04.</span> CSV dispute summary export
                  </li>
                  <li className="flex items-center gap-2 text-[#777268]/50">
                    <span className="font-mono">—</span> Formatted PDF claim statement
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="mt-8 block text-center py-2 px-4 rounded border border-[#DCD5C8] text-xs font-semibold text-[#121210] hover:bg-[#F3F0E8] transition"
              >
                Create Free Workspace
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="p-6 rounded bg-white border-2 border-[#121210] flex flex-col justify-between relative">
              <span className="absolute -top-3 right-6 bg-[#B8892D] text-[#090908] text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#a67a26]">
                Operational Standard
              </span>
              <div>
                <span className="text-[11px] font-mono font-semibold text-[#B8892D] uppercase">
                  Full SaaS License
                </span>
                <h3 className="text-lg font-serif font-bold text-[#121210] mt-1">Auditor Pro</h3>
                <div className="mt-4 flex items-baseline text-3xl font-mono font-bold text-[#121210]">
                  $49.00
                  <span className="text-xs font-normal text-[#777268] ml-1.5 font-sans">/ month</span>
                </div>
                <p className="text-[11px] text-[#777268] mt-1">Recurring fulfillment invoice audits</p>

                <ul className="mt-6 space-y-2.5 text-xs text-[#121210]">
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-[#B8892D] font-bold">✓</span> <strong>Unlimited</strong> recurring monthly audits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-[#B8892D] font-bold">✓</span> Up to <strong>50,000 lines</strong> per invoice
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-[#B8892D] font-bold">✓</span> Formatted PDF Dispute Claim Sheets
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-[#B8892D] font-bold">✓</span> Multi-user workspace team members
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-[#B8892D] font-bold">✓</span> Historical audit log &amp; rate card archives
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="mt-8 block text-center py-2 px-4 rounded bg-[#121210] hover:bg-[#090908] text-xs font-semibold text-[#FBFAF6] transition"
              >
                Start Pro Subscription
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
