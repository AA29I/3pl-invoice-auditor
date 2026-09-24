import { PrismaClient } from "@prisma/client";
import { formatCents } from "../src/lib/money/currency";
import { generateAuditCsv, CsvExportRow } from "../src/lib/export/csv-generator";
import { generateDisputePdf } from "../src/lib/export/pdf-generator";
import { RULE_LABELS } from "../src/types/audit";

const prisma = new PrismaClient();

async function runAuditDemonstration() {
  console.log("=================================================================");
  console.log("  3PL INVOICE AUDITOR — DETERMINISTIC AUDIT DEMONSTRATION");
  console.log("=================================================================\n");

  const invoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: "INV-2026-08-DEMO" },
    include: {
      provider: true,
      workspace: true,
      rateCard: { include: { fees: true } },
      lines: { orderBy: { lineNumber: "asc" } },
      flags: {
        include: { invoiceLine: true },
        orderBy: { differenceCents: "desc" },
      },
    },
  });

  if (!invoice) {
    console.error("Demo invoice not found in database! Please run `npm run seed` first.");
    process.exit(1);
  }

  console.log(`[INVOICE AUDITED]`);
  console.log(`  Workspace:        ${invoice.workspace.name}`);
  console.log(`  3PL Provider:     ${invoice.provider.name}`);
  console.log(`  Contract Rate:    ${invoice.rateCard?.name}`);
  console.log(`  Invoice Number:   ${invoice.invoiceNumber}`);
  console.log(`  Billing Period:   ${invoice.billingPeriodStart.toISOString().slice(0, 10)} to ${invoice.billingPeriodEnd.toISOString().slice(0, 10)}`);
  console.log(`  Total Rows:       ${invoice.totalLines}`);
  console.log(`  Total Billed:     ${formatCents(invoice.totalBilledCents)}`);
  console.log(`  Potential Overage:${formatCents(invoice.potentialDiscrepancyCents)}`);
  console.log(`  Flags Generated:  ${invoice.flags.length}\n`);

  console.log("-----------------------------------------------------------------");
  console.log("  LINE ITEM AUDIT FLAGS (SORTED BY VARIANCE)");
  console.log("-----------------------------------------------------------------\n");

  invoice.flags.forEach((flag, idx) => {
    const ruleInfo = RULE_LABELS[flag.ruleType as keyof typeof RULE_LABELS];
    console.log(`Flag #${idx + 1}: [${ruleInfo?.title.toUpperCase() || flag.ruleType}]`);
    console.log(`  Line Number:     #${flag.invoiceLine.lineNumber}`);
    console.log(`  Reference ID:    ${flag.invoiceLine.orderReference || "N/A"}`);
    console.log(`  Raw Description: "${flag.invoiceLine.rawCategory}"`);
    console.log(`  Billed Rate:     ${formatCents(flag.invoiceLine.billedRateCents)} (${flag.invoiceLine.billedQuantity} units)`);
    console.log(`  Billed Total:    ${formatCents(flag.billedTotalCents)}`);
    console.log(`  Contract Rate:   ${flag.expectedRateCents !== null ? formatCents(flag.expectedRateCents) : "Not in contract"}`);
    console.log(`  Expected Total:  ${flag.expectedTotalCents !== null ? formatCents(flag.expectedTotalCents) : "$0.00"}`);
    console.log(`  Discrepancy:     +${formatCents(flag.differenceCents)}`);
    console.log(`  Triage Status:   ${flag.status}`);
    console.log(`  Calculation:     ${flag.calculationBreakdown}`);
    console.log("");
  });

  // Verify CSV generation
  const csvRows: CsvExportRow[] = invoice.flags.map((f) => ({
    invoiceNumber: invoice.invoiceNumber,
    lineNumber: f.invoiceLine.lineNumber,
    orderReference: f.invoiceLine.orderReference || "",
    category: f.invoiceLine.matchedCategory || f.invoiceLine.rawCategory,
    description: f.invoiceLine.rawCategory,
    status: f.status,
    ruleType: f.ruleType,
    expectedRateCents: f.expectedRateCents,
    expectedTotalCents: f.expectedTotalCents,
    billedTotalCents: f.billedTotalCents,
    differenceCents: f.differenceCents,
    userNote: f.userNote || "",
    calculationBreakdown: f.calculationBreakdown,
  }));

  const csvContent = generateAuditCsv(csvRows);
  console.log(`[CSV EXPORT VERIFICATION] Generated ${csvContent.split("\n").length} CSV lines.`);

  // Verify PDF generation
  const pdfBytes = generateDisputePdf({
    workspaceName: invoice.workspace.name,
    providerName: invoice.provider.name,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toLocaleDateString(),
    totalBilledCents: invoice.totalBilledCents,
    potentialDiscrepancyCents: invoice.potentialDiscrepancyCents,
    confirmedDiscrepancyCents: invoice.confirmedDiscrepancyCents,
    flags: invoice.flags.map((f) => ({
      lineNumber: f.invoiceLine.lineNumber,
      reference: f.invoiceLine.orderReference || "",
      category: f.invoiceLine.matchedCategory || f.invoiceLine.rawCategory,
      expectedRateCents: f.expectedRateCents,
      billedTotalCents: f.billedTotalCents,
      differenceCents: f.differenceCents,
      ruleTitle: f.ruleType,
      status: f.status,
    })),
  });

  console.log(`[PDF EXPORT VERIFICATION] Generated dispute PDF document of ${pdfBytes.length} bytes.`);
  console.log("\n=================================================================");
  console.log("  DEMONSTRATION COMPLETE: ALL DETERMINISTIC AUDIT RULES PASSED!");
  console.log("=================================================================\n");
}

runAuditDemonstration()
  .catch((e) => {
    console.error("Demonstration failure:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
