import { prisma } from "../../lib/prisma.js";
import type {
  OwnerDashboardResponse,
  TenantDashboardResponse,
  DashboardSignal,
  IncomeTrendPoint,
} from "@estateos/shared";

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysBetween(d1: Date, d2: Date): number {
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function hoursBetween(d1: Date, d2: Date): number {
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

export async function getSixMonthIncomeTrend(ownerId: string): Promise<IncomeTrendPoint[]> {
  const now = new Date();
  const months: { label: string; year: number; month: number; start: Date; end: Date }[] = [];

  // Generate 6 months from 5 months ago up to current month
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = `${year}-${String(month + 1).padStart(2, "0")}`;
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const nextMonth = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
    months.push({ label, year, month, start, end: nextMonth });
  }

  // Fetch all rent obligations and payments for this owner's leases
  const [obligations, payments] = await Promise.all([
    prisma.rentObligation.findMany({
      where: {
        lease: { property: { ownerId } },
      },
      select: { dueDate: true, amountDue: true },
    }),
    prisma.payment.findMany({
      where: {
        lease: { property: { ownerId } },
      },
      select: { paidAt: true, amount: true },
    }),
  ]);

  return months.map((m) => {
    const expected = obligations
      .filter((ob) => ob.dueDate >= m.start && ob.dueDate < m.end)
      .reduce((sum, ob) => sum + Number(ob.amountDue), 0);

    const collected = payments
      .filter((p) => p.paidAt >= m.start && p.paidAt < m.end)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      month: m.label,
      expected,
      collected,
    };
  });
}

export async function getRecentActivity(
  ownerId: string,
  propertyIds?: string[],
  leaseIds?: string[]
) {
  let pIds: string[] = propertyIds ?? [];
  if (!propertyIds) {
    pIds = await prisma.property
      .findMany({
        where: { ownerId },
        select: { id: true },
      })
      .then((rows) => rows.map((r) => r.id));
  }

  let lIds: string[] = leaseIds ?? [];
  if (!leaseIds) {
    lIds =
      pIds.length > 0
        ? await prisma.lease
            .findMany({
              where: { propertyId: { in: pIds } },
              select: { id: true },
            })
            .then((rows) => rows.map((r) => r.id))
        : [];
  }

  const orConditions: any[] = [{ userId: ownerId }];
  if (pIds.length > 0) {
    orConditions.push({ entity: "Property", entityId: { in: pIds } });
  }
  if (lIds.length > 0) {
    orConditions.push({ entity: "Lease", entityId: { in: lIds } });
  }

  const logs = await prisma.auditLog.findMany({
    where: { OR: orConditions },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return logs.map((log) => {
    let message = log.action;
    switch (log.action) {
      case "property.created":
        message = "New property listed";
        break;
      case "property.published":
        message = "Property published to marketplace";
        break;
      case "property.unpublished":
        message = "Property unpublished to draft";
        break;
      case "lease.created":
        message = "Lease agreement generated";
        break;
      case "lease.accepted":
        message = "Lease agreement accepted by tenant";
        break;
      case "lease.active":
        message = "Lease activated";
        break;
      case "lease.ended":
        message = "Lease concluded";
        break;
      case "payment.recorded":
        message = "Rent payment received";
        break;
      case "maintenance.submitted":
        message = "Maintenance issue reported";
        break;
      case "maintenance.acknowledged":
        message = "Maintenance acknowledged";
        break;
      case "maintenance.in_progress":
        message = "Maintenance in progress";
        break;
      case "maintenance.resolved":
        message = "Maintenance resolved";
        break;
      default:
        message = log.action.replace(".", " ");
    }

    return {
      id: log.id,
      action: log.action,
      message,
      createdAt: log.createdAt.toISOString(),
    };
  });
}

export async function getOwnerDashboard(ownerId: string): Promise<OwnerDashboardResponse> {
  const now = new Date();
  const sevenDaysAhead = addDays(now, 7);
  const thirtyDaysAhead = addDays(now, 30);
  const oneDayAhead = addDays(now, 1);
  const twoDaysAgo = addDays(now, -2);

  // Batch 1: Base properties & active leases
  const [properties, activeLeases] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId, deletedAt: null },
      select: { id: true, status: true, activeLeaseId: true, title: true, city: true },
    }),
    prisma.lease.findMany({
      where: { property: { ownerId }, status: "ACTIVE" },
      select: { id: true, rentAmount: true },
    }),
  ]);

  const propertyIds = properties.map((p) => p.id);
  const activeLeaseIds = activeLeases.map((l) => l.id);

  // Batch 2: Obligations
  const [overdueObligations, upcomingObligations] = await Promise.all([
    prisma.rentObligation
      .findMany({
        where: {
          lease: { property: { ownerId }, status: "ACTIVE" },
          dueDate: { lt: now },
        },
        include: { lease: { include: { tenant: true, property: true } } },
      })
      .then((rows) => rows.filter((r) => Number(r.amountPaid) < Number(r.amountDue))),
    prisma.rentObligation
      .findMany({
        where: {
          lease: { property: { ownerId }, status: "ACTIVE" },
          dueDate: { gte: now, lte: sevenDaysAhead },
        },
        include: { lease: { include: { tenant: true, property: true } } },
      })
      .then((rows) => rows.filter((r) => Number(r.amountPaid) < Number(r.amountDue))),
  ]);

  // Batch 3: Operations & Funnel
  const [unresolvedMaintenance, upcomingViewings, expiringLeases, newEnquiries] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where: {
        property: { ownerId },
        status: { in: ["SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS"] },
      },
      include: { property: true, tenant: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        enquiry: { property: { ownerId } },
        status: "CONFIRMED",
        visitAt: { gte: now, lte: oneDayAhead },
      },
      include: { enquiry: { include: { user: true, property: true } } },
    }),
    prisma.lease.findMany({
      where: {
        property: { ownerId },
        status: "ACTIVE",
        endDate: { gte: now, lte: thirtyDaysAhead },
      },
      include: { property: true, tenant: true },
    }),
    prisma.enquiry.findMany({
      where: {
        property: { ownerId },
        status: "NEW",
        createdAt: { lt: twoDaysAgo },
      },
      include: { property: true, user: true },
    }),
  ]);

  // Batch 4: Financial trend & Recent activity
  const [sixMonthPayments, recentActivity] = await Promise.all([
    getSixMonthIncomeTrend(ownerId),
    getRecentActivity(ownerId, propertyIds, activeLeaseIds),
  ]);

  // Construct signals
  const signals: DashboardSignal[] = [
    ...overdueObligations.map((ob) => {
      const daysOver = daysBetween(now, ob.dueDate);
      return {
        id: `overdue-${ob.id}`,
        type: "OVERDUE_RENT" as const,
        severity: "critical" as const,
        title: `${ob.lease.tenant.name} owes rent`,
        description: `${ob.lease.property.title} · due ${formatDate(ob.dueDate)}`,
        link: `/owner/leases/${ob.leaseId}`,
        amount: Number(ob.amountDue) - Number(ob.amountPaid),
        daysOffset: -daysOver,
      };
    }),
    ...upcomingObligations.map((ob) => {
      const daysUntil = daysBetween(now, ob.dueDate);
      return {
        id: `upcoming-${ob.id}`,
        type: "UPCOMING_RENT" as const,
        severity: "warning" as const,
        title: `Rent due in ${daysUntil} days`,
        description: `${ob.lease.tenant.name} · ${ob.lease.property.title}`,
        link: `/owner/leases/${ob.leaseId}`,
        amount: Number(ob.amountDue) - Number(ob.amountPaid),
        daysOffset: daysUntil,
      };
    }),
    ...properties
      .filter((p) => p.status === "ACTIVE" && !p.activeLeaseId)
      .map((p) => ({
        id: `vacant-${p.id}`,
        type: "VACANT_PROPERTY" as const,
        severity: "warning" as const,
        title: `${p.title} is vacant`,
        description: `Publish and promote to find tenants`,
        link: `/owner/properties/${p.id}`,
        amount: null,
        daysOffset: 0,
      })),
    ...unresolvedMaintenance.map((mr) => {
      const age = daysBetween(now, mr.createdAt);
      return {
        id: `maint-${mr.id}`,
        type: "UNRESOLVED_MAINTENANCE" as const,
        severity: age > 7 ? ("critical" as const) : ("warning" as const),
        title: `Maintenance open ${age} days`,
        description: `${mr.property.title} · ${mr.title}`,
        link: `/owner/maintenance`,
        amount: null,
        daysOffset: -age,
      };
    }),
    ...upcomingViewings.map((a) => ({
      id: `viewing-${a.id}`,
      type: "UPCOMING_VIEWING" as const,
      severity: "info" as const,
      title: `Viewing in ${hoursBetween(now, a.visitAt)}h`,
      description: `${a.enquiry.user.name} · ${a.enquiry.property.title}`,
      link: `/owner/dashboard`,
      amount: null,
      daysOffset: 0,
    })),
    ...expiringLeases.map((l) => {
      const daysUntilEnd = daysBetween(now, l.endDate);
      return {
        id: `expiring-${l.id}`,
        type: "EXPIRING_LEASE" as const,
        severity: "warning" as const,
        title: `Lease ends in ${daysUntilEnd} days`,
        description: `${l.tenant.name} · ${l.property.title}`,
        link: `/owner/leases/${l.id}`,
        amount: null,
        daysOffset: daysUntilEnd,
      };
    }),
    ...newEnquiries.map((e) => {
      const daysUnanswered = daysBetween(now, e.createdAt);
      return {
        id: `enq-${e.id}`,
        type: "NEW_ENQUIRY" as const,
        severity: "warning" as const,
        title: `Enquiry unanswered for ${daysUnanswered} days`,
        description: `${e.user.name} · ${e.property.title}`,
        link: `/owner/dashboard`,
        amount: null,
        daysOffset: -daysUnanswered,
      };
    }),
  ];

  // Rank signals: critical first, then warning, then info; then by abs(daysOffset) descending
  signals.sort((a, b) => {
    const sevRank = { critical: 0, warning: 1, info: 2 };
    if (sevRank[a.severity] !== sevRank[b.severity]) {
      return sevRank[a.severity] - sevRank[b.severity];
    }
    return Math.abs(b.daysOffset) - Math.abs(a.daysOffset);
  });

  // Summary counts
  const totalProperties = properties.length;
  const activeProperties = properties.filter((p) => p.status === "ACTIVE").length;
  const rentedProperties = properties.filter((p) => p.status === "RENTED").length;
  const occupancyRate =
    activeProperties + rentedProperties > 0
      ? rentedProperties / (activeProperties + rentedProperties)
      : 0;

  const monthlyRentExpected = activeLeases.reduce((s, l) => s + Number(l.rentAmount), 0);
  const currentMonthTrend = sixMonthPayments[sixMonthPayments.length - 1];
  const monthlyRentCollected = currentMonthTrend ? currentMonthTrend.collected : 0;
  const collectionRate =
    monthlyRentExpected > 0 ? monthlyRentCollected / monthlyRentExpected : 0;
  const overdueAmount = overdueObligations.reduce(
    (s, ob) => s + (Number(ob.amountDue) - Number(ob.amountPaid)),
    0
  );

  return {
    summary: {
      totalProperties,
      activeProperties,
      rentedProperties,
      activeLeases: activeLeases.length,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      monthlyRentExpected,
      monthlyRentCollected,
      collectionRate: Math.round(collectionRate * 100) / 100,
      overdueAmount,
      unresolvedMaintenanceCount: unresolvedMaintenance.length,
      upcomingViewingsCount: upcomingViewings.length,
    },
    signals: signals.slice(0, 15),
    incomeTrend: sixMonthPayments,
    recentActivity,
  };
}

export async function getTenantDashboard(tenantId: string): Promise<TenantDashboardResponse> {
  const now = new Date();

  // Find active lease for tenant
  const activeLease = await prisma.lease.findFirst({
    where: {
      tenantId,
      status: "ACTIVE",
    },
    include: {
      property: { select: { title: true, city: true, address: true } },
    },
  });

  let nextRentDue = null;
  if (activeLease) {
    const obligations = await prisma.rentObligation.findMany({
      where: { leaseId: activeLease.id },
      orderBy: { dueDate: "asc" },
    });

    const unpaid = obligations.find((ob) => Number(ob.amountPaid) < Number(ob.amountDue));
    if (unpaid) {
      const balance = Number(unpaid.amountDue) - Number(unpaid.amountPaid);
      let status = "PENDING";
      if (unpaid.dueDate < now) status = "OVERDUE";
      else if (Number(unpaid.amountPaid) > 0) status = "PARTIAL";

      const diffDays = Math.ceil((unpaid.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      nextRentDue = {
        id: unpaid.id,
        dueDate: unpaid.dueDate.toISOString(),
        amountDue: Number(unpaid.amountDue),
        amountPaid: Number(unpaid.amountPaid),
        balance,
        status,
        daysUntilDue: diffDays,
      };
    }
  }

  // Open maintenance requests
  const openMaintenance = await prisma.maintenanceRequest.findMany({
    where: {
      tenantId,
      status: { in: ["SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS"] },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalOpenCount = await prisma.maintenanceRequest.count({
    where: {
      tenantId,
      status: { in: ["SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS"] },
    },
  });

  return {
    activeLease: activeLease
      ? {
          id: activeLease.id,
          propertyTitle: activeLease.property.title,
          propertyCity: activeLease.property.city,
          propertyAddress: activeLease.property.address,
          rentAmount: Number(activeLease.rentAmount),
          dueDay: activeLease.dueDay,
          startDate: activeLease.startDate.toISOString(),
          endDate: activeLease.endDate.toISOString(),
          status: activeLease.status,
        }
      : null,
    nextRentDue,
    openMaintenanceCount: totalOpenCount,
    recentMaintenance: openMaintenance.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      priority: m.priority,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}
