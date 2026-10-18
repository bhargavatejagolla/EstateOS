import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ForbiddenError, ConflictError } from "../../middleware/errors.js";
import { createNotification } from "../notifications/notification.service.js";
import { logAudit } from "../audit/audit.service.js";
import type { MaintenanceCreate, MaintenanceStatusUpdate, MaintenanceStatus } from "@estateos/shared";

export async function createMaintenanceRequest(tenantId: string, data: MaintenanceCreate) {
  return prisma.$transaction(async (tx) => {
    const lease = await tx.lease.findUnique({
      where: { id: data.leaseId },
      include: { property: { select: { id: true, ownerId: true, title: true } } },
    });

    if (!lease) {
      throw new NotFoundError("Lease not found");
    }

    if (lease.tenantId !== tenantId) {
      throw new ForbiddenError("Forbidden: you can only submit maintenance for your own lease");
    }

    if (lease.status !== "ACTIVE") {
      throw new ConflictError("Maintenance requests can only be submitted for an ACTIVE lease");
    }

    const request = await tx.maintenanceRequest.create({
      data: {
        propertyId: lease.propertyId,
        tenantId,
        leaseId: lease.id,
        title: data.title,
        description: data.description,
        priority: data.priority ?? "MEDIUM",
        imageUrl: data.imageUrl ?? null,
        status: "SUBMITTED",
      },
      include: {
        property: { select: { id: true, title: true, city: true } },
        tenant: { select: { id: true, name: true, email: true } },
      },
    });

    // Create the initial audit row
    const firstUpdate = await tx.maintenanceUpdate.create({
      data: {
        requestId: request.id,
        updatedBy: tenantId,
        oldStatus: null,
        newStatus: "SUBMITTED",
        note: "Request submitted",
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Notify owner
    await createNotification(tx, {
      userId: lease.property.ownerId,
      type: "MAINTENANCE_SUBMITTED",
      message: `New maintenance request: ${data.title} for ${lease.property.title}`,
      link: `/owner/maintenance/${request.id}`,
    });

    await logAudit(tx, {
      userId: tenantId,
      action: "maintenance.submitted",
      entity: "MaintenanceRequest",
      entityId: request.id,
      metadata: { title: data.title, priority: data.priority },
    });

    const now = new Date();
    const ageInDays = Math.max(
      0,
      Math.floor((now.getTime() - request.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      id: request.id,
      propertyId: request.propertyId,
      tenantId: request.tenantId,
      leaseId: request.leaseId,
      title: request.title,
      description: request.description,
      imageUrl: request.imageUrl,
      status: request.status,
      priority: request.priority,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      resolvedAt: request.resolvedAt?.toISOString() ?? null,
      ageInDays,
      property: request.property,
      tenant: request.tenant,
      updates: [
        {
          id: firstUpdate.id,
          oldStatus: firstUpdate.oldStatus,
          newStatus: firstUpdate.newStatus,
          note: firstUpdate.note,
          updatedBy: firstUpdate.user,
          createdAt: firstUpdate.createdAt.toISOString(),
        },
      ],
    };
  });
}

export async function getMaintenanceList(
  user: { id: string; role: string },
  filters?: { propertyId?: string; status?: MaintenanceStatus }
) {
  const whereClause: any = {};

  if (filters?.propertyId) {
    whereClause.propertyId = filters.propertyId;
  }
  if (filters?.status) {
    whereClause.status = filters.status;
  }

  if (user.role === "OWNER") {
    whereClause.property = { ownerId: user.id };
  } else if (user.role !== "ADMIN") {
    whereClause.tenantId = user.id;
  }

  const requests = await prisma.maintenanceRequest.findMany({
    where: whereClause,
    include: {
      property: { select: { id: true, title: true, city: true } },
      tenant: { select: { id: true, name: true, email: true } },
      updates: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return requests.map((req) => ({
    id: req.id,
    propertyId: req.propertyId,
    tenantId: req.tenantId,
    leaseId: req.leaseId,
    title: req.title,
    description: req.description,
    imageUrl: req.imageUrl,
    status: req.status,
    priority: req.priority,
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
    resolvedAt: req.resolvedAt?.toISOString() ?? null,
    ageInDays: Math.max(
      0,
      Math.floor((now.getTime() - req.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    ),
    property: req.property,
    tenant: req.tenant,
    updates: req.updates.map((u) => ({
      id: u.id,
      oldStatus: u.oldStatus,
      newStatus: u.newStatus,
      note: u.note,
      updatedBy: u.user,
      createdAt: u.createdAt.toISOString(),
    })),
  }));
}

export async function getMaintenanceById(id: string, user: { id: string; role: string }) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      property: { select: { id: true, ownerId: true, title: true, city: true } },
      tenant: { select: { id: true, name: true, email: true } },
      updates: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!request) {
    throw new NotFoundError("Maintenance request not found");
  }

  const isOwner = request.property.ownerId === user.id;
  const isTenant = request.tenantId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isTenant && !isAdmin) {
    throw new ForbiddenError("Forbidden: access denied");
  }

  const now = new Date();
  const ageInDays = Math.max(
    0,
    Math.floor((now.getTime() - request.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  );

  return {
    id: request.id,
    propertyId: request.propertyId,
    tenantId: request.tenantId,
    leaseId: request.leaseId,
    title: request.title,
    description: request.description,
    imageUrl: request.imageUrl,
    status: request.status,
    priority: request.priority,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    resolvedAt: request.resolvedAt?.toISOString() ?? null,
    ageInDays,
    property: {
      id: request.property.id,
      title: request.property.title,
      city: request.property.city,
    },
    tenant: request.tenant,
    updates: request.updates.map((u) => ({
      id: u.id,
      oldStatus: u.oldStatus,
      newStatus: u.newStatus,
      note: u.note,
      updatedBy: u.user,
      createdAt: u.createdAt.toISOString(),
    })),
  };
}

export async function updateMaintenanceStatus(
  id: string,
  userId: string,
  data: MaintenanceStatusUpdate
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, ownerId: true, title: true } },
      },
    });

    if (!request) {
      throw new NotFoundError("Maintenance request not found");
    }

    if (request.property.ownerId !== userId) {
      throw new ForbiddenError("Forbidden: you cannot manage maintenance for another owner's property");
    }

    const isResolvedOrClosed = data.status === "RESOLVED" || data.status === "CLOSED";
    const resolvedAt = isResolvedOrClosed ? new Date() : request.resolvedAt;

    await tx.maintenanceRequest.update({
      where: { id },
      data: {
        status: data.status,
        resolvedAt,
      },
    });

    await tx.maintenanceUpdate.create({
      data: {
        requestId: id,
        updatedBy: userId,
        oldStatus: request.status,
        newStatus: data.status,
        note: data.note ?? null,
      },
    });

    await createNotification(tx, {
      userId: request.tenantId,
      type: "MAINTENANCE_UPDATED",
      message: `Maintenance request "${request.title}" updated to ${data.status}`,
      link: `/tenant/maintenance/${request.id}`,
    });

    await logAudit(tx, {
      userId,
      action: `maintenance.${data.status.toLowerCase()}`,
      entity: "MaintenanceRequest",
      entityId: id,
      metadata: { oldStatus: request.status, newStatus: data.status, note: data.note },
    });

    const refreshed = await tx.maintenanceRequest.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, title: true, city: true } },
        tenant: { select: { id: true, name: true, email: true } },
        updates: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const now = new Date();
    const ageInDays = Math.max(
      0,
      Math.floor((now.getTime() - refreshed!.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      id: refreshed!.id,
      propertyId: refreshed!.propertyId,
      tenantId: refreshed!.tenantId,
      leaseId: refreshed!.leaseId,
      title: refreshed!.title,
      description: refreshed!.description,
      imageUrl: refreshed!.imageUrl,
      status: refreshed!.status,
      priority: refreshed!.priority,
      createdAt: refreshed!.createdAt.toISOString(),
      updatedAt: refreshed!.updatedAt.toISOString(),
      resolvedAt: refreshed!.resolvedAt?.toISOString() ?? null,
      ageInDays,
      property: refreshed!.property,
      tenant: refreshed!.tenant,
      updates: refreshed!.updates.map((u) => ({
        id: u.id,
        oldStatus: u.oldStatus,
        newStatus: u.newStatus,
        note: u.note,
        updatedBy: u.user,
        createdAt: u.createdAt.toISOString(),
      })),
    };
  });
}
