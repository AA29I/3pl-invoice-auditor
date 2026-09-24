"use client";

import React, { useState, useEffect } from "react";
import { ColumnMappingConfig } from "@/types/audit";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface CustomFieldEntry {
  csvColumn: string;
  fieldKey: string;
}

interface ColumnMapperProps {
  headers: string[];
  previewRows: Record<string, string>[];
  onConfirm: (mapping: ColumnMappingConfig) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isDevMode?: boolean;
}

export function ColumnMapper({
  headers,
  previewRows,
  onConfirm,
  onCancel,
  isLoading = false,
  isDevMode = false,
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMappingConfig>({
    dateColumn: "",
    referenceColumn: "",
    categoryColumn: "",
    quantityColumn: "",
    unitRateColumn: "",
    totalColumn: "",
    weightColumn: "",
    weightUnitColumn: "",
    carrierColumn: "",
    zoneColumn: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(true);
  const [customFields, setCustomFields] = useState<CustomFieldEntry[]>([]);

  useEffect(() => {
    const autoMap: ColumnMappingConfig = {
      dateColumn: "",
      referenceColumn: "",
      categoryColumn: "",
      quantityColumn: "",
      unitRateColumn: "",
      totalColumn: "",
      weightColumn: "",
      weightUnitColumn: "",
      carrierColumn: "",
      zoneColumn: "",
    };

    const detectedCustom: CustomFieldEntry[] = [];

    for (const h of headers) {
      const lower = h.toLowerCase().trim();
      if (!autoMap.dateColumn && (lower.includes("date") || lower.includes("day"))) {
        autoMap.dateColumn = h;
      } else if (
        !autoMap.referenceColumn &&
        (lower.includes("ref") || lower.includes("order") || lower.includes("tracking") || lower === "id")
      ) {
        autoMap.referenceColumn = h;
      } else if (
        !autoMap.categoryColumn &&
        (lower.includes("desc") || lower.includes("cat") || lower.includes("fee") || lower.includes("type") || lower.includes("item"))
      ) {
        autoMap.categoryColumn = h;
      } else if (
        !autoMap.quantityColumn &&
        (lower.includes("qty") || lower.includes("quant") || lower.includes("count") || lower.includes("units"))
      ) {
        autoMap.quantityColumn = h;
      } else if (
        !autoMap.unitRateColumn &&
        (lower.includes("rate") || lower.includes("unit") || lower.includes("price") || lower.includes("each"))
      ) {
        autoMap.unitRateColumn = h;
      } else if (
        !autoMap.totalColumn &&
        (lower.includes("total") || lower.includes("amount") || lower.includes("charge") || lower.includes("cost") || lower.includes("billed"))
      ) {
        autoMap.totalColumn = h;
      } else if (
        !autoMap.weightColumn &&
        (lower.includes("weight") || lower.includes("wt") || lower.includes("billed wt") || lower.includes("actual wt"))
      ) {
        autoMap.weightColumn = h;
        setShowAdvanced(true);
      } else if (
        !autoMap.weightUnitColumn &&
        (lower.includes("uom") || lower.includes("weight unit") || lower.includes("wt unit"))
      ) {
        autoMap.weightUnitColumn = h;
        setShowAdvanced(true);
      } else if (
        !autoMap.carrierColumn &&
        (lower.includes("carrier") || lower.includes("shipper") || lower.includes("courier") || lower.includes("service") || lower.includes("ship method"))
      ) {
        autoMap.carrierColumn = h;
        setShowAdvanced(true);
      } else if (!autoMap.zoneColumn && (lower.includes("zone") || lower.includes("region"))) {
        autoMap.zoneColumn = h;
        setShowAdvanced(true);
      } else {
        // Auto-detect common bespoke business custom fields (e.g. SKU, PO, Dimensions)
        if (lower.includes("sku") || lower.includes("part")) {
          detectedCustom.push({ csvColumn: h, fieldKey: "SKU" });
        } else if (lower.includes("po") || lower.includes("purchase order")) {
          detectedCustom.push({ csvColumn: h, fieldKey: "PO_Number" });
        } else if (lower.includes("dim") || lower.includes("size") || lower.includes("measurement")) {
          detectedCustom.push({ csvColumn: h, fieldKey: "Dimensions" });
        } else if (lower.includes("facility") || lower.includes("warehouse") || lower.includes("fc")) {
          detectedCustom.push({ csvColumn: h, fieldKey: "Facility_Code" });
        }
      }
    }

    setMapping(autoMap);
    if (detectedCustom.length > 0) {
      setCustomFields(detectedCustom);
    }
  }, [headers]);

  const handleAddCustomField = () => {
    // Pick first unused header if available
    const usedCols = new Set([
      mapping.dateColumn,
      mapping.referenceColumn,
      mapping.categoryColumn,
      mapping.quantityColumn,
      mapping.unitRateColumn,
      mapping.totalColumn,
      mapping.weightColumn,
      mapping.weightUnitColumn,
      mapping.carrierColumn,
      mapping.zoneColumn,
      ...customFields.map((c) => c.csvColumn),
    ]);

    const firstAvailable = headers.find((h) => !usedCols.has(h)) || headers[0] || "";

    setCustomFields([
      ...customFields,
      { csvColumn: firstAvailable, fieldKey: firstAvailable.replace(/\s+/g, "_") || "Custom_Field" },
    ]);
  };

  const handleUpdateCustomField = (index: number, field: "csvColumn" | "fieldKey", val: string) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: val };
    setCustomFields(updated);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    const customFieldMappings: Record<string, string> = {};
    for (const entry of customFields) {
      if (entry.csvColumn && entry.fieldKey.trim()) {
        customFieldMappings[entry.csvColumn] = entry.fieldKey.trim();
      }
    }

    onConfirm({
      ...mapping,
      customFieldMappings: Object.keys(customFieldMappings).length > 0 ? customFieldMappings : undefined,
    });
  };

  const isValid =
    Boolean(mapping.categoryColumn) &&
    (Boolean(mapping.totalColumn) || Boolean(mapping.unitRateColumn));

  return (
    <Card className="w-full bg-[#FBFAF6] border border-[#DCD5C8]">
      <CardHeader className="border-b border-[#DCD5C8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#B8892D] uppercase tracking-wider mb-1">
            <span>Ingestion Schema</span>
            <span>•</span>
            <span>Deterministic Alignment</span>
          </div>
          {isDevMode && (
            <span className="text-[10px] font-mono font-bold uppercase bg-[#121210] text-[#E0BC68] px-2 py-0.5 rounded border border-[#B8892D]">
              Sandbox Mode: Unlimited Custom Fields
            </span>
          )}
        </div>
        <CardTitle className="text-lg font-serif">Map Invoice CSV Columns</CardTitle>
        <CardDescription className="text-xs text-[#777268]">
          Different warehouses structure billing exports under varied nomenclature. Correlate your CSV headers to standard audit parameters or configure unlimited custom fields.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        {/* Core Billing Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Service Date"
            value={mapping.dateColumn}
            onChange={(e) => setMapping({ ...mapping, dateColumn: e.target.value })}
          >
            <option value="">-- Optional / Select Column --</option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>

          <Select
            label="Order / Reference / Tracking #"
            value={mapping.referenceColumn}
            onChange={(e) => setMapping({ ...mapping, referenceColumn: e.target.value })}
          >
            <option value="">-- Optional (Recommended for Duplicate Detection) --</option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>

          <Select
            label="Fee Description / Category *"
            value={mapping.categoryColumn}
            onChange={(e) => setMapping({ ...mapping, categoryColumn: e.target.value })}
          >
            <option value="">-- Required: Select Category Column --</option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>

          <Select
            label="Billed Quantity"
            value={mapping.quantityColumn}
            onChange={(e) => setMapping({ ...mapping, quantityColumn: e.target.value })}
          >
            <option value="">-- Optional (Defaults to 1.0) --</option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>

          <Select
            label="Unit Rate ($)"
            value={mapping.unitRateColumn}
            onChange={(e) => setMapping({ ...mapping, unitRateColumn: e.target.value })}
          >
            <option value="">-- Select Unit Rate Column --</option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>

          <Select
            label="Total Charge ($) *"
            value={mapping.totalColumn}
            onChange={(e) => setMapping({ ...mapping, totalColumn: e.target.value })}
          >
            <option value="">-- Required: Select Total Column --</option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>
        </div>

        {/* Section 2: Advanced Dimensional & Carrier Weight Fields */}
        <div className="pt-2 border-t border-[#DCD5C8]/70">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-xs font-mono text-[#B8892D] hover:underline"
          >
            <span>{showAdvanced ? "▼ Hide" : "▶ Show"} Tiered Weight &amp; Shipper Mapping (Optional)</span>
            <span className="text-[10px] text-[#777268]">
              (For weight tiers in oz, lbs, or kg &amp; carrier rate cards like FedEx, DPD, Royal Mail)
            </span>
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 rounded bg-[#F3F0E8]/50 border border-[#DCD5C8]">
              <Select
                label="Package Weight"
                value={mapping.weightColumn || ""}
                onChange={(e) => setMapping({ ...mapping, weightColumn: e.target.value })}
              >
                <option value="">-- Optional: Weight Column --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>

              <Select
                label="Weight Unit (oz, lb, kg)"
                value={mapping.weightUnitColumn || ""}
                onChange={(e) => setMapping({ ...mapping, weightUnitColumn: e.target.value })}
              >
                <option value="">-- Optional: Unit Column --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>

              <Select
                label="Carrier / Shipper"
                value={mapping.carrierColumn || ""}
                onChange={(e) => setMapping({ ...mapping, carrierColumn: e.target.value })}
              >
                <option value="">-- Optional: Carrier Column --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>

              <Select
                label="Zone / Region"
                value={mapping.zoneColumn || ""}
                onChange={(e) => setMapping({ ...mapping, zoneColumn: e.target.value })}
              >
                <option value="">-- Optional: Zone Column --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {/* Section 3: UNLIMITED CUSTOM FIELDS MAPPING */}
        <div className="pt-2 border-t border-[#DCD5C8]/70">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCustomFields(!showCustomFields)}
              className="flex items-center space-x-2 text-xs font-mono text-[#121210] font-bold hover:text-[#B8892D]"
            >
              <span>{showCustomFields ? "▼" : "▶"} Custom Invoice Fields ({customFields.length} Mapped)</span>
              <span className="text-[10px] font-normal text-[#777268]">
                — Map arbitrary CSV columns (SKU, PO #, Dimensions, Packaging, Facility)
              </span>
            </button>
            <button
              type="button"
              onClick={handleAddCustomField}
              className="px-2.5 py-1 text-[11px] font-mono text-[#B8892D] hover:text-[#9e7424] border border-[#DCD5C8] rounded bg-white hover:bg-[#F3F0E8] transition"
            >
              + Map Custom Column
            </button>
          </div>

          {showCustomFields && (
            <div className="mt-3 p-4 rounded bg-[#FBFAF6] border border-[#DCD5C8] space-y-3">
              {customFields.length === 0 ? (
                <p className="text-xs font-mono text-[#777268] italic">
                  No custom fields mapped. Click &quot;+ Map Custom Column&quot; to correlate product SKUs, PO numbers, dimensions, or warehouse tags with zero restrictions.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-3 text-[11px] font-mono font-semibold text-[#777268] uppercase pb-1 border-b border-[#DCD5C8]/50">
                    <div className="col-span-5">Source CSV Header</div>
                    <div className="col-span-1 text-center">→</div>
                    <div className="col-span-5">Custom Field Name / Identifier</div>
                    <div className="col-span-1 text-center">Remove</div>
                  </div>

                  {customFields.map((cf, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-5">
                        <select
                          value={cf.csvColumn}
                          onChange={(e) => handleUpdateCustomField(idx, "csvColumn", e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#DCD5C8] rounded text-xs font-mono text-[#121210] bg-white focus:outline-none focus:ring-1 focus:ring-[#B8892D]"
                        >
                          <option value="">-- Select Header --</option>
                          {headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 text-center font-mono text-[#777268] text-xs">
                        →
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={cf.fieldKey}
                          onChange={(e) => handleUpdateCustomField(idx, "fieldKey", e.target.value)}
                          placeholder="e.g. SKU, PO_Number, Dimensions, Facility_Code"
                          className="w-full px-2.5 py-1.5 border border-[#DCD5C8] rounded text-xs font-mono text-[#121210] bg-white focus:outline-none focus:ring-1 focus:ring-[#B8892D]"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(idx)}
                          className="text-xs text-red-600 hover:text-red-800 p-1"
                          title="Remove custom field"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Preview Table */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-mono font-semibold text-[#777268] uppercase tracking-wider">
            Raw CSV Sample (First {previewRows.length} Rows)
          </h4>
          <div className="overflow-x-auto border border-[#DCD5C8] rounded bg-white">
            <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
              <thead className="bg-[#F3F0E8]">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-mono font-medium text-[#777268]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD5C8]/60 bg-white">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FBFAF6]">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-1.5 font-mono text-[11px] text-[#121210] whitespace-nowrap">
                        {row[h] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#DCD5C8]">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="gold"
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            isLoading={isLoading}
          >
            Confirm &amp; Run Deterministic Audit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
