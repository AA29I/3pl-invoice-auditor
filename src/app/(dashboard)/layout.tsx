import React from "react";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { getWorkspaceSubscription } from "@/lib/billing/limits";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !user.workspace) {
    redirect("/login");
  }

  const { tier } = await getWorkspaceSubscription(user.workspace.id);

  return (
    <DashboardShell
      workspaceName={user.workspace.name}
      planTier={tier}
      userName={user.name}
      userEmail={user.email}
      initialDevMode={Boolean(user.workspace.devModeEnabled)}
    >
      {children}
    </DashboardShell>
  );
}
