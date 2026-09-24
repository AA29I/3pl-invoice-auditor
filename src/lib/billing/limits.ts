import { prisma } from "@/lib/db/prisma";
import { PLAN_LIMITS, PlanTier } from "@/types/billing";

export async function getWorkspaceSubscription(workspaceId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { workspaceId },
  });

  const tier: PlanTier = (sub?.tier as PlanTier) || "FREE";
  const isActive = sub?.status === "ACTIVE" || sub?.status === "TRIALING";

  return {
    tier: isActive ? tier : "FREE",
    status: sub?.status || "INACTIVE",
    portalUrl: sub?.portalUrl || null,
    currentPeriodEnd: sub?.currentPeriodEnd || null,
    limits: PLAN_LIMITS[isActive ? tier : "FREE"],
  };
}

export async function assertCanUploadInvoice(
  workspaceId: string,
  rowCount: number
): Promise<{ allowed: boolean; reason?: string; tier: PlanTier }> {
  const { tier, limits } = await getWorkspaceSubscription(workspaceId);

  // Check row limit
  if (rowCount > limits.maxRowsPerAudit) {
    return {
      allowed: false,
      reason: `Invoice has ${rowCount} lines, which exceeds the ${tier} tier limit of ${limits.maxRowsPerAudit} lines. Please upgrade to Pro for high-volume invoice auditing.`,
      tier,
    };
  }

  // Count audits performed this calendar month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const auditsCount = await prisma.invoice.count({
    where: {
      workspaceId,
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  if (auditsCount >= limits.maxAuditsPerMonth) {
    return {
      allowed: false,
      reason: `Your workspace has reached the ${tier} plan limit of ${limits.maxAuditsPerMonth} audit(s) this month. Upgrade to Pro for unlimited recurring audits.`,
      tier,
    };
  }

  return { allowed: true, tier };
}

export async function assertCanExportPdf(
  workspaceId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const { limits, tier } = await getWorkspaceSubscription(workspaceId);

  if (!limits.allowPdfExport) {
    return {
      allowed: false,
      reason: `PDF Dispute Claim export is a Pro feature. Upgrade your workspace to export formatted PDF dispute statements.`,
    };
  }

  return { allowed: true };
}
