import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { executeDeterministicAudit, AuditContext } from "../src/lib/audit/engine";
import { normalizeInvoiceRows, getSampleInvoiceCsvContent } from "../src/lib/audit/normalizer";
import { ColumnMappingConfig } from "../src/types/audit";
import Papa from "papaparse";

const prisma = new PrismaClient();

async function main() {
  console.log("--- Starting 3PL Invoice Auditor Database Seed ---");

  // 1. Create or Find Demo User
  const demoEmail = "demo@apexapparel.com";
  const passwordHash = await bcrypt.hash("Password123!", 10);

  let user = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Alex Mercer",
        passwordHash,
      },
    });
    console.log(`Created demo user: ${user.email} (Password: Password123!)`);
  }

  // 2. Create Demo Workspace
  let workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId: user.id } } },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "Apex Apparel Co.",
        slug: "apex-apparel-demo",
      },
    });

    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    await prisma.subscription.create({
      data: {
        workspaceId: workspace.id,
        tier: "PRO",
        status: "ACTIVE",
      },
    });
    console.log(`Created demo workspace: ${workspace.name}`);
  }

  // 3. Create Demo 3PL Provider 1: ShipBob
  let provider = await prisma.provider.findFirst({
    where: { workspaceId: workspace.id, name: "ShipBob Fulfillment Center" },
  });

  if (!provider) {
    provider = await prisma.provider.create({
      data: {
        workspaceId: workspace.id,
        name: "ShipBob Fulfillment Center",
        contactEmail: "billing@shipbob.com",
        currency: "USD",
      },
    });
    console.log(`Created provider: ${provider.name}`);
  }

  // 4. Create Standard Contracted Rate Card for ShipBob
  let rateCard = await prisma.rateCard.findFirst({
    where: { providerId: provider.id, name: "2026 Master Fulfillment Schedule" },
  });

  if (!rateCard) {
    rateCard = await prisma.rateCard.create({
      data: {
        providerId: provider.id,
        name: "2026 Master Fulfillment Schedule",
        effectiveFrom: new Date("2026-01-01"),
        currency: "USD",
        notes: "Master contract signed January 2026 with negotiated DTC volume rates.",
      },
    });

    const standardFees = [
      { category: "BASE_PICK_PACK", description: "Base Pick & Pack (Order Fee)", unitType: "order", rateCents: 285 },
      { category: "ADDITIONAL_ITEM", description: "Additional Item Pick Fee", unitType: "item", rateCents: 65 },
      { category: "STORAGE_PALLET", description: "Pallet Storage (Monthly)", unitType: "pallet/month", rateCents: 2200 },
      { category: "STORAGE_BIN", description: "Bin Storage (Monthly)", unitType: "bin/month", rateCents: 350 },
      { category: "RECEIVING_CARTON", description: "Carton Inbound Receiving", unitType: "carton", rateCents: 300 },
      { category: "RECEIVING_PALLET", description: "Pallet Inbound Receiving", unitType: "pallet", rateCents: 1800 },
      { category: "RETURN_PROCESSING", description: "Return Inspection & Restock", unitType: "return", rateCents: 450 },
      { category: "ACCOUNT_MANAGEMENT", description: "Monthly Account Software Fee", unitType: "month", rateCents: 25000 },
    ];

    for (const f of standardFees) {
      await prisma.rateCardFee.create({
        data: {
          rateCardId: rateCard.id,
          category: f.category,
          description: f.description,
          unitType: f.unitType,
          rateCents: f.rateCents,
        },
      });
    }
    console.log(`Created rate card: ${rateCard.name} with ${standardFees.length} contracted fees`);
  }

  // 5. Create Demo 3PL Provider 2: RDX Sports Global Logistics (Tiered Weight & Multi-Carrier)
  let rdxProvider = await prisma.provider.findFirst({
    where: { workspaceId: workspace.id, name: "RDX Sports Global Logistics" },
  });

  if (!rdxProvider) {
    rdxProvider = await prisma.provider.create({
      data: {
        workspaceId: workspace.id,
        name: "RDX Sports Global Logistics",
        contactEmail: "logistics@rdxsports.com",
        currency: "USD",
      },
    });
    console.log(`Created provider: ${rdxProvider.name}`);
  }

  let rdxRateCard = await prisma.rateCard.findFirst({
    where: { providerId: rdxProvider.id, name: "RDX Sports 2026 Tiered Parcel & Freight Agreement" },
  });

  if (!rdxRateCard) {
    rdxRateCard = await prisma.rateCard.create({
      data: {
        providerId: rdxProvider.id,
        name: "RDX Sports 2026 Tiered Parcel & Freight Agreement",
        rateCardType: "HYBRID",
        defaultWeightUnit: "KG",
        effectiveFrom: new Date("2026-01-01"),
        currency: "USD",
        notes: "Multi-carrier tiered schedule for boxing gloves, heavy punch bags, combat gear & apparel.",
      },
    });

    // Seed Tiered Weight Rates & Shippers
    const rdxTieredFees = [
      // Royal Mail Tracked 48 Tiers (kg)
      {
        category: "SHIPPING_CARRIER",
        description: "Royal Mail Tracked 48 (0 - 1 kg)",
        unitType: "tier",
        rateCents: 350,
        feeType: "TIERED_WEIGHT",
        shipper: "Royal Mail",
        serviceLevel: "Tracked 48",
        weightUnit: "KG",
        minWeight: 0.0,
        maxWeight: 1.0,
        zone: "UK Mainland",
      },
      {
        category: "SHIPPING_CARRIER",
        description: "Royal Mail Tracked 48 (1 - 2 kg)",
        unitType: "tier",
        rateCents: 510,
        feeType: "TIERED_WEIGHT",
        shipper: "Royal Mail",
        serviceLevel: "Tracked 48",
        weightUnit: "KG",
        minWeight: 1.01,
        maxWeight: 2.0,
        zone: "UK Mainland",
      },
      // DPD Parcel Tiers (kg)
      {
        category: "SHIPPING_CARRIER",
        description: "DPD Standard Parcel (2 - 5 kg)",
        unitType: "tier",
        rateCents: 780,
        feeType: "TIERED_WEIGHT",
        shipper: "DPD",
        serviceLevel: "Standard Next Day",
        weightUnit: "KG",
        minWeight: 2.01,
        maxWeight: 5.0,
        zone: "UK Mainland",
      },
      {
        category: "SHIPPING_CARRIER",
        description: "DPD Medium Freight (5 - 15 kg)",
        unitType: "tier",
        rateCents: 1250,
        feeType: "TIERED_WEIGHT",
        shipper: "DPD",
        serviceLevel: "Standard Next Day",
        weightUnit: "KG",
        minWeight: 5.01,
        maxWeight: 15.0,
        zone: "UK Mainland",
      },
      {
        category: "SHIPPING_CARRIER",
        description: "DPD Heavy Freight / Punch Bags (15 - 30 kg)",
        unitType: "tier",
        rateCents: 2400,
        feeType: "TIERED_WEIGHT",
        shipper: "DPD",
        serviceLevel: "Heavy Freight",
        weightUnit: "KG",
        minWeight: 15.01,
        maxWeight: 30.0,
        zone: "UK Mainland",
        incrementalRateCents: 85,
        incrementalWeightStep: 1.0,
      },
      // US Carrier Tiers: FedEx & USPS (oz and lbs)
      {
        category: "SHIPPING_CARRIER",
        description: "USPS Ground Advantage (0 - 8 oz)",
        unitType: "tier",
        rateCents: 380,
        feeType: "TIERED_WEIGHT",
        shipper: "USPS",
        serviceLevel: "Ground Advantage",
        weightUnit: "OZ",
        minWeight: 0.0,
        maxWeight: 8.0,
        zone: "Zone 1-4",
      },
      {
        category: "SHIPPING_CARRIER",
        description: "USPS Ground Advantage (8 - 16 oz)",
        unitType: "tier",
        rateCents: 465,
        feeType: "TIERED_WEIGHT",
        shipper: "USPS",
        serviceLevel: "Ground Advantage",
        weightUnit: "OZ",
        minWeight: 8.01,
        maxWeight: 16.0,
        zone: "Zone 1-4",
      },
      {
        category: "SHIPPING_CARRIER",
        description: "FedEx Ground (1 - 3 lbs)",
        unitType: "tier",
        rateCents: 680,
        feeType: "TIERED_WEIGHT",
        shipper: "FedEx",
        serviceLevel: "Ground",
        weightUnit: "LB",
        minWeight: 1.0,
        maxWeight: 3.0,
        zone: "All Zones",
      },
      {
        category: "SHIPPING_CARRIER",
        description: "FedEx Ground (3 - 10 lbs)",
        unitType: "tier",
        rateCents: 1120,
        feeType: "TIERED_WEIGHT",
        shipper: "FedEx",
        serviceLevel: "Ground",
        weightUnit: "LB",
        minWeight: 3.01,
        maxWeight: 10.0,
        zone: "All Zones",
        incrementalRateCents: 60,
        incrementalWeightStep: 1.0,
      },
      // Standard Warehouse Handling for RDX Sports
      {
        category: "BASE_PICK_PACK",
        description: "Base Pick & Pack",
        unitType: "order",
        rateCents: 285,
        feeType: "FLAT",
      },
      {
        category: "ADDITIONAL_ITEM",
        description: "Additional Item Pick Fee",
        unitType: "item",
        rateCents: 65,
        feeType: "FLAT",
      },
      {
        category: "HEAVY_WEIGHT_SURCHARGE",
        description: "Heavy Weight Item Handling (>20kg)",
        unitType: "item",
        rateCents: 1500,
        feeType: "SURCHARGE",
      },
    ];

    for (const fee of rdxTieredFees) {
      await prisma.rateCardFee.create({
        data: {
          rateCardId: rdxRateCard.id,
          category: fee.category,
          description: fee.description,
          unitType: fee.unitType,
          rateCents: fee.rateCents,
          feeType: fee.feeType,
          shipper: fee.shipper || null,
          serviceLevel: fee.serviceLevel || null,
          weightUnit: fee.weightUnit || null,
          minWeight: fee.minWeight ?? null,
          maxWeight: fee.maxWeight ?? null,
          zone: fee.zone || null,
          incrementalRateCents: fee.incrementalRateCents ?? null,
          incrementalWeightStep: fee.incrementalWeightStep ?? null,
        },
      });
    }
    console.log(`Created RDX Sports Rate Card with ${rdxTieredFees.length} tiered & operational fees`);
  }

  // 6. Check if sample audit already exists
  const existingInvoice = await prisma.invoice.findFirst({
    where: { workspaceId: workspace.id, invoiceNumber: "INV-2026-08-DEMO" },
  });

  if (!existingInvoice) {
    // Parse sample CSV with weight and carrier columns
    const sampleCsv = getSampleInvoiceCsvContent();
    const parsed = Papa.parse(sampleCsv, { header: true, skipEmptyLines: true });
    const rawRows = parsed.data as Record<string, string>[];

    const mapping: ColumnMappingConfig = {
      dateColumn: "Date",
      referenceColumn: "Reference",
      categoryColumn: "Description",
      quantityColumn: "Quantity",
      unitRateColumn: "Unit Rate",
      totalColumn: "Total Amount",
      carrierColumn: "Carrier",
      weightColumn: "Weight",
      weightUnitColumn: "Unit",
    };

    const norm = normalizeInvoiceRows(rawRows, mapping);
    if (!norm.isValid) {
      throw new Error("Sample CSV failed validation: " + JSON.stringify(norm.errors));
    }

    // Build fees lookup from the RDX rate card to demonstrate tiered matching
    const fees = await prisma.rateCardFee.findMany({ where: { rateCardId: rdxRateCard.id } });
    const feesByCategory = new Map();
    const tieredFees = [];

    for (const f of fees) {
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

    const auditContext: AuditContext = {
      rateCardName: rdxRateCard.name,
      feesByCategory,
      tieredFees,
    };

    const auditOutcome = executeDeterministicAudit(norm.lines, auditContext);

    // Save sample invoice and flags
    const invoice = await prisma.invoice.create({
      data: {
        workspaceId: workspace.id,
        providerId: rdxProvider.id,
        rateCardId: rdxRateCard.id,
        invoiceNumber: "INV-2026-08-DEMO",
        invoiceDate: new Date("2026-08-31"),
        billingPeriodStart: new Date("2026-08-01"),
        billingPeriodEnd: new Date("2026-08-31"),
        fileName: "rdx-sports-sample-invoice.csv",
        fileSize: 1024,
        totalLines: auditOutcome.totalLines,
        totalBilledCents: auditOutcome.totalBilledCents,
        potentialDiscrepancyCents: auditOutcome.potentialDiscrepancyCents,
        confirmedDiscrepancyCents: 0,
        status: "COMPLETED",
      },
    });

    for (const item of auditOutcome.lines) {
      const line = item.line;
      const createdLine = await prisma.invoiceLine.create({
        data: {
          invoiceId: invoice.id,
          lineNumber: line.lineNumber,
          serviceDate: line.serviceDate,
          orderReference: line.orderReference,
          rawCategory: line.rawCategory,
          matchedCategory: line.matchedCategory,
          billedQuantity: line.billedQuantity,
          billedRateCents: line.billedRateCents,
          billedTotalCents: line.billedTotalCents,
          billedWeight: line.billedWeight,
          weightUnit: line.weightUnit,
          carrier: line.carrier,
          zone: line.zone,
          rawData: JSON.stringify(line.rawData),
        },
      });

      for (const flag of item.flags) {
        await prisma.auditFlag.create({
          data: {
            invoiceId: invoice.id,
            invoiceLineId: createdLine.id,
            ruleType: flag.ruleType,
            status: flag.status,
            expectedRateCents: flag.expectedRateCents,
            expectedTotalCents: flag.expectedTotalCents,
            billedTotalCents: flag.billedTotalCents,
            differenceCents: flag.differenceCents,
            calculationBreakdown: flag.calculationBreakdown,
          },
        });
      }
    }

    console.log(`Created realistic sample audit: ${invoice.invoiceNumber}`);
    console.log(`- Total Billed: $${(auditOutcome.totalBilledCents / 100).toFixed(2)}`);
    console.log(`- Potential Discrepancies: $${(auditOutcome.potentialDiscrepancyCents / 100).toFixed(2)}`);
    console.log(`- Flags Triggered: ${auditOutcome.totalFlagsCount}`);
  }

  console.log("--- Database Seed Completed Successfully ---");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
