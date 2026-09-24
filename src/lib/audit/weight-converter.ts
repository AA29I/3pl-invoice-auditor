import { WeightUnit } from "@/types/audit";

/**
 * Standard gram conversion factors for exact weight conversions.
 */
const GRAM_MULTIPLIERS: Record<string, number> = {
  OZ: 28.349523125,
  OUNCE: 28.349523125,
  OUNCES: 28.349523125,
  LB: 453.59237,
  LBS: 453.59237,
  POUND: 453.59237,
  POUNDS: 453.59237,
  KG: 1000,
  KGS: 1000,
  KILOGRAM: 1000,
  KILOGRAMS: 1000,
  G: 1,
  GRAM: 1,
  GRAMS: 1,
};

export function parseStandardWeightUnit(rawUnit?: string | null): WeightUnit {
  if (!rawUnit) return "LB";
  const upper = rawUnit.toUpperCase().trim();
  if (upper === "OZ" || upper === "OUNCE" || upper === "OUNCES") return "OZ";
  if (upper === "KG" || upper === "KGS" || upper === "KILOGRAM" || upper === "KILOGRAMS") return "KG";
  if (upper === "G" || upper === "GRAM" || upper === "GRAMS") return "G";
  return "LB";
}

export function convertWeight(
  weight: number,
  fromUnit: string,
  toUnit: string
): number {
  const normFrom = fromUnit.toUpperCase().trim();
  const normTo = toUnit.toUpperCase().trim();

  if (normFrom === normTo) return weight;

  const fromMultiplier = GRAM_MULTIPLIERS[normFrom] || 453.59237; // default LB
  const toMultiplier = GRAM_MULTIPLIERS[normTo] || 453.59237;

  const grams = weight * fromMultiplier;
  return grams / toMultiplier;
}

export function extractWeightAndUnit(
  raw: string,
  defaultUnit: WeightUnit = "LB"
): { weight: number; unit: WeightUnit } | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  // Match e.g. "1.5 kg", "14oz", "2.8 lbs", "750 g", "0.9"
  const match = trimmed.match(/^([0-9.]+)\s*([a-zA-Z]*)$/);
  if (!match) return null;

  const num = parseFloat(match[1]);
  if (isNaN(num) || num <= 0) return null;

  const rawUnit = match[2];
  const unit = rawUnit ? parseStandardWeightUnit(rawUnit) : defaultUnit;

  return { weight: num, unit };
}

export interface TierMatchCandidate {
  id: string;
  category: string;
  description: string;
  unitType: string;
  rateCents: number;
  feeType: string;
  shipper?: string | null;
  serviceLevel?: string | null;
  weightUnit?: string | null;
  minWeight?: number | null;
  maxWeight?: number | null;
  zone?: string | null;
  incrementalRateCents?: number | null;
  incrementalWeightStep?: number | null;
}

export interface TierMatchResult {
  fee: TierMatchCandidate;
  expectedRateCents: number;
  normalizedWeight: number;
  weightUnit: string;
  explanation: string;
}

/**
 * Evaluates an invoice line against registered tiered weight fees.
 */
export function matchTieredWeightFee(
  lineWeight: number,
  lineUnit: string,
  lineCarrier: string | null,
  lineZone: string | null,
  candidateFees: TierMatchCandidate[]
): TierMatchResult | null {
  if (!candidateFees || candidateFees.length === 0) return null;

  const cleanCarrier = lineCarrier ? lineCarrier.toLowerCase().trim() : null;

  // Filter and sort candidates:
  // Carrier-specific candidates take precedence over general candidates
  const prioritized = [...candidateFees].sort((a, b) => {
    const aHasShipper = Boolean(a.shipper);
    const bHasShipper = Boolean(b.shipper);
    if (aHasShipper && !bHasShipper) return -1;
    if (!aHasShipper && bHasShipper) return 1;
    return 0;
  });

  for (const fee of prioritized) {
    // 1. Shipper Check (if specified)
    if (fee.shipper && cleanCarrier) {
      const feeShipper = fee.shipper.toLowerCase().trim();
      const carrierMatch =
        cleanCarrier.includes(feeShipper) ||
        feeShipper.includes(cleanCarrier) ||
        feeShipper === "all";
      if (!carrierMatch) continue;
    } else if (fee.shipper && !cleanCarrier) {
      // Fee specifies a shipper but the invoice line has no carrier -> skip unless fee.shipper is 'ALL'
      if (fee.shipper.toLowerCase() !== "all" && fee.shipper.toLowerCase() !== "generic") {
        continue;
      }
    }

    // 2. Zone Check (if specified)
    if (fee.zone && lineZone) {
      const feeZone = fee.zone.toLowerCase().trim();
      const lineZ = lineZone.toLowerCase().trim();
      if (feeZone !== "all" && !lineZ.includes(feeZone) && !feeZone.includes(lineZ)) {
        continue;
      }
    }

    // 3. Weight Range Check with Unit Normalization
    const targetUnit = parseStandardWeightUnit(fee.weightUnit || lineUnit);
    const normalizedWeight = convertWeight(lineWeight, lineUnit, targetUnit);

    const min = fee.minWeight ?? 0;
    const max = fee.maxWeight ?? Infinity;

    // Inclusive range check (with micro-epsilon for floating point comparisons)
    const inRange = normalizedWeight >= min - 0.0001 && normalizedWeight <= max + 0.0001;

    if (inRange) {
      let expectedRateCents = fee.rateCents;
      let overageNote = "";

      // Incremental overweight rate calculation if defined
      if (
        fee.incrementalRateCents &&
        fee.incrementalRateCents > 0 &&
        fee.maxWeight != null &&
        normalizedWeight > fee.maxWeight
      ) {
        const excess = normalizedWeight - fee.maxWeight;
        const step = fee.incrementalWeightStep || 1.0;
        const increments = Math.ceil(excess / step);
        const overageChargeCents = increments * fee.incrementalRateCents;
        expectedRateCents += overageChargeCents;
        overageNote = ` (includes ${increments} step(s) of excess weight over ${fee.maxWeight} ${targetUnit} at ${fee.incrementalRateCents / 100} / ${step} ${targetUnit})`;
      }

      return {
        fee,
        expectedRateCents,
        normalizedWeight,
        weightUnit: targetUnit,
        explanation: `${fee.shipper ? fee.shipper + " " : ""}${fee.description} [${min} to ${max === Infinity ? "∞" : max} ${targetUnit}]${overageNote}`,
      };
    }
  }

  return null;
}
