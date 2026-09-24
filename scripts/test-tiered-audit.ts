import { PrismaClient } from "@prisma/client";
import { executeDeterministicAudit, AuditContext } from "../src/lib/audit/engine";
import { normalizeInvoiceRows } from "../src/lib/audit/normalizer";
import { ColumnMappingConfig } from "../src/types/audit";
import { formatCents } from "../src/lib/money/currency";

const prisma = new PrismaClient();

async function runTieredAuditTest() {
  console.log("=================================================================");
  console.log("  TESTING TIERED WEIGHT RATE CARD AUDIT (RDX SPORTS SCENARIO)");
  console.log("=================================================================\n");

  const rdxCard = await prisma.rateCard.findFirst({
    where: { name: "RDX Sports 2026 Tiered Parcel & Freight Agreement" },
    include: { fees: true, provider: true },
  });

  if (!rdxCard) {
    console.error("RDX Sports rate card not found!");
    process.exit(1);
  }

  console.log(`Loaded Rate Card: "${rdxCard.name}"`);
  console.log(`Provider: ${rdxCard.provider.name}`);
  console.log(`Total Fees/Tiers: ${rdxCard.fees.length}\n`);

  // Build fee lookup
  const feesByCategory = new Map();
  const tieredFees: any[] = [];

  for (const f of rdxCard.fees) {
    feesByCategory.set(f.category, {
      id: f.id,
      category: f.category,
      unitType: f.unitType,
      rateCents: f.rateCents,
      description: f.description,
      feeType: f.feeType,
      shipper: f.shipper,
      serviceLevel: f.serviceLevel,
      weightUnit: f.weightUnit,
      minWeight: f.minWeight,
      maxWeight: f.maxWeight,
      zone: f.zone,
      incrementalRateCents: f.incrementalRateCents,
      incrementalWeightStep: f.incrementalWeightStep,
    });

    if (f.feeType === "TIERED_WEIGHT" || f.minWeight != null) {
      tieredFees.push({
        id: f.id,
        category: f.category,
        description: f.description,
        unitType: f.unitType,
        rateCents: f.rateCents,
        feeType: f.feeType,
        shipper: f.shipper,
        serviceLevel: f.serviceLevel,
        weightUnit: f.weightUnit,
        minWeight: f.minWeight,
        maxWeight: f.maxWeight,
        zone: f.zone,
        incrementalRateCents: f.incrementalRateCents,
        incrementalWeightStep: f.incrementalWeightStep,
      });
    }
  }

  // Realistic RDX Sports Invoice Rows:
  // 1. Boxing Gloves: 14 oz, FedEx Ground (contracted 8-16 oz is $4.65, billed $6.80 -> OVERAGE $2.15)
  // 2. Punch Bag: 22.5 kg, DPD Heavy Freight (contracted 15-30 kg is $24.00, billed $32.00 -> OVERAGE $8.00)
  // 3. Hand Wraps: 4 oz, USPS Ground (contracted 0-8 oz is $3.80, billed $3.80 -> CORRECT, NO FLAG)
  // 4. Shin Guards: 0.85 kg, Royal Mail Tracked 48 (contracted 0-1 kg is $3.50, billed $4.95 -> OVERAGE $1.45)
  // 5. Training Headgear: 1.4 kg, Royal Mail Tracked 48 (contracted 1-2 kg is $5.10, billed $5.10 -> CORRECT, NO FLAG)
  // 6. Uncontracted Courier: DHL Express (no contracted DHL tier -> UNCONTRACTED CATEGORY FLAG)
  const testRows = [
    {
      Date: "2026-08-02",
      Reference: "RDX-ORD-101",
      Description: "FedEx Ground Parcel - Boxing Gloves 14oz",
      Carrier: "FedEx",
      Weight: "14",
      Unit: "OZ",
      Quantity: "1",
      Rate: "6.80",
      Total: "6.80",
    },
    {
      Date: "2026-08-03",
      Reference: "RDX-ORD-102",
      Description: "DPD Heavy Freight - Heavy Punching Bag 45lbs",
      Carrier: "DPD",
      Weight: "22.5",
      Unit: "KG",
      Quantity: "1",
      Rate: "32.00",
      Total: "32.00",
    },
    {
      Date: "2026-08-04",
      Reference: "RDX-ORD-103",
      Description: "USPS Ground Advantage - Hand Wraps 4oz",
      Carrier: "USPS",
      Weight: "4",
      Unit: "OZ",
      Quantity: "1",
      Rate: "3.80",
      Total: "3.80",
    },
    {
      Date: "2026-08-05",
      Reference: "RDX-ORD-104",
      Description: "Royal Mail Tracked 48 - Shin Guards 850g",
      Carrier: "Royal Mail",
      Weight: "0.85",
      Unit: "KG",
      Quantity: "1",
      Rate: "4.95",
      Total: "4.95",
    },
    {
      Date: "2026-08-06",
      Reference: "RDX-ORD-105",
      Description: "Royal Mail Tracked 48 - Sparring Headgear 1.4kg",
      Carrier: "Royal Mail",
      Weight: "1.4",
      Unit: "KG",
      Quantity: "1",
      Rate: "5.10",
      Total: "5.10",
    },
    {
      Date: "2026-08-07",
      Reference: "RDX-ORD-106",
      Description: "DHL Express Delivery - Unscheduled Express Air",
      Carrier: "DHL",
      Weight: "3.2",
      Unit: "KG",
      Quantity: "1",
      Rate: "45.00",
      Total: "45.00",
    },
  ];

  const mapping: ColumnMappingConfig = {
    dateColumn: "Date",
    referenceColumn: "Reference",
    categoryColumn: "Description",
    quantityColumn: "Quantity",
    unitRateColumn: "Rate",
    totalColumn: "Total",
    carrierColumn: "Carrier",
    weightColumn: "Weight",
    weightUnitColumn: "Unit",
  };

  const normResult = normalizeInvoiceRows(testRows, mapping);
  console.log(`Normalized ${normResult.lines.length} invoice lines successfully.`);

  const auditContext: AuditContext = {
    rateCardName: rdxCard.name,
    feesByCategory,
    tieredFees,
  };

  const outcome = executeDeterministicAudit(normResult.lines, auditContext);

  console.log("\n=================================================================");
  console.log("  AUDIT EXECUTION RESULTS");
  console.log("=================================================================");
  console.log(`Total Rows Audited:        ${outcome.totalLines}`);
  console.log(`Total Billed:              ${formatCents(outcome.totalBilledCents)}`);
  console.log(`Potential Discrepancies:   ${formatCents(outcome.potentialDiscrepancyCents)}`);
  console.log(`Flags Triggered:           ${outcome.totalFlagsCount}\n`);

  outcome.lines.forEach((item, idx) => {
    console.log(`Line #${idx + 1}: ${item.line.rawCategory} (${item.line.carrier || "No carrier"}, ${item.line.billedWeight} ${item.line.weightUnit || ""})`);
    console.log(`  Billed: ${formatCents(item.line.billedTotalCents)}`);
    if (item.flags.length === 0) {
      console.log(`  Status: ✓ Matched Contract Rate Exactly (No Discrepancy)`);
    } else {
      item.flags.forEach((f) => {
        console.log(`  FLAG: [${f.ruleType}] Expected: ${formatCents(f.expectedTotalCents || 0)} | Variance: +${formatCents(f.differenceCents)}`);
        console.log(`  Detail: ${f.calculationBreakdown}`);
      });
    }
    console.log("");
  });
}

runTieredAuditTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
