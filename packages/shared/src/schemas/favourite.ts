import { z } from "zod";
import { PropertyResponseSchema } from "./property.js";

export const FavouriteResponseSchema = z.object({
  userId: z.string(),
  propertyId: z.string(),
  createdAt: z.string().datetime(),
  property: PropertyResponseSchema.optional(),
});

export type FavouriteResponse = z.infer<typeof FavouriteResponseSchema>;
