import { NormalizedInvoiceLine, AuditFlagResult } from "@/types/audit";
import { formatCents, multiplyQuantity, calculateDifference, calculatePercentageDiff } from "@/lib/money/currency";
import { TierMatchCandidate, matchTieredWeightFee } from "../weight-converter";

export interface RateCardFeeLookup {
  id: string;
  category: string;
  unitType: string;
  rateCents: number;
  description: string;
  feeType?: string;
  shipper?: string | null;
  serviceLevel?: string | null;
  weightUnit?: string | null;
  minWeight?: number | null;
  maxWeight?: number | null;
  zone?: string | null;
  incrementalRateCents?: number | null;
  incrementalWeightStep?: number | null;
}

/**
 * Rule 1: Billed Rate Exceeds Contracted Rate Card (Supports both Flat Rates & Tiered Weight Schedules)
 */
export function checkRateExceeded(
  line: NormalizedInvoiceLine,
  feesByCategory: Map<string, RateCardFeeLookup>,
  tieredFees?: TierMatchCandidate[]
): AuditFlagResult | null {
  if (!line.matchedCategory) return null;

  // 1. Check if line has weight or carrier attributes and tiered fees are configured
  const isTieredCategory =
    line.matchedCategory === "SHIPPING_CARRIER" ||
    line.matchedCategory === "WEIGHT_TIERED_PICK" ||
    line.matchedCategory === "HEAVY_WEIGHT_SURCHARGE";

  const hasWeightInfo = line.billedWeight != null && line.billedWeight > 0;

  if ((isTieredCategory || hasWeightInfo) && tieredFees && tieredFees.length > 0) {
    const relevantTieredFees = tieredFees.filter(
      (f) =>
        f.category === line.matchedCategory ||
        f.category === "SHIPPING_CARRIER" ||
        f.category === "WEIGHT_TIERED_PICK"
    );

    if (relevantTieredFees.length > 0 && hasWeightInfo) {
      const match = matchTieredWeightFee(
        line.billedWeight!,
        line.weightUnit || "LB",
        line.carrier || null,
        line.zone || null,
        relevantTieredFees
      );

      if (match) {
        const expectedUnitRateCents = match.expectedRateCents;
        const expectedTotalCents = multiplyQuantity(line.billedQuantity, expectedUnitRateCents);

        if (line.billedRateCents > expectedUnitRateCents || line.billedTotalCents > expectedTotalCents) {
          const diffCents = calculateDifference(line.billedTotalCents, expectedTotalCents);
          const pct = calculatePercentageDiff(line.billedTotalCents, expectedTotalCents);

          return {
            ruleType: "RATE_EXCEEDS_CONTRACT",
            expectedRateCents: expectedUnitRateCents,
            expectedTotalCents,
            billedTotalCents: line.billedTotalCents,
            differenceCents: diffCents,
            status: "AWAITING_CLARIFICATION",
            calculationBreakdown: `Contracted rate for ${match.explanation} is ${formatCents(
              expectedUnitRateCents
            )}. Package weight ${line.billedWeight} ${line.weightUnit || "LB"} (normalized: ${match.normalizedWeight.toFixed(
              2
            )} ${match.weightUnit}) billed at ${formatCents(line.billedRateCents)} across ${
              line.billedQuantity
            } unit(s). Expected: ${formatCents(expectedTotalCents)}, Billed: ${formatCents(
              line.billedTotalCents
            )}. Potential discrepancy: +${formatCents(diffCents)} (+${pct}% overage).`,
          };
        }

        return null; // Rate is within or equal to contracted tier
      } else {
        // Line has weight/carrier but no tier matched
        return {
          ruleType: "UNCONTRACTED_FEE_CATEGORY",
          expectedRateCents: 0,
          expectedTotalCents: 0,
          billedTotalCents: line.billedTotalCents,
          differenceCents: line.billedTotalCents,
          status: "AWAITING_CLARIFICATION",
          calculationBreakdown: `No contracted weight tier found for ${
            line.carrier ? `shipper '${line.carrier}'` : "carrier"
          } with weight ${line.billedWeight} ${line.weightUnit || "LB"}${
            line.zone ? ` in ${line.zone}` : ""
          }. Full amount flagged for rate verification: ${formatCents(line.billedTotalCents)}.`,
        };
      }
    }
  }

  // 2. Standard Flat Rate Verification
  const contractedFee = feesByCategory.get(line.matchedCategory);
  if (!contractedFee) return null; // Handled by missing-rate-card rule

  const expectedUnitRateCents = contractedFee.rateCents;
  const expectedTotalCents = multiplyQuantity(line.billedQuantity, expectedUnitRateCents);

  // If billed rate or total exceeds expected with integer precision
  if (line.billedRateCents > expectedUnitRateCents || line.billedTotalCents > expectedTotalCents) {
    const diffCents = calculateDifference(line.billedTotalCents, expectedTotalCents);
    const pct = calculatePercentageDiff(line.billedTotalCents, expectedTotalCents);

    return {
      ruleType: "RATE_EXCEEDS_CONTRACT",
      expectedRateCents: expectedUnitRateCents,
      expectedTotalCents,
      billedTotalCents: line.billedTotalCents,
      differenceCents: diffCents,
      status: "AWAITING_CLARIFICATION",
      calculationBreakdown: `Contracted rate for ${contractedFee.description || line.matchedCategory} is ${formatCents(
        expectedUnitRateCents
      )}/${contractedFee.unitType}. Billed at ${formatCents(line.billedRateCents)} across ${
        line.billedQuantity
      } ${contractedFee.unitType}(s). Expected total: ${formatCents(
        expectedTotalCents
      )}, Billed total: ${formatCents(line.billedTotalCents)}. Potential discrepancy: +${formatCents(
        diffCents
      )} (+${pct}% overage).`,
    };
  }

  return null;
}
