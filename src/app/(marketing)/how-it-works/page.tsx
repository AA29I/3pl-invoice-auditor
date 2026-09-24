import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | 3PL Invoice Auditor Workflow",
  description:
    "Learn how 3PL Invoice Auditor verifies fulfillment invoices against contracted rates using deterministic logic, column mapping, and dispute reporting.",
  alternates: {
    canonical: "/how-it-works",
  },
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Add Your 3PL Warehouse & Contracted Rate Card",
      desc: "Input your effective contracted rate cards: base pick & pack fees, additional unit picks, pallet/bin storage, carton receiving, return inspection, and scheduled account management fees. Effective dates ensure historical invoices are evaluated accurately even when rates change over time.",
    },
    {
      num: "02",
      title: "Upload Your Warehouse CSV Invoice",
      desc: "Export your monthly billing line items directly from your 3PL portal (ShipBob, Red Stag, DCL, Quiet 3PL, etc.) as a CSV. You can also download our standardized test CSV to preview the audit workflow.",
    },
    {
      num: "03",
      title: "Interactive Column Mapping",
      desc: "Because warehouses name their columns differently (e.g., 'Total Charge' vs 'Amount', 'Order Reference' vs 'Ref ID'), our interactive column mapper lets you pair your headers in seconds and saves the template for subsequent monthly runs.",
    },
    {
      num: "04",
      title: "Run Deterministic Audit Rules",
      desc: "Our engine executes strict mathematical rules using exact integer minor units (cents): rate card overages, duplicate lines or repeated tracking numbers, uncontracted fee categories, and anomalous month-over-month rate increases.",
    },
    {
      num: "05",
      title: "Triage Flags & Export Dispute Claims",
      desc: "Review every flagged row alongside its expected contracted rate, billed rate, and mathematical calculation. Label items as Awaiting Clarification, Confirmed Overcharge, or Dismissed. Export a CSV or generate a clean PDF Dispute Claim Sheet to deliver to your warehouse accounting rep.",
    },
  ];

  return (
    <div className="py-16 md:py-24 bg-[#FBFAF6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-mono font-bold text-[#B8892D] uppercase tracking-wider">
            Deterministic 5-Step Verification
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-serif font-bold text-[#090908] tracking-tight">
            How 3PL Invoice Auditor Works
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#777268] leading-relaxed max-w-2xl mx-auto">
            Eliminate manual spreadsheet audits. We verify every line item on your warehouse billing statement deterministically against your agreed contracts.
          </p>
        </div>

        <div className="mt-14 space-y-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex flex-col md:flex-row gap-6 p-6 sm:p-8 rounded border border-[#DCD5C8] bg-[#FBFAF6] shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            >
              <div className="w-10 h-10 rounded bg-[#121210] border border-[#B8892D]/40 text-[#E0BC68] font-mono font-bold flex items-center justify-center text-sm shrink-0">
                {step.num}
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-serif font-bold text-[#090908]">{step.title}</h2>
                <p className="text-xs sm:text-sm text-[#777268] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-[#121210] border border-[#090908] rounded p-8 sm:p-10 text-[#FBFAF6]">
          <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider block mb-2">
            Zero Obligation Verification
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#FBFAF6]">Ready to audit your first invoice?</h2>
          <p className="mt-2 text-xs sm:text-sm text-[#777268] max-w-md mx-auto">
            Free tier includes 1 sample audit with no credit card required.
          </p>
          <div className="mt-6">
            <Link
              href="/register"
              className="inline-flex px-6 py-2.5 rounded bg-[#B8892D] hover:bg-[#E0BC68] text-[#090908] font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              Create Free Workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
