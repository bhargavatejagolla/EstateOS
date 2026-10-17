import { z } from "zod";

export const PropertyTypeEnum = z.enum([
  "APARTMENT",
  "HOUSE",
  "VILLA",
  "STUDIO",
  "PLOT",
  "COMMERCIAL",
]);

export const FurnishingEnum = z.enum([
  "UNFURNISHED",
  "SEMI_FURNISHED",
  "FULLY_FURNISHED",
]);

export const PropertyStatusEnum = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "ACTIVE",
  "ARCHIVED",
  "RENTED",
  "SOLD",
]);

export const AvailabilityEnum = z.enum([
  "AVAILABLE_NOW",
  "AVAILABLE_SOON",
  "NOT_AVAILABLE",
]);

export const PropertyCreateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  price: z.coerce.number().positive("Price must be positive"),
  depositAmount: z.coerce.number().nonnegative("Deposit cannot be negative").optional(),
  city: z.string().min(2, "City is required").max(100),
  locality: z.string().min(2, "Locality is required").max(100),
  address: z.string().min(5, "Address must be at least 5 characters").max(500),
  pincode: z.string().regex(/^\d{5,6}$/, "Pincode must be 5 to 6 digits").optional(),
  propertyType: PropertyTypeEnum,
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  areaSqft: z.coerce.number().int().positive("Area must be positive"),
  furnishing: FurnishingEnum,
  amenities: z.array(z.string()).default([]),
  availability: AvailabilityEnum.default("AVAILABLE_NOW"),
});

export const PropertyUpdateSchema = PropertyCreateSchema.partial().extend({
  status: PropertyStatusEnum.optional(),
});

export const PropertyImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  publicId: z.string(),
  isPrimary: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.string().datetime(),
});

export const PropertyResponseSchema = PropertyCreateSchema.extend({
  id: z.string(),
  ownerId: z.string(),
  status: PropertyStatusEnum,
  images: z.array(PropertyImageSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PropertyType = z.infer<typeof PropertyTypeEnum>;
export type Furnishing = z.infer<typeof FurnishingEnum>;
export type PropertyStatus = z.infer<typeof PropertyStatusEnum>;
export type Availability = z.infer<typeof AvailabilityEnum>;
export type PropertyCreate = z.infer<typeof PropertyCreateSchema>;
export type PropertyUpdate = z.infer<typeof PropertyUpdateSchema>;
export type PropertyImage = z.infer<typeof PropertyImageSchema>;
export type PropertyResponse = z.infer<typeof PropertyResponseSchema>;
