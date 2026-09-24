import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: Request,
  { params }: { params: { auditId: string } }
) {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { auditId } = params;

  const invoice = await prisma.invoice.findFirst({
    where: { id: auditId, workspaceId: user.workspace.id },
    include: {
      provider: true,
      rateCard: {
        include: {
          fees: true,
        },
      },
      flags: {
        include: {
          invoiceLine: true,
        },
        orderBy: {
          differenceCents: "desc",
        },
      },
      lines: {
        orderBy: {
          lineNumber: "asc",
        },
      },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json({ invoice });
}

export async function DELETE(
  req: Request,
  { params }: { params: { auditId: string } }
) {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { auditId } = params;

  // Confirm ownership
  const invoice = await prisma.invoice.findFirst({
    where: { id: auditId, workspaceId: user.workspace.id },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  await prisma.invoice.delete({
    where: { id: auditId },
  });

  return NextResponse.json({ success: true, message: "Audit deleted successfully." });
}
