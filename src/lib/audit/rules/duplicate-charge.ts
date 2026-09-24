import { NormalizedInvoiceLine, AuditFlagResult } from "@/types/audit";
import { formatCents } from "@/lib/money/currency";

export interface DuplicateTracker {
  seenReferences: Map<string, { lineNumber: number; lineId?: string; billedTotalCents: number }>;
}

/**
 * Rule 2: Duplicate Invoice Line or Repeated Order Reference
 * Detects if the exact same order reference and category was billed multiple times.
 */
export function checkDuplicateCharge(
  line: NormalizedInvoiceLine,
  tracker: DuplicateTracker
): AuditFlagResult | null {
  // If line has no order/shipment reference, we can't reliably determine an order-level duplicate
  if (!line.orderReference || line.orderReference.trim() === "") {
    return null;
  }

  const categoryKey = line.matchedCategory || line.rawCategory.toLowerCase().trim();
  const duplicateKey = `${line.orderReference.toLowerCase().trim()}:::${categoryKey}`;

  if (tracker.seenReferences.has(duplicateKey)) {
    const prior = tracker.seenReferences.get(duplicateKey)!;
    return {
      ruleType: "DUPLICATE_INVOICE_LINE",
      expectedRateCents: 0,
      expectedTotalCents: 0,
      billedTotalCents: line.billedTotalCents,
      differenceCents: line.billedTotalCents,
      status: "AWAITING_CLARIFICATION",
      calculationBreakdown: `Duplicate charge: Reference '${line.orderReference}' was already billed on row #${prior.lineNumber} for '${line.rawCategory}'. Expected total for duplicate entry: $0.00. Potential discrepancy: +${formatCents(line.billedTotalCents)}.`,
    };
  }

  tracker.seenReferences.set(duplicateKey, {
    lineNumber: line.lineNumber,
    billedTotalCents: line.billedTotalCents,
  });

  return null;
}
