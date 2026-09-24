import { NormalizedInvoiceLine, AuditFlagResult, FlagRuleType } from "@/types/audit";
import { checkRateExceeded, RateCardFeeLookup } from "./rules/rate-exceeded";
import { checkDuplicateCharge, DuplicateTracker } from "./rules/duplicate-charge";
import { checkUncontractedFeeCategory } from "./rules/missing-rate-card";
import { checkMomSurge, HistoricalBenchmark } from "./rules/mom-surge";
import { TierMatchCandidate } from "./weight-converter";

export interface AuditContext {
  rateCardName: string;
  feesByCategory: Map<string, RateCardFeeLookup>;
  tieredFees?: TierMatchCandidate[];
  historicalBenchmarks?: Map<string, HistoricalBenchmark>;
}

export interface AuditedLineResult {
  line: NormalizedInvoiceLine;
  flags: AuditFlagResult[];
}

export interface FullAuditOutcome {
  lines: AuditedLineResult[];
  totalLines: number;
  totalBilledCents: number;
  potentialDiscrepancyCents: number; // Strictly labeled "potential discrepancy", never "recovered savings"
  totalFlagsCount: number;
  flagsByRule: Record<FlagRuleType, number>;
}

/**
 * Deterministic Audit Engine:
 * Processes normalized invoice lines against active rate card (including tiered weight brackets) and historical benchmarks.
 */
export function executeDeterministicAudit(
  lines: NormalizedInvoiceLine[],
  context: AuditContext
): FullAuditOutcome {
  const auditedLines: AuditedLineResult[] = [];
  const duplicateTracker: DuplicateTracker = { seenReferences: new Map() };

  let totalBilledCents = 0;
  let potentialDiscrepancyCents = 0;
  let totalFlagsCount = 0;

  const flagsByRule: Record<FlagRuleType, number> = {
    RATE_EXCEEDS_CONTRACT: 0,
    DUPLICATE_INVOICE_LINE: 0,
    UNCONTRACTED_FEE_CATEGORY: 0,
    MOM_ANOMALOUS_SURGE: 0,
  };

  for (const line of lines) {
    totalBilledCents += line.billedTotalCents;
    const flags: AuditFlagResult[] = [];

    // 1. Check if category is contracted (flat or tiered)
    const uncontractedFlag = checkUncontractedFeeCategory(
      line,
      context.feesByCategory,
      context.rateCardName,
      context.tieredFees
    );

    if (uncontractedFlag) {
      flags.push(uncontractedFlag);
    } else {
      // 2. Check if contracted rate was exceeded (evaluates flat or tiered weight rates)
      const rateExceededFlag = checkRateExceeded(
        line,
        context.feesByCategory,
        context.tieredFees
      );
      if (rateExceededFlag) {
        flags.push(rateExceededFlag);
      }
    }

    // 3. Check for duplicates
    const duplicateFlag = checkDuplicateCharge(line, duplicateTracker);
    if (duplicateFlag) {
      flags.push(duplicateFlag);
    }

    // 4. Check for MoM anomalous surge if historical data is available
    if (context.historicalBenchmarks) {
      const surgeFlag = checkMomSurge(line, context.historicalBenchmarks);
      if (surgeFlag) {
        flags.push(surgeFlag);
      }
    }

    // Accumulate flags and discrepancy totals
    for (const flag of flags) {
      totalFlagsCount++;
      flagsByRule[flag.ruleType]++;
      potentialDiscrepancyCents += Math.max(0, flag.differenceCents);
    }

    auditedLines.push({
      line,
      flags,
    });
  }

  return {
    lines: auditedLines,
    totalLines: lines.length,
    totalBilledCents,
    potentialDiscrepancyCents,
    totalFlagsCount,
    flagsByRule,
  };
}
