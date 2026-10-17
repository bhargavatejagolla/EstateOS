import { z } from "zod";
import {
  Role,
  PropertyStatus,
  PropertyType,
  Furnishing,
  EnquiryStatus,
  AppointmentStatus,
  LeaseStatus,
  RentObligationStatus,
  PaymentMethod,
  MaintenancePriority,
  MaintenanceStatus,
  NotificationType,
} from "../enums";

// Auth Schemas
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  role: z.enum([Role.OWNER, Role.TENANT]).default(Role.TENANT),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Property Schemas
export const CreatePropertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  propertyType: z.enum([
    PropertyType.APARTMENT,
    PropertyType.VILLA,
    PropertyType.STUDIO,
    PropertyType.COMMERCIAL,
  ]),
  rentPrice: z.number().positive("Rent price must be positive"),
  depositPrice: z.number().nonnegative("Deposit price must be non-negative"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  locality: z.string().min(2, "Locality is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  areaSqft: z.number().int().positive(),
  furnishing: z.enum([
    Furnishing.UNFURNISHED,
    Furnishing.SEMI_FURNISHED,
    Furnishing.FULLY_FURNISHED,
  ]),
  amenities: z.array(z.string()).default([]),
  status: z
    .enum([
      PropertyStatus.AVAILABLE,
      PropertyStatus.RENTED,
      PropertyStatus.MAINTENANCE,
      PropertyStatus.UNLISTED,
    ])
    .default(PropertyStatus.AVAILABLE),
});

export const UpdatePropertySchema = CreatePropertySchema.partial();

export const PropertyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  city: z.string().optional(),
  propertyType: z.enum([
    PropertyType.APARTMENT,
    PropertyType.VILLA,
    PropertyType.STUDIO,
    PropertyType.COMMERCIAL,
  ]).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  furnishing: z.enum([
    Furnishing.UNFURNISHED,
    Furnishing.SEMI_FURNISHED,
    Furnishing.FULLY_FURNISHED,
  ]).optional(),
  status: z.enum([
    PropertyStatus.AVAILABLE,
    PropertyStatus.RENTED,
    PropertyStatus.MAINTENANCE,
    PropertyStatus.UNLISTED,
  ]).optional(),
  search: z.string().optional(),
});

// Enquiry Schemas
export const CreateEnquirySchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  preferredVisitDate: z.string().datetime().optional(),
});

export const UpdateEnquirySchema = z.object({
  status: z.enum([
    EnquiryStatus.PENDING,
    EnquiryStatus.CONTACTED,
    EnquiryStatus.SCHEDULED,
    EnquiryStatus.CLOSED,
  ]),
});

// Appointment Schemas
export const CreateAppointmentSchema = z.object({
  enquiryId: z.string().uuid().optional(),
  propertyId: z.string().uuid("Invalid property ID"),
  visitAt: z.string().datetime("Must be a valid ISO datetime"),
  notes: z.string().max(500).optional(),
});

export const UpdateAppointmentStatusSchema = z.object({
  status: z.enum([
    AppointmentStatus.PENDING,
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.RESCHEDULED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ]),
  notes: z.string().max(500).optional(),
});

// Lease Schemas
export const CreateLeaseSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  tenantId: z.string().uuid("Invalid tenant ID"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  rentAmount: z.number().positive("Rent amount must be positive"),
  depositAmount: z.number().nonnegative("Deposit amount must be non-negative"),
  dueDay: z.number().int().min(1).max(31).default(1),
});

export const UpdateLeaseSchema = z.object({
  status: z.enum([
    LeaseStatus.PENDING_SIGNATURE,
    LeaseStatus.ACTIVE,
    LeaseStatus.TERMINATED,
    LeaseStatus.EXPIRED,
  ]),
});

// Payment Schemas
export const CreatePaymentSchema = z.object({
  leaseId: z.string().uuid("Invalid lease ID"),
  amount: z.number().positive("Payment amount must be positive"),
  method: z.enum([
    PaymentMethod.UPI,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.DEBIT_CARD,
    PaymentMethod.CASH,
    PaymentMethod.SIMULATED,
  ]).default(PaymentMethod.SIMULATED),
  reference: z.string().optional(),
  allocations: z.array(
    z.object({
      rentObligationId: z.string().uuid(),
      amount: z.number().positive(),
    })
  ).optional(),
});

// Maintenance Request Schemas
export const CreateMaintenanceRequestSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  priority: z.enum([
    MaintenancePriority.LOW,
    MaintenancePriority.MEDIUM,
    MaintenancePriority.HIGH,
    MaintenancePriority.EMERGENCY,
  ]).default(MaintenancePriority.MEDIUM),
  imageUrl: z.string().url().optional(),
});

export const UpdateMaintenanceStatusSchema = z.object({
  status: z.enum([
    MaintenanceStatus.SUBMITTED,
    MaintenanceStatus.ASSIGNED,
    MaintenanceStatus.IN_PROGRESS,
    MaintenanceStatus.RESOLVED,
    MaintenanceStatus.CANCELLED,
  ]),
  note: z.string().min(1, "Resolution note or update text is required"),
});
