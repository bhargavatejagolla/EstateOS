import { z } from "zod";
import * as schemas from "../schemas";

export type RegisterInput = z.infer<typeof schemas.RegisterSchema>;
export type LoginInput = z.infer<typeof schemas.LoginSchema>;
export type RefreshTokenInput = z.infer<typeof schemas.RefreshTokenSchema>;

export type CreatePropertyInput = z.infer<typeof schemas.CreatePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof schemas.UpdatePropertySchema>;
export type PropertyQueryInput = z.infer<typeof schemas.PropertyQuerySchema>;

export type CreateEnquiryInput = z.infer<typeof schemas.CreateEnquirySchema>;
export type UpdateEnquiryInput = z.infer<typeof schemas.UpdateEnquirySchema>;

export type CreateAppointmentInput = z.infer<typeof schemas.CreateAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof schemas.UpdateAppointmentStatusSchema>;

export type CreateLeaseInput = z.infer<typeof schemas.CreateLeaseSchema>;
export type UpdateLeaseInput = z.infer<typeof schemas.UpdateLeaseSchema>;

export type CreatePaymentInput = z.infer<typeof schemas.CreatePaymentSchema>;

export type CreateMaintenanceRequestInput = z.infer<typeof schemas.CreateMaintenanceRequestSchema>;
export type UpdateMaintenanceStatusInput = z.infer<typeof schemas.UpdateMaintenanceStatusSchema>;

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface OwnerDashboardSummary {
  metrics: {
    totalProperties: number;
    occupiedProperties: number;
    vacantProperties: number;
    occupancyRate: number;
    totalActiveLeases: number;
    monthlyProjectedIncome: number;
    totalOverdueRent: number;
    pendingMaintenanceCount: number;
    upcomingViewingsCount: number;
  };
  signals: {
    overdueObligations: Array<{
      obligationId: string;
      leaseId: string;
      propertyTitle: string;
      tenantName: string;
      amountDue: number;
      amountPaid: number;
      balance: number;
      dueDate: string;
      daysOverdue: number;
    }>;
    expiringLeases: Array<{
      leaseId: string;
      propertyTitle: string;
      tenantName: string;
      endDate: string;
      daysRemaining: number;
    }>;
    urgentMaintenance: Array<{
      requestId: string;
      propertyTitle: string;
      tenantName: string;
      title: string;
      priority: string;
      status: string;
      createdAt: string;
    }>;
  };
}
