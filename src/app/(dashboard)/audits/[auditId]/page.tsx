"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCents } from "@/lib/money/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RuleBadge, StatusBadge } from "@/components/audit/flag-badge";
import { FlagDetailModal } from "@/components/audit/flag-detail-modal";
import { FEE_CATEGORY_LABELS, StandardFeeCategory } from "@/types/audit";

export default function AuditDetailPage({
  params,
}: {
  params: { auditId: string };
}) {
  const router = useRouter();
  const { auditId } = params;

  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const loadAudit = async () => {
    try {
      const res = await fetch(`/api/audits/${auditId}`);
      if (!res.ok) throw new Error("Failed to load invoice audit");
      const data = await res.json();
      setInvoice(data.invoice);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, [auditId]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-[#777268]">
        Evaluating deterministic audit assertions...
      </div>
    );
  }

  if (errorMsg || !invoice) {
    return (
      <div className="p-6 bg-[#fdf8f8] border border-[#f1c2c2] text-[#8f2020] rounded text-xs font-mono">
        {errorMsg || "Audit record not found."}
      </div>
    );
  }

  const handleFlagUpdated = (updatedFlag: any, newConfirmedTotal: number) => {
    setInvoice((prev: any) => ({
      ...prev,
      confirmedDiscrepancyCents: newConfirmedTotal,
      flags: prev.flags.map((f: any) => (f.id === updatedFlag.id ? { ...f, ...updatedFlag } : f)),
    }));
  };

  const handleDownloadPdf = async () => {
    setPdfError(null);
    try {
      const res = await fetch(`/api/audits/${auditId}/export-pdf`);
      if (!res.ok) {
        const json = await res.json();
        setPdfError(json.error || "Failed to download PDF dispute statement.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dispute-claim-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setPdfError(err.message);
    }
  };

  const filteredFlags =
    statusFilter === "ALL"
      ? invoice.flags
      : invoice.flags.filter((f: any) => f.status === statusFilter);

  const awaitingCount = invoice.flags.filter((f: any) => f.status === "AWAITING_CLARIFICATION").length;
  const confirmedCount = invoice.flags.filter((f: any) => f.status === "CONFIRMED").length;
  const dismissedCount = invoice.flags.filter((f: any) => f.status === "DISMISSED").length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs font-mono text-[#777268]">
        <Link href="/audits" className="hover:underline">
          Audits
        </Link>
        <span>/</span>
        <span className="text-[#121210] font-medium">{invoice.invoiceNumber}</span>
      </div>

      {/* Top Header & CTAs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCD5C8] pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-serif font-bold text-[#121210] tracking-tight">
              Audit Statement: {invoice.invoiceNumber}
            </h1>
            <Badge variant="ink">{invoice.provider.name}</Badge>
            {invoice.isDevMode && (
              <span className="text-[10px] font-mono font-bold uppercase bg-[#121210] text-[#E0BC68] px-2 py-0.5 rounded border border-[#B8892D]">
                Dev Sandbox Audit
              </span>
            )}
          </div>
          <p className="text-xs text-[#777268] mt-1 font-mono">
            Rate Card: <strong className="text-[#121210] font-sans">{invoice.rateCard?.name || "Contracted Schedule"}</strong> • Service Period: {new Date(invoice.billingPeriodStart).toLocaleDateString()} to {new Date(invoice.billingPeriodEnd).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <a
            href={`/api/audits/${auditId}/export-csv`}
            download
            className="px-3.5 py-2 text-xs font-medium text-[#121210] bg-[#F3F0E8] hover:bg-[#e9e4d8] border border-[#DCD5C8] rounded transition font-mono"
          >
            Export Dispute CSV
          </a>
          <Button
            variant="gold"
            size="sm"
            onClick={handleDownloadPdf}
            className="font-mono text-xs"
          >
            Generate PDF Dispute Claim
          </Button>
        </div>
      </div>

      {pdfError && (
        <div className="p-3 bg-[#F3F0E8] border border-[#DCD5C8] text-xs text-[#777268] rounded flex items-center justify-between">
          <span className="font-mono">{pdfError}</span>
          <Link href="/settings/billing" className="font-bold underline text-[#B8892D] ml-2">
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#FBFAF6]">
          <CardContent className="p-5">
            <p className="text-[11px] font-mono font-medium text-[#777268] uppercase">Total Invoice Billed</p>
            <p className="text-2xl font-mono font-bold text-[#121210] mt-1">
              {formatCents(invoice.totalBilledCents)}
            </p>
            <p className="text-[11px] font-mono text-[#777268] mt-1">
              Across {invoice.totalLines} row items
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#F3F0E8] border-[#DCD5C8]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono font-semibold text-[#B8892D] uppercase">Potential Discrepancy</p>
              <span className="text-[10px] font-mono bg-[#E0BC68]/20 text-[#B8892D] font-bold px-1.5 py-0.5 rounded border border-[#E0BC68]/40">
                Unconfirmed
              </span>
            </div>
            <p className="text-2xl font-mono font-bold text-[#B8892D] mt-1">
              +{formatCents(invoice.potentialDiscrepancyCents)}
            </p>
            <p className="text-[11px] font-mono text-[#777268] mt-1">
              {invoice.flags.length} flagged charges awaiting clarification
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#fdf8f8] border-[#f1c2c2]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono font-semibold text-[#8f2020] uppercase">Confirmed Overcharge</p>
              <span className="text-[10px] font-mono bg-[#fdf2f2] text-[#8f2020] font-bold px-1.5 py-0.5 rounded border border-[#f1c2c2]">
                Verified
              </span>
            </div>
            <p className="text-2xl font-mono font-bold text-[#8f2020] mt-1">
              {formatCents(invoice.confirmedDiscrepancyCents)}
            </p>
            <p className="text-[11px] font-mono text-[#777268] mt-1">
              {confirmedCount} item(s) confirmed for credit memo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 border-b border-[#DCD5C8] pb-2 text-xs font-mono">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1.5 rounded transition ${
            statusFilter === "ALL"
              ? "bg-[#121210] text-[#FBFAF6] font-semibold"
              : "text-[#777268] hover:bg-[#F3F0E8]"
          }`}
        >
          All Flags ({invoice.flags.length})
        </button>
        <button
          onClick={() => setStatusFilter("AWAITING_CLARIFICATION")}
          className={`px-3 py-1.5 rounded transition ${
            statusFilter === "AWAITING_CLARIFICATION"
              ? "bg-[#F3F0E8] text-[#B8892D] border border-[#E0BC68] font-semibold"
              : "text-[#777268] hover:bg-[#F3F0E8]"
          }`}
        >
          Awaiting Clarification ({awaitingCount})
        </button>
        <button
          onClick={() => setStatusFilter("CONFIRMED")}
          className={`px-3 py-1.5 rounded transition ${
            statusFilter === "CONFIRMED"
              ? "bg-[#fdf2f2] text-[#8f2020] border border-[#f1c2c2] font-semibold"
              : "text-[#777268] hover:bg-[#F3F0E8]"
          }`}
        >
          Confirmed ({confirmedCount})
        </button>
        <button
          onClick={() => setStatusFilter("DISMISSED")}
          className={`px-3 py-1.5 rounded transition ${
            statusFilter === "DISMISSED"
              ? "bg-[#252522] text-[#FBFAF6] font-semibold"
              : "text-[#777268] hover:bg-[#F3F0E8]"
          }`}
        >
          Dismissed ({dismissedCount})
        </button>
      </div>

      {/* Table of Flagged Lines */}
      <Card>
        <CardContent className="p-0">
          {filteredFlags.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
                <thead className="bg-[#F3F0E8]">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-mono font-medium text-[#777268]">Row / Ref</th>
                    <th className="px-4 py-2.5 text-left font-mono font-medium text-[#777268]">Category</th>
                    <th className="px-4 py-2.5 text-left font-mono font-medium text-[#777268]">Rule Triggered</th>
                    <th className="px-4 py-2.5 text-right font-mono font-medium text-[#777268]">Contract Rate</th>
                    <th className="px-4 py-2.5 text-right font-mono font-medium text-[#777268]">Billed</th>
                    <th className="px-4 py-2.5 text-right font-mono font-medium text-[#777268]">Variance</th>
                    <th className="px-4 py-2.5 text-center font-mono font-medium text-[#777268]">Status</th>
                    <th className="px-4 py-2.5 text-right font-mono font-medium text-[#777268]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCD5C8]/60 bg-white">
                  {filteredFlags.map((flag: any) => (
                    <tr key={flag.id} className="hover:bg-[#FBFAF6]">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-[#121210]">
                          #{flag.invoiceLine.lineNumber}
                        </div>
                        <div className="font-mono text-[#777268] text-[11px]">
                          {flag.invoiceLine.orderReference || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#121210]">
                          {FEE_CATEGORY_LABELS[flag.invoiceLine.matchedCategory as StandardFeeCategory] ||
                            flag.invoiceLine.rawCategory}
                        </div>
                        <div className="text-[11px] text-[#777268] truncate max-w-[200px] font-mono">
                          {flag.invoiceLine.rawCategory}
                        </div>
                        {(flag.invoiceLine.billedWeight != null || flag.invoiceLine.carrier) && (
                          <div className="text-[10px] font-mono text-[#B8892D] mt-0.5">
                            {flag.invoiceLine.billedWeight != null && `${flag.invoiceLine.billedWeight} ${flag.invoiceLine.weightUnit || "LB"}`}
                            {flag.invoiceLine.carrier && ` • ${flag.invoiceLine.carrier}`}
                            {flag.invoiceLine.zone && ` (${flag.invoiceLine.zone})`}
                          </div>
                        )}
                        {flag.invoiceLine.customFields && (() => {
                          let cf: Record<string, any> = {};
                          try {
                            cf =
                              typeof flag.invoiceLine.customFields === "string"
                                ? JSON.parse(flag.invoiceLine.customFields)
                                : flag.invoiceLine.customFields;
                          } catch {}
                          if (Object.keys(cf).length === 0) return null;
                          return (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(cf).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#F3F0E8] text-[#121210] border border-[#DCD5C8]"
                                  title={`${k}: ${String(v)}`}
                                >
                                  {k}: {String(v)}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <RuleBadge ruleType={flag.ruleType} />
                      </td>
                      <td className="px-4 py-3 text-right text-[#777268] font-mono">
                        {flag.expectedRateCents !== null ? formatCents(flag.expectedRateCents) : "Uncontracted"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#121210] font-mono">
                        {formatCents(flag.billedTotalCents)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#B8892D] font-mono">
                        +{formatCents(flag.differenceCents)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={flag.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFlag(flag);
                            setIsModalOpen(true);
                          }}
                          className="font-mono text-[11px] text-[#121210] px-2.5 py-1 rounded bg-[#F3F0E8] hover:bg-[#e9e4d8] border border-[#DCD5C8] transition"
                        >
                          Triage &amp; Notes →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-[#777268]">
              No flags match the selected status filter.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flag Detail & Triage Modal */}
      {selectedFlag && (
        <FlagDetailModal
          flag={selectedFlag}
          auditId={auditId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdated={handleFlagUpdated}
        />
      )}
    </div>
  );
}
