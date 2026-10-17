import { z } from "zod";

export const EnquiryStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "VISIT_SCHEDULED",
  "NEGOTIATING",
  "CLOSED_WON",
  "CLOSED_LOST",
]);

export const AppointmentStatusEnum = z.enum([
  "PROPOSED",
  "CONFIRMED",
  "RESCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export type EnquiryStatus = z.infer<typeof EnquiryStatusEnum>;
export type AppointmentStatus = z.infer<typeof AppointmentStatusEnum>;
