import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { generateAuditCsv, CsvExportRow } from "@/lib/export/csv-generator";
import { RULE_LABELS } from "@/types/audit";

export async function GET(
  req: Request,
  { params }: { params: { auditId: string } }
) {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { auditId } = params;

  const invoice = await prisma.invoice.findFirst({
    where: { id: auditId, workspaceId: user.workspace.id },
    include: {
      provider: true,
      flags: {
        include: {
          invoiceLine: true,
        },
        orderBy: {
          invoiceLine: {
            lineNumber: "asc",
          },
        },
      },
    },
  });

  if (!invoice) {
    return new Response("Audit not found", { status: 404 });
  }

  const rows: CsvExportRow[] = invoice.flags.map((flag) => {
    const ruleInfo = RULE_LABELS[flag.ruleType as keyof typeof RULE_LABELS];

    let customStr = "";
    if (flag.invoiceLine.customFields) {
      try {
        const cf =
          typeof flag.invoiceLine.customFields === "string"
            ? JSON.parse(flag.invoiceLine.customFields)
            : flag.invoiceLine.customFields;
        customStr = Object.entries(cf)
          .map(([k, v]) => `${k}:${v}`)
          .join("; ");
      } catch {}
    }

    const weightStr =
      flag.invoiceLine.billedWeight != null
        ? `${flag.invoiceLine.billedWeight} ${flag.invoiceLine.weightUnit || "LB"}`
        : "";

    return {
      invoiceNumber: invoice.invoiceNumber,
      lineNumber: flag.invoiceLine.lineNumber,
      orderReference: flag.invoiceLine.orderReference || "",
      category: flag.invoiceLine.matchedCategory || flag.invoiceLine.rawCategory,
      description: flag.invoiceLine.rawCategory,
      carrier: flag.invoiceLine.carrier || "",
      weight: weightStr,
      customFields: customStr,
      status: flag.status,
      ruleType: ruleInfo?.title || flag.ruleType,
      expectedRateCents: flag.expectedRateCents,
      expectedTotalCents: flag.expectedTotalCents,
      billedTotalCents: flag.billedTotalCents,
      differenceCents: flag.differenceCents,
      userNote: flag.userNote || "",
      calculationBreakdown: flag.calculationBreakdown,
    };
  });

  const csvContent = generateAuditCsv(rows);

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dispute-audit-${invoice.invoiceNumber}.csv"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
