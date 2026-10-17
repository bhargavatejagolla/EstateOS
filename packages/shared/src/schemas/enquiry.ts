import { z } from "zod";
import { EnquiryStatusEnum } from "./enums.js";

export const EnquiryCreateSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  message: z.string().min(5, "Message must be at least 5 characters").max(1000),
});

export const EnquiryUpdateSchema = z.object({
  status: EnquiryStatusEnum.optional(),
  ownerNotes: z.string().max(2000).optional(),
});

export const EnquiryResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  propertyId: z.string(),
  message: z.string(),
  status: EnquiryStatusEnum,
  ownerNotes: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
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
      price: z.number(),
      city: z.string(),
      locality: z.string(),
      images: z
        .array(
          z.object({
            id: z.string(),
            url: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
  appointments: z.array(z.any()).optional(),
});

export type EnquiryCreate = z.infer<typeof EnquiryCreateSchema>;
export type EnquiryUpdate = z.infer<typeof EnquiryUpdateSchema>;
export type EnquiryResponse = z.infer<typeof EnquiryResponseSchema>;
