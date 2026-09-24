import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspace_id");
  const email = url.searchParams.get("email");
  const redirectUrl = url.searchParams.get("redirect_url") || "/settings/billing";

  if (!workspaceId) {
    return new Response("Missing workspace_id", { status: 400 });
  }

  // HTML UI for Sandbox Test Mode
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lemon Squeezy Sandbox Checkout - 3PL Invoice Auditor</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
    <div class="bg-amber-500 text-white px-6 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="font-bold tracking-wide">LEMON SQUEEZY TEST MODE</span>
      </div>
      <span class="text-xs bg-amber-600 px-2 py-1 rounded">Sandbox</span>
    </div>
    
    <div class="p-6 space-y-6">
      <div>
        <h2 class="text-xl font-bold text-slate-900">3PL Auditor Pro Subscription</h2>
        <p class="text-sm text-slate-500 mt-1">Unlimited monthly audits, 50,000 line capacity, PDF dispute claims.</p>
        <div class="mt-4 flex items-baseline text-2xl font-extrabold text-slate-900">
          $49.00
          <span class="ml-1 text-sm font-medium text-slate-500">/ month</span>
        </div>
      </div>

      <div class="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs space-y-1">
        <div class="flex justify-between text-slate-600">
          <span>Customer Email:</span>
          <span class="font-mono font-medium">${email || "user@example.com"}</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>Workspace Target:</span>
          <span class="font-mono text-slate-800">${workspaceId}</span>
        </div>
      </div>

      <div class="space-y-3 pt-2">
        <button id="pay-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-sm">
          Complete Test Payment ($49.00)
        </button>
        <a href="${redirectUrl}?cancelled=true" class="block text-center text-sm text-slate-500 hover:text-slate-800 py-1">
          Cancel and return to workspace
        </a>
      </div>

      <div id="status-box" class="hidden text-xs p-3 rounded bg-slate-100 text-slate-700"></div>
    </div>
  </div>

  <script>
    document.getElementById("pay-btn").addEventListener("click", async () => {
      const btn = document.getElementById("pay-btn");
      const status = document.getElementById("status-box");
      btn.disabled = true;
      btn.innerText = "Dispatching Signed Webhook...";
      status.classList.remove("hidden");
      status.innerText = "Generating HMAC-SHA256 signature and triggering subscription_created event...";

      try {
        const res = await fetch("/api/billing/test-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: "${workspaceId}",
            email: "${email || "user@example.com"}"
          })
        });

        const data = await res.json();
        if (data.success) {
          status.innerText = "Payment & signed webhook verified! Redirecting...";
          setTimeout(() => {
            window.location.href = "${redirectUrl}?upgraded=true";
          }, 1200);
        } else {
          status.innerText = "Error: " + (data.error || "Simulation failed");
          btn.disabled = false;
        }
      } catch (err) {
        status.innerText = "Network error during test dispatch: " + err.message;
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  try {
    const { workspaceId, email } = await req.json();

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
    }

    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "lmsq_test_webhook_secret_key";
    const subId = `sub_test_${Date.now()}`;
    const customerId = `cust_test_${Date.now()}`;

    const payloadObj = {
      meta: {
        event_name: "subscription_created",
        custom_data: {
          workspace_id: workspaceId,
          event_id: `evt_test_${Date.now()}`,
        },
      },
      data: {
        id: subId,
        type: "subscriptions",
        attributes: {
          store_id: 12345,
          customer_id: customerId,
          order_id: `ord_${Date.now()}`,
          status: "active",
          status_formatted: "Active",
          user_name: "Test Customer",
          user_email: email,
          variant_id: 9999,
          renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          urls: {
            customer_portal: "https://app.lemonsqueezy.com/my-orders",
            update_payment_method: "https://app.lemonsqueezy.com/my-orders",
          },
        },
      },
    };

    const payloadRaw = JSON.stringify(payloadObj);
    const hmac = crypto.createHmac("sha256", webhookSecret);
    const signature = hmac.update(payloadRaw).digest("hex");

    // Call our actual webhook endpoint using standard HTTP post with signature
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookRes = await fetch(`${appUrl}/api/webhooks/lemon-squeezy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": signature,
      },
      body: payloadRaw,
    });

    if (!webhookRes.ok) {
      const errText = await webhookRes.text();
      return NextResponse.json({ error: `Webhook error: ${errText}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, subId });
  } catch (error: any) {
    console.error("Test checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
