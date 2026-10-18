import { z } from "zod";

export const YieldEstimateSchema = z.object({
  propertyId: z.string(),
  purchasePrice: z.number(),
  monthlyRent: z.number(),
  annualRent: z.number(),
  grossYieldPercent: z.number(), // (annualRent / purchasePrice) * 100
  comparableCount: z.number().int(), // how many active leases in same city+bedrooms used
  isVerified: z.literal(false), // honesty flag — this is an ESTIMATE
  disclaimer: z.string(), // always returned, always shown
});

export type YieldEstimate = z.infer<typeof YieldEstimateSchema>;
