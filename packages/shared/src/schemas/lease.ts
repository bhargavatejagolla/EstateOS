import { z } from "zod";
import { LeaseStatusSchema, LeaseAcceptanceStatusSchema } from "./enums.js";

export const LeaseCreateSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  enquiryId: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  rentAmount: z.coerce.number().positive("Rent amount must be positive"),
  depositAmount: z.coerce.number().nonnegative("Deposit amount cannot be negative").optional(),
  dueDay: z.coerce.number().int().min(1).max(28),
  documentUrl: z.string().url().optional(),
}).refine((d) => new Date(d.endDate) > new Date(d.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const LeaseAcceptSchema = z.object({
  acceptedByName: z.string().min(2, "Name must be at least 2 characters").max(100),
  signatureDataUrl: z.string().startsWith("data:image/").optional(),
});

export const LeaseStatusUpdateSchema = z.object({
  status: LeaseStatusSchema.optional(),
  endDate: z.string().datetime().optional(),
});

export const LeaseResponseSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  tenantId: z.string(),
  enquiryId: z.string().nullable().optional(),
  startDate: z.string(),
  endDate: z.string(),
  rentAmount: z.number(),
  depositAmount: z.number().nullable().optional(),
  dueDay: z.number(),
  status: LeaseStatusSchema,
  acceptanceStatus: LeaseAcceptanceStatusSchema,
  acceptedByName: z.string().nullable().optional(),
  acceptedByTenantAt: z.string().nullable().optional(),
  signatureDataUrl: z.string().nullable().optional(),
  documentUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  property: z
    .object({
      id: z.string(),
      title: z.string(),
      city: z.string(),
      price: z.number().optional(),
      address: z.string().optional(),
      ownerId: z.string().optional(),
    })
    .optional(),
  tenant: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      phone: z.string().nullable().optional(),
    })
    .optional(),
});

export type LeaseCreate = z.infer<typeof LeaseCreateSchema>;
export type LeaseAccept = z.infer<typeof LeaseAcceptSchema>;
export type LeaseStatusUpdate = z.infer<typeof LeaseStatusUpdateSchema>;
export type LeaseResponse = z.infer<typeof LeaseResponseSchema>;
