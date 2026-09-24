import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/passwords";
import { signToken, getSessionCookieOptions } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const { email, password, name, workspaceName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const resolvedName = name?.trim() || cleanEmail.split("@")[0];
    const brandName = workspaceName?.trim() || `${resolvedName}'s Brand`;
    const slug = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // Create User, Workspace, WorkspaceMember, and default Free Subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          name: resolvedName,
          passwordHash,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: brandName,
          slug,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      await tx.subscription.create({
        data: {
          workspaceId: workspace.id,
          tier: "FREE",
          status: "ACTIVE",
        },
      });

      return { user, workspace };
    });

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        workspaceId: result.workspace.id,
      },
    });

    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(cookieOpts.name, token, cookieOpts);

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    const isDbError =
      !process.env.DATABASE_URL ||
      process.env.DATABASE_URL.includes("placeholder") ||
      error?.message?.includes("Can't reach database") ||
      error?.message?.includes("connect") ||
      error?.code === "P1001";

    return NextResponse.json(
      {
        error: isDbError
          ? "Database connection failed. Please ensure DATABASE_URL is configured in your Vercel project settings."
          : "Failed to create account. Please try again.",
      },
      { status: 500 }
    );
  }
}
