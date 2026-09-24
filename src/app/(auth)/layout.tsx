import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBFAF6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#B8892D]/20">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#121210] border border-[#B8892D]/40 flex items-center justify-center text-[#E0BC68] font-bold text-xs tracking-wider">
            MG
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-sm tracking-widest uppercase text-[#090908]">
              METT GLOBAL
            </span>
            <span className="text-[10px] text-[#777268] uppercase tracking-wider -mt-0.5">
              3PL Invoice Auditor
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FBFAF6] py-8 px-6 border border-[#DCD5C8] sm:rounded sm:px-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {children}
        </div>
        <div className="mt-6 text-center text-xs text-[#777268]">
          Deterministic 3PL warehouse invoice verification • Bank-grade session security
        </div>
      </div>
    </div>
  );
}
