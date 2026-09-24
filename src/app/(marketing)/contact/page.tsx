import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Support | 3PL Invoice Auditor",
  description:
    "Get in touch with the 3PL Invoice Auditor engineering team for support, custom enterprise rate card parsing, or questions.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="py-16 md:py-24 bg-[#FBFAF6]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-mono font-bold text-[#B8892D] uppercase tracking-wider">
            Direct Support
          </span>
          <h1 className="mt-3 text-3xl font-serif font-bold text-[#090908] tracking-tight">
            Contact Our Team
          </h1>
          <p className="mt-3 text-sm text-[#777268] leading-relaxed">
            Have a question about a complex warehouse agreement or need assistance importing an invoice? Reach out below.
          </p>
        </div>

        <div className="mt-12 bg-[#FBFAF6] border border-[#DCD5C8] rounded p-8 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-medium text-[#777268] uppercase tracking-tight mb-1">
                Your Email
              </label>
              <input
                type="email"
                placeholder="you@yourbrand.com"
                className="w-full px-3.5 py-2.5 bg-white border border-[#DCD5C8] rounded text-xs text-[#121210] focus:outline-none focus:ring-1 focus:ring-[#B8892D] focus:border-[#B8892D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-[#777268] uppercase tracking-tight mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="Question about 3PL rate card mapping"
                className="w-full px-3.5 py-2.5 bg-white border border-[#DCD5C8] rounded text-xs text-[#121210] focus:outline-none focus:ring-1 focus:ring-[#B8892D] focus:border-[#B8892D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-[#777268] uppercase tracking-tight mb-1">
                Message / Details
              </label>
              <textarea
                rows={4}
                placeholder="Describe your 3PL invoice format or inquiry..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#DCD5C8] rounded text-xs text-[#121210] focus:outline-none focus:ring-1 focus:ring-[#B8892D] focus:border-[#B8892D]"
              />
            </div>

            <button
              type="button"
              className="w-full py-3 bg-[#121210] hover:bg-[#090908] text-[#FBFAF6] border border-[#B8892D]/40 font-bold text-xs uppercase tracking-wider rounded shadow-sm transition"
            >
              Send Message
            </button>
          </div>

          <div className="text-center pt-4 border-t border-[#DCD5C8] text-xs text-[#777268]">
            Support desk: <span className="font-mono text-[#121210]">support@3plauditor.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
