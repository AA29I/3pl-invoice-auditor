import { NormalizedInvoiceLine, AuditFlagResult } from "@/types/audit";
import { RateCardFeeLookup } from "./rate-exceeded";
import { TierMatchCandidate } from "../weight-converter";
import { formatCents } from "@/lib/money/currency";

/**
 * Rule 3: Fee Category Absent from Rate Card
 * Detects fees or miscellaneous warehouse surcharges that are not contracted in the rate card.
 */
export function checkUncontractedFeeCategory(
  line: NormalizedInvoiceLine,
  feesByCategory: Map<string, RateCardFeeLookup>,
  rateCardName: string,
  tieredFees?: TierMatchCandidate[]
): AuditFlagResult | null {
  // Check if category is present in flat rate card fees
  const isPresentInFlat = line.matchedCategory && feesByCategory.has(line.matchedCategory);

  // Check if category is present in tiered fees (e.g. SHIPPING_CARRIER or WEIGHT_TIERED_PICK)
  const isPresentInTiered =
    Boolean(line.matchedCategory) &&
    Boolean(
      tieredFees?.some(
        (f) =>
          f.category === line.matchedCategory ||
          (line.matchedCategory === "SHIPPING_CARRIER" && f.feeType === "TIERED_WEIGHT") ||
          (line.matchedCategory === "WEIGHT_TIERED_PICK" && f.feeType === "TIERED_WEIGHT")
      )
    );

  if (!isPresentInFlat && !isPresentInTiered) {
    return {
      ruleType: "UNCONTRACTED_FEE_CATEGORY",
      expectedRateCents: 0,
      expectedTotalCents: 0,
      billedTotalCents: line.billedTotalCents,
      differenceCents: line.billedTotalCents,
      status: "AWAITING_CLARIFICATION",
      calculationBreakdown: `Uncontracted surcharge: Fee description '${line.rawCategory}' is not defined in active rate card '${rateCardName}'. Full billed amount flagged for warehouse clarification: ${formatCents(line.billedTotalCents)}.`,
    };
  }

  return null;
}
