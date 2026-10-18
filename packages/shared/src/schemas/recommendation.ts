import { z } from "zod";

export const RecommendationReasonSchema = z.object({
  type: z.enum([
    "CITY_MATCH",
    "BEDROOM_MATCH",
    "PRICE_MATCH",
    "AMENITY_MATCH",
    "TYPE_MATCH",
  ]),
  description: z.string(), // human-readable, e.g. "Same city as 2 of your favourites"
});

export const RecommendationSchema = z.object({
  propertyId: z.string(),
  title: z.string(),
  city: z.string(),
  price: z.number(),
  bedrooms: z.number().int().optional(),
  propertyType: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  score: z.number(), // 0..100, for sorting only — NOT shown to user as "AI confidence"
  reasons: z.array(RecommendationReasonSchema), // 1..4 reasons, each factual
});

export const RecommendationsResponseSchema = z.object({
  data: z.array(RecommendationSchema),
  basedOn: z.object({
    favourites: z.number().int(),
    enquiries: z.number().int(),
    cities: z.array(z.string()),
  }),
});

export type RecommendationReason = z.infer<typeof RecommendationReasonSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type RecommendationsResponse = z.infer<typeof RecommendationsResponseSchema>;
