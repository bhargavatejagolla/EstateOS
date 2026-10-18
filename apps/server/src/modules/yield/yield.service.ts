import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../middleware/errors.js";
import type { YieldEstimate } from "@estateos/shared";

export async function getYieldEstimate(propertyId: string): Promise<YieldEstimate> {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    throw new NotFoundError("Property not found");
  }

  // Look up real comparable rents: same city + bedrooms, ACTIVE leases
  const comparables = await prisma.lease.findMany({
    where: {
      status: "ACTIVE",
      property: { city: property.city, bedrooms: property.bedrooms },
    },
    select: { rentAmount: true },
  });

  if (comparables.length < 2) {
    return {
      propertyId,
      purchasePrice: Number(property.price),
      monthlyRent: 0,
      annualRent: 0,
      grossYieldPercent: 0,
      comparableCount: comparables.length,
      isVerified: false as const,
      disclaimer: "Not enough comparable leases to estimate yield for this area.",
    };
  }

  const avgMonthly =
    comparables.reduce((s, c) => s + Number(c.rentAmount), 0) / comparables.length;
  const annual = avgMonthly * 12;
  const grossYield = (annual / Number(property.price)) * 100;

  return {
    propertyId,
    purchasePrice: Number(property.price),
    monthlyRent: Math.round(avgMonthly),
    annualRent: Math.round(annual),
    grossYieldPercent: Math.round(grossYield * 100) / 100,
    comparableCount: comparables.length,
    isVerified: false as const,
    disclaimer: `Estimated from ${comparables.length} active leases in ${property.city} with ${property.bedrooms}BHK. Not a market valuation.`,
  };
}
