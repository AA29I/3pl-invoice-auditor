import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { parseDollarsToCents } from "@/lib/money/currency";

export async function POST(
  req: Request,
  { params }: { params: { providerId: string } }
) {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { providerId } = params;

  // Confirm provider belongs to this workspace
  const provider = await prisma.provider.findFirst({
    where: { id: providerId, workspaceId: user.workspace.id },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  try {
    const {
      name,
      effectiveFrom,
      effectiveTo,
      currency,
      notes,
      rateCardType,
      defaultWeightUnit,
      customOptions,
      fees,
    } = await req.json();

    if (!name || !effectiveFrom) {
      return NextResponse.json(
        { error: "Rate card name and effective start date are required." },
        { status: 400 }
      );
    }

    if (!fees || !Array.isArray(fees) || fees.length === 0) {
      return NextResponse.json(
        { error: "At least one contracted fee rate is required." },
        { status: 400 }
      );
    }

    const rateCard = await prisma.$transaction(async (tx) => {
      const card = await tx.rateCard.create({
        data: {
          providerId,
          name: name.trim(),
          rateCardType: rateCardType || "STANDARD",
          defaultWeightUnit: defaultWeightUnit || "LB",
          effectiveFrom: new Date(effectiveFrom),
          effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
          currency: currency || "USD",
          notes: notes?.trim() || null,
          customOptions: customOptions ? JSON.stringify(customOptions) : null,
        },
      });

      for (const fee of fees) {
        const rateCents =
          typeof fee.rateCents === "number"
            ? fee.rateCents
            : parseDollarsToCents(fee.rateDollars || fee.rate || "0");

        const incrementalRateCents =
          fee.incrementalRateDollars
            ? parseDollarsToCents(fee.incrementalRateDollars)
            : typeof fee.incrementalRateCents === "number"
            ? fee.incrementalRateCents
            : null;

        await tx.rateCardFee.create({
          data: {
            rateCardId: card.id,
            category: fee.category,
            description: fee.description?.trim() || fee.category,
            unitType: fee.unitType?.trim() || "unit",
            rateCents,
            feeType: fee.feeType || "FLAT",
            shipper: fee.shipper?.trim() || null,
            serviceLevel: fee.serviceLevel?.trim() || null,
            weightUnit: fee.weightUnit || null,
            minWeight: fee.minWeight != null && fee.minWeight !== "" ? parseFloat(fee.minWeight) : null,
            maxWeight: fee.maxWeight != null && fee.maxWeight !== "" ? parseFloat(fee.maxWeight) : null,
            zone: fee.zone?.trim() || null,
            incrementalRateCents,
            incrementalWeightStep:
              fee.incrementalWeightStep != null && fee.incrementalWeightStep !== ""
                ? parseFloat(fee.incrementalWeightStep)
                : null,
            customFields: fee.customFields ? JSON.stringify(fee.customFields) : null,
          },
        });
      }

      return card;
    });

    const fullCard = await prisma.rateCard.findUnique({
      where: { id: rateCard.id },
      include: { fees: true },
    });

    return NextResponse.json({ rateCard: fullCard });
  } catch (error: any) {
    console.error("Failed to create rate card:", error);
    return NextResponse.json(
      { error: "Failed to create rate card. Please verify dates and rates." },
      { status: 500 }
    );
  }
}
