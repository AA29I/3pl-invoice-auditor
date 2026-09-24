"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  userName: string | null;
  userEmail: string;
  workspaceName: string;
  initialDevMode?: boolean;
  onToggleMobileNav?: () => void;
}

export function TopNav({
  userName,
  userEmail,
  workspaceName,
  initialDevMode = false,
  onToggleMobileNav,
}: TopNavProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDevMode, setIsDevMode] = useState(initialDevMode);
  const [isTogglingDev, setIsTogglingDev] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const handleToggleDevMode = async () => {
    const nextState = !isDevMode;
    setIsTogglingDev(true);
    try {
      const res = await fetch("/api/workspace/dev-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devModeEnabled: nextState }),
      });
      if (res.ok) {
        setIsDevMode(nextState);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to toggle dev mode:", err);
    } finally {
      setIsTogglingDev(false);
    }
  };

  return (
    <div className="flex flex-col">
      <header className="h-14 bg-[#FBFAF6] border-b border-[#DCD5C8] px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Mobile Menu Hamburger */}
          {onToggleMobileNav && (
            <button
              type="button"
              onClick={onToggleMobileNav}
              className="md:hidden p-1.5 -ml-1.5 rounded text-[#121210] hover:bg-[#F3F0E8] transition focus:outline-none focus:ring-1 focus:ring-[#B8892D]"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-[#121210]" />
            </button>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-[#777268] uppercase tracking-wider hidden sm:inline">
              Workspace:
            </span>
            <span className="text-xs font-serif font-bold text-[#121210] truncate max-w-[130px] sm:max-w-none">
              {workspaceName}
            </span>
          </div>

          {/* Dev Mode Switcher */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleToggleDevMode}
              disabled={isTogglingDev}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                isDevMode
                  ? "bg-[#121210] text-[#E0BC68] border-[#B8892D] shadow-sm font-semibold"
                  : "bg-[#F3F0E8] text-[#777268] border-[#DCD5C8] hover:text-[#121210]"
              }`}
              title={isDevMode ? "Developer Mode is Active" : "Click to activate Developer Sandbox"}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isDevMode ? "bg-[#E0BC68] animate-pulse" : "bg-[#777268]"
                }`}
              />
              <span className="hidden sm:inline">
                {isDevMode ? "DEV SANDBOX: ACTIVE" : "DEV MODE"}
              </span>
              <span className="sm:hidden">
                {isDevMode ? "DEV" : "LIVE"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-[#121210]">{userName || "User"}</div>
            <div className="text-[11px] text-[#777268] font-mono">{userEmail}</div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            isLoading={isLoggingOut}
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Dev Mode Global Sandbox Banner */}
      {isDevMode && (
        <div className="bg-[#121210] border-b border-[#B8892D]/50 text-[#FBFAF6] px-4 sm:px-6 py-1.5 flex items-center justify-between text-[11px] font-mono animate-in fade-in">
          <div className="flex items-center space-x-2 sm:space-x-2.5 overflow-hidden">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E0BC68] shrink-0 animate-ping" />
            <span className="text-[#E0BC68] font-bold uppercase tracking-wider shrink-0">
              Dev Mode
            </span>
            <span className="text-[#777268] hidden sm:inline">•</span>
            <span className="text-[#DCD5C8] truncate text-[10px] sm:text-[11px]">
              Row limits bypassed • Uncontracted rate card simulation active
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleDevMode}
            className="text-[#E0BC68] hover:underline uppercase text-[10px] tracking-wide shrink-0 ml-2"
          >
            Switch to Live
          </button>
        </div>
      )}
    </div>
  );
}
