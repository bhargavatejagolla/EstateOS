export const Role = {
  OWNER: "OWNER",
  TENANT: "TENANT",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const PropertyStatus = {
  AVAILABLE: "AVAILABLE",
  RENTED: "RENTED",
  MAINTENANCE: "MAINTENANCE",
  UNLISTED: "UNLISTED",
} as const;
export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus];

export const PropertyType = {
  APARTMENT: "APARTMENT",
  VILLA: "VILLA",
  STUDIO: "STUDIO",
  COMMERCIAL: "COMMERCIAL",
} as const;
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const Furnishing = {
  UNFURNISHED: "UNFURNISHED",
  SEMI_FURNISHED: "SEMI_FURNISHED",
  FULLY_FURNISHED: "FULLY_FURNISHED",
} as const;
export type Furnishing = (typeof Furnishing)[keyof typeof Furnishing];

export const EnquiryStatus = {
  PENDING: "PENDING",
  CONTACTED: "CONTACTED",
  SCHEDULED: "SCHEDULED",
  CLOSED: "CLOSED",
} as const;
export type EnquiryStatus = (typeof EnquiryStatus)[keyof typeof EnquiryStatus];

export const AppointmentStatus = {
  PENDING: "PENDING",
  SCHEDULED: "SCHEDULED",
  RESCHEDULED: "RESCHEDULED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const LeaseStatus = {
  PENDING_SIGNATURE: "PENDING_SIGNATURE",
  ACTIVE: "ACTIVE",
  TERMINATED: "TERMINATED",
  EXPIRED: "EXPIRED",
} as const;
export type LeaseStatus = (typeof LeaseStatus)[keyof typeof LeaseStatus];

export const RentObligationStatus = {
  PENDING: "PENDING",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
} as const;
export type RentObligationStatus = (typeof RentObligationStatus)[keyof typeof RentObligationStatus];

export const PaymentMethod = {
  UPI: "UPI",
  BANK_TRANSFER: "BANK_TRANSFER",
  CREDIT_CARD: "CREDIT_CARD",
  DEBIT_CARD: "DEBIT_CARD",
  CASH: "CASH",
  SIMULATED: "SIMULATED",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const MaintenancePriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  EMERGENCY: "EMERGENCY",
} as const;
export type MaintenancePriority = (typeof MaintenancePriority)[keyof typeof MaintenancePriority];

export const MaintenanceStatus = {
  SUBMITTED: "SUBMITTED",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CANCELLED: "CANCELLED",
} as const;
export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

export const NotificationType = {
  RENT_DUE: "RENT_DUE",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  APPOINTMENT_NEW: "APPOINTMENT_NEW",
  MAINTENANCE_UPDATE: "MAINTENANCE_UPDATE",
  LEASE_EXPIRING: "LEASE_EXPIRING",
  GENERAL: "GENERAL",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
