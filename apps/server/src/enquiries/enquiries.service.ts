import { prisma } from "../lib/prisma.js";
import { NotFoundError, BadRequestError, ForbiddenError } from "../middleware/errors.js";
import type { EnquiryCreate, EnquiryUpdate } from "@estateos/shared";
import type { Prisma } from "@prisma/client";

export class EnquiriesService {
  static async create(userId: string, input: EnquiryCreate) {
    const property = await prisma.property.findFirst({
      where: { id: input.propertyId, deletedAt: null },
    });

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    if (property.ownerId === userId) {
      throw new BadRequestError("You cannot enquire about your own property");
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        userId,
        propertyId: input.propertyId,
        message: input.message,
        status: "NEW",
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            locality: true,
            images: {
              take: 1,
              select: { id: true, url: true },
            },
          },
        },
      },
    });

    return {
      ...enquiry,
      property: {
        ...enquiry.property,
        price: Number(enquiry.property.price),
      },
    };
  }

  static async list(userId: string, role: string, propertyId?: string) {
    const where: Prisma.EnquiryWhereInput = {};

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (role === "OWNER") {
      where.property = {
        ownerId: userId,
        deletedAt: null,
      };
    } else if (role !== "ADMIN") {
      where.userId = userId;
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            locality: true,
            ownerId: true,
            images: {
              take: 1,
              select: { id: true, url: true },
            },
          },
        },
        appointments: {
          orderBy: { visitAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return enquiries.map((e) => {
      const isOwnerOrAdmin = role === "ADMIN" || e.property.ownerId === userId;
      return {
        ...e,
        ownerNotes: isOwnerOrAdmin ? e.ownerNotes : null,
        property: {
          ...e.property,
          price: Number(e.property.price),
        },
      };
    });
  }

  static async getById(id: string, userId: string, role: string) {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            locality: true,
            ownerId: true,
            images: {
              take: 1,
              select: { id: true, url: true },
            },
          },
        },
        appointments: {
          orderBy: { visitAt: "asc" },
        },
      },
    });

    if (!enquiry) {
      throw new NotFoundError("Enquiry not found");
    }

    const isAuthor = enquiry.userId === userId;
    const isOwner = enquiry.property.ownerId === userId;
    const isAdmin = role === "ADMIN";

    if (!isAuthor && !isOwner && !isAdmin) {
      throw new ForbiddenError("You are not authorized to access this enquiry");
    }

    return {
      ...enquiry,
      ownerNotes: isOwner || isAdmin ? enquiry.ownerNotes : null,
      property: {
        ...enquiry.property,
        price: Number(enquiry.property.price),
      },
    };
  }

  static async update(id: string, userId: string, role: string, input: EnquiryUpdate) {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: { ownerId: true },
        },
      },
    });

    if (!enquiry) {
      throw new NotFoundError("Enquiry not found");
    }

    const isOwner = enquiry.property.ownerId === userId;
    const isAdmin = role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("Only the property owner can update enquiry status or notes");
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: {
        ...(input.status && { status: input.status }),
        ...(input.ownerNotes !== undefined && { ownerNotes: input.ownerNotes }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            locality: true,
            ownerId: true,
          },
        },
        appointments: {
          orderBy: { visitAt: "asc" },
        },
      },
    });

    return {
      ...updated,
      property: {
        ...updated.property,
        price: Number(updated.property.price),
      },
    };
  }
}
