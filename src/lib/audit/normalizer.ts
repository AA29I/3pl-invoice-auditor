import {
  ColumnMappingConfig,
  NormalizedInvoiceLine,
  StandardFeeCategory,
  WeightUnit,
} from "@/types/audit";
import { parseDollarsToCents } from "@/lib/money/currency";
import { extractWeightAndUnit, parseStandardWeightUnit } from "./weight-converter";

export interface RowValidationError {
  row: number;
  field: string;
  message: string;
  rawLine?: any;
}

export interface NormalizationResult {
  lines: NormalizedInvoiceLine[];
  errors: RowValidationError[];
  isValid: boolean;
}

/**
 * Intelligent fuzzy matcher to map arbitrary 3PL invoice line descriptions
 * to our standardized FeeCategory.
 */
export function inferStandardCategory(rawDescription: string): StandardFeeCategory {
  const lower = rawDescription.toLowerCase().trim();

  // Carrier / Shipping Postage & Delivery
  if (
    lower.includes("postage") ||
    lower.includes("shipping") ||
    lower.includes("freight") ||
    lower.includes("courier") ||
    lower.includes("royal mail") ||
    lower.includes("dpd") ||
    lower.includes("fedex") ||
    lower.includes("ups") ||
    lower.includes("dhl") ||
    lower.includes("evri") ||
    lower.includes("usps") ||
    lower.includes("tracked 24") ||
    lower.includes("tracked 48") ||
    lower.includes("ground delivery")
  ) {
    return "SHIPPING_CARRIER";
  }

  // Weight Surcharges & Heavy handling
  if (
    lower.includes("heavy item") ||
    lower.includes("heavy weight") ||
    lower.includes("oversize") ||
    lower.includes("overweight") ||
    lower.includes("non-conveyable")
  ) {
    return "HEAVY_WEIGHT_SURCHARGE";
  }

  // Fuel Surcharge
  if (lower.includes("fuel")) {
    return "FUEL_SURCHARGE";
  }

  // Residential Surcharge
  if (lower.includes("residential")) {
    return "RESIDENTIAL_SURCHARGE";
  }

  // Tiered pick & pack
  if (
    lower.includes("tiered pick") ||
    lower.includes("weight pick")
  ) {
    return "WEIGHT_TIERED_PICK";
  }

  // Base Pick & Pack
  if (
    lower.includes("base pick") ||
    lower.includes("pick & pack") ||
    lower.includes("order pick") ||
    lower.includes("first item") ||
    lower.includes("fulfillment fee")
  ) {
    return "BASE_PICK_PACK";
  }

  // Additional Item Pick
  if (
    lower.includes("additional item") ||
    lower.includes("extra pick") ||
    lower.includes("subsequent item") ||
    lower.includes("unit pick")
  ) {
    return "ADDITIONAL_ITEM";
  }

  // Storage
  if (lower.includes("storage") && lower.includes("pallet")) {
    return "STORAGE_PALLET";
  }
  if (lower.includes("storage") && lower.includes("bin")) {
    return "STORAGE_BIN";
  }
  if (lower.includes("storage") && lower.includes("shelf")) {
    return "STORAGE_SHELF";
  }
  if (lower.includes("storage")) {
    return "STORAGE_PALLET";
  }

  // Inbound Receiving
  if (lower.includes("receiving") && lower.includes("carton")) {
    return "RECEIVING_CARTON";
  }
  if (lower.includes("receiving") || lower.includes("inbound")) {
    return "RECEIVING_PALLET";
  }

  // Returns
  if (lower.includes("return") || lower.includes("reverse logistics")) {
    return "RETURN_PROCESSING";
  }

  // Tech / Account Fee
  if (
    lower.includes("account") ||
    lower.includes("tech fee") ||
    lower.includes("software") ||
    lower.includes("platform fee")
  ) {
    return "ACCOUNT_MANAGEMENT";
  }

  // Packaging
  if (
    lower.includes("box") ||
    lower.includes("packaging") ||
    lower.includes("mailer") ||
    lower.includes("bubble wrap")
  ) {
    return "PACKAGING_MATERIALS";
  }

  // Disposal
  if (lower.includes("disposal") || lower.includes("destroy") || lower.includes("scrap")) {
    return "DISPOSAL_FEE";
  }

  return "CUSTOM_CHARGE";
}

/**
 * Parses raw CSV rows into normalized schema with rigorous integer cent validation,
 * extracting weight tiers, carrier dimensions, and custom attributes.
 */
export function normalizeInvoiceRows(
  rows: Record<string, string>[],
  mapping: ColumnMappingConfig
): NormalizationResult {
  const lines: NormalizedInvoiceLine[] = [];
  const errors: RowValidationError[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 1;

    // Check required mapped columns exist
    const rawCategory = row[mapping.categoryColumn]?.trim();
    if (!rawCategory) {
      errors.push({
        row: rowNum,
        field: "category",
        message: `Missing fee category/description in column '${mapping.categoryColumn}'`,
        rawLine: row,
      });
      return;
    }

    // Parse quantity
    const rawQty = row[mapping.quantityColumn]?.trim();
    let billedQuantity = 1.0;
    if (rawQty) {
      const parsedQty = parseFloat(rawQty.replace(/[^0-9.-]/g, ""));
      if (isNaN(parsedQty) || parsedQty <= 0) {
        errors.push({
          row: rowNum,
          field: "quantity",
          message: `Invalid quantity '${rawQty}'. Must be a positive number.`,
          rawLine: row,
        });
        return;
      }
      billedQuantity = parsedQty;
    }

    // Parse unit rate in cents
    const rawRate = row[mapping.unitRateColumn]?.trim();
    let billedRateCents = 0;
    if (rawRate) {
      billedRateCents = parseDollarsToCents(rawRate);
    }

    // Parse total charge in cents
    const rawTotal = row[mapping.totalColumn]?.trim();
    let billedTotalCents = 0;
    if (rawTotal) {
      billedTotalCents = parseDollarsToCents(rawTotal);
      if (billedTotalCents < 0) {
        errors.push({
          row: rowNum,
          field: "total",
          message: `Total charge cannot be negative ('${rawTotal}').`,
          rawLine: row,
        });
        return;
      }
    } else if (billedRateCents > 0) {
      billedTotalCents = Math.round(billedQuantity * billedRateCents);
    } else {
      errors.push({
        row: rowNum,
        field: "total",
        message: `Missing both unit rate and total charge for row #${rowNum}`,
        rawLine: row,
      });
      return;
    }

    // Parse service date if provided
    let serviceDate: Date | null = null;
    const rawDate = row[mapping.dateColumn]?.trim();
    if (rawDate) {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        serviceDate = parsedDate;
      }
    }

    // Order or shipment reference
    const orderReference = row[mapping.referenceColumn]?.trim() || null;

    // Infer fee category
    const matchedCategory = inferStandardCategory(rawCategory);

    // Extract Weight & Unit
    let billedWeight: number | null = null;
    let weightUnit: WeightUnit | null = null;

    if (mapping.weightColumn && row[mapping.weightColumn]) {
      const rawWeightStr = row[mapping.weightColumn].trim();
      const extracted = extractWeightAndUnit(rawWeightStr);
      if (extracted) {
        billedWeight = extracted.weight;
        weightUnit = extracted.unit;
      } else {
        const num = parseFloat(rawWeightStr.replace(/[^0-9.]/g, ""));
        if (!isNaN(num) && num > 0) {
          billedWeight = num;
        }
      }
    }

    // If separate weight unit column is mapped
    if (mapping.weightUnitColumn && row[mapping.weightUnitColumn]) {
      weightUnit = parseStandardWeightUnit(row[mapping.weightUnitColumn]);
    } else if (billedWeight != null && !weightUnit) {
      weightUnit = "LB"; // Default unit
    }

    // Extract Carrier / Shipper
    let carrier: string | null = null;
    if (mapping.carrierColumn && row[mapping.carrierColumn]) {
      carrier = row[mapping.carrierColumn].trim();
    } else {
      // Check if rawCategory contains a known carrier
      const lower = rawCategory.toLowerCase();
      if (lower.includes("royal mail")) carrier = "Royal Mail";
      else if (lower.includes("dpd")) carrier = "DPD";
      else if (lower.includes("fedex")) carrier = "FedEx";
      else if (lower.includes("ups")) carrier = "UPS";
      else if (lower.includes("dhl")) carrier = "DHL";
      else if (lower.includes("evri")) carrier = "Evri";
      else if (lower.includes("usps")) carrier = "USPS";
    }

    // Extract Zone
    const zone: string | null =
      mapping.zoneColumn && row[mapping.zoneColumn]
        ? row[mapping.zoneColumn].trim()
        : null;

    // Extract Custom Fields
    const customFields: Record<string, any> = {};
    if (mapping.customFieldMappings) {
      for (const [csvCol, fieldKey] of Object.entries(mapping.customFieldMappings)) {
        if (row[csvCol] !== undefined) {
          customFields[fieldKey] = row[csvCol].trim();
        }
      }
    }

    lines.push({
      lineNumber: rowNum,
      serviceDate,
      orderReference,
      rawCategory,
      matchedCategory,
      billedQuantity,
      billedRateCents,
      billedTotalCents,
      billedWeight,
      weightUnit,
      carrier,
      zone,
      customFields: Object.keys(customFields).length > 0 ? customFields : null,
      rawData: row,
    });
  });

  return {
    lines,
    errors,
    isValid: errors.length === 0,
  };
}

/**
 * Returns realistic sample 3PL CSV invoice content with intentional overcharges,
 * duplicates, and tiered weight shipping rows (e.g. RDX Sports boxing gloves, punch bags).
 */
export function getSampleInvoiceCsvContent(): string {
  return `Date,Reference,Description,Carrier,Weight,Unit,Quantity,Unit Rate,Total Amount
2026-08-01,ORD-9821,Pick & Pack Base,,1.5,lbs,1,3.45,3.45
2026-08-01,ORD-9821,Additional Item Pick,,0.8,lbs,2,0.65,1.30
2026-08-01,ORD-9821,Royal Mail Tracked 48 Delivery,Royal Mail,0.85,kg,1,4.95,4.95
2026-08-02,ORD-9822,Pick & Pack Base,,1.0,lbs,1,2.85,2.85
2026-08-02,ORD-9822,Royal Mail Tracked 48 Delivery,Royal Mail,1.40,kg,1,5.10,5.10
2026-08-02,ORD-9823,Pick & Pack Base,,2.0,lbs,1,2.85,2.85
2026-08-02,ORD-9823,Pick & Pack Base,,2.0,lbs,1,2.85,2.85
2026-08-03,ORD-9824,DPD Heavy Freight (Punch Bag),DPD,22.5,kg,1,32.00,32.00
2026-08-04,PAL-001,Monthly Storage Pallet,,,12,24.00,288.00
2026-08-05,RCV-401,Inbound Receiving Pallet,,,4,18.00,72.00
2026-08-06,RET-109,Return Processing,,,1,4.50,4.50
2026-08-07,MISC-99,Unscheduled Peak Warehouse Surcharge,,,1,150.00,150.00
2026-08-10,ORD-9825,FedEx Ground Boxing Gloves,FedEx,14,oz,1,6.80,6.80
2026-08-10,ORD-9825,Custom Gift Insert Wrap,,,1,1.50,1.50
2026-08-15,TECH-08,Monthly Account Software Fee,,,1,250.00,250.00
`;
}

/**
 * Returns complex enterprise test dataset with custom columns (SKU, PO_Number, Dimensions)
 * and multi-carrier tiered weights (oz, lbs, kg).
 */
export function getEnterpriseSampleInvoiceCsvContent(): string {
  return `Date,Reference,Description,Carrier,Weight,Unit,SKU,PO_Number,Dimensions,Quantity,Unit Rate,Total Amount
2026-08-01,ORD-9821,Royal Mail Tracked 48 Delivery,Royal Mail,0.85,kg,RDX-GLV-01,PO-8821,30x15x12 cm,1,4.95,4.95
2026-08-01,ORD-9821,Pick & Pack Base,,1.5,lbs,RDX-GLV-01,PO-8821,30x15x12 cm,1,3.45,3.45
2026-08-01,ORD-9821,Additional Item Pick,,0.8,lbs,RDX-WRP-02,PO-8821,15x10x5 cm,2,0.65,1.30
2026-08-02,ORD-9822,Royal Mail Tracked 48 Delivery,Royal Mail,1.40,kg,RDX-SHN-03,PO-8822,40x20x15 cm,1,5.10,5.10
2026-08-02,ORD-9822,Pick & Pack Base,,1.0,lbs,RDX-SHN-03,PO-8822,40x20x15 cm,1,2.85,2.85
2026-08-02,ORD-9823,Pick & Pack Base,,2.0,lbs,RDX-PAD-04,PO-8823,35x25x20 cm,1,2.85,2.85
2026-08-02,ORD-9823,Pick & Pack Base,,2.0,lbs,RDX-PAD-04,PO-8823,35x25x20 cm,1,2.85,2.85
2026-08-03,ORD-9824,DPD Heavy Freight (Punch Bag),DPD,22.5,kg,RDX-BAG-99,PO-8824,120x40x40 cm,1,32.00,32.00
2026-08-04,PAL-001,Monthly Storage Pallet,,,PLT-001,PO-STORE,120x100x160 cm,12,24.00,288.00
2026-08-05,RCV-401,Inbound Receiving Pallet,,,RCV-PLT-04,PO-INBND,120x100x160 cm,4,18.00,72.00
2026-08-06,RET-109,Return Processing,,,RET-CUST-11,PO-RET,,1,4.50,4.50
2026-08-07,MISC-99,Unscheduled Peak Warehouse Surcharge,,,SUR-PEAK,PO-SUR,,1,150.00,150.00
2026-08-10,ORD-9825,FedEx Ground Boxing Gloves,FedEx,14,oz,RDX-GLV-PRO,PO-8825,28x14x12 cm,1,6.80,6.80
2026-08-10,ORD-9825,Custom Gift Insert Wrap,,,ACC-WRAP,PO-8825,,1,1.50,1.50
2026-08-15,TECH-08,Monthly Account Software Fee,,,FEE-SLA,PO-TECH,,1,250.00,250.00
`;
}
