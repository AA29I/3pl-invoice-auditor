"use client";

import React, { useState } from "react";
import { formatCents, parseDollarsToCents } from "@/lib/money/currency";

export function PickAndPackCalculator() {
  const [orders, setOrders] = useState(2000);
  const [itemsPerOrder, setItemsPerOrder] = useState(2.2);
  const [basePickRate, setBasePickRate] = useState("2.85");
  const [extraItemRate, setExtraItemRate] = useState("0.65");
  const [storagePallets, setStoragePallets] = useState(25);
  const [palletRate, setPalletRate] = useState("22.00");
  const [returnsRate, setReturnsRate] = useState("4.50");
  const [returnPct, setReturnPct] = useState(3.0);

  // Exact minor units math
  const basePickCents = parseDollarsToCents(basePickRate);
  const extraItemCents = parseDollarsToCents(extraItemRate);
  const palletStorageCents = parseDollarsToCents(palletRate);
  const returnProcessingCents = parseDollarsToCents(returnsRate);

  // Calculations
  const monthlyBasePickTotalCents = orders * basePickCents;
  const extraItemsPerOrder = Math.max(0, itemsPerOrder - 1);
  const monthlyExtraItemTotalCents = Math.round(orders * extraItemsPerOrder * extraItemCents);
  const monthlyStorageTotalCents = storagePallets * palletStorageCents;
  const estimatedReturnsCount = Math.round((orders * returnPct) / 100);
  const monthlyReturnsTotalCents = estimatedReturnsCount * returnProcessingCents;

  const totalMonthlyFulfillmentCents =
    monthlyBasePickTotalCents +
    monthlyExtraItemTotalCents +
    monthlyStorageTotalCents +
    monthlyReturnsTotalCents;

  const annualFulfillmentSpendCents = totalMonthlyFulfillmentCents * 12;
  const effectiveCostPerOrderCents =
    orders > 0 ? Math.round(totalMonthlyFulfillmentCents / orders) : 0;

  return (
    <div className="bg-[#FBFAF6] rounded border border-[#DCD5C8] overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 bg-[#121210] text-[#FBFAF6] border-b border-[#090908]">
        <div className="flex items-center space-x-2 text-[11px] font-mono text-[#B8892D] uppercase tracking-wider mb-2">
          <span>Financial Simulation</span>
          <span>•</span>
          <span>Contracted Fulfillment Rates</span>
        </div>
        <h3 className="text-xl md:text-2xl font-serif font-bold tracking-tight">
          Fulfillment Cost &amp; Rate Card Baseline Calculator
        </h3>
        <p className="text-xs text-[#777268] mt-2 max-w-2xl leading-relaxed">
          Establish expected monthly warehouse expenditure based on contracted unit fees. Use these figures to identify mathematical variances and rate drift on incoming 3PL invoices.
        </p>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs */}
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-medium text-[#777268] uppercase tracking-tight mb-1">
                Monthly Orders
              </label>
              <input
                type="number"
                min="1"
                value={orders}
                onChange={(e) => setOrders(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-[#DCD5C8] bg-white rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:border-[#B8892D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-medium text-[#777268] uppercase tracking-tight mb-1">
                Avg Items Per Order
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                value={itemsPerOrder}
                onChange={(e) => setItemsPerOrder(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-[#DCD5C8] bg-white rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:border-[#B8892D] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-medium text-[#777268] uppercase tracking-tight mb-1">
                Base Pick &amp; Pack Rate ($)
              </label>
              <input
                type="text"
                value={basePickRate}
                onChange={(e) => setBasePickRate(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD5C8] bg-white rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:border-[#B8892D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-medium text-[#777268] uppercase tracking-tight mb-1">
                Extra Item Pick Rate ($)
              </label>
              <input
                type="text"
                value={extraItemRate}
                onChange={(e) => setExtraItemRate(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD5C8] bg-white rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:border-[#B8892D] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-medium text-[#777268] uppercase tracking-tight mb-1">
                Stored Pallets / Month
              </label>
              <input
                type="number"
                min="0"
                value={storagePallets}
                onChange={(e) => setStoragePallets(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-[#DCD5C8] bg-white rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:border-[#B8892D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-medium text-[#777268] uppercase tracking-tight mb-1">
                Pallet Storage Rate ($/mo)
              </label>
              <input
                type="text"
                value={palletRate}
                onChange={(e) => setPalletRate(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD5C8] bg-white rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:border-[#B8892D] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-medium text-[#777268] uppercase tracking-tight mb-1">
                Return Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={returnPct}
                onChange={(e) => setReturnPct(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-[#DCD5C8] bg-white rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:border-[#B8892D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-medium text-[#777268] uppercase tracking-tight mb-1">
                Return Processing Fee ($)
              </label>
              <input
                type="text"
                value={returnsRate}
                onChange={(e) => setReturnsRate(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD5C8] bg-white rounded text-xs font-mono text-[#121210] focus:ring-1 focus:ring-[#B8892D] focus:border-[#B8892D] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5 bg-[#F3F0E8] border border-[#DCD5C8] rounded p-6 flex flex-col justify-between space-y-6">
          <div>
            <h4 className="text-[11px] font-mono font-bold text-[#777268] uppercase tracking-wider mb-4 border-b border-[#DCD5C8] pb-2">
              Contracted Cost Summary
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#777268]">
                <span>Base Pick &amp; Pack ({orders.toLocaleString()} orders)</span>
                <span className="font-mono font-semibold text-[#121210]">
                  {formatCents(monthlyBasePickTotalCents)}
                </span>
              </div>
              <div className="flex justify-between text-[#777268]">
                <span>Additional Item Picks</span>
                <span className="font-mono font-semibold text-[#121210]">
                  {formatCents(monthlyExtraItemTotalCents)}
                </span>
              </div>
              <div className="flex justify-between text-[#777268]">
                <span>Pallet Storage ({storagePallets} pallets)</span>
                <span className="font-mono font-semibold text-[#121210]">
                  {formatCents(monthlyStorageTotalCents)}
                </span>
              </div>
              <div className="flex justify-between text-[#777268]">
                <span>Returns Processing ({estimatedReturnsCount} units)</span>
                <span className="font-mono font-semibold text-[#121210]">
                  {formatCents(monthlyReturnsTotalCents)}
                </span>
              </div>
            </div>

            <div className="border-t border-[#DCD5C8] mt-6 pt-5 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium text-[#777268]">Calculated Monthly Spend</span>
                <span className="text-2xl font-mono font-bold text-[#121210]">
                  {formatCents(totalMonthlyFulfillmentCents)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#777268] pt-1">
                <span>Effective Cost Per Order:</span>
                <span className="font-mono font-bold text-[#B8892D]">
                  {formatCents(effectiveCostPerOrderCents)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#777268]">
                <span>Projected Annual Expenditure:</span>
                <span className="font-mono font-bold text-[#121210]">
                  {formatCents(annualFulfillmentSpendCents)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FBFAF6] border border-[#DCD5C8] rounded text-[11px] text-[#777268] leading-relaxed">
            <span className="font-mono font-semibold text-[#121210] uppercase mr-1">Audit Application:</span>
            Upload your monthly warehouse statement into the auditor to verify every billed order against this rate schedule.
          </div>
        </div>
      </div>
    </div>
  );
}
