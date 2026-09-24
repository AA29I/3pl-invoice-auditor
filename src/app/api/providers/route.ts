import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providers = await prisma.provider.findMany({
    where: { workspaceId: user.workspace.id },
    include: {
      rateCards: {
        orderBy: { effectiveFrom: "desc" },
        include: {
          fees: true,
        },
      },
      invoices: {
        select: { id: true, invoiceNumber: true, totalBilledCents: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ providers });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, contactEmail, currency } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Provider name is required." }, { status: 400 });
    }

    const provider = await prisma.provider.create({
      data: {
        workspaceId: user.workspace.id,
        name: name.trim(),
        contactEmail: contactEmail?.trim() || null,
        currency: currency || "USD",
      },
    });

    return NextResponse.json({ provider });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A provider with this name already exists in your workspace." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create provider." }, { status: 500 });
  }
}
