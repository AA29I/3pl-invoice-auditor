import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatCents } from "@/lib/money/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AuditsListPage() {
  const user = await getCurrentUser();
  if (!user || !user.workspace) return null;

  const invoices = await prisma.invoice.findMany({
    where: { workspaceId: user.workspace.id },
    include: {
      provider: true,
      rateCard: true,
      _count: {
        select: { flags: true, lines: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD5C8] pb-5">
        <div>
          <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider">
            Audit Records
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#121210] tracking-tight mt-0.5">
            Fulfillment Invoices
          </h1>
        </div>

        <Link
          href="/audits/new"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-[#090908] bg-[#B8892D] hover:bg-[#a67a26] border border-[#a67a26] rounded transition"
        >
          + Upload &amp; Audit CSV
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Historical Audit Statements ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
                <thead className="bg-[#F3F0E8]">
                  <tr>
                    <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">3PL Warehouse</th>
                    <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">Invoice #</th>
                    <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">Date Audited</th>
                    <th className="px-5 py-2.5 text-right font-mono font-medium text-[#777268]">Lines</th>
                    <th className="px-5 py-2.5 text-right font-mono font-medium text-[#777268]">Total Billed</th>
                    <th className="px-5 py-2.5 text-right font-mono font-medium text-[#777268]">Potential Discrepancy</th>
                    <th className="px-5 py-2.5 text-right font-mono font-medium text-[#777268]">Confirmed</th>
                    <th className="px-5 py-2.5 text-center font-mono font-medium text-[#777268]">Flags</th>
                    <th className="px-5 py-2.5 text-right font-mono font-medium text-[#777268]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCD5C8]/60 bg-white">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FBFAF6]">
                      <td className="px-5 py-3 font-semibold text-[#121210]">
                        {inv.provider.name}
                      </td>
                      <td className="px-5 py-3 font-mono text-[#777268]">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[#121210] font-medium">{inv.invoiceNumber}</span>
                          {inv.isDevMode && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#121210] text-[#E0BC68] uppercase font-bold border border-[#B8892D]">
                              DEV
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-[11px] text-[#777268]">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-[#777268]">
                        {inv.totalLines}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-[#121210]">
                        {formatCents(inv.totalBilledCents)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-[#B8892D]">
                        +{formatCents(inv.potentialDiscrepancyCents)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-[#8f2020]">
                        {formatCents(inv.confirmedDiscrepancyCents)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Badge variant={inv._count.flags > 0 ? "gold" : "neutral"}>
                          {inv._count.flags} flag(s)
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        <Link
                          href={`/audits/${inv.id}`}
                          className="font-medium text-[#B8892D] hover:underline"
                        >
                          Review &amp; Export →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs font-mono text-[#777268] space-y-3">
              <p>No warehouse invoices have been audited yet.</p>
              <Link
                href="/audits/new"
                className="inline-flex px-4 py-2 text-xs font-semibold text-[#090908] bg-[#B8892D] hover:bg-[#a67a26] rounded transition"
              >
                Upload &amp; Audit First Invoice
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
