import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { MarketingHeaderClient } from "@/components/marketing/header-client";

export async function MarketingHeader() {
  const user = await getCurrentUser();
  return <MarketingHeaderClient isAuthenticated={Boolean(user)} />;
}
