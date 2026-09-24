"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface MarketingHeaderClientProps {
  isAuthenticated: boolean;
}

export function MarketingHeaderClient({ isAuthenticated }: MarketingHeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Platform", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
    { name: "Discrepancies", href: "/3pl-billing-errors" },
    { name: "Rate Calculator", href: "/pick-and-pack-calculator" },
    { name: "Documentation", href: "/docs" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FBFAF6]/95 backdrop-blur-sm border-b border-[#DCD5C8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-3">
            <span className="font-serif font-black tracking-wider text-sm text-[#121210] uppercase">
              Mett Global
            </span>
            <span className="text-[#DCD5C8] font-light">|</span>
            <span className="text-xs font-mono font-medium tracking-tight text-[#777268] uppercase">
              3PL Auditor
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-[#777268]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#121210] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium text-[#FBFAF6] bg-[#121210] hover:bg-[#090908] rounded transition"
            >
              Open Workspace
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium text-[#777268] hover:text-[#121210] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-[#090908] bg-[#B8892D] hover:bg-[#a67a26] border border-[#a67a26] rounded transition"
              >
                Start Free Audit
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="px-2.5 py-1 text-xs font-medium text-[#FBFAF6] bg-[#121210] rounded"
            >
              Workspace
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded text-[#121210] hover:bg-[#F3F0E8] transition focus:outline-none focus:ring-1 focus:ring-[#B8892D]"
            aria-label="Toggle Navigation Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#121210]" />
            ) : (
              <Menu className="w-5 h-5 text-[#121210]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#DCD5C8] bg-[#FBFAF6] px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-medium text-[#121210] hover:bg-[#F3F0E8] rounded transition"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#DCD5C8] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-medium text-[#FBFAF6] bg-[#121210] hover:bg-[#090908] rounded transition"
              >
                Open Workspace Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-semibold text-[#090908] bg-[#B8892D] hover:bg-[#a67a26] border border-[#a67a26] rounded transition"
                >
                  Start Free Audit
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-medium text-[#121210] bg-[#F3F0E8] hover:bg-[#e9e4d8] border border-[#DCD5C8] rounded transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
