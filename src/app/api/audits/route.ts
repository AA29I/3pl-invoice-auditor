import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { assertCanUploadInvoice } from "@/lib/billing/limits";
import { normalizeInvoiceRows } from "@/lib/audit/normalizer";
import { executeDeterministicAudit, AuditContext } from "@/lib/audit/engine";
import { ColumnMappingConfig } from "@/types/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    where: { workspaceId: user.workspace.id },
    include: {
      provider: { select: { id: true, name: true } },
      rateCard: { select: { id: true, name: true } },
      _count: {
        select: {
          flags: true,
          lines: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = user.workspace.id;

  try {
    const {
      providerId,
      rateCardId,
      invoiceNumber,
      invoiceDate,
      billingPeriodStart,
      billingPeriodEnd,
      fileName,
      fileSize,
      rawRows,
      mapping,
    }: {
      providerId: string;
      rateCardId: string;
      invoiceNumber: string;
      invoiceDate: string;
      billingPeriodStart: string;
      billingPeriodEnd: string;
      fileName: string;
      fileSize: number;
      rawRows: Record<string, string>[];
      mapping: ColumnMappingConfig;
    } = await req.json();

    if (!providerId || !rateCardId || !invoiceNumber || !rawRows || rawRows.length === 0) {
      return NextResponse.json(
        { error: "Missing required invoice payload or rows." },
        { status: 400 }
      );
    }

    // Check if workspace is running in Dev / Sandbox Mode
    const workspaceRecord = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { devModeEnabled: true },
    });
    const isDev = Boolean(workspaceRecord?.devModeEnabled);

    // 1. Enforce Plan Limits on the Server (Bypassed in Dev Mode so companies can test freely)
    if (!isDev) {
      const planCheck = await assertCanUploadInvoice(workspaceId, rawRows.length);
      if (!planCheck.allowed) {
        return NextResponse.json({ error: planCheck.reason }, { status: 403 });
      }
    }

    // 2. Parse & Validate Rows Pre-Flight
    const normResult = normalizeInvoiceRows(rawRows, mapping);
    if (!normResult.isValid || normResult.lines.length === 0) {
      return NextResponse.json(
        {
          error: "CSV validation failed. Please correct the flagged row errors.",
          validationErrors: normResult.errors,
        },
        { status: 422 }
      );
    }

    // 3. Load Selected Rate Card & Contracted Fees
    const rateCard = await prisma.rateCard.findFirst({
      where: { id: rateCardId, providerId },
      include: { fees: true },
    });

    if (!rateCard) {
      return NextResponse.json({ error: "Contracted rate card not found." }, { status: 404 });
    }

    const feesByCategory = new Map();
    const tieredFees = [];

    for (const f of rateCard.fees) {
      feesByCategory.set(f.category, {
        id: f.id,
        category: f.category,
        unitType: f.unitType,
        rateCents: f.rateCents,
        description: f.description,
        feeType: f.feeType,
        shipper: f.shipper,
        serviceLevel: f.serviceLevel,
        weightUnit: f.weightUnit,
        minWeight: f.minWeight,
        maxWeight: f.maxWeight,
        zone: f.zone,
        incrementalRateCents: f.incrementalRateCents,
        incrementalWeightStep: f.incrementalWeightStep,
      });

      if (f.feeType === "TIERED_WEIGHT" || f.minWeight != null || f.maxWeight != null) {
        tieredFees.push({
          id: f.id,
          category: f.category,
          description: f.description,
          unitType: f.unitType,
          rateCents: f.rateCents,
          feeType: f.feeType || "TIERED_WEIGHT",
          shipper: f.shipper,
          serviceLevel: f.serviceLevel,
          weightUnit: f.weightUnit,
          minWeight: f.minWeight,
          maxWeight: f.maxWeight,
          zone: f.zone,
          incrementalRateCents: f.incrementalRateCents,
          incrementalWeightStep: f.incrementalWeightStep,
        });
      }
    }

    // 4. Retrieve Historical Benchmarks for Month-over-Month Rule
    const priorLines = await prisma.invoiceLine.findMany({
      where: {
        invoice: {
          workspaceId,
          providerId,
          status: "COMPLETED",
        },
      },
      select: {
        matchedCategory: true,
        billedRateCents: true,
      },
    });

    const historicalBenchmarks = new Map();
    if (priorLines.length > 0) {
      const grouped: Record<string, number[]> = {};
      for (const pl of priorLines) {
        if (!pl.matchedCategory) continue;
        if (!grouped[pl.matchedCategory]) grouped[pl.matchedCategory] = [];
        grouped[pl.matchedCategory].push(pl.billedRateCents);
      }
      for (const [cat, rates] of Object.entries(grouped)) {
        const sum = rates.reduce((a, b) => a + b, 0);
        historicalBenchmarks.set(cat, {
          averageRateCents: Math.round(sum / rates.length),
          sampleCount: rates.length,
        });
      }
    }

    // 5. Run Deterministic Audit Engine (including tiered weight brackets & shipper rules)
    const auditContext: AuditContext = {
      rateCardName: rateCard.name,
      feesByCategory,
      tieredFees,
      historicalBenchmarks,
    };

    const auditOutcome = executeDeterministicAudit(normResult.lines, auditContext);

    // 6. Persist Audit, Lines, and Flags in a Transaction
    const savedInvoice = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          workspaceId,
          providerId,
          rateCardId: rateCard.id,
          invoiceNumber: invoiceNumber.trim(),
          invoiceDate: new Date(invoiceDate || Date.now()),
          billingPeriodStart: new Date(billingPeriodStart || Date.now()),
          billingPeriodEnd: new Date(billingPeriodEnd || Date.now()),
          fileName: fileName || "invoice.csv",
          fileSize: fileSize || 0,
          totalLines: auditOutcome.totalLines,
          totalBilledCents: auditOutcome.totalBilledCents,
          potentialDiscrepancyCents: auditOutcome.potentialDiscrepancyCents,
          confirmedDiscrepancyCents: 0,
          status: "COMPLETED",
          isDevMode: isDev,
          customFields: mapping.customFieldMappings ? JSON.stringify(mapping.customFieldMappings) : null,
        },
      });

      for (const item of auditOutcome.lines) {
        const line = item.line;
        const createdLine = await tx.invoiceLine.create({
          data: {
            invoiceId: invoice.id,
            lineNumber: line.lineNumber,
            serviceDate: line.serviceDate,
            orderReference: line.orderReference,
            rawCategory: line.rawCategory,
            matchedCategory: line.matchedCategory,
            billedQuantity: line.billedQuantity,
            billedRateCents: line.billedRateCents,
            billedTotalCents: line.billedTotalCents,
            billedWeight: line.billedWeight,
            weightUnit: line.weightUnit,
            carrier: line.carrier,
            zone: line.zone,
            customFields: line.customFields ? JSON.stringify(line.customFields) : null,
            rawData: JSON.stringify(line.rawData),
          },
        });

        for (const flag of item.flags) {
          await tx.auditFlag.create({
            data: {
              invoiceId: invoice.id,
              invoiceLineId: createdLine.id,
              ruleType: flag.ruleType,
              status: flag.status,
              expectedRateCents: flag.expectedRateCents,
              expectedTotalCents: flag.expectedTotalCents,
              billedTotalCents: flag.billedTotalCents,
              differenceCents: flag.differenceCents,
              calculationBreakdown: flag.calculationBreakdown,
            },
          });
        }
      }

      return invoice;
    });

    return NextResponse.json({
      success: true,
      auditId: savedInvoice.id,
      summary: {
        totalLines: auditOutcome.totalLines,
        totalBilledCents: auditOutcome.totalBilledCents,
        potentialDiscrepancyCents: auditOutcome.potentialDiscrepancyCents,
        totalFlagsCount: auditOutcome.totalFlagsCount,
        flagsByRule: auditOutcome.flagsByRule,
      },
    });
  } catch (error: any) {
    console.error("Audit processing error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "An audit for this provider and invoice number already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to audit invoice: " + error.message },
      { status: 500 }
    );
  }
}
