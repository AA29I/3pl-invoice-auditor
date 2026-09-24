import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { auditId: string; flagId: string } }
) {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { auditId, flagId } = params;

  try {
    const { status, userNote } = await req.json();

    // Verify invoice belongs to workspace
    const invoice = await prisma.invoice.findFirst({
      where: { id: auditId, workspaceId: user.workspace.id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const updatedFlag = await prisma.auditFlag.update({
      where: { id: flagId },
      data: {
        ...(status ? { status } : {}),
        ...(userNote !== undefined ? { userNote } : {}),
        resolvedAt: status === "CONFIRMED" || status === "DISMISSED" ? new Date() : null,
        resolvedByUserId: user.id,
      },
    });

    // Recompute total confirmed discrepancy on the parent invoice
    const confirmedFlags = await prisma.auditFlag.findMany({
      where: {
        invoiceId: auditId,
        status: "CONFIRMED",
      },
      select: {
        differenceCents: true,
      },
    });

    const confirmedDiscrepancyCents = confirmedFlags.reduce(
      (sum, f) => sum + Math.max(0, f.differenceCents),
      0
    );

    await prisma.invoice.update({
      where: { id: auditId },
      data: { confirmedDiscrepancyCents },
    });

    return NextResponse.json({ flag: updatedFlag, confirmedDiscrepancyCents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
