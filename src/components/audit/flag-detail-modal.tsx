"use client";

import React, { useState } from "react";
import { formatCents } from "@/lib/money/currency";
import { Button } from "@/components/ui/button";
import { RuleBadge } from "./flag-badge";

interface FlagDetailModalProps {
  flag: any;
  auditId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedFlag: any, newConfirmedTotal: number) => void;
}

export function FlagDetailModal({
  flag,
  auditId,
  isOpen,
  onClose,
  onUpdated,
}: FlagDetailModalProps) {
  const [status, setStatus] = useState<string>(flag.status);
  const [userNote, setUserNote] = useState<string>(flag.userNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !flag) return null;

  const rawData =
    typeof flag.invoiceLine?.rawData === "string"
      ? JSON.parse(flag.invoiceLine.rawData || "{}")
      : flag.invoiceLine?.rawData || {};

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/audits/${auditId}/flags/${flag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, userNote }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update flag");
      }

      const data = await res.json();
      onUpdated(data.flag, data.confirmedDiscrepancyCents);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090908]/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FBFAF6] rounded border border-[#DCD5C8] w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#DCD5C8] bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-base font-serif font-bold text-[#121210]">
              Discrepancy Analysis • Row #{flag.invoiceLine?.lineNumber}
            </h3>
            <RuleBadge ruleType={flag.ruleType} />
          </div>
          <button
            onClick={onClose}
            className="text-[#777268] hover:text-[#121210] p-1 font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Summary Box */}
          <div className="bg-[#F3F0E8] border border-[#DCD5C8] rounded p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[11px] font-mono text-[#777268] uppercase">Contracted Amount</p>
              <p className="text-sm font-mono font-bold text-[#121210] mt-1">
                {flag.expectedTotalCents !== null ? formatCents(flag.expectedTotalCents) : "Uncontracted"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[#777268] uppercase">Billed Amount</p>
              <p className="text-sm font-mono font-bold text-[#121210] mt-1">
                {formatCents(flag.billedTotalCents)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[#B8892D] uppercase font-bold">Calculated Variance</p>
              <p className="text-base font-mono font-bold text-[#B8892D] mt-1">
                +{formatCents(flag.differenceCents)}
              </p>
            </div>
          </div>

          {/* Custom Fields & Logistics Parameters */}
          {(() => {
            let cf: Record<string, any> = {};
            if (flag.invoiceLine?.customFields) {
              try {
                cf =
                  typeof flag.invoiceLine.customFields === "string"
                    ? JSON.parse(flag.invoiceLine.customFields)
                    : flag.invoiceLine.customFields;
              } catch {}
            }

            const hasWeight = flag.invoiceLine?.billedWeight != null;
            const hasCarrier = Boolean(flag.invoiceLine?.carrier);
            const hasZone = Boolean(flag.invoiceLine?.zone);
            const hasCustom = Object.keys(cf).length > 0;

            if (!hasWeight && !hasCarrier && !hasZone && !hasCustom) return null;

            return (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#777268]">
                    Custom Fields &amp; Logistics Attributes
                  </h4>
                  <span className="text-[10px] font-mono text-[#B8892D]">
                    Unrestricted Parameters
                  </span>
                </div>
                <div className="p-3 bg-[#FBFAF6] border border-[#DCD5C8] rounded grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  {hasWeight && (
                    <div className="p-2 rounded bg-white border border-[#DCD5C8]/80">
                      <div className="text-[10px] text-[#777268] uppercase">Billed Weight</div>
                      <div className="font-bold text-[#121210]">
                        {flag.invoiceLine.billedWeight} {flag.invoiceLine.weightUnit || "LB"}
                      </div>
                    </div>
                  )}
                  {hasCarrier && (
                    <div className="p-2 rounded bg-white border border-[#DCD5C8]/80">
                      <div className="text-[10px] text-[#777268] uppercase">Carrier / Shipper</div>
                      <div className="font-bold text-[#121210]">
                        {flag.invoiceLine.carrier}
                      </div>
                    </div>
                  )}
                  {hasZone && (
                    <div className="p-2 rounded bg-white border border-[#DCD5C8]/80">
                      <div className="text-[10px] text-[#777268] uppercase">Zone / Region</div>
                      <div className="font-bold text-[#121210]">
                        {flag.invoiceLine.zone}
                      </div>
                    </div>
                  )}
                  {Object.entries(cf).map(([k, v]) => (
                    <div key={k} className="p-2 rounded bg-white border border-[#DCD5C8]/80">
                      <div className="text-[10px] text-[#777268] uppercase">{k}</div>
                      <div className="font-bold text-[#121210] truncate" title={String(v)}>
                        {String(v)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Mathematical Breakdown */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#777268]">
              Mathematical Calculation &amp; Rule Assertion
            </h4>
            <div className="p-3 bg-white border border-[#DCD5C8] rounded font-mono text-[11px] text-[#121210] leading-relaxed">
              {flag.calculationBreakdown}
            </div>
          </div>

          {/* Raw CSV Metadata */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#777268]">
              Original Row Metadata (CSV Audit Trail)
            </h4>
            <div className="p-3 bg-[#121210] text-[#FBFAF6] rounded font-mono text-[11px] overflow-x-auto max-h-32 border border-[#090908]">
              {Object.keys(rawData).length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(rawData).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-[#777268] min-w-[140px] select-none">{k}:</span>
                      <span className="text-[#E0BC68]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#777268] italic">No metadata available.</p>
              )}
            </div>
          </div>

          {/* Status & Dispute Notes */}
          <div className="space-y-3 pt-3 border-t border-[#DCD5C8]">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#777268] uppercase mb-1">
                Discrepancy Triage Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded border border-[#DCD5C8] bg-white px-3 py-2 text-xs font-mono text-[#121210] focus:border-[#B8892D] focus:outline-none focus:ring-1 focus:ring-[#B8892D]"
              >
                <option value="AWAITING_CLARIFICATION">Awaiting Warehouse Clarification</option>
                <option value="CONFIRMED">Confirmed Warehouse Overcharge</option>
                <option value="DISMISSED">Dismissed / Authorized Exception</option>
              </select>
              <p className="text-[11px] text-[#777268] mt-1 font-mono">
                Item remains categorized as &quot;Potential Discrepancy&quot; until marked Confirmed.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#777268] uppercase mb-1">
                Internal Dispute Note (for warehouse billing contact)
              </label>
              <textarea
                rows={3}
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="e.g. Rate card amendment from June 1st was not applied. Requested credit memo #402."
                className="w-full rounded border border-[#DCD5C8] bg-white p-2.5 text-xs text-[#121210] focus:border-[#B8892D] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
              />
            </div>

            {errorMsg && <p className="text-xs text-[#8f2020]">{errorMsg}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F3F0E8] border-t border-[#DCD5C8] flex items-center justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
