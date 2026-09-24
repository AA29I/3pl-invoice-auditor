export type PlanTier = "FREE" | "PRO" | "ENTERPRISE";

export interface PlanLimits {
  tier: PlanTier;
  maxAuditsPerMonth: number;
  maxRowsPerAudit: number;
  allowPdfExport: boolean;
  allowTeamMembers: boolean;
  auditHistoryDays: number;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: {
    tier: "FREE",
    maxAuditsPerMonth: 1,
    maxRowsPerAudit: 50,
    allowPdfExport: false,
    allowTeamMembers: false,
    auditHistoryDays: 14,
  },
  PRO: {
    tier: "PRO",
    maxAuditsPerMonth: 9999,
    maxRowsPerAudit: 50000,
    allowPdfExport: true,
    allowTeamMembers: true,
    auditHistoryDays: 365 * 3,
  },
  ENTERPRISE: {
    tier: "ENTERPRISE",
    maxAuditsPerMonth: 999999,
    maxRowsPerAudit: 500000,
    allowPdfExport: true,
    allowTeamMembers: true,
    auditHistoryDays: 365 * 10,
  },
};

export interface IBillingProvider {
  createCheckoutSession(params: {
    workspaceId: string;
    userId: string;
    userEmail: string;
    variantId?: string;
    redirectUrl: string;
  }): Promise<{ checkoutUrl: string }>;

  createCustomerPortalSession(params: {
    customerId: string;
  }): Promise<{ portalUrl: string }>;

  verifyWebhookSignature(payloadRaw: string, signature: string): boolean;

  processWebhookEvent(event: any): Promise<{
    handled: boolean;
    eventType: string;
    workspaceId?: string;
  }>;
}
