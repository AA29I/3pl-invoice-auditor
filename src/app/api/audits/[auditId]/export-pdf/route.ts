import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { assertCanExportPdf } from "@/lib/billing/limits";
import { generateDisputePdf } from "@/lib/export/pdf-generator";
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

  // Enforce plan limits on server
  const planCheck = await assertCanExportPdf(user.workspace.id);
  if (!planCheck.allowed) {
    return new Response(JSON.stringify({ error: planCheck.reason }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: auditId, workspaceId: user.workspace.id },
    include: {
      provider: true,
      workspace: true,
      flags: {
        include: {
          invoiceLine: true,
        },
        orderBy: {
          differenceCents: "desc",
        },
      },
    },
  });

  if (!invoice) {
    return new Response("Audit not found", { status: 404 });
  }

  const pdfData = {
    workspaceName: invoice.workspace.name,
    providerName: invoice.provider.name,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString(),
    totalBilledCents: invoice.totalBilledCents,
    potentialDiscrepancyCents: invoice.potentialDiscrepancyCents,
    confirmedDiscrepancyCents: invoice.confirmedDiscrepancyCents,
    flags: invoice.flags.map((f) => {
      const rule = RULE_LABELS[f.ruleType as keyof typeof RULE_LABELS];
      return {
        lineNumber: f.invoiceLine.lineNumber,
        reference: f.invoiceLine.orderReference || "",
        category: f.invoiceLine.matchedCategory || f.invoiceLine.rawCategory,
        expectedRateCents: f.expectedRateCents,
        billedTotalCents: f.billedTotalCents,
        differenceCents: f.differenceCents,
        ruleTitle: rule?.title || f.ruleType,
        status: f.status,
        notes: f.userNote || undefined,
      };
    }),
  };

  const pdfBytes = generateDisputePdf(pdfData);

  return new Response(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="dispute-claim-${invoice.invoiceNumber}.pdf"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
