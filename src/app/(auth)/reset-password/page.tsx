"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token") || "";

  const [email, setEmail] = useState("");
  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset">(urlToken ? "reset" : "request");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
      setStep("reset");
    }
  }, [urlToken]);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process request");

      setMessage(data.message);

      // If Resend email provider is not yet configured, automatically transition to reset step with direct token
      const fallbackToken = data.directToken || data.devResetToken;
      if (fallbackToken) {
        setToken(fallbackToken);
        setStep("reset");
        setMessage("Password reset token generated! You can enter your new password below.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setMessage(data.message || "Your password has been successfully updated.");
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#121210] border border-[#B8892D]/40 text-[#E0BC68] flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-[#090908] tracking-tight">
            Password Updated
          </h2>
          <p className="mt-2 text-xs text-[#777268]">
            Your new password has been verified and saved. You can now sign in with your updated credentials.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="primary" className="w-full">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#090908] tracking-tight">
          {step === "request" ? "Reset your password" : "Set new password"}
        </h2>
        <p className="mt-1 text-xs text-[#777268]">
          {step === "request"
            ? "Enter your registered work email to receive password reset instructions"
            : "Enter your reset token and new secure password below"}
        </p>
      </div>

      {message && (
        <div className="p-3 rounded bg-[#F3F0E8] border border-[#B8892D]/40 text-xs text-[#121210]">
          {message}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded bg-[#fdf8f8] border border-[#f1c2c2] text-xs font-mono text-[#8f2020]">
          {errorMsg}
        </div>
      )}

      {step === "request" ? (
        <form onSubmit={handleRequestToken} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mettglobalinc@gmail.com"
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Generate Reset Instructions
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setStep("reset")}
              className="text-xs text-[#777268] hover:text-[#090908] transition"
            >
              Already have a reset token? Click here
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="Reset Token"
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter token from email or generated above"
          />

          <Input
            label="New Password (min 8 chars)"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Update Password
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setStep("request")}
              className="text-xs text-[#777268] hover:text-[#090908] transition"
            >
              ← Back to request reset link
            </button>
          </div>
        </form>
      )}

      <div className="text-center pt-2 border-t border-[#DCD5C8] text-xs text-[#777268]">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-[#B8892D] hover:text-[#090908] underline underline-offset-2">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-xs text-[#777268]">
          Loading password reset...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
