import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProvidersPage() {
  const user = await getCurrentUser();
  if (!user || !user.workspace) return null;

  const providers = await prisma.provider.findMany({
    where: { workspaceId: user.workspace.id },
    include: {
      rateCards: {
        orderBy: { effectiveFrom: "desc" },
        include: {
          fees: true,
        },
      },
      _count: {
        select: { invoices: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD5C8] pb-5">
        <div>
          <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider">
            Vendor Directory
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#121210] tracking-tight mt-0.5">
            3PL Warehouse Providers
          </h1>
        </div>

        <Link
          href="/providers/new"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-[#090908] bg-[#B8892D] hover:bg-[#a67a26] border border-[#a67a26] rounded transition"
        >
          + Add 3PL Provider
        </Link>
      </div>

      {providers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => {
            const activeRateCard = p.rateCards[0];
            return (
              <Card key={p.id} className="bg-white hover:border-[#777268] transition flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-serif">{p.name}</CardTitle>
                    <Badge variant="ink">{p.currency}</Badge>
                  </div>
                  <p className="text-[11px] text-[#777268] font-mono mt-1">
                    {p.contactEmail || "No billing email registered"}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-xs font-mono text-[#777268] space-y-1.5">
                    <div className="flex justify-between">
                      <span>Rate Schedules:</span>
                      <span className="font-semibold text-[#121210]">{p.rateCards.length} schedule(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audited Invoices:</span>
                      <span className="font-semibold text-[#121210]">{p._count.invoices} statement(s)</span>
                    </div>
                    {activeRateCard && (
                      <div className="flex justify-between">
                        <span>Active Agreement:</span>
                        <span className="font-medium text-[#B8892D] truncate max-w-[150px]">
                          {activeRateCard.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#DCD5C8] flex items-center justify-between font-mono text-[11px]">
                    <Link
                      href={`/providers/${p.id}/rate-cards/new`}
                      className="text-[#B8892D] hover:underline font-semibold"
                    >
                      + New Rate Card
                    </Link>
                    <Link
                      href={`/providers/${p.id}`}
                      className="text-[#121210] hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center space-y-4">
          <div className="w-10 h-10 rounded bg-[#121210] text-[#FBFAF6] font-mono font-bold text-xs flex items-center justify-center mx-auto">
            3PL
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#121210]">No 3PL Providers Configured</h3>
            <p className="text-xs text-[#777268] max-w-sm mx-auto mt-1">
              Add your warehouse vendor and enter your signed rate schedule to begin auditing invoices.
            </p>
          </div>
          <Link
            href="/providers/new"
            className="inline-flex px-4 py-2 text-xs font-semibold text-[#090908] bg-[#B8892D] hover:bg-[#a67a26] rounded transition"
          >
            Add Your First 3PL Provider
          </Link>
        </Card>
      )}
    </div>
  );
}
