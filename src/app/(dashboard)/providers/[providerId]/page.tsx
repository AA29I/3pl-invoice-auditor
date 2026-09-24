import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatCents } from "@/lib/money/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FEE_CATEGORY_LABELS, StandardFeeCategory } from "@/types/audit";

export default async function ProviderDetailPage({
  params,
}: {
  params: { providerId: string };
}) {
  const user = await getCurrentUser();
  if (!user || !user.workspace) return null;

  const provider = await prisma.provider.findFirst({
    where: { id: params.providerId, workspaceId: user.workspace.id },
    include: {
      rateCards: {
        orderBy: { effectiveFrom: "desc" },
        include: {
          fees: true,
        },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!provider) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-xs font-mono text-[#777268]">
        <Link href="/providers" className="hover:underline">
          Providers
        </Link>
        <span>/</span>
        <span className="text-[#121210] font-medium">{provider.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD5C8] pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-serif font-bold text-[#121210]">{provider.name}</h1>
            <Badge variant="ink">{provider.currency}</Badge>
          </div>
          <p className="text-xs text-[#777268] mt-1 font-mono">
            Contact: {provider.contactEmail || "No billing email configured"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/providers/${provider.id}/rate-cards/new`}
            className="px-4 py-2 text-xs font-semibold text-[#090908] bg-[#B8892D] hover:bg-[#a67a26] border border-[#a67a26] rounded transition font-mono"
          >
            + Add Rate Card
          </Link>
        </div>
      </div>

      {/* Rate Cards Section */}
      <div className="space-y-4">
        <h2 className="text-base font-serif font-bold text-[#121210]">
          Contracted Rate Cards ({provider.rateCards.length})
        </h2>

        {provider.rateCards.length > 0 ? (
          <div className="space-y-4">
            {provider.rateCards.map((rc) => (
              <Card key={rc.id} className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base">{rc.name}</CardTitle>
                    <p className="text-xs font-mono text-[#777268] mt-0.5">
                      Effective: {new Date(rc.effectiveFrom).toLocaleDateString()}
                      {rc.effectiveTo ? ` to ${new Date(rc.effectiveTo).toLocaleDateString()}` : " (Current / Active)"}
                    </p>
                  </div>
                  <Badge variant={rc.effectiveTo ? "neutral" : "gold"}>
                    {rc.effectiveTo ? "Historical" : "Active Schedule"}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {rc.notes && (
                    <p className="text-xs text-[#777268] italic font-mono">{rc.notes}</p>
                  )}

                  {/* Tiered Weight & Multi-Carrier Schedules */}
                  {rc.fees.some((f) => f.feeType === "TIERED_WEIGHT" || f.minWeight != null) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase text-[#B8892D]">
                          Tiered Weight &amp; Carrier Rates
                        </span>
                        <span className="text-[10px] font-mono text-[#777268]">
                          Default Unit: {rc.defaultWeightUnit || "KG"}
                        </span>
                      </div>
                      <div className="overflow-x-auto border border-[#DCD5C8] rounded">
                        <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
                          <thead className="bg-[#F3F0E8]">
                            <tr>
                              <th className="px-3 py-1.5 text-left font-mono font-medium text-[#777268]">Shipper / Carrier</th>
                              <th className="px-3 py-1.5 text-left font-mono font-medium text-[#777268]">Service Level</th>
                              <th className="px-3 py-1.5 text-left font-mono font-medium text-[#777268]">Weight Bracket</th>
                              <th className="px-3 py-1.5 text-left font-mono font-medium text-[#777268]">Zone</th>
                              <th className="px-3 py-1.5 text-right font-mono font-medium text-[#777268]">Contracted Rate</th>
                              <th className="px-3 py-1.5 text-right font-mono font-medium text-[#777268]">+Overage</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#DCD5C8]/60 bg-white">
                            {rc.fees
                              .filter((f) => f.feeType === "TIERED_WEIGHT" || f.minWeight != null)
                              .map((fee) => (
                                <tr key={fee.id} className="hover:bg-[#FBFAF6]">
                                  <td className="px-3 py-2 font-mono font-medium text-[#121210]">
                                    {fee.shipper || "Any Carrier"}
                                  </td>
                                  <td className="px-3 py-2 text-[#777268]">{fee.serviceLevel || "-"}</td>
                                  <td className="px-3 py-2 font-mono text-[11px] text-[#121210]">
                                    {fee.minWeight ?? 0} – {fee.maxWeight ?? "∞"} {fee.weightUnit || rc.defaultWeightUnit}
                                  </td>
                                  <td className="px-3 py-2 text-[#777268]">{fee.zone || "All"}</td>
                                  <td className="px-3 py-2 text-right font-mono font-bold text-[#121210]">
                                    {formatCents(fee.rateCents, rc.currency)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-[11px] text-[#777268]">
                                    {fee.incrementalRateCents
                                      ? `+${formatCents(fee.incrementalRateCents, rc.currency)} / ${fee.incrementalWeightStep || 1} ${fee.weightUnit || rc.defaultWeightUnit}`
                                      : "-"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Standard Warehouse Fees */}
                  {rc.fees.some((f) => f.feeType !== "TIERED_WEIGHT" && f.minWeight == null) && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold uppercase text-[#121210]">
                        Standard Warehouse &amp; Operational Fees
                      </span>
                      <div className="overflow-x-auto border border-[#DCD5C8] rounded">
                        <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
                          <thead className="bg-[#F3F0E8]">
                            <tr>
                              <th className="px-4 py-2 text-left font-mono font-medium text-[#777268]">Category</th>
                              <th className="px-4 py-2 text-left font-mono font-medium text-[#777268]">Description</th>
                              <th className="px-4 py-2 text-left font-mono font-medium text-[#777268]">Unit Type</th>
                              <th className="px-4 py-2 text-right font-mono font-medium text-[#777268]">Contracted Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#DCD5C8]/60 bg-white">
                            {rc.fees
                              .filter((f) => f.feeType !== "TIERED_WEIGHT" && f.minWeight == null)
                              .map((fee) => (
                                <tr key={fee.id} className="hover:bg-[#FBFAF6]">
                                  <td className="px-4 py-2 font-mono text-[11px] font-medium text-[#121210]">
                                    {FEE_CATEGORY_LABELS[fee.category as StandardFeeCategory] || fee.category}
                                  </td>
                                  <td className="px-4 py-2 text-[#777268]">{fee.description}</td>
                                  <td className="px-4 py-2 text-[#777268] font-mono">{fee.unitType}</td>
                                  <td className="px-4 py-2 text-right font-mono font-bold text-[#121210]">
                                    {formatCents(fee.rateCents, rc.currency)}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Custom Contract Properties & SLA Parameters */}
                  {(() => {
                    let customOpts: Record<string, any> | null = null;
                    if (rc.customOptions) {
                      try {
                        customOpts = JSON.parse(rc.customOptions);
                      } catch {}
                    }
                    if (!customOpts || Object.keys(customOpts).length === 0) return null;

                    return (
                      <div className="space-y-2 pt-2 border-t border-[#DCD5C8]/60">
                        <span className="text-[11px] font-mono font-bold uppercase text-[#121210]">
                          Custom SLA Metadata &amp; Contract Parameters ({Object.keys(customOpts).length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {Object.entries(customOpts).map(([key, data]) => {
                            const val = typeof data === "object" && data !== null ? data.value : String(data);
                            const desc = typeof data === "object" && data !== null ? data.notes : "";
                            return (
                              <div
                                key={key}
                                className="p-2.5 rounded bg-[#F3F0E8]/50 border border-[#DCD5C8] font-mono text-xs"
                              >
                                <div className="text-[10px] text-[#777268] uppercase font-bold tracking-wider">
                                  {key}
                                </div>
                                <div className="text-xs font-bold text-[#121210] mt-0.5">
                                  {val || "—"}
                                </div>
                                {desc && (
                                  <div className="text-[10px] text-[#777268] mt-1 italic font-sans truncate">
                                    {desc}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-xs font-mono text-[#777268]">
            No rate cards recorded. Add your contracted rate schedule to enable invoice audits.
          </Card>
        )}
      </div>
    </div>
  );
}
