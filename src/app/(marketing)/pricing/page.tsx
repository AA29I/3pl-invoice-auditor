import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans | 3PL Invoice Auditor",
  description:
    "Predictable SaaS pricing for e-commerce brands auditing warehouse invoices. Free sample audit and Pro monthly subscription with unlimited audits.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <div className="py-16 md:py-24 bg-[#FBFAF6]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold text-[#B8892D] uppercase tracking-wider">
            Predictable Terms
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-serif font-bold text-[#090908] tracking-tight">
            Straightforward Plans for Growing Brands
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#777268] leading-relaxed">
            No long-term contracts. No percentage-of-savings cuts. Just predictable software that verifies your 3PL charges.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded border border-[#DCD5C8] bg-[#FBFAF6] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold text-[#090908]">Free Tier</h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#F3F0E8] border border-[#DCD5C8] text-[#777268]">
                  Evaluation
                </span>
              </div>
              <p className="text-xs text-[#777268] mt-1">For testing and small one-off checks</p>
              <div className="mt-6 flex items-baseline text-4xl font-serif font-bold text-[#090908]">
                $0
              </div>
              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-[#121210]">
                <li className="flex items-center gap-2.5">
                  <span className="text-[#B8892D] font-bold">✓</span> 1 sample audit per month
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#B8892D] font-bold">✓</span> Up to 50 rows per CSV invoice
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#B8892D] font-bold">✓</span> Full 4-rule deterministic audit engine
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#B8892D] font-bold">✓</span> CSV dispute summary export
                </li>
                <li className="flex items-center gap-2.5 text-[#777268]">
                  <span className="text-[#DCD5C8]">✕</span> PDF dispute claim sheet
                </li>
                <li className="flex items-center gap-2.5 text-[#777268]">
                  <span className="text-[#DCD5C8]">✕</span> Multiple team members
                </li>
              </ul>
            </div>
            <Link
              href="/register"
              className="mt-8 block text-center py-2.5 px-4 rounded border border-[#DCD5C8] font-semibold text-xs uppercase tracking-wider text-[#121210] hover:bg-[#F3F0E8] transition"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded border-2 border-[#B8892D] bg-[#121210] text-[#FBFAF6] shadow-md flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 bg-[#B8892D] text-[#090908] text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded shadow-sm">
              Commercial Operations
            </span>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold text-[#FBFAF6]">Auditor Pro</h2>
              </div>
              <p className="text-xs text-[#777268] mt-1">For DTC brands with recurring warehouse bills</p>
              <div className="mt-6 flex items-baseline text-4xl font-serif font-bold text-[#E0BC68]">
                $49
                <span className="text-xs font-mono font-normal text-[#777268] ml-2">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-[#FBFAF6]">
                <li className="flex items-center gap-2.5">
                  <span className="text-[#B8892D] font-bold">✓</span> <strong>Unlimited</strong> recurring monthly audits
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#B8892D] font-bold">✓</span> Up to <strong>50,000 lines</strong> per invoice
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#B8892D] font-bold">✓</span> Formatted PDF Dispute Claim Sheets
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#B8892D] font-bold">✓</span> Historical audit log &amp; rate trends
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#B8892D] font-bold">✓</span> Workspace team invites
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#B8892D] font-bold">✓</span> Cancel anytime via Lemon Squeezy portal
                </li>
              </ul>
            </div>
            <Link
              href="/register"
              className="mt-8 block text-center py-2.5 px-4 rounded bg-[#B8892D] hover:bg-[#E0BC68] text-[#090908] font-bold text-xs uppercase tracking-wider shadow transition"
            >
              Start Pro Plan
            </Link>
          </div>
        </div>

        {/* Pricing Notice */}
        <div className="mt-12 text-center text-xs text-[#777268] max-w-xl mx-auto leading-relaxed">
          All subscriptions are billed securely via Lemon Squeezy as Merchant of Record. You can update payment methods or cancel at any time from your workspace settings with 1 click.
        </div>
      </div>
    </div>
  );
}
