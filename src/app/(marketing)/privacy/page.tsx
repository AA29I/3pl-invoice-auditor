import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy & Workspace Isolation | 3PL Invoice Auditor",
  description:
    "How 3PL Invoice Auditor isolates brand invoice data, protects private downloads, and provides self-service data deletion.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24 bg-[#FBFAF6]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-[#121210]">
        <div>
          <span className="text-xs font-mono font-bold text-[#B8892D] uppercase tracking-wider">
            Trust &amp; Governance
          </span>
          <h1 className="mt-3 text-3xl font-serif font-bold text-[#090908] tracking-tight">
            Privacy Policy &amp; Data Isolation
          </h1>
          <p className="mt-2 text-xs font-mono text-[#777268]">
            Effective Date: September 2026
          </p>
        </div>

        <section className="space-y-3 text-xs sm:text-sm leading-relaxed border-t border-[#DCD5C8] pt-6">
          <h2 className="text-base font-serif font-bold text-[#090908]">1. Strict Workspace Isolation</h2>
          <p className="text-[#777268]">
            Your warehouse fulfillment rates, volume data, and supplier invoices are strictly private. All database records (including Providers, Rate Cards, Invoices, and Audit Flags) are strictly scoped by workspace IDs. No brand or tenant can query, access, or view data from another workspace.
          </p>
        </section>

        <section className="space-y-3 text-xs sm:text-sm leading-relaxed border-t border-[#DCD5C8] pt-6">
          <h2 className="text-base font-serif font-bold text-[#090908]">2. File Validation &amp; Upload Safety</h2>
          <p className="text-[#777268]">
            We only accept standard delimited CSV text files with strict client-side and server-side size limits (5 megabytes maximum). Uploaded files are processed in-memory or persisted in encrypted database fields; we do not execute arbitrary file code or process unverified binary payloads.
          </p>
        </section>

        <section className="space-y-3 text-xs sm:text-sm leading-relaxed border-t border-[#DCD5C8] pt-6">
          <h2 className="text-base font-serif font-bold text-[#090908]">3. Protected Private Downloads</h2>
          <p className="text-[#777268]">
            Dispute summary CSVs and PDF claim reports are never publicly accessible. All export endpoints require an active, authenticated session with validated workspace permissions. Search engines and web scrapers are prohibited via strict robots.txt disallow rules.
          </p>
        </section>

        <section className="space-y-3 text-xs sm:text-sm leading-relaxed border-t border-[#DCD5C8] pt-6">
          <h2 className="text-base font-serif font-bold text-[#090908]">4. Self-Service Data Deletion</h2>
          <p className="text-[#777268]">
            You retain 100% ownership of your financial records. If you choose to leave the platform or clear historical records, you can execute permanent, cascading deletion of all providers, rate cards, and invoices directly from your Workspace Data Settings.
          </p>
        </section>

        <section className="space-y-3 text-xs sm:text-sm leading-relaxed border-t border-[#DCD5C8] pt-6">
          <h2 className="text-base font-serif font-bold text-[#090908]">5. Billing &amp; Payment Processing</h2>
          <p className="text-[#777268]">
            Subscription billing is managed securely by Lemon Squeezy acting as Merchant of Record. We never store, collect, or process your credit card numbers on our servers.
          </p>
        </section>
      </div>
    </div>
  );
}
