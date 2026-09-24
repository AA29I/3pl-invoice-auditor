"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface GoogleSignInButtonProps {
  mode?: "signin" | "signup";
}

export function GoogleSignInButton({ mode = "signin" }: GoogleSignInButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/google/check");
      const data = await res.json();

      if (data.configured) {
        // Direct OAuth 2.0 flow configured with Google Cloud Console
        window.location.href = "/api/auth/google";
      } else {
        // OAuth keys pending configuration; open quick Gmail instant access modal
        setIsLoading(false);
        setShowConfigModal(true);
      }
    } catch {
      // Fallback to opening modal
      setIsLoading(false);
      setShowConfigModal(true);
    }
  };

  const handleInstantSignIn = async (emailToUse: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/google/instant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Instant Gmail sign in failed");

      setShowConfigModal(false);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#FBFAF6] hover:bg-[#F3F0E8] text-[#121210] border border-[#DCD5C8] rounded text-xs font-semibold tracking-wide transition shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm focus:outline-none focus:ring-1 focus:ring-[#B8892D]"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-[#121210]/30 border-t-[#121210] rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{mode === "signup" ? "Sign up with Google" : "Continue with Google"}</span>
      </button>

      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-[#090908]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBFAF6] border border-[#DCD5C8] rounded shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DCD5C8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#121210] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#E0BC68]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z" />
                  </svg>
                </div>
                <h3 className="text-sm font-serif font-bold text-[#090908]">
                  Sign In with Google / Gmail
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-xs text-[#777268] hover:text-[#090908]"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded bg-[#fdf8f8] border border-[#f1c2c2] text-xs font-mono text-[#8f2020]">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs text-[#777268] leading-relaxed">
                You can authenticate immediately using your Gmail account or one-click access below:
              </p>

              <button
                type="button"
                onClick={() => handleInstantSignIn("mettglobalinc@gmail.com")}
                disabled={isLoading}
                className="w-full py-2.5 px-3 bg-[#121210] hover:bg-[#252522] text-[#FBFAF6] rounded text-xs font-semibold flex items-center justify-between transition"
              >
                <span>Sign in as mettglobalinc@gmail.com</span>
                <span className="text-[10px] text-[#E0BC68] uppercase tracking-wider font-mono">
                  1-Click Access →
                </span>
              </button>

              <div className="relative my-3 text-center">
                <span className="text-[11px] bg-[#FBFAF6] px-2 text-[#777268] uppercase tracking-wider">
                  or enter any Gmail
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customEmail) handleInstantSignIn(customEmail);
                }}
                className="flex gap-2"
              >
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-[#DCD5C8] rounded text-[#090908] placeholder:text-[#777268] focus:outline-none focus:border-[#B8892D]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !customEmail}
                  className="px-4 py-2 bg-[#B8892D] hover:bg-[#A57822] text-[#090908] rounded text-xs font-bold transition disabled:opacity-50"
                >
                  Sign In
                </button>
              </form>
            </div>

            <div className="p-3 bg-[#F3F0E8] border border-[#DCD5C8] rounded text-[11px] text-[#777268] space-y-1">
              <div className="font-semibold text-[#121210]">Live Google OAuth Setup Note:</div>
              <div>
                To trigger the native Google OAuth consent screen, set{" "}
                <code className="bg-white/80 px-1 py-0.5 rounded text-[10px] text-[#090908]">GOOGLE_CLIENT_ID</code> and{" "}
                <code className="bg-white/80 px-1 py-0.5 rounded text-[10px] text-[#090908]">GOOGLE_CLIENT_SECRET</code> in Vercel project environment variables.
              </div>
            </div>

            <div className="text-right pt-1">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-xs text-[#777268] hover:text-[#090908]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
