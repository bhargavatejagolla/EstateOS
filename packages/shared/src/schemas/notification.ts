import { z } from "zod";
import { NotificationTypeSchema } from "./enums.js";

export const NotificationResponseSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  type: NotificationTypeSchema,
  message: z.string(),
  link: z.string().nullable().optional(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const NotificationListResponseSchema = z.object({
  notifications: z.array(NotificationResponseSchema),
  unreadCount: z.number().int().nonnegative(),
});

export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;
export type NotificationListResponse = z.infer<typeof NotificationListResponseSchema>;
