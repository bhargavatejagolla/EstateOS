import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ForbiddenError, ConflictError } from "../../middleware/errors.js";
import { createNotification } from "../notifications/notification.service.js";
import { logAudit } from "../audit/audit.service.js";
import type { LeaseCreate, LeaseAccept, LeaseStatus, DerivedObligationStatus } from "@estateos/shared";

export function deriveObligationStatus(
  dueDate: Date,
  amountDue: number,
  amountPaid: number
): DerivedObligationStatus {
  if (amountPaid >= amountDue) return "PAID";
  const now = new Date();
  if (dueDate < now) return "OVERDUE";
  if (amountPaid > 0) return "PARTIAL";
  return "PENDING";
}

export function buildObligations(lease: {
  id: string;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  dueDay: number;
}) {
  const rows: {
    leaseId: string;
    dueDate: Date;
    amountDue: number;
    amountPaid: number;
  }[] = [];

  const start = new Date(lease.startDate);
  const end = new Date(lease.endDate);

  let currentYear = start.getUTCFullYear();
  let currentMonth = start.getUTCMonth();

  while (true) {
    const maxDays = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
    const clampedDay = Math.min(lease.dueDay, maxDays);
    const dueDate = new Date(Date.UTC(currentYear, currentMonth, clampedDay, 0, 0, 0));

    // If due date is before the start date, advance to next month
    if (dueDate < start) {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      continue;
    }

    // If due date has passed the lease end date, finish
    if (dueDate > end) {
      break;
    }

    rows.push({
      leaseId: lease.id,
      dueDate,
      amountDue: lease.rentAmount,
      amountPaid: 0,
    });

    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return rows;
}

export async function createLease(ownerId: string, data: LeaseCreate) {
  return prisma.$transaction(async (tx) => {
    // 1. Verify property belongs to owner
    const property = await tx.property.findUnique({
      where: { id: data.propertyId },
    });
    if (!property || property.ownerId !== ownerId) {
      throw new ForbiddenError("Forbidden: not your property");
    }
    if (property.status !== "ACTIVE") {
      throw new ConflictError("Property must be ACTIVE to create a lease");
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // 2. Verify no overlapping ACTIVE or PENDING_ACCEPTANCE lease on same property
    const overlapping = await tx.lease.findFirst({
      where: {
        propertyId: data.propertyId,
        status: { in: ["ACTIVE", "PENDING_ACCEPTANCE"] },
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
    });
    if (overlapping) {
      throw new ConflictError("Property already has an active lease in this window");
    }

    // 3. Verify tenant doesn't already have an ACTIVE lease
    const tenantBusy = await tx.lease.findFirst({
      where: {
        tenantId: data.tenantId,
        status: "ACTIVE",
      },
    });
    if (tenantBusy) {
      throw new ConflictError("Tenant already has an active lease elsewhere");
    }

    // 4. Create lease
    const lease = await tx.lease.create({
      data: {
        propertyId: data.propertyId,
        tenantId: data.tenantId,
        enquiryId: data.enquiryId ?? null,
        startDate,
        endDate,
        rentAmount: data.rentAmount,
        depositAmount: data.depositAmount ?? null,
        dueDay: data.dueDay,
        status: "PENDING_ACCEPTANCE",
        acceptanceStatus: "PENDING",
        documentUrl: data.documentUrl ?? null,
      },
      include: {
        property: {
          select: { id: true, title: true, city: true, price: true, address: true, ownerId: true },
        },
        tenant: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // 5. Generate one rent obligation per month
    const obligations = buildObligations({
      id: lease.id,
      startDate,
      endDate,
      rentAmount: data.rentAmount,
      dueDay: data.dueDay,
    });

    if (obligations.length > 0) {
      await tx.rentObligation.createMany({
        data: obligations,
      });
    }

    // 6. Notify tenant
    await createNotification(tx, {
      userId: data.tenantId,
      type: "LEASE_CREATED",
      message: `You have a new lease to review for ${property.title}`,
      link: `/tenant/leases/${lease.id}`,
    });

    // 7. If enquiry was linked, mark it CLOSED_WON
    if (data.enquiryId) {
      await tx.enquiry.update({
        where: { id: data.enquiryId },
        data: {
          status: "CLOSED_WON",
          leaseId: lease.id,
        },
      });
    }

    await logAudit(tx, {
      userId: ownerId,
      action: "lease.created",
      entity: "Lease",
      entityId: lease.id,
      metadata: { propertyId: data.propertyId, tenantId: data.tenantId, rentAmount: data.rentAmount },
    });

    return {
      id: lease.id,
      propertyId: lease.propertyId,
      tenantId: lease.tenantId,
      enquiryId: lease.enquiryId,
      startDate: lease.startDate.toISOString(),
      endDate: lease.endDate.toISOString(),
      rentAmount: Number(lease.rentAmount),
      depositAmount: lease.depositAmount ? Number(lease.depositAmount) : null,
      dueDay: lease.dueDay,
      status: lease.status,
      acceptanceStatus: lease.acceptanceStatus,
      acceptedByName: lease.acceptedByName,
      acceptedByTenantAt: lease.acceptedByTenantAt?.toISOString() ?? null,
      signatureDataUrl: lease.signatureDataUrl,
      documentUrl: lease.documentUrl,
      createdAt: lease.createdAt.toISOString(),
      updatedAt: lease.updatedAt.toISOString(),
      property: {
        ...lease.property,
        price: Number(lease.property.price),
      },
      tenant: lease.tenant,
    };
  });
}

export async function getLeases(user: { id: string; role: string }) {
  const whereClause =
    user.role === "OWNER"
      ? { property: { ownerId: user.id } }
      : user.role === "ADMIN"
      ? {}
      : { tenantId: user.id };

  const leases = await prisma.lease.findMany({
    where: whereClause,
    include: {
      property: {
        select: { id: true, title: true, city: true, price: true, address: true, ownerId: true },
      },
      tenant: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return leases.map((l) => ({
    id: l.id,
    propertyId: l.propertyId,
    tenantId: l.tenantId,
    enquiryId: l.enquiryId,
    startDate: l.startDate.toISOString(),
    endDate: l.endDate.toISOString(),
    rentAmount: Number(l.rentAmount),
    depositAmount: l.depositAmount ? Number(l.depositAmount) : null,
    dueDay: l.dueDay,
    status: l.status,
    acceptanceStatus: l.acceptanceStatus,
    acceptedByName: l.acceptedByName,
    acceptedByTenantAt: l.acceptedByTenantAt?.toISOString() ?? null,
    signatureDataUrl: l.signatureDataUrl,
    documentUrl: l.documentUrl,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    property: {
      ...l.property,
      price: Number(l.property.price),
    },
    tenant: l.tenant,
  }));
}

export async function getLeaseById(id: string, user: { id: string; role: string }) {
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: {
      property: {
        select: { id: true, title: true, city: true, price: true, address: true, ownerId: true },
      },
      tenant: {
        select: { id: true, name: true, email: true, phone: true },
      },
      rentObligations: {
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!lease) {
    throw new NotFoundError("Lease not found");
  }

  const isOwner = lease.property.ownerId === user.id;
  const isTenant = lease.tenantId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isTenant && !isAdmin) {
    throw new ForbiddenError("Forbidden: access denied");
  }

  return {
    id: lease.id,
    propertyId: lease.propertyId,
    tenantId: lease.tenantId,
    enquiryId: lease.enquiryId,
    startDate: lease.startDate.toISOString(),
    endDate: lease.endDate.toISOString(),
    rentAmount: Number(lease.rentAmount),
    depositAmount: lease.depositAmount ? Number(lease.depositAmount) : null,
    dueDay: lease.dueDay,
    status: lease.status,
    acceptanceStatus: lease.acceptanceStatus,
    acceptedByName: lease.acceptedByName,
    acceptedByTenantAt: lease.acceptedByTenantAt?.toISOString() ?? null,
    signatureDataUrl: lease.signatureDataUrl,
    documentUrl: lease.documentUrl,
    createdAt: lease.createdAt.toISOString(),
    updatedAt: lease.updatedAt.toISOString(),
    property: {
      ...lease.property,
      price: Number(lease.property.price),
    },
    tenant: lease.tenant,
    obligations: lease.rentObligations.map((ob) => {
      const amountDue = Number(ob.amountDue);
      const amountPaid = Number(ob.amountPaid);
      const balance = Math.max(0, amountDue - amountPaid);
      const status = deriveObligationStatus(ob.dueDate, amountDue, amountPaid);
      const now = new Date();
      const daysOverdue =
        ob.dueDate < now && amountPaid < amountDue
          ? Math.max(0, Math.floor((now.getTime() - ob.dueDate.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

      return {
        id: ob.id,
        leaseId: ob.leaseId,
        dueDate: ob.dueDate.toISOString(),
        amountDue,
        amountPaid,
        balance,
        status,
        daysOverdue,
      };
    }),
  };
}

export async function acceptLease(id: string, tenantId: string, data: LeaseAccept) {
  return prisma.$transaction(async (tx) => {
    const lease = await tx.lease.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, ownerId: true, title: true } },
      },
    });

    if (!lease) {
      throw new NotFoundError("Lease not found");
    }

    if (lease.tenantId !== tenantId) {
      throw new ForbiddenError("Forbidden: only the assigned tenant can accept this lease");
    }

    if (lease.acceptanceStatus === "ACCEPTED") {
      throw new ConflictError("Lease is already accepted and locked against further edits");
    }

    const updated = await tx.lease.update({
      where: { id },
      data: {
        acceptanceStatus: "ACCEPTED",
        acceptedByName: data.acceptedByName,
        signatureDataUrl: data.signatureDataUrl ?? null,
        acceptedByTenantAt: new Date(),
      },
    });

    await createNotification(tx, {
      userId: lease.property.ownerId,
      type: "LEASE_ACCEPTED",
      message: `${data.acceptedByName} has accepted the lease agreement for ${lease.property.title}`,
      link: `/owner/leases/${lease.id}`,
    });

    await logAudit(tx, {
      userId: tenantId,
      action: "lease.accepted",
      entity: "Lease",
      entityId: id,
      metadata: { acceptedByName: data.acceptedByName },
    });

    return {
      id: updated.id,
      acceptanceStatus: updated.acceptanceStatus,
      acceptedByName: updated.acceptedByName,
      acceptedByTenantAt: updated.acceptedByTenantAt?.toISOString(),
      signatureDataUrl: updated.signatureDataUrl,
    };
  });
}

export async function updateLeaseStatus(
  id: string,
  ownerId: string,
  data: { status?: LeaseStatus; endDate?: string }
) {
  return prisma.$transaction(async (tx) => {
    const lease = await tx.lease.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, ownerId: true, title: true } },
      },
    });

    if (!lease) {
      throw new NotFoundError("Lease not found");
    }

    if (lease.property.ownerId !== ownerId) {
      throw new ForbiddenError("Forbidden: not your property's lease");
    }

    if (data.endDate && lease.acceptanceStatus === "ACCEPTED") {
      throw new ConflictError("Cannot modify terms of an accepted lease");
    }

    const newStatus = data.status;

    if (newStatus === "ACTIVE") {
      if (lease.acceptanceStatus !== "ACCEPTED") {
        throw new ConflictError("Tenant must accept the lease first");
      }

      await tx.lease.update({
        where: { id },
        data: { status: "ACTIVE" },
      });

      await tx.property.update({
        where: { id: lease.propertyId },
        data: {
          status: "RENTED",
          activeLeaseId: lease.id,
        },
      });

      await createNotification(tx, {
        userId: lease.tenantId,
        type: "LEASE_CREATED",
        message: `Your lease for ${lease.property.title} is now ACTIVE!`,
        link: `/tenant/leases/${lease.id}`,
      });
    } else if (newStatus === "ENDED" || newStatus === "TERMINATED") {
      await tx.lease.update({
        where: { id },
        data: { status: newStatus },
      });

      await tx.property.update({
        where: { id: lease.propertyId },
        data: {
          status: "ACTIVE",
          activeLeaseId: null,
        },
      });

      await createNotification(tx, {
        userId: lease.tenantId,
        type: "LEASE_ENDED",
        message: `Your lease for ${lease.property.title} has ended.`,
        link: `/tenant/leases/${lease.id}`,
      });
    } else if (newStatus) {
      await tx.lease.update({
        where: { id },
        data: { status: newStatus },
      });
    }

    if (newStatus) {
      await logAudit(tx, {
        userId: ownerId,
        action: `lease.${newStatus.toLowerCase()}`,
        entity: "Lease",
        entityId: id,
        metadata: { from: lease.status, to: newStatus },
      });
    }

    const refreshed = await tx.lease.findUnique({
      where: { id },
      include: {
        property: {
          select: { id: true, title: true, city: true, price: true, address: true, ownerId: true, status: true },
        },
        tenant: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    return refreshed;
  });
}

export async function getLeaseObligations(leaseId: string, user: { id: string; role: string }) {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: { property: { select: { ownerId: true } } },
  });

  if (!lease) {
    throw new NotFoundError("Lease not found");
  }

  const isOwner = lease.property.ownerId === user.id;
  const isTenant = lease.tenantId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isTenant && !isAdmin) {
    throw new ForbiddenError("Forbidden: access denied");
  }

  const obligations = await prisma.rentObligation.findMany({
    where: { leaseId },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();

  return obligations.map((ob) => {
    const amountDue = Number(ob.amountDue);
    const amountPaid = Number(ob.amountPaid);
    const balance = Math.max(0, amountDue - amountPaid);
    const status = deriveObligationStatus(ob.dueDate, amountDue, amountPaid);
    const daysOverdue =
      ob.dueDate < now && amountPaid < amountDue
        ? Math.max(0, Math.floor((now.getTime() - ob.dueDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

    return {
      id: ob.id,
      leaseId: ob.leaseId,
      dueDate: ob.dueDate.toISOString(),
      amountDue,
      amountPaid,
      balance,
      status,
      daysOverdue,
    };
  });
}
