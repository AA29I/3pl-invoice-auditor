import React from "react";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="bg-[#121210] text-[#777268] py-14 border-t border-[#090908]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-[#FBFAF6] font-serif font-bold text-sm tracking-wide uppercase">
            <span>Mett Global</span>
            <span className="text-[#B8892D]">/</span>
            <span className="font-mono text-xs font-normal text-[#E0BC68]">3PL Auditor</span>
          </div>
          <p className="text-xs text-[#777268] leading-relaxed">
            Deterministic fulfillment invoice audit software. Verifies warehouse rate schedules, line-item mathematics, and billing events against signed commercial contracts.
          </p>
          <p className="text-[11px] text-[#777268]/70 pt-2 font-mono">
            © {new Date().getFullYear()} Mett Global. All rights reserved.
          </p>
        </div>

        <div>
          <h4 className="text-[11px] font-mono font-semibold text-[#FBFAF6] uppercase tracking-wider mb-3">
            Product &amp; Reference
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/docs" className="hover:text-[#FBFAF6] transition text-[#E0BC68] font-medium">
                Official Documentation &amp; Specs
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-[#FBFAF6] transition">
                Audit Methodology
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-[#FBFAF6] transition">
                Pricing &amp; Quotas
              </Link>
            </li>
            <li>
              <Link href="/3pl-invoice-audit" className="hover:text-[#FBFAF6] transition">
                3PL Audit Guide
              </Link>
            </li>
            <li>
              <Link href="/fulfillment-invoice-checker" className="hover:text-[#FBFAF6] transition">
                Fulfillment Invoice Checker
              </Link>
            </li>
            <li>
              <Link href="/3pl-billing-errors" className="hover:text-[#FBFAF6] transition">
                Documented Billing Errors
              </Link>
            </li>
            <li>
              <Link href="/pick-and-pack-calculator" className="hover:text-[#FBFAF6] transition">
                Pick &amp; Pack Calculator
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-mono font-semibold text-[#FBFAF6] uppercase tracking-wider mb-3">
            Governance &amp; Isolation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/privacy" className="hover:text-[#FBFAF6] transition">
                Data Isolation &amp; Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#FBFAF6] transition">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-[#FBFAF6] transition">
                Auditing Standards FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#FBFAF6] transition">
                Operations &amp; Support
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-mono font-semibold text-[#FBFAF6] uppercase tracking-wider mb-3">
            Auditing Boundary
          </h4>
          <p className="text-xs text-[#777268] leading-relaxed">
            All flagged charges are displayed as <span className="text-[#E0BC68] font-medium">potential discrepancies</span> until confirmed by human verification. Calculations are deterministic and based strictly on uploaded CSV data and contracted rate schedules.
          </p>
        </div>
      </div>
    </footer>
  );
}
