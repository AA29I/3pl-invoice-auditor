import React from "react";
import { Metadata } from "next";
import { PickAndPackCalculator } from "@/components/marketing/calculator";

export const metadata: Metadata = {
  title: "Pick and Pack Fee Calculator | Calculate 3PL Fulfillment Costs",
  description:
    "Free interactive pick and pack fee calculator for e-commerce brands. Estimate warehouse fulfillment costs, extra item picks, pallet storage, and returns.",
  alternates: {
    canonical: "/pick-and-pack-calculator",
  },
};

export default function PickAndPackCalculatorPage() {
  return (
    <div className="py-16 md:py-24 bg-[#FBFAF6]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold text-[#B8892D] uppercase tracking-wider">
            Interactive Financial Model
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#090908] tracking-tight">
            Pick and Pack Fee Calculator
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#777268] leading-relaxed">
            Model your contracted warehouse fulfillment expenses, understand your true cost-per-order, and compare your projections against your actual 3PL billing statements.
          </p>
        </div>

        {/* Live Calculator Component */}
        <PickAndPackCalculator />

        {/* Informational Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded border border-[#DCD5C8] bg-[#FBFAF6] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h2 className="font-serif font-bold text-[#090908]">What is Base Pick &amp; Pack?</h2>
            <p className="mt-2 text-xs text-[#777268] leading-relaxed">
              The primary fee charged for locating an order in the warehouse, selecting the first item, and packing it into a box or poly mailer. Industry average is typically $2.50 to $3.50.
            </p>
          </div>
          <div className="p-6 rounded border border-[#DCD5C8] bg-[#FBFAF6] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h2 className="font-serif font-bold text-[#090908]">Incremental Item Picks</h2>
            <p className="mt-2 text-xs text-[#777268] leading-relaxed">
              When an order contains multiple SKUs or units, warehouses charge a reduced rate for each additional item retrieved (often $0.50 to $0.85 per unit).
            </p>
          </div>
          <div className="p-6 rounded border border-[#DCD5C8] bg-[#FBFAF6] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h2 className="font-serif font-bold text-[#090908]">Storage Footprint</h2>
            <p className="mt-2 text-xs text-[#777268] leading-relaxed">
              Pallet storage is commonly billed monthly per standard 40x48 inch footprint ($18 to $28/pallet). Efficient brands minimize inventory holding times to keep storage below 10% of total fulfillment spend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
