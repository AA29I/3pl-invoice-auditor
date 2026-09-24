import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only workspace OWNER or ADMIN can trigger bulk deletion
  if (user.workspace.role !== "OWNER" && user.workspace.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only workspace owners or administrators can delete workspace data." },
      { status: 403 }
    );
  }

  try {
    const { confirmation } = await req.json();
    if (confirmation !== "DELETE_ALL_DATA") {
      return NextResponse.json(
        { error: "Confirmation keyword 'DELETE_ALL_DATA' is required." },
        { status: 400 }
      );
    }

    // Delete all invoices, lines, flags, rate cards, and providers belonging to this workspace
    await prisma.$transaction([
      prisma.invoice.deleteMany({
        where: { workspaceId: user.workspace.id },
      }),
      prisma.provider.deleteMany({
        where: { workspaceId: user.workspace.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "All invoices, rate cards, and provider data have been permanently deleted.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
