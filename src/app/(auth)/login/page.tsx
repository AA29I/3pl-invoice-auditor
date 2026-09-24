"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#090908] tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-[#777268]">
          Access your brand workspace and fulfillment audits
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded bg-[#fdf8f8] border border-[#f1c2c2] text-xs font-mono text-[#8f2020]">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Work Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="operations@yourbrand.com"
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <div className="text-right">
            <Link
              href="/reset-password"
              className="text-xs text-[#B8892D] hover:text-[#090908] hover:underline transition"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-[#DCD5C8] text-xs text-[#777268]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-[#B8892D] hover:text-[#090908] underline underline-offset-2">
          Create free workspace
        </Link>
      </div>
    </div>
  );
}
