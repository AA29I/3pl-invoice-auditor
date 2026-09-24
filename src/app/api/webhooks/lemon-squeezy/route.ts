import { NextResponse } from "next/server";
import { billingProvider } from "@/lib/billing/billing-provider";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    // Cryptographic signature check
    const isValid = billingProvider.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("Invalid Lemon Squeezy webhook signature rejected.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const result = await billingProvider.processWebhookEvent(body);

    return NextResponse.json({
      received: true,
      handled: result.handled,
      eventType: result.eventType,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
