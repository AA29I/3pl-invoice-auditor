"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function NewProviderPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contactEmail, currency }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create provider");

      router.push(`/providers/${data.provider.id}/rate-cards/new`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-xs font-mono text-[#777268]">
        <Link href="/providers" className="hover:underline">
          Providers
        </Link>
        <span>/</span>
        <span className="text-[#121210] font-medium">Add New 3PL</span>
      </div>

      <Card className="bg-[#FBFAF6]">
        <CardHeader className="border-b border-[#DCD5C8]">
          <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider">
            Vendor Record
          </span>
          <CardTitle className="font-serif">Add 3PL Warehouse Provider</CardTitle>
          <CardDescription>
            Specify your fulfillment vendor details. You will configure contracted rate schedules in the following step.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          {errorMessage && (
            <div className="p-3 mb-4 rounded bg-[#fdf8f8] border border-[#f1c2c2] text-xs font-mono text-[#8f2020]">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Provider Name *"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ShipBob, Red Stag, Quiet Logistics"
            />

            <Input
              label="Billing Contact Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="billing@3plwarehouse.com"
              helperText="Referenced on dispute claim sheets and credit memo requests"
            />

            <Select
              label="Commercial Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="CAD">CAD ($) - Canadian Dollar</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="AUD">AUD ($) - Australian Dollar</option>
            </Select>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#DCD5C8]">
              <Link href="/providers">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="gold" isLoading={isLoading}>
                Save &amp; Add Rate Card →
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
