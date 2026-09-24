import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-insecure-dev-secret-do-not-use-in-production";
const COOKIE_NAME = "three_pl_auditor_session";

export interface SessionPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  workspace: {
    id: string;
    name: string;
    slug: string;
    role: string;
    devModeEnabled?: boolean;
  } | null;
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
        take: 1,
      },
    },
  });

  if (!user) return null;

  const primaryMembership = user.memberships[0];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    workspace: primaryMembership
      ? {
          id: primaryMembership.workspace.id,
          name: primaryMembership.workspace.name,
          slug: primaryMembership.workspace.slug,
          role: primaryMembership.role,
          devModeEnabled: Boolean(primaryMembership.workspace.devModeEnabled),
        }
      : null,
  };
}

export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  };
}
