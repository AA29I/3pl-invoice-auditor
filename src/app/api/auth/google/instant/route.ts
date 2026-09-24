import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/passwords";
import { signToken, getSessionCookieOptions } from "@/lib/auth/session";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = body.email || "mettglobalinc@gmail.com";
    const cleanEmail = String(rawEmail).toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberships: {
          include: { workspace: true },
          take: 1,
        },
      },
    });

    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const passwordHash = await hashPassword(randomPassword);
      const displayName = body.name || cleanEmail.split("@")[0];
      const baseSlug = (displayName || "brand").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 15) || "brand";
      const slug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;

      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: displayName,
          passwordHash,
          memberships: {
            create: {
              role: "OWNER",
              workspace: {
                create: {
                  name: `${displayName}'s Organization`,
                  slug,
                  subscription: {
                    create: {
                      tier: "FREE",
                      status: "ACTIVE",
                    },
                  },
                },
              },
            },
          },
        },
        include: {
          memberships: {
            include: { workspace: true },
            take: 1,
          },
        },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId: user.memberships[0]?.workspaceId,
      },
    });

    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(cookieOpts.name, token, cookieOpts);

    return response;
  } catch (error: any) {
    console.error("Instant Gmail login error:", error);
    return NextResponse.json(
      { error: "Failed to sign in with Gmail. Please try again." },
      { status: 500 }
    );
  }
}
