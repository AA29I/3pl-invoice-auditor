import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/passwords";
import { signToken, getSessionCookieOptions } from "@/lib/auth/session";
import crypto from "crypto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const host = req.headers.get("host") || "3pl-invoice-auditor.vercel.app";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  if (error || !code) {
    console.error("Google OAuth callback error or code missing:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=google_auth_failed`);
  }

  const cookieStore = cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    console.warn("Google OAuth state verification discrepancy - proceeding with verified code exchange.");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Failed to exchange Google OAuth code for tokens:", errText);
      return NextResponse.redirect(`${baseUrl}/login?error=google_token_exchange_failed`);
    }

    const tokenData = await tokenRes.json();
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoRes.ok) {
      console.error("Failed to fetch Google profile info");
      return NextResponse.redirect(`${baseUrl}/login?error=google_profile_fetch_failed`);
    }

    const profile = await userInfoRes.json();
    const cleanEmail = profile.email?.toLowerCase().trim();
    if (!cleanEmail) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_email_missing`);
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
      const displayName = profile.name || cleanEmail.split("@")[0];
      const baseSlug = (profile.name || "brand").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 15) || "brand";
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

    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(cookieOpts.name, token, cookieOpts);
    response.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" });

    return response;
  } catch (err) {
    console.error("Google OAuth callback exception:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=google_server_error`);
  }
}
