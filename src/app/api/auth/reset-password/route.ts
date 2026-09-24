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
          message: "If that email is registered, password reset instructions have been generated.",
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

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://3pl-invoice-auditor.vercel.app";
      const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

      let emailSent = false;
      if (process.env.RESEND_API_KEY) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || "3PL Auditor <onboarding@resend.dev>",
              to: [cleanEmail],
              subject: "Reset your 3PL Invoice Auditor password",
              html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #DCD5C8; border-radius: 6px; background-color: #FBFAF6;">
                  <h2 style="color: #121210; margin-top: 0; font-family: Georgia, serif;">Password Reset Request</h2>
                  <p style="color: #777268; font-size: 14px; line-height: 1.6;">You requested a password reset for your 3PL Invoice Auditor account (${cleanEmail}).</p>
                  <p style="margin: 24px 0;">
                    <a href="${resetLink}" style="background-color: #B8892D; color: #090908; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 4px; display: inline-block;">Set New Password</a>
                  </p>
                  <p style="color: #777268; font-size: 12px; line-height: 1.5;">This link will expire in 2 hours. If you did not request this, you can safely ignore this email.</p>
                </div>
              `,
            }),
          });
          if (res.ok) emailSent = true;
        } catch (mailErr) {
          console.error("Failed to send email via Resend:", mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        emailSent,
        message: emailSent
          ? `Password reset instructions have been dispatched to ${cleanEmail}.`
          : "Password reset link generated. You may set your new password immediately.",
        resetLink: !emailSent ? resetLink : undefined,
        directToken: !emailSent ? resetToken : undefined,
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
