"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Papa from "papaparse";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ColumnMapper } from "@/components/audit/column-mapper";
import { ColumnMappingConfig } from "@/types/audit";
import {
  getSampleInvoiceCsvContent,
  getEnterpriseSampleInvoiceCsvContent,
} from "@/lib/audit/normalizer";

interface ProviderWithCards {
  id: string;
  name: string;
  currency: string;
  rateCards: Array<{
    id: string;
    name: string;
    effectiveFrom: string;
    effectiveTo: string | null;
  }>;
}

export default function NewAuditPage() {
  const router = useRouter();

  const [providers, setProviders] = useState<ProviderWithCards[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [selectedRateCardId, setSelectedRateCardId] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("INV-2026-08");
  const [invoiceDate, setInvoiceDate] = useState("2026-08-31");
  const [periodStart, setPeriodStart] = useState("2026-08-01");
  const [periodEnd, setPeriodEnd] = useState("2026-08-31");

  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [step, setStep] = useState<"upload" | "map" | "error">("upload");

  const [isDevMode, setIsDevMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Array<{ row: number; field: string; message: string }>>([]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [provRes, devRes] = await Promise.all([
          fetch("/api/providers"),
          fetch("/api/workspace/dev-mode"),
        ]);

        if (devRes.ok) {
          const devData = await devRes.json();
          setIsDevMode(Boolean(devData.devModeEnabled));
        }

        if (provRes.ok) {
          const data = await provRes.json();
          setProviders(data.providers || []);
          if (data.providers?.length > 0) {
            setSelectedProviderId(data.providers[0].id);
            if (data.providers[0].rateCards?.length > 0) {
              setSelectedRateCardId(data.providers[0].rateCards[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load providers / dev mode:", err);
      }
    }
    loadInitialData();
  }, []);

  const handleProviderChange = (providerId: string) => {
    setSelectedProviderId(providerId);
    const p = providers.find((prov) => prov.id === providerId);
    if (p && p.rateCards.length > 0) {
      setSelectedRateCardId(p.rateCards[0].id);
    } else {
      setSelectedRateCardId("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      setGeneralError("File size exceeds 5MB limit. Please upload a smaller CSV or split the file.");
      return;
    }

    setFile(selected);
    setGeneralError(null);

    Papa.parse(selected, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setGeneralError("CSV file contains no data rows.");
          return;
        }

        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        setRawRows(results.data as Record<string, string>[]);
        setStep("map");
      },
      error: (err) => {
        setGeneralError("Failed to parse CSV: " + err.message);
      },
    });
  };

  const handleDownloadSample = () => {
    const content = getSampleInvoiceCsvContent();
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample-3pl-invoice.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadSampleData = () => {
    const content = getSampleInvoiceCsvContent();
    const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
    setCsvHeaders(parsed.meta.fields || []);
    setRawRows(parsed.data as Record<string, string>[]);
    setFile(new File([content], "sample-3pl-invoice.csv", { type: "text/csv" }));
    setStep("map");
  };

  const handleLoadEnterpriseSampleData = () => {
    const content = getEnterpriseSampleInvoiceCsvContent();
    const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
    setCsvHeaders(parsed.meta.fields || []);
    setRawRows(parsed.data as Record<string, string>[]);
    setFile(new File([content], "rdxsports-enterprise-tiered-invoice.csv", { type: "text/csv" }));
    setStep("map");
  };

  const handleExecuteAudit = async (mapping: ColumnMappingConfig) => {
    setIsLoading(true);
    setGeneralError(null);
    setValidationErrors([]);

    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: selectedProviderId,
          rateCardId: selectedRateCardId,
          invoiceNumber,
          invoiceDate,
          billingPeriodStart: periodStart,
          billingPeriodEnd: periodEnd,
          fileName: file?.name || "sample-3pl-invoice.csv",
          fileSize: file?.size || 1024,
          rawRows,
          mapping,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.validationErrors) {
          setValidationErrors(data.validationErrors);
          setStep("error");
          return;
        }
        throw new Error(data.error || "Failed to audit invoice");
      }

      router.push(`/audits/${data.auditId}`);
      router.refresh();
    } catch (err: any) {
      setGeneralError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const currentProvider = providers.find((p) => p.id === selectedProviderId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-xs font-mono text-[#777268]">
        <Link href="/audits" className="hover:underline">
          Audits
        </Link>
        <span>/</span>
        <span className="text-[#121210] font-medium">New CSV Audit</span>
      </div>

      <div className="border-b border-[#DCD5C8] pb-4">
        <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider">
          Ingestion Workflow
        </span>
        <h1 className="text-2xl font-serif font-bold text-[#121210] tracking-tight mt-0.5">
          Upload &amp; Audit Warehouse Invoice
        </h1>
      </div>

      {isDevMode && (
        <div className="p-3.5 bg-[#121210] border border-[#B8892D] rounded text-xs font-mono text-[#FBFAF6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E0BC68] animate-pulse" />
            <div>
              <span className="text-[#E0BC68] font-bold uppercase tracking-wider">
                Dev Sandbox Mode Active
              </span>
              <p className="text-[11px] text-[#DCD5C8] font-sans mt-0.5">
                Subscription line limits bypassed. Extended custom attributes (SKU, PO, Dims) &amp; rate telemetry enabled.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLoadEnterpriseSampleData}
            className="px-3 py-1.5 bg-[#B8892D] text-[#090908] rounded text-xs font-mono font-bold hover:bg-[#a67a26] transition whitespace-nowrap"
          >
            ⚡ Load RDX Sports Enterprise CSV
          </button>
        </div>
      )}

      {generalError && (
        <div className="p-4 rounded bg-[#fdf8f8] border border-[#f1c2c2] text-xs font-mono text-[#8f2020]">
          <p className="font-bold">Audit Error</p>
          <p className="mt-0.5">{generalError}</p>
        </div>
      )}

      {step === "error" && (
        <Card className="border-[#f1c2c2]">
          <CardHeader className="bg-[#fdf8f8] border-b border-[#f1c2c2]">
            <CardTitle className="text-base text-[#8f2020] font-mono">
              CSV Validation Errors ({validationErrors.length})
            </CardTitle>
            <CardDescription className="text-[#8f2020]">
              Please address the row discrepancies in your spreadsheet before continuing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="max-h-60 overflow-y-auto border border-[#f1c2c2] rounded bg-white">
              <table className="min-w-full divide-y divide-[#f1c2c2] text-xs font-mono">
                <thead className="bg-[#fdf8f8]">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-[#8f2020]">Row</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#8f2020]">Field</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#8f2020]">Issue Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1c2c2]/60 bg-white">
                  {validationErrors.map((err, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 font-bold text-[#121210]">#{err.row}</td>
                      <td className="px-4 py-2 text-[#8f2020]">{err.field}</td>
                      <td className="px-4 py-2 text-[#777268]">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setStep("map")}>
                ← Back to Column Mapping
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "upload" && (
        <Card className="bg-[#FBFAF6]">
          <CardHeader className="border-b border-[#DCD5C8]">
            <CardTitle className="font-serif">Contract Correlation</CardTitle>
            <CardDescription>
              Select the 3PL provider and the active contracted rate schedule to audit against.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-5">
            {providers.length === 0 ? (
              <div className="p-6 rounded bg-[#F3F0E8] border border-[#DCD5C8] text-center space-y-3">
                <p className="text-xs font-mono text-[#777268]">
                  No 3PL warehouse providers configured.
                </p>
                <Link
                  href="/providers/new"
                  className="inline-flex px-4 py-2 text-xs font-semibold text-[#090908] bg-[#B8892D] hover:bg-[#a67a26] rounded transition"
                >
                  Create 3PL Provider &amp; Rate Card First
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="3PL Warehouse Provider *"
                    value={selectedProviderId}
                    onChange={(e) => handleProviderChange(e.target.value)}
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.currency})
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Contracted Rate Card Schedule *"
                    value={selectedRateCardId}
                    onChange={(e) => setSelectedRateCardId(e.target.value)}
                  >
                    {currentProvider?.rateCards && currentProvider.rateCards.length > 0 ? (
                      currentProvider.rateCards.map((rc) => (
                        <option key={rc.id} value={rc.id}>
                          {rc.name} (from {new Date(rc.effectiveFrom).toLocaleDateString()})
                        </option>
                      ))
                    ) : (
                      <option value="">No rate cards found for this provider</option>
                    )}
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Invoice Number *"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-2026-08"
                  />
                  <Input
                    label="Billing Period Start"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                  <Input
                    label="Billing Period End"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>

                {/* CSV File Input */}
                <div className="space-y-3 pt-4 border-t border-[#DCD5C8]">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono font-semibold text-[#777268] uppercase">
                      Upload Warehouse CSV Statement (Max 5MB)
                    </label>
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={handleDownloadSample}
                        className="text-[#B8892D] hover:underline"
                      >
                        Download Sample CSV
                      </button>
                      <span className="text-[#DCD5C8]">|</span>
                      <button
                        type="button"
                        onClick={handleLoadSampleData}
                        className="text-[#B8892D] hover:underline"
                      >
                        Load Standard Sample
                      </button>
                      <span className="text-[#DCD5C8]">|</span>
                      <button
                        type="button"
                        onClick={handleLoadEnterpriseSampleData}
                        className="text-[#090908] bg-[#E0BC68] hover:bg-[#d6af57] px-2 py-0.5 rounded font-semibold"
                        title="Load RDX Sports Enterprise dataset with Tiered Weights (oz/lbs/kg) & Custom Columns (SKU, PO, Dimensions)"
                      >
                        ⚡ Load Enterprise Tiered Dataset (RDX Sports)
                      </button>
                    </div>
                  </div>

                  <div className="border border-dashed border-[#DCD5C8] rounded p-8 text-center bg-[#F3F0E8]/50 hover:bg-[#F3F0E8] transition">
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-file-input"
                    />
                    <label
                      htmlFor="csv-file-input"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-8 h-8 rounded bg-[#121210] text-[#FBFAF6] flex items-center justify-center font-mono text-xs font-bold">
                        CSV
                      </div>
                      <span className="text-xs font-semibold text-[#121210]">
                        Select warehouse CSV billing statement
                      </span>
                      <span className="text-[11px] font-mono text-[#777268]">
                        Compatible with ShipBob, Red Stag, DCL, Quiet Logistics, and custom formats
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step === "map" && (
        <ColumnMapper
          headers={csvHeaders}
          previewRows={rawRows.slice(0, 4)}
          onConfirm={handleExecuteAudit}
          onCancel={() => setStep("upload")}
          isLoading={isLoading}
          isDevMode={isDevMode}
        />
      )}
    </div>
  );
}
