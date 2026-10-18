import { z } from "zod";

// A single computed signal — every widget on the dashboard is one of these
export const SignalSeveritySchema = z.enum(["info", "warning", "critical"]);

export const DashboardSignalSchema = z.object({
  id: z.string(),
  type: z.enum([
    "OVERDUE_RENT",
    "UPCOMING_RENT",
    "VACANT_PROPERTY",
    "UNRESOLVED_MAINTENANCE",
    "UPCOMING_VIEWING",
    "EXPIRING_LEASE",
    "NEW_ENQUIRY",
  ]),
  severity: SignalSeveritySchema,
  title: z.string(),
  description: z.string(),
  link: z.string(), // deep link to relevant page
  amount: z.number().nullable(),
  daysOffset: z.number().int(), // negative = overdue by N days, positive = due in N days
});

export const DashboardSummarySchema = z.object({
  totalProperties: z.number().int(),
  activeProperties: z.number().int(),
  rentedProperties: z.number().int(),
  activeLeases: z.number().int(),
  occupancyRate: z.number(), // 0..1, computed from active leases / active+rented properties
  monthlyRentExpected: z.number(),
  monthlyRentCollected: z.number(),
  collectionRate: z.number(), // 0..1
  overdueAmount: z.number(),
  unresolvedMaintenanceCount: z.number().int(),
  upcomingViewingsCount: z.number().int(),
});

export const IncomeTrendPointSchema = z.object({
  month: z.string(), // "2026-05"
  expected: z.number(),
  collected: z.number(),
});

export const OwnerDashboardResponseSchema = z.object({
  summary: DashboardSummarySchema,
  signals: z.array(DashboardSignalSchema), // ranked, most urgent first
  incomeTrend: z.array(IncomeTrendPointSchema), // last 6 months
  recentActivity: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      message: z.string(),
      createdAt: z.string(),
    })
  ), // last 10 from AuditLog
});

export const TenantDashboardResponseSchema = z.object({
  activeLease: z
    .object({
      id: z.string(),
      propertyTitle: z.string(),
      propertyCity: z.string(),
      propertyAddress: z.string().optional(),
      rentAmount: z.number(),
      dueDay: z.number(),
      startDate: z.string(),
      endDate: z.string(),
      status: z.string(),
    })
    .nullable(),
  nextRentDue: z
    .object({
      id: z.string(),
      dueDate: z.string(),
      amountDue: z.number(),
      amountPaid: z.number(),
      balance: z.number(),
      status: z.string(),
      daysUntilDue: z.number().int(),
    })
    .nullable(),
  openMaintenanceCount: z.number().int(),
  recentMaintenance: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: z.string(),
      priority: z.string(),
      createdAt: z.string(),
    })
  ),
});

export type SignalSeverity = z.infer<typeof SignalSeveritySchema>;
export type DashboardSignal = z.infer<typeof DashboardSignalSchema>;
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;
export type IncomeTrendPoint = z.infer<typeof IncomeTrendPointSchema>;
export type OwnerDashboardResponse = z.infer<typeof OwnerDashboardResponseSchema>;
export type TenantDashboardResponse = z.infer<typeof TenantDashboardResponseSchema>;
