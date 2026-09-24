"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, workspaceName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
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
          Create your workspace
        </h2>
        <p className="mt-1 text-xs text-[#777268]">
          Start auditing warehouse fulfillment bills against signed rate cards
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded bg-[#fdf8f8] border border-[#f1c2c2] text-xs font-mono text-[#8f2020]">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
        />

        <Input
          label="Brand / Company Name"
          type="text"
          required
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          placeholder="Apex Apparel Co."
          helperText="Used to isolate your 3PL rate cards and invoices"
        />

        <Input
          label="Work Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@apexapparel.com"
        />

        <Input
          label="Password (min 8 characters)"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Create Workspace &amp; Start
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-[#DCD5C8] text-xs text-[#777268]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#B8892D] hover:text-[#090908] underline underline-offset-2">
          Sign In
        </Link>
      </div>
    </div>
  );
}
