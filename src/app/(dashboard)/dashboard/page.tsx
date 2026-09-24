import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatCents } from "@/lib/money/currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RuleBadge, StatusBadge } from "@/components/audit/flag-badge";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || !user.workspace) return null;

  const workspaceId = user.workspace.id;

  const invoices = await prisma.invoice.findMany({
    where: { workspaceId },
    include: {
      provider: true,
      _count: {
        select: { flags: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalInvoices = await prisma.invoice.count({ where: { workspaceId } });

  const totals = await prisma.invoice.aggregate({
    where: { workspaceId },
    _sum: {
      totalBilledCents: true,
      potentialDiscrepancyCents: true,
      confirmedDiscrepancyCents: true,
    },
  });

  const recentFlags = await prisma.auditFlag.findMany({
    where: { invoice: { workspaceId } },
    include: {
      invoice: { select: { invoiceNumber: true, provider: { select: { name: true } } } },
      invoiceLine: true,
    },
    orderBy: { differenceCents: "desc" },
    take: 5,
  });

  const totalBilledCents = totals._sum.totalBilledCents || 0;
  const potentialDiscrepancyCents = totals._sum.potentialDiscrepancyCents || 0;
  const confirmedDiscrepancyCents = totals._sum.confirmedDiscrepancyCents || 0;

  return (
    <div className="space-y-8">
      {/* Top Header & CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD5C8] pb-5">
        <div>
          <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider">
            Workspace Overview
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#121210] tracking-tight mt-0.5">
            Fulfillment Audit Summary
          </h1>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/providers/new"
            className="px-3.5 py-2 text-xs font-medium text-[#121210] bg-[#F3F0E8] hover:bg-[#e9e4d8] border border-[#DCD5C8] rounded transition"
          >
            + Add Provider
          </Link>
          <Link
            href="/audits/new"
            className="px-4 py-2 text-xs font-semibold text-[#090908] bg-[#B8892D] hover:bg-[#a67a26] border border-[#a67a26] rounded transition"
          >
            + Upload &amp; Audit CSV
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#FBFAF6]">
          <CardContent className="p-5">
            <p className="text-[11px] font-mono font-medium text-[#777268] uppercase">Invoices Audited</p>
            <p className="text-2xl font-mono font-bold text-[#121210] mt-1">{totalInvoices}</p>
            <p className="text-[11px] font-mono text-[#777268] mt-1">Total billing runs</p>
          </CardContent>
        </Card>

        <Card className="bg-[#FBFAF6]">
          <CardContent className="p-5">
            <p className="text-[11px] font-mono font-medium text-[#777268] uppercase">Total Billed</p>
            <p className="text-2xl font-mono font-bold text-[#121210] mt-1">{formatCents(totalBilledCents)}</p>
            <p className="text-[11px] font-mono text-[#777268] mt-1">Audited warehouse charges</p>
          </CardContent>
        </Card>

        <Card className="bg-[#F3F0E8] border-[#DCD5C8]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono font-semibold text-[#B8892D] uppercase">Potential Discrepancy</p>
              <span className="text-[10px] font-mono bg-[#E0BC68]/20 text-[#B8892D] font-bold px-1.5 py-0.5 rounded border border-[#E0BC68]/40">
                Unconfirmed
              </span>
            </div>
            <p className="text-2xl font-mono font-bold text-[#B8892D] mt-1">
              +{formatCents(potentialDiscrepancyCents)}
            </p>
            <p className="text-[11px] font-mono text-[#777268] mt-1">Awaiting 3PL clarification</p>
          </CardContent>
        </Card>

        <Card className="bg-[#fdf8f8] border-[#f1c2c2]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono font-semibold text-[#8f2020] uppercase">Confirmed Overcharge</p>
              <span className="text-[10px] font-mono bg-[#fdf2f2] text-[#8f2020] font-bold px-1.5 py-0.5 rounded border border-[#f1c2c2]">
                Verified
              </span>
            </div>
            <p className="text-2xl font-mono font-bold text-[#8f2020] mt-1">
              {formatCents(confirmedDiscrepancyCents)}
            </p>
            <p className="text-[11px] font-mono text-[#777268] mt-1">Verified for credit memo</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Recent Billing Statements</CardTitle>
            <p className="text-xs text-[#777268]">Latest warehouse billing statements audited against rate cards</p>
          </div>
          <Link href="/audits" className="text-xs font-mono font-medium text-[#B8892D] hover:underline">
            All Audits →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
                <thead className="bg-[#F3F0E8]">
                  <tr>
                    <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">3PL Provider</th>
                    <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">Invoice #</th>
                    <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">Period</th>
                    <th className="px-5 py-2.5 text-right font-mono font-medium text-[#777268]">Total Billed</th>
                    <th className="px-5 py-2.5 text-right font-mono font-medium text-[#777268]">Potential Discrepancy</th>
                    <th className="px-5 py-2.5 text-center font-mono font-medium text-[#777268]">Flags</th>
                    <th className="px-5 py-2.5 text-right font-mono font-medium text-[#777268]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCD5C8]/60 bg-white">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FBFAF6]">
                      <td className="px-5 py-3 font-semibold text-[#121210]">{inv.provider.name}</td>
                      <td className="px-5 py-3 font-mono text-[#777268]">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3 font-mono text-[11px] text-[#777268]">
                        {new Date(inv.billingPeriodStart).toLocaleDateString()} -{" "}
                        {new Date(inv.billingPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-[#121210]">
                        {formatCents(inv.totalBilledCents)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-[#B8892D]">
                        +{formatCents(inv.potentialDiscrepancyCents)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F3F0E8] text-[#121210] border border-[#DCD5C8]">
                          {inv._count.flags}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        <Link
                          href={`/audits/${inv.id}`}
                          className="font-medium text-[#B8892D] hover:underline"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-[#777268]">
              No invoices audited yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Discrepancies Requiring Review */}
      {recentFlags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Priority Discrepancy Items</CardTitle>
            <p className="text-xs text-[#777268]">
              Line items with highest variance against contracted rate schedules
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
                <thead className="bg-[#F3F0E8]">
                  <tr>
                    <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">Invoice / Ref</th>
                    <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">Category</th>
                    <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">Rule Triggered</th>
                    <th className="px-5 py-2.5 text-right font-mono font-medium text-[#777268]">Billed</th>
                    <th className="px-5 py-2.5 text-right font-mono font-medium text-[#777268]">Variance</th>
                    <th className="px-5 py-2.5 text-center font-mono font-medium text-[#777268]">Status</th>
                    <th className="px-5 py-2.5 text-right font-mono font-medium text-[#777268]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCD5C8]/60 bg-white">
                  {recentFlags.map((flag) => (
                    <tr key={flag.id} className="hover:bg-[#FBFAF6]">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#121210]">
                          {flag.invoice.provider.name} • {flag.invoice.invoiceNumber}
                        </div>
                        <div className="font-mono text-[#777268] text-[11px]">
                          Ref: {flag.invoiceLine.orderReference || `Row #${flag.invoiceLine.lineNumber}`}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#121210]">
                        {flag.invoiceLine.matchedCategory || flag.invoiceLine.rawCategory}
                      </td>
                      <td className="px-5 py-3">
                        <RuleBadge ruleType={flag.ruleType} />
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-[#121210]">
                        {formatCents(flag.billedTotalCents)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-[#B8892D]">
                        +{formatCents(flag.differenceCents)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <StatusBadge status={flag.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        <Link
                          href={`/audits/${flag.invoiceId}`}
                          className="font-medium text-[#B8892D] hover:underline"
                        >
                          Triage →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
