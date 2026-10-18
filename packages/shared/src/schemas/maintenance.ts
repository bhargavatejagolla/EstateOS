import { z } from "zod";
import { MaintenanceStatusSchema, MaintenancePrioritySchema } from "./enums.js";

export const MaintenanceCreateSchema = z.object({
  leaseId: z.string().min(1, "Lease ID is required"),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  priority: MaintenancePrioritySchema.default("MEDIUM"),
  imageUrl: z.string().url().optional(),
});

export const MaintenanceStatusUpdateSchema = z.object({
  status: MaintenanceStatusSchema,
  note: z.string().max(1000).optional(),
});

export const MaintenanceUpdateEntrySchema = z.object({
  id: z.string(),
  oldStatus: MaintenanceStatusSchema.nullable().optional(),
  newStatus: MaintenanceStatusSchema,
  note: z.string().nullable().optional(),
  updatedBy: z.object({ id: z.string(), name: z.string() }),
  createdAt: z.string(),
});

export const MaintenanceResponseSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  tenantId: z.string(),
  leaseId: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().nullable().optional(),
  status: MaintenanceStatusSchema,
  priority: MaintenancePrioritySchema,
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  resolvedAt: z.string().nullable().optional(),
  ageInDays: z.number().int().nonnegative(),
  property: z
    .object({
      id: z.string(),
      title: z.string(),
      city: z.string().optional(),
    })
    .optional(),
  tenant: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
  updates: z.array(MaintenanceUpdateEntrySchema),
});

export type MaintenanceCreate = z.infer<typeof MaintenanceCreateSchema>;
export type MaintenanceStatusUpdate = z.infer<typeof MaintenanceStatusUpdateSchema>;
export type MaintenanceUpdateEntry = z.infer<typeof MaintenanceUpdateEntrySchema>;
export type MaintenanceResponse = z.infer<typeof MaintenanceResponseSchema>;
