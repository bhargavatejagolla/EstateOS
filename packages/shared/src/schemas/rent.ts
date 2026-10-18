import { z } from "zod";
import { PaymentMethodSchema } from "./enums.js";

export const DerivedObligationStatusSchema = z.enum([
  "PENDING",
  "PARTIAL",
  "PAID",
  "OVERDUE",
  "WAIVED",
]);

export const RentObligationResponseSchema = z.object({
  id: z.string(),
  leaseId: z.string(),
  dueDate: z.string(),
  amountDue: z.number(),
  amountPaid: z.number(),
  balance: z.number(),
  status: DerivedObligationStatusSchema,
  daysOverdue: z.number().int().nonnegative(),
});

export const PaymentCreateSchema = z.object({
  leaseId: z.string().min(1, "Lease ID is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  paidAt: z.string().datetime().optional(),
  method: PaymentMethodSchema,
  reference: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export const PaymentAllocationResponseSchema = z.object({
  id: z.string().optional(),
  obligationId: z.string(),
  amount: z.number(),
  dueDate: z.string().optional(),
});

export const PaymentResponseSchema = z.object({
  id: z.string(),
  leaseId: z.string(),
  amount: z.number(),
  paidAt: z.string(),
  method: z.string(),
  reference: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  allocations: z.array(PaymentAllocationResponseSchema),
  createdAt: z.string().optional(),
});

export type DerivedObligationStatus = z.infer<typeof DerivedObligationStatusSchema>;
export type RentObligationResponse = z.infer<typeof RentObligationResponseSchema>;
export type PaymentCreate = z.infer<typeof PaymentCreateSchema>;
export type PaymentAllocationResponse = z.infer<typeof PaymentAllocationResponseSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
