"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BillingPage() {
  const [subData, setSubData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadSubscription = async () => {
    try {
      const res = await fetch("/api/workspace");
      if (res.ok) {
        const data = await res.json();
        setSubData(data.subscription);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      setMsg(err.message);
      setIsUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Confirm cancellation of Pro plan at the end of the current billing cycle?")) {
      return;
    }

    setIsCancelling(true);
    setMsg(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed");

      setMsg("Subscription scheduled to terminate at period end.");
      loadSubscription();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-xs font-mono text-[#777268]">Loading subscription telemetry...</div>;
  }

  const isPro = subData?.tier === "PRO";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#DCD5C8] pb-4">
        <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider">
          Commerce &amp; Licensing
        </span>
        <h1 className="text-2xl font-serif font-bold text-[#121210] tracking-tight mt-0.5">
          Subscription &amp; Quotas
        </h1>
      </div>

      {msg && (
        <div className="p-3 bg-[#F3F0E8] border border-[#DCD5C8] text-xs font-mono text-[#121210] rounded">
          {msg}
        </div>
      )}

      {/* Plan Card */}
      <Card className="bg-[#FBFAF6]">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#DCD5C8]">
          <div>
            <div className="flex items-center space-x-3">
              <CardTitle className="font-serif">Active License: {subData?.tier || "FREE"}</CardTitle>
              <Badge variant={isPro ? "gold" : "neutral"}>
                {subData?.status || "ACTIVE"}
              </Badge>
            </div>
            <CardDescription className="font-mono mt-1 text-[11px]">
              Merchant of Record: Lemon Squeezy Payments Inc.
            </CardDescription>
          </div>
          {isPro && (
            <div className="text-right">
              <span className="text-xl font-mono font-bold text-[#121210]">$49.00</span>
              <span className="text-xs text-[#777268]"> / month</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded bg-[#F3F0E8] border border-[#DCD5C8] text-xs font-mono">
            <div>
              <span className="text-[#777268] text-[11px] uppercase">Audit Runs / Month:</span>
              <p className="font-bold text-[#121210] mt-0.5">
                {subData?.limits?.maxAuditsPerMonth > 100
                  ? "Unlimited"
                  : `${subData?.limits?.maxAuditsPerMonth} audit`}
              </p>
            </div>
            <div>
              <span className="text-[#777268] text-[11px] uppercase">Row Ceiling / Run:</span>
              <p className="font-bold text-[#121210] mt-0.5">
                {subData?.limits?.maxRowsPerAudit?.toLocaleString()} lines
              </p>
            </div>
            <div>
              <span className="text-[#777268] text-[11px] uppercase">PDF Dispute Export:</span>
              <p className="font-bold text-[#121210] mt-0.5">
                {subData?.limits?.allowPdfExport ? "Enabled (Pro)" : "Locked (Free)"}
              </p>
            </div>
          </div>

          {subData?.currentPeriodEnd && (
            <p className="text-xs font-mono text-[#777268]">
              Subscribed term renewal:{" "}
              <strong className="text-[#121210]">{new Date(subData.currentPeriodEnd).toLocaleDateString()}</strong>
            </p>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-[#DCD5C8] bg-[#F3F0E8]/40">
          {!isPro ? (
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-[#777268]">
                Upgrade to Pro for high-volume recurring audits and PDF dispute generation.
              </p>
              <Button
                variant="gold"
                onClick={handleUpgrade}
                isLoading={isUpgrading}
              >
                Upgrade to Pro ($49/mo)
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <a
                href={subData?.portalUrl || "https://app.lemonsqueezy.com/my-orders"}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono font-semibold text-[#B8892D] hover:underline"
              >
                Lemon Squeezy Billing Portal ↗
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSubscription}
                isLoading={isCancelling}
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
