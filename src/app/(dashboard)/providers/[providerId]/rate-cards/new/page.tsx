"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StandardFeeCategory, WeightUnit } from "@/types/audit";

interface FlatFeeRow {
  category: StandardFeeCategory;
  description: string;
  unitType: string;
  rateDollars: string;
}

interface TieredWeightRow {
  shipper: string;
  serviceLevel: string;
  weightUnit: WeightUnit;
  minWeight: string;
  maxWeight: string;
  zone: string;
  rateDollars: string;
  incrementalRateDollars: string;
  incrementalWeightStep: string;
  description: string;
}

interface CustomSurchargeRow {
  category: StandardFeeCategory;
  description: string;
  unitType: string;
  rateDollars: string;
  notes: string;
}

interface CustomOptionEntry {
  key: string;
  value: string;
  notes: string;
}

const DEFAULT_FLAT_FEES: FlatFeeRow[] = [
  {
    category: "BASE_PICK_PACK",
    description: "Base Pick & Pack (Order Fee)",
    unitType: "order",
    rateDollars: "2.85",
  },
  {
    category: "ADDITIONAL_ITEM",
    description: "Additional Item Pick Fee",
    unitType: "item",
    rateDollars: "0.65",
  },
  {
    category: "STORAGE_PALLET",
    description: "Pallet Storage (Monthly)",
    unitType: "pallet/month",
    rateDollars: "22.00",
  },
  {
    category: "STORAGE_BIN",
    description: "Bin Storage (Monthly)",
    unitType: "bin/month",
    rateDollars: "3.50",
  },
  {
    category: "RECEIVING_CARTON",
    description: "Inbound Receiving - Standard Carton",
    unitType: "carton",
    rateDollars: "3.00",
  },
  {
    category: "RECEIVING_PALLET",
    description: "Inbound Receiving - Pallet Putaway",
    unitType: "pallet",
    rateDollars: "18.00",
  },
  {
    category: "RETURN_PROCESSING",
    description: "Customer Return Inspection & Restock",
    unitType: "return",
    rateDollars: "4.50",
  },
  {
    category: "ACCOUNT_MANAGEMENT",
    description: "Monthly Warehouse Platform / Tech Fee",
    unitType: "month",
    rateDollars: "250.00",
  },
];

const RDX_SPORTS_METRIC_TIERS: TieredWeightRow[] = [
  {
    shipper: "Royal Mail",
    serviceLevel: "Tracked 48",
    weightUnit: "KG",
    minWeight: "0.0",
    maxWeight: "1.0",
    zone: "UK Mainland",
    rateDollars: "3.50",
    incrementalRateDollars: "",
    incrementalWeightStep: "",
    description: "Royal Mail Tracked 48 (0 - 1 kg)",
  },
  {
    shipper: "Royal Mail",
    serviceLevel: "Tracked 48",
    weightUnit: "KG",
    minWeight: "1.01",
    maxWeight: "2.0",
    zone: "UK Mainland",
    rateDollars: "5.10",
    incrementalRateDollars: "",
    incrementalWeightStep: "",
    description: "Royal Mail Tracked 48 (1 - 2 kg)",
  },
  {
    shipper: "DPD",
    serviceLevel: "Standard Next Day",
    weightUnit: "KG",
    minWeight: "2.01",
    maxWeight: "5.0",
    zone: "UK Mainland",
    rateDollars: "7.80",
    incrementalRateDollars: "",
    incrementalWeightStep: "",
    description: "DPD Parcel (2 - 5 kg)",
  },
  {
    shipper: "DPD",
    serviceLevel: "Standard Next Day",
    weightUnit: "KG",
    minWeight: "5.01",
    maxWeight: "15.0",
    zone: "UK Mainland",
    rateDollars: "12.50",
    incrementalRateDollars: "",
    incrementalWeightStep: "",
    description: "DPD Medium Freight (5 - 15 kg)",
  },
  {
    shipper: "DPD",
    serviceLevel: "Heavy Freight",
    weightUnit: "KG",
    minWeight: "15.01",
    maxWeight: "30.0",
    zone: "UK Mainland",
    rateDollars: "24.00",
    incrementalRateDollars: "0.85",
    incrementalWeightStep: "1.0",
    description: "DPD Heavy Freight / Punch Bags (15 - 30 kg, +$0.85/kg over 30kg)",
  },
];

const US_PARCEL_TIERS: TieredWeightRow[] = [
  {
    shipper: "USPS",
    serviceLevel: "Ground Advantage",
    weightUnit: "OZ",
    minWeight: "0.0",
    maxWeight: "8.0",
    zone: "Zone 1-4",
    rateDollars: "3.80",
    incrementalRateDollars: "",
    incrementalWeightStep: "",
    description: "USPS Ground (0 - 8 oz)",
  },
  {
    shipper: "USPS",
    serviceLevel: "Ground Advantage",
    weightUnit: "OZ",
    minWeight: "8.01",
    maxWeight: "15.9",
    zone: "Zone 1-4",
    rateDollars: "4.65",
    incrementalRateDollars: "",
    incrementalWeightStep: "",
    description: "USPS Ground (8 - 16 oz)",
  },
  {
    shipper: "FedEx",
    serviceLevel: "Ground",
    weightUnit: "LB",
    minWeight: "1.0",
    maxWeight: "3.0",
    zone: "All Zones",
    rateDollars: "6.80",
    incrementalRateDollars: "",
    incrementalWeightStep: "",
    description: "FedEx Ground (1 - 3 lbs)",
  },
  {
    shipper: "FedEx",
    serviceLevel: "Ground",
    weightUnit: "LB",
    minWeight: "3.01",
    maxWeight: "10.0",
    zone: "All Zones",
    rateDollars: "11.20",
    incrementalRateDollars: "0.60",
    incrementalWeightStep: "1.0",
    description: "FedEx Ground (3 - 10 lbs, +$0.60/lb over 10 lbs)",
  },
];

export default function NewRateCardPage({
  params,
}: {
  params: { providerId: string };
}) {
  const router = useRouter();
  const { providerId } = params;

  // Header Details
  const [name, setName] = useState("2026 Master Fulfillment & Tiered Shipping Schedule");
  const [effectiveFrom, setEffectiveFrom] = useState("2026-01-01");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [rateCardType, setRateCardType] = useState("HYBRID");
  const [defaultWeightUnit, setDefaultWeightUnit] = useState<WeightUnit>("KG");

  const [notes, setNotes] = useState("");

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"tiers" | "flat" | "surcharges" | "properties">("tiers");

  // State Collections
  const [flatFees, setFlatFees] = useState<FlatFeeRow[]>(DEFAULT_FLAT_FEES);
  const [tieredFees, setTieredFees] = useState<TieredWeightRow[]>(RDX_SPORTS_METRIC_TIERS);
  const [surcharges, setSurcharges] = useState<CustomSurchargeRow[]>([
    {
      category: "HEAVY_WEIGHT_SURCHARGE",
      description: "Heavy Weight Item Surcharge (>20 kg / 44 lbs)",
      unitType: "item",
      rateDollars: "15.00",
      notes: "Applies to heavy combat bags, weight benches, barbell plates",
    },
    {
      category: "FUEL_SURCHARGE",
      description: "Contracted Carrier Fuel Surcharge Index",
      unitType: "%",
      rateDollars: "6.50",
      notes: "Fixed fuel adjustment benchmark",
    },
  ]);

  const [customProperties, setCustomProperties] = useState<CustomOptionEntry[]>([
    { key: "Account_Number", value: "RDX-UK-EXP-889", notes: "Primary Carrier & Warehouse Billing ID" },
    { key: "DIM_Divisor", value: "5000", notes: "Volumetric factor: (L x W x H cm) / 5000" },
    { key: "Facility_Code", value: "LHR-DC-04", notes: "Fulfillment warehouse identifier" },
    { key: "Contract_Clause_ID", value: "RDX-LOG-2026-V3", notes: "SLA Master Agreement clause reference" },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom property handlers
  const handleCustomPropertyChange = (index: number, field: keyof CustomOptionEntry, val: string) => {
    const updated = [...customProperties];
    updated[index] = { ...updated[index], [field]: val };
    setCustomProperties(updated);
  };

  const handleAddCustomProperty = () => {
    setCustomProperties([
      ...customProperties,
      { key: "New_Property", value: "", notes: "" },
    ]);
  };

  const handleRemoveCustomProperty = (index: number) => {
    setCustomProperties(customProperties.filter((_, i) => i !== index));
  };

  // Flat fee handlers
  const handleFlatFeeChange = (index: number, field: keyof FlatFeeRow, val: string) => {
    const updated = [...flatFees];
    updated[index] = { ...updated[index], [field]: val };
    setFlatFees(updated);
  };

  const handleAddFlatFee = () => {
    setFlatFees([
      ...flatFees,
      {
        category: "CUSTOM_CHARGE",
        description: "Special Project / Handling Fee",
        unitType: "unit",
        rateDollars: "10.00",
      },
    ]);
  };

  const handleRemoveFlatFee = (index: number) => {
    setFlatFees(flatFees.filter((_, i) => i !== index));
  };

  // Tiered fee handlers
  const handleTierChange = (index: number, field: keyof TieredWeightRow, val: string) => {
    const updated = [...tieredFees];
    updated[index] = { ...updated[index], [field]: val };
    setTieredFees(updated);
  };

  const handleAddTier = () => {
    const lastTier = tieredFees[tieredFees.length - 1];
    const newMin = lastTier ? (parseFloat(lastTier.maxWeight) + 0.01).toFixed(2) : "0.0";
    const newMax = lastTier ? (parseFloat(lastTier.maxWeight) + 2.0).toFixed(2) : "1.0";

    setTieredFees([
      ...tieredFees,
      {
        shipper: lastTier?.shipper || "DPD",
        serviceLevel: lastTier?.serviceLevel || "Standard",
        weightUnit: defaultWeightUnit,
        minWeight: newMin,
        maxWeight: newMax,
        zone: "All Zones",
        rateDollars: "6.50",
        incrementalRateDollars: "",
        incrementalWeightStep: "",
        description: `${lastTier?.shipper || "Carrier"} (${newMin} - ${newMax} ${defaultWeightUnit})`,
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    setTieredFees(tieredFees.filter((_, i) => i !== index));
  };

  // Surcharge handlers
  const handleSurchargeChange = (index: number, field: keyof CustomSurchargeRow, val: string) => {
    const updated = [...surcharges];
    updated[index] = { ...updated[index], [field]: val };
    setSurcharges(updated);
  };

  const handleAddSurcharge = () => {
    setSurcharges([
      ...surcharges,
      {
        category: "CUSTOM_CHARGE",
        description: "Oversize / Dimensional Handling Surcharge",
        unitType: "unit",
        rateDollars: "8.50",
        notes: "Girth + length > 120 cm",
      },
    ]);
  };

  const handleRemoveSurcharge = (index: number) => {
    setSurcharges(surcharges.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Assemble all fee rows
      const combinedFees: any[] = [];

      // 1. Flat warehouse fees
      for (const f of flatFees) {
        combinedFees.push({
          category: f.category,
          description: f.description,
          unitType: f.unitType,
          rateDollars: f.rateDollars,
          feeType: "FLAT",
        });
      }

      // 2. Tiered weight fees
      for (const t of tieredFees) {
        combinedFees.push({
          category: "SHIPPING_CARRIER",
          description: t.description || `${t.shipper} (${t.minWeight}-${t.maxWeight} ${t.weightUnit})`,
          unitType: "tier",
          rateDollars: t.rateDollars,
          feeType: "TIERED_WEIGHT",
          shipper: t.shipper,
          serviceLevel: t.serviceLevel,
          weightUnit: t.weightUnit,
          minWeight: t.minWeight ? parseFloat(t.minWeight) : 0,
          maxWeight: t.maxWeight ? parseFloat(t.maxWeight) : null,
          zone: t.zone,
          incrementalRateDollars: t.incrementalRateDollars || null,
          incrementalWeightStep: t.incrementalWeightStep ? parseFloat(t.incrementalWeightStep) : null,
        });
      }

      // 3. Custom surcharges
      for (const s of surcharges) {
        combinedFees.push({
          category: s.category,
          description: s.description,
          unitType: s.unitType,
          rateDollars: s.rateDollars,
          feeType: "SURCHARGE",
          customFields: { notes: s.notes },
        });
      }

      // 4. Custom Metadata Options
      const customOptions: Record<string, any> = {};
      for (const p of customProperties) {
        if (p.key.trim()) {
          customOptions[p.key.trim()] = {
            value: p.value.trim(),
            notes: p.notes?.trim() || "",
          };
        }
      }

      const res = await fetch(`/api/providers/${providerId}/rate-cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          effectiveFrom,
          effectiveTo: effectiveTo || null,
          currency,
          rateCardType,
          defaultWeightUnit,
          notes,
          customOptions: Object.keys(customOptions).length > 0 ? customOptions : null,
          fees: combinedFees,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save rate card");

      router.push(`/providers/${providerId}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-xs font-mono text-[#777268]">
        <Link href="/providers" className="hover:underline">
          Providers
        </Link>
        <span>/</span>
        <Link href={`/providers/${providerId}`} className="hover:underline">
          Rate Cards
        </Link>
        <span>/</span>
        <span className="text-[#121210] font-medium">Advanced Rate Card Builder</span>
      </div>

      <Card className="bg-[#FBFAF6] border border-[#DCD5C8]">
        <CardHeader className="border-b border-[#DCD5C8]">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#B8892D] uppercase tracking-wider mb-1">
            <span>Enterprise Logistics</span>
            <span>•</span>
            <span>Weight-Tiered &amp; Multi-Shipper Specification</span>
          </div>
          <CardTitle className="font-serif text-xl">Contracted Rate Card Schedule</CardTitle>
          <CardDescription className="text-xs text-[#777268]">
            Configure multi-tier weight thresholds (oz, lbs, kg, g), carrier schedules (Royal Mail, DPD, FedEx, UPS), and contracted warehouse fees for deterministic auditing.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {errorMsg && (
            <div className="p-3 mb-6 rounded bg-[#fdf8f8] border border-[#f1c2c2] text-xs font-mono text-[#8f2020]">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Schedule Title *"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. RDX Sports Master Fulfillment Schedule"
                />
              </div>

              <div>
                <Input
                  label="Effective From *"
                  type="date"
                  required
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Effective To (Optional)"
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                  helperText="Blank = actively in effect"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($) - US Dollars</option>
                <option value="GBP">GBP (£) - British Pounds</option>
                <option value="EUR">EUR (€) - Euros</option>
                <option value="CAD">CAD ($) - Canadian Dollars</option>
                <option value="AUD">AUD ($) - Australian Dollars</option>
              </Select>

              <Select
                label="Default Weight Unit (e.g. kg, lbs, oz)"
                value={defaultWeightUnit}
                onChange={(e) => setDefaultWeightUnit(e.target.value as WeightUnit)}
              >
                <option value="KG">Kilograms (kg) - Metric</option>
                <option value="LB">Pounds (lbs) - US Standard</option>
                <option value="OZ">Ounces (oz) - Lightweight Goods</option>
                <option value="G">Grams (g)</option>
              </Select>

              <Select
                label="Rate Card Architecture"
                value={rateCardType}
                onChange={(e) => setRateCardType(e.target.value)}
              >
                <option value="HYBRID">Hybrid (Fulfillment + Weight Tiers)</option>
                <option value="TIERED_WEIGHT">Carrier Weight Matrix Only</option>
                <option value="STANDARD">Standard Warehouse Fees Only</option>
              </Select>
            </div>

            <Input
              label="Internal Agreement Reference / Contract Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Master Logistics SLA with warehouse rep • Section 4.2 Weight Matrix"
            />

            {/* Tab Navigation */}
            <div className="border-b border-[#DCD5C8] flex space-x-6 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("tiers")}
                className={`pb-2.5 font-bold uppercase transition ${
                  activeTab === "tiers"
                    ? "border-b-2 border-[#B8892D] text-[#090908]"
                    : "text-[#777268] hover:text-[#121210]"
                }`}
              >
                1. Tiered Weight &amp; Shipper Rates ({tieredFees.length} Tiers)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("flat")}
                className={`pb-2.5 font-bold uppercase transition ${
                  activeTab === "flat"
                    ? "border-b-2 border-[#B8892D] text-[#090908]"
                    : "text-[#777268] hover:text-[#121210]"
                }`}
              >
                2. Standard Warehouse Fees ({flatFees.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("surcharges")}
                className={`pb-2.5 font-bold uppercase transition ${
                  activeTab === "surcharges"
                    ? "border-b-2 border-[#B8892D] text-[#090908]"
                    : "text-[#777268] hover:text-[#121210]"
                }`}
              >
                3. Custom Surcharges &amp; Accessorials ({surcharges.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("properties")}
                className={`pb-2.5 font-bold uppercase transition ${
                  activeTab === "properties"
                    ? "border-b-2 border-[#B8892D] text-[#090908]"
                    : "text-[#777268] hover:text-[#121210]"
                }`}
              >
                4. Custom Properties &amp; Metadata ({customProperties.length})
              </button>
            </div>

            {/* TAB 1: TIERED WEIGHT RATES */}
            {activeTab === "tiers" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3F0E8]/60 p-4 rounded border border-[#DCD5C8]">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-[#121210] uppercase">
                      Weight Thresholds &amp; Carrier Rates
                    </h3>
                    <p className="text-[11px] text-[#777268] mt-0.5">
                      Define charges for specific shippers and weight brackets (e.g. 0–1 kg, 1–2 kg, 0–16 oz, 1–5 lbs).
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setTieredFees(RDX_SPORTS_METRIC_TIERS)}
                      className="px-2.5 py-1 text-[10px] font-mono rounded bg-white border border-[#DCD5C8] text-[#121210] hover:bg-[#F3F0E8] transition"
                    >
                      Template: RDX Sports Metric (kg)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTieredFees(US_PARCEL_TIERS)}
                      className="px-2.5 py-1 text-[10px] font-mono rounded bg-white border border-[#DCD5C8] text-[#121210] hover:bg-[#F3F0E8] transition"
                    >
                      Template: US Parcel (oz/lbs)
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-[#DCD5C8] rounded bg-white">
                  <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
                    <thead className="bg-[#F3F0E8]">
                      <tr>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Shipper / Carrier</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Service Level</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Unit</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Min Weight</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Max Weight</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Zone / Area</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Rate ({currency})</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">+Overage ($/unit)</th>
                        <th className="px-2 py-2 text-center font-mono font-semibold text-[#777268]">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCD5C8]/60">
                      {tieredFees.map((tier, idx) => (
                        <tr key={idx} className="hover:bg-[#FBFAF6]">
                          <td className="p-2">
                            <input
                              type="text"
                              value={tier.shipper}
                              onChange={(e) => handleTierChange(idx, "shipper", e.target.value)}
                              placeholder="e.g. Royal Mail, DPD"
                              className="w-28 px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={tier.serviceLevel}
                              onChange={(e) => handleTierChange(idx, "serviceLevel", e.target.value)}
                              placeholder="Tracked 48"
                              className="w-28 px-2 py-1 border border-[#DCD5C8] rounded text-xs text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={tier.weightUnit}
                              onChange={(e) => handleTierChange(idx, "weightUnit", e.target.value)}
                              className="px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-[#121210] bg-white focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            >
                              <option value="KG">KG</option>
                              <option value="LB">LB</option>
                              <option value="OZ">OZ</option>
                              <option value="G">G</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={tier.minWeight}
                              onChange={(e) => handleTierChange(idx, "minWeight", e.target.value)}
                              className="w-16 px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={tier.maxWeight}
                              onChange={(e) => handleTierChange(idx, "maxWeight", e.target.value)}
                              className="w-16 px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={tier.zone}
                              onChange={(e) => handleTierChange(idx, "zone", e.target.value)}
                              placeholder="All Zones"
                              className="w-24 px-2 py-1 border border-[#DCD5C8] rounded text-xs text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={tier.rateDollars}
                              onChange={(e) => handleTierChange(idx, "rateDollars", e.target.value)}
                              className="w-20 px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-right font-medium text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={tier.incrementalRateDollars}
                              onChange={(e) => handleTierChange(idx, "incrementalRateDollars", e.target.value)}
                              placeholder="0.00"
                              className="w-16 px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-right text-[#777268] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveTier(idx)}
                              className="text-xs text-[#8f2020] hover:text-[#731919] hover:bg-[#fdf2f2] rounded transition font-mono p-1"
                              title="Delete Tier"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="button" variant="outline" onClick={handleAddTier}>
                    + Add Weight Bracket Tier
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: FLAT WAREHOUSE FEES */}
            {activeTab === "flat" && (
              <div className="space-y-4">
                <div className="bg-[#F3F0E8]/60 p-4 rounded border border-[#DCD5C8]">
                  <h3 className="text-xs font-mono font-bold text-[#121210] uppercase">
                    Standard Fulfillment &amp; Storage Schedule
                  </h3>
                  <p className="text-[11px] text-[#777268] mt-0.5">
                    Standard order pick, carton receiving, pallet storage, and monthly account fees.
                  </p>
                </div>

                <div className="overflow-x-auto border border-[#DCD5C8] rounded bg-white">
                  <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
                    <thead className="bg-[#F3F0E8]">
                      <tr>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Category</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Description</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Billing Unit</th>
                        <th className="px-3 py-2 text-right font-mono font-semibold text-[#777268]">Rate ({currency})</th>
                        <th className="px-2 py-2 text-center font-mono font-semibold text-[#777268]">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCD5C8]/60">
                      {flatFees.map((fee, idx) => (
                        <tr key={idx} className="hover:bg-[#FBFAF6]">
                          <td className="p-2 font-mono text-[11px] text-[#777268]">
                            {fee.category}
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={fee.description}
                              onChange={(e) => handleFlatFeeChange(idx, "description", e.target.value)}
                              className="w-full px-2 py-1 border border-[#DCD5C8] rounded text-xs text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={fee.unitType}
                              onChange={(e) => handleFlatFeeChange(idx, "unitType", e.target.value)}
                              className="w-28 px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={fee.rateDollars}
                              onChange={(e) => handleFlatFeeChange(idx, "rateDollars", e.target.value)}
                              className="w-24 px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-right font-medium text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none ml-auto block"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveFlatFee(idx)}
                              className="text-xs text-[#8f2020] hover:text-[#731919] hover:bg-[#fdf2f2] rounded transition font-mono p-1"
                              title="Delete Fee"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="button" variant="outline" onClick={handleAddFlatFee}>
                    + Add Flat Warehouse Fee
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOM SURCHARGES & ACCESSORIALS */}
            {activeTab === "surcharges" && (
              <div className="space-y-4">
                <div className="bg-[#F3F0E8]/60 p-4 rounded border border-[#DCD5C8]">
                  <h3 className="text-xs font-mono font-bold text-[#121210] uppercase">
                    Custom Surcharges &amp; Accessorial Rules
                  </h3>
                  <p className="text-[11px] text-[#777268] mt-0.5">
                    Configure specialized surcharges: heavy item handling, fuel percentages, residential delivery, or custom labor.
                  </p>
                </div>

                <div className="overflow-x-auto border border-[#DCD5C8] rounded bg-white">
                  <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
                    <thead className="bg-[#F3F0E8]">
                      <tr>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Surcharge Name</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Unit Type</th>
                        <th className="px-3 py-2 text-right font-mono font-semibold text-[#777268]">Contracted Rate</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Application Rules / Trigger</th>
                        <th className="px-2 py-2 text-center font-mono font-semibold text-[#777268]">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCD5C8]/60">
                      {surcharges.map((surcharge, idx) => (
                        <tr key={idx} className="hover:bg-[#FBFAF6]">
                          <td className="p-2">
                            <input
                              type="text"
                              value={surcharge.description}
                              onChange={(e) => handleSurchargeChange(idx, "description", e.target.value)}
                              className="w-64 px-2 py-1 border border-[#DCD5C8] rounded text-xs text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={surcharge.unitType}
                              onChange={(e) => handleSurchargeChange(idx, "unitType", e.target.value)}
                              placeholder="item, %, order"
                              className="w-24 px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={surcharge.rateDollars}
                              onChange={(e) => handleSurchargeChange(idx, "rateDollars", e.target.value)}
                              className="w-24 px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-right font-medium text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none ml-auto block"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={surcharge.notes}
                              onChange={(e) => handleSurchargeChange(idx, "notes", e.target.value)}
                              placeholder="e.g. Applied to items exceeding 20 kg"
                              className="w-full px-2 py-1 border border-[#DCD5C8] rounded text-xs text-[#777268] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveSurcharge(idx)}
                              className="text-xs text-[#8f2020] hover:text-[#731919] hover:bg-[#fdf2f2] rounded transition font-mono p-1"
                              title="Delete Surcharge"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="button" variant="outline" onClick={handleAddSurcharge}>
                    + Add Custom Surcharge
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 4: UNLIMITED CUSTOM PROPERTIES & METADATA */}
            {activeTab === "properties" && (
              <div className="space-y-4">
                <div className="bg-[#F3F0E8]/60 p-4 rounded border border-[#DCD5C8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-[#121210] uppercase">
                        Unrestricted Custom Properties &amp; Contract Metadata
                      </h3>
                      <p className="text-[11px] text-[#777268] mt-0.5">
                        Define enterprise parameters, account numbers, volumetric DIM factors, facility codes, or contract clauses without limits.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono bg-[#121210] text-[#E0BC68] px-2 py-0.5 rounded border border-[#B8892D]">
                      Unlimited Key-Value Store
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-[#DCD5C8] rounded bg-white">
                  <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
                    <thead className="bg-[#F3F0E8]">
                      <tr>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268] w-1/4">Property Key / Identifier</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268] w-1/3">Value</th>
                        <th className="px-3 py-2 text-left font-mono font-semibold text-[#777268]">Description / SLA Scope</th>
                        <th className="px-2 py-2 text-center font-mono font-semibold text-[#777268] w-12">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCD5C8]/60">
                      {customProperties.map((prop, idx) => (
                        <tr key={idx} className="hover:bg-[#FBFAF6]">
                          <td className="p-2">
                            <input
                              type="text"
                              value={prop.key}
                              onChange={(e) => handleCustomPropertyChange(idx, "key", e.target.value)}
                              placeholder="e.g. DIM_Divisor, Facility_Code"
                              className="w-full px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={prop.value}
                              onChange={(e) => handleCustomPropertyChange(idx, "value", e.target.value)}
                              placeholder="e.g. 5000, LHR-01"
                              className="w-full px-2 py-1 border border-[#DCD5C8] rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:outline-none font-semibold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={prop.notes}
                              onChange={(e) => handleCustomPropertyChange(idx, "notes", e.target.value)}
                              placeholder="Contract clause or calculation explanation"
                              className="w-full px-2 py-1 border border-[#DCD5C8] rounded text-xs text-[#777268] focus:ring-1 focus:ring-[#B8892D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomProperty(idx)}
                              className="text-xs text-[#8f2020] hover:text-[#731919] hover:bg-[#fdf2f2] rounded transition font-mono p-1"
                              title="Delete Property"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="button" variant="outline" onClick={handleAddCustomProperty}>
                    + Add Custom Property
                  </Button>
                </div>
              </div>
            )}

            {/* Submission Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-[#DCD5C8]">
              <div className="text-xs font-mono text-[#777268]">
                Total Contracted Entries:{" "}
                <span className="text-[#121210] font-bold">
                  {tieredFees.length + flatFees.length + surcharges.length} fees • {customProperties.length} custom properties
                </span>{" "}
                configured
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/providers/${providerId}`)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isLoading}>
                  Save Contracted Rate Card
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
