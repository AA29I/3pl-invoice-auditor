"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";

interface DashboardShellProps {
  workspaceName: string;
  planTier: string;
  userName: string | null;
  userEmail: string;
  initialDevMode: boolean;
  children: React.ReactNode;
}

export function DashboardShell({
  workspaceName,
  planTier,
  userName,
  userEmail,
  initialDevMode,
  children,
}: DashboardShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FBFAF6]">
      {/* Desktop Sidebar (visible on md+) */}
      <div className="hidden md:flex">
        <Sidebar workspaceName={workspaceName} planTier={planTier} />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#121210] z-10 animate-in slide-in-from-left duration-200">
            <Sidebar
              workspaceName={workspaceName}
              planTier={planTier}
              isMobile={true}
              onNavigate={() => setIsMobileNavOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          userName={userName}
          userEmail={userEmail}
          workspaceName={workspaceName}
          initialDevMode={initialDevMode}
          onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
