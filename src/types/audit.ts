export type StandardFeeCategory =
  | "BASE_PICK_PACK"
  | "ADDITIONAL_ITEM"
  | "STORAGE_PALLET"
  | "STORAGE_BIN"
  | "STORAGE_SHELF"
  | "RECEIVING_CARTON"
  | "RECEIVING_PALLET"
  | "RETURN_PROCESSING"
  | "ACCOUNT_MANAGEMENT"
  | "PACKAGING_MATERIALS"
  | "DISPOSAL_FEE"
  | "SHIPPING_CARRIER"
  | "WEIGHT_TIERED_PICK"
  | "HEAVY_WEIGHT_SURCHARGE"
  | "FUEL_SURCHARGE"
  | "RESIDENTIAL_SURCHARGE"
  | "CUSTOM_CHARGE";

export const FEE_CATEGORY_LABELS: Record<StandardFeeCategory, string> = {
  BASE_PICK_PACK: "Base Pick & Pack (Order Fee)",
  ADDITIONAL_ITEM: "Additional Item Pick",
  STORAGE_PALLET: "Storage - Pallet",
  STORAGE_BIN: "Storage - Bin",
  STORAGE_SHELF: "Storage - Shelf",
  RECEIVING_CARTON: "Inbound Receiving - Carton",
  RECEIVING_PALLET: "Inbound Receiving - Pallet",
  RETURN_PROCESSING: "Return Inspection & Restock",
  ACCOUNT_MANAGEMENT: "Monthly Account / Tech Fee",
  PACKAGING_MATERIALS: "Boxes, Mailers & Packaging",
  DISPOSAL_FEE: "Disposal / Destruction",
  SHIPPING_CARRIER: "Carrier Postage / Delivery (Weight Tiered)",
  WEIGHT_TIERED_PICK: "Weight-Tiered Pick & Pack",
  HEAVY_WEIGHT_SURCHARGE: "Heavy / Oversize Item Surcharge",
  FUEL_SURCHARGE: "Fuel Surcharge",
  RESIDENTIAL_SURCHARGE: "Residential Delivery Surcharge",
  CUSTOM_CHARGE: "Custom Surcharge / Accessorial",
};

export type WeightUnit = "OZ" | "LB" | "KG" | "G";
export type RateCardFeeType = "FLAT" | "TIERED_WEIGHT" | "SURCHARGE";

export interface RateCardFeeItem {
  id?: string;
  category: StandardFeeCategory;
  feeType: RateCardFeeType;
  description: string;
  unitType: string;
  rateDollars?: string;
  rateCents: number;
  shipper?: string | null;
  serviceLevel?: string | null;
  weightUnit?: WeightUnit | null;
  minWeight?: number | null;
  maxWeight?: number | null;
  zone?: string | null;
  incrementalRateDollars?: string | null;
  incrementalRateCents?: number | null;
  incrementalWeightStep?: number | null;
  customFields?: string | null; // Serialized JSON
}

export type FlagRuleType =
  | "RATE_EXCEEDS_CONTRACT"
  | "DUPLICATE_INVOICE_LINE"
  | "UNCONTRACTED_FEE_CATEGORY"
  | "MOM_ANOMALOUS_SURGE";

export const RULE_LABELS: Record<FlagRuleType, { title: string; severity: "high" | "medium" | "low" }> = {
  RATE_EXCEEDS_CONTRACT: {
    title: "Billed Rate Exceeds Contract",
    severity: "high",
  },
  DUPLICATE_INVOICE_LINE: {
    title: "Duplicate Line or Order Reference",
    severity: "high",
  },
  UNCONTRACTED_FEE_CATEGORY: {
    title: "Fee Category Absent from Rate Card",
    severity: "medium",
  },
  MOM_ANOMALOUS_SURGE: {
    title: "Month-Over-Month Anomalous Surge",
    severity: "medium",
  },
};

export type FlagStatus = "AWAITING_CLARIFICATION" | "CONFIRMED" | "DISMISSED";

export interface ColumnMappingConfig {
  dateColumn: string;
  referenceColumn: string;
  categoryColumn: string;
  quantityColumn: string;
  unitRateColumn: string;
  totalColumn: string;
  weightColumn?: string;
  weightUnitColumn?: string;
  carrierColumn?: string;
  zoneColumn?: string;
  customFieldMappings?: Record<string, string>; // CSV column -> custom field name
}

export interface ParsedRawRow {
  [key: string]: string;
}

export interface NormalizedInvoiceLine {
  lineNumber: number;
  serviceDate: Date | null;
  orderReference: string | null;
  rawCategory: string;
  matchedCategory: StandardFeeCategory | null;
  billedQuantity: number;
  billedRateCents: number;
  billedTotalCents: number;
  billedWeight?: number | null;
  weightUnit?: WeightUnit | null;
  carrier?: string | null;
  zone?: string | null;
  customFields?: Record<string, any> | null;
  rawData: Record<string, string>;
}

export interface AuditFlagResult {
  ruleType: FlagRuleType;
  expectedRateCents?: number;
  expectedTotalCents?: number;
  billedTotalCents: number;
  differenceCents: number;
  calculationBreakdown: string;
  userNote?: string;
  status: FlagStatus;
}
