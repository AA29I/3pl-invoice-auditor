import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getWorkspaceSubscription } from "@/lib/billing/limits";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: user.workspace.id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      subscription: true,
      _count: {
        select: {
          invoices: true,
          providers: true,
        },
      },
    },
  });

  const subInfo = await getWorkspaceSubscription(user.workspace.id);

  return NextResponse.json({
    workspace,
    subscription: subInfo,
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updated = await prisma.workspace.update({
      where: { id: user.workspace.id },
      data: { name: name.trim() },
    });

    return NextResponse.json({ workspace: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
