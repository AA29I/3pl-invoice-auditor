import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { billingProvider } from "@/lib/billing/billing-provider";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutResult = await billingProvider.createCheckoutSession({
      workspaceId: user.workspace.id,
      userId: user.id,
      userEmail: user.email,
      redirectUrl: `${appUrl}/settings/billing`,
    });

    return NextResponse.json({ checkoutUrl: checkoutResult.checkoutUrl });
  } catch (error: any) {
    console.error("Checkout initiation error:", error);
    return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 });
  }
}
