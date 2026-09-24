import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { billingProvider } from "@/lib/billing/billing-provider";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = await prisma.subscription.findUnique({
      where: { workspaceId: user.workspace.id },
    });

    const portal = await billingProvider.createCustomerPortalSession({
      customerId: sub?.customerId || "",
    });

    return NextResponse.json({ portalUrl: portal.portalUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cancel subscription on period end
    await prisma.subscription.updateMany({
      where: { workspaceId: user.workspace.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription set to cancel at end of billing cycle.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
