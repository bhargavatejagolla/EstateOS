import { z } from "zod";
import { AppointmentStatusEnum } from "./enums.js";

export const AppointmentCreateSchema = z.object({
  enquiryId: z.string().min(1, "Enquiry ID is required"),
  visitAt: z.string().datetime("Must be a valid ISO datetime"),
  notes: z.string().max(1000).optional(),
});

export const AppointmentUpdateSchema = z.object({
  status: AppointmentStatusEnum.optional(),
  visitAt: z.string().datetime("Must be a valid ISO datetime").optional(),
  notes: z.string().max(1000).optional(),
});

export const AppointmentResponseSchema = z.object({
  id: z.string(),
  enquiryId: z.string(),
  visitAt: z.string().datetime(),
  status: AppointmentStatusEnum,
  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  enquiry: z
    .object({
      id: z.string(),
      message: z.string(),
      user: z
        .object({
          id: z.string(),
          name: z.string(),
          email: z.string().email(),
          phone: z.string().nullable().optional(),
        })
        .optional(),
      property: z
        .object({
          id: z.string(),
          title: z.string(),
          city: z.string(),
          locality: z.string(),
        })
        .optional(),
    })
    .optional(),
});

export type AppointmentCreate = z.infer<typeof AppointmentCreateSchema>;
export type AppointmentUpdate = z.infer<typeof AppointmentUpdateSchema>;
export type AppointmentResponse = z.infer<typeof AppointmentResponseSchema>;
