import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: user.workspace.id },
    select: { id: true, devModeEnabled: true },
  });

  return NextResponse.json({ devModeEnabled: Boolean(workspace?.devModeEnabled) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { devModeEnabled } = await req.json();

    const updated = await prisma.workspace.update({
      where: { id: user.workspace.id },
      data: { devModeEnabled: Boolean(devModeEnabled) },
      select: { id: true, devModeEnabled: true },
    });

    return NextResponse.json({
      success: true,
      devModeEnabled: updated.devModeEnabled,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
