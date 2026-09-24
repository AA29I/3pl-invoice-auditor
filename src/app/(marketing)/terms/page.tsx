import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | 3PL Invoice Auditor",
  description: "Terms and conditions for using 3PL Invoice Auditor software.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24 bg-[#FBFAF6]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-[#121210]">
        <div>
          <span className="text-xs font-mono font-bold text-[#B8892D] uppercase tracking-wider">
            Legal Agreement
          </span>
          <h1 className="mt-3 text-3xl font-serif font-bold text-[#090908] tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs font-mono text-[#777268]">
            Effective Date: September 2026
          </p>
        </div>

        <section className="space-y-3 text-xs sm:text-sm leading-relaxed border-t border-[#DCD5C8] pt-6">
          <h2 className="text-base font-serif font-bold text-[#090908]">1. Software Scope &amp; Purpose</h2>
          <p className="text-[#777268]">
            3PL Invoice Auditor provides mathematical and contract-rate comparison tools designed to evaluate electronic CSV invoices provided by third-party logistics warehouses. The software compares billed rates against user-entered contracted rate schedules.
          </p>
        </section>

        <section className="space-y-3 text-xs sm:text-sm leading-relaxed border-t border-[#DCD5C8] pt-6">
          <h2 className="text-base font-serif font-bold text-[#090908]">2. Auditing Boundaries &amp; No Guarantee of Recovery</h2>
          <p className="text-[#777268]">
            The software flags potential discrepancies, math errors, duplicate references, and uncontracted line items. Flagged items do not constitute legal determinations or guarantees of recovered savings. Financial recovery depends on bilateral agreement between your brand and your warehouse service provider.
          </p>
        </section>

        <section className="space-y-3 text-xs sm:text-sm leading-relaxed border-t border-[#DCD5C8] pt-6">
          <h2 className="text-base font-serif font-bold text-[#090908]">3. Subscription Terms &amp; Cancellation</h2>
          <p className="text-[#777268]">
            Pro plans are billed on a recurring monthly schedule via Lemon Squeezy. Subscriptions may be cancelled at any time through the workspace billing portal prior to the start of the next billing cycle.
          </p>
        </section>
      </div>
    </div>
  );
}
