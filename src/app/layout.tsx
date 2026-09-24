import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "3PL Invoice Auditor | Verify Warehouse Contract Rates & Overcharges",
    template: "%s | 3PL Invoice Auditor",
  },
  description:
    "Deterministic warehouse fulfillment invoice audit software. Verify contracted rates, detect duplicate lines, uncontracted surcharges, and anomalous rate increases on your 3PL bills.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  keywords: [
    "3PL invoice audit",
    "fulfillment invoice checker",
    "3PL billing errors",
    "pick and pack fee calculator",
    "warehouse rate card audit",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "3PL Invoice Auditor",
    title: "3PL Invoice Auditor — Warehouse Fulfillment Billing Audit Software",
    description:
      "Deterministic audit rules to check 3PL warehouse invoices against contracted rate cards.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans text-[#121210] bg-[#FBFAF6]">
        {children}
      </body>
    </html>
  );
}
