"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { X } from "lucide-react";

interface SidebarProps {
  workspaceName: string;
  planTier: string;
  onNavigate?: () => void;
  isMobile?: boolean;
}

export function Sidebar({
  workspaceName,
  planTier,
  onNavigate,
  isMobile = false,
}: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/dashboard" },
    { name: "3PL Providers & Rates", href: "/providers" },
    { name: "Invoice Audits", href: "/audits" },
    { name: "Upload & Audit CSV", href: "/audits/new" },
    { name: "Documentation & Specs", href: "/docs" },
    { name: "Workspace Settings", href: "/settings" },
    { name: "Subscription & Billing", href: "/settings/billing" },
  ];

  return (
    <aside
      className={clsx(
        "bg-[#121210] text-[#777268] flex flex-col justify-between shrink-0 min-h-screen border-r border-[#090908]",
        isMobile ? "w-72 shadow-2xl" : "w-60"
      )}
    >
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#252522] flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center space-x-2.5"
          >
            <span className="font-serif font-black tracking-wider text-xs text-[#FBFAF6] uppercase">
              Mett Global
            </span>
            <span className="text-[#777268]/60">/</span>
            <span className="font-mono text-[11px] text-[#B8892D] uppercase font-semibold">
              Auditor
            </span>
          </Link>

          {isMobile && onNavigate && (
            <button
              type="button"
              onClick={onNavigate}
              className="p-1 rounded text-[#777268] hover:text-[#FBFAF6] transition"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-5 pt-4">
          <div className="p-2.5 rounded bg-[#090908] border border-[#252522]">
            <div className="text-xs font-medium text-[#FBFAF6] truncate">{workspaceName}</div>
            <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
              <span className="text-[#777268]">Tier:</span>
              <span
                className={clsx(
                  "font-bold uppercase px-1.5 py-0.5 rounded text-[10px]",
                  planTier === "PRO"
                    ? "bg-[#B8892D] text-[#090908]"
                    : "bg-[#252522] text-[#FBFAF6]"
                )}
              >
                {planTier}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {links.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={clsx(
                  "flex items-center px-3 py-2 text-xs font-medium rounded transition-colors tracking-tight",
                  isActive
                    ? "bg-[#090908] text-[#FBFAF6] border-l-2 border-[#B8892D] font-semibold"
                    : "text-[#777268] hover:text-[#FBFAF6] hover:bg-[#1a1a17]"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Plan Limits Indicator */}
      <div className="p-4 border-t border-[#252522]">
        {planTier === "FREE" ? (
          <div className="p-3 rounded bg-[#090908] border border-[#252522] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#E0BC68] font-mono text-[10px] font-bold uppercase">
                Free Quota
              </span>
              <span className="text-[10px] text-[#777268] font-mono">1 audit/mo</span>
            </div>
            <p className="text-[#777268] text-[11px] leading-tight">
              Sample mode with 50-row maximum.
            </p>
            <Link
              href="/settings/billing"
              onClick={onNavigate}
              className="block text-center py-1.5 bg-[#B8892D] hover:bg-[#a67a26] text-[#090908] font-bold rounded text-[11px] transition"
            >
              Upgrade to Pro
            </Link>
          </div>
        ) : (
          <div className="text-[11px] text-[#777268] font-mono flex items-center justify-between">
            <span>Recurring Audits</span>
            <span className="text-[#E0BC68] font-bold">Unlimited</span>
          </div>
        )}
      </div>
    </aside>
  );
}
