import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/passwords";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, token, newPassword } = await req.json();

    // Flow 1: Request reset token
    if (email && !token && !newPassword) {
      const cleanEmail = email.toLowerCase().trim();
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        // Return success anyway to avoid user enumeration
        return NextResponse.json({
          success: true,
          message: "If that email is registered, password reset instructions have been dispatched.",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours

      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt,
        },
      });

      return NextResponse.json({
        success: true,
        message: "If that email is registered, password reset instructions have been dispatched.",
        // For development/testing ease, we also return the token
        devResetToken: process.env.NODE_ENV !== "production" ? resetToken : undefined,
      });
    }

    // Flow 2: Reset password using token
    if (token && newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters long." },
          { status: 400 }
        );
      }

      const resetRecord = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Password reset link is invalid or has expired." },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(newPassword);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetRecord.userId },
          data: { passwordHash },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetRecord.id },
          data: { usedAt: new Date() },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Your password has been successfully updated. You may now log in.",
      });
    }

    return NextResponse.json({ error: "Invalid request parameters." }, { status: 400 });
  } catch (err: any) {
    console.error("Password reset error:", err);
    return NextResponse.json({ error: "Failed to process password reset." }, { status: 500 });
  }
}
