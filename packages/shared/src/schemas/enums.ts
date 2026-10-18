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

export const LeaseStatusSchema = z.enum([
  "DRAFT",
  "PENDING_ACCEPTANCE",
  "ACTIVE",
  "ENDED",
  "TERMINATED",
]);
export const LeaseStatusEnum = LeaseStatusSchema;

export const LeaseAcceptanceStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
]);
export const LeaseAcceptanceStatusEnum = LeaseAcceptanceStatusSchema;

export const PaymentMethodSchema = z.enum([
  "UPI",
  "CASH",
  "BANK_TRANSFER",
  "OTHER",
]);
export const PaymentMethodEnum = PaymentMethodSchema;

export const MaintenanceStatusSchema = z.enum([
  "SUBMITTED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);
export const MaintenanceStatusEnum = MaintenanceStatusSchema;

export const MaintenancePrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);
export const MaintenancePriorityEnum = MaintenancePrioritySchema;

export const NotificationTypeSchema = z.enum([
  "ENQUIRY_RECEIVED",
  "APPOINTMENT_SCHEDULED",
  "APPOINTMENT_CONFIRMED",
  "LEASE_CREATED",
  "LEASE_ACCEPTED",
  "LEASE_ENDING_SOON",
  "LEASE_ENDED",
  "RENT_DUE_SOON",
  "RENT_OVERDUE",
  "PAYMENT_RECORDED",
  "MAINTENANCE_SUBMITTED",
  "MAINTENANCE_UPDATED",
]);
export const NotificationTypeEnum = NotificationTypeSchema;

export type EnquiryStatus = z.infer<typeof EnquiryStatusEnum>;
export type AppointmentStatus = z.infer<typeof AppointmentStatusEnum>;
export type LeaseStatus = z.infer<typeof LeaseStatusSchema>;
export type LeaseAcceptanceStatus = z.infer<typeof LeaseAcceptanceStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type MaintenanceStatus = z.infer<typeof MaintenanceStatusSchema>;
export type MaintenancePriority = z.infer<typeof MaintenancePrioritySchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
