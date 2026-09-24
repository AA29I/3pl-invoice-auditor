import { NormalizedInvoiceLine, AuditFlagResult } from "@/types/audit";
import { formatCents, calculatePercentageDiff } from "@/lib/money/currency";

export interface HistoricalBenchmark {
  averageRateCents: number;
  sampleCount: number;
}

/**
 * Rule 4: Unusual Month-over-Month Surge
 * Detects if a billed unit rate spiked significantly (> 25%) above historical baseline.
 */
export function checkMomSurge(
  line: NormalizedInvoiceLine,
  historicalBenchmarks: Map<string, HistoricalBenchmark>
): AuditFlagResult | null {
  if (!line.matchedCategory) return null;

  const benchmark = historicalBenchmarks.get(line.matchedCategory);
  if (!benchmark || benchmark.sampleCount < 2) {
    // Insufficient historical data to assert a statistical MoM anomaly
    return null;
  }

  // If billed rate is > 25% higher than historical average
  if (line.billedRateCents > benchmark.averageRateCents * 1.25) {
    const diffCents = line.billedRateCents - benchmark.averageRateCents;
    const pct = calculatePercentageDiff(line.billedRateCents, benchmark.averageRateCents);

    return {
      ruleType: "MOM_ANOMALOUS_SURGE",
      expectedRateCents: benchmark.averageRateCents,
      expectedTotalCents: Math.round(line.billedQuantity * benchmark.averageRateCents),
      billedTotalCents: line.billedTotalCents,
      differenceCents: Math.round(line.billedQuantity * diffCents),
      status: "AWAITING_CLARIFICATION",
      calculationBreakdown: `Historical rate surge: Billed unit rate of ${formatCents(
        line.billedRateCents
      )} is ${pct}% higher than historical trailing average (${formatCents(
        benchmark.averageRateCents
      )} across ${benchmark.sampleCount} previous invoices).`,
    };
  }

  return null;
}
