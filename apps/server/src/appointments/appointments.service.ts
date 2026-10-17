import { prisma } from "../lib/prisma.js";
import { NotFoundError, ForbiddenError } from "../middleware/errors.js";
import type { AppointmentCreate, AppointmentUpdate } from "@estateos/shared";
import type { Prisma } from "@prisma/client";

export class AppointmentsService {
  static async create(userId: string, role: string, input: AppointmentCreate) {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: input.enquiryId },
      include: {
        property: {
          select: { id: true, ownerId: true, title: true, city: true, locality: true },
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
      throw new ForbiddenError("You are not authorized to schedule an appointment for this enquiry");
    }

    // Atomic transaction: create appointment and transition enquiry to VISIT_SCHEDULED
    const [appointment] = await prisma.$transaction([
      prisma.appointment.create({
        data: {
          enquiryId: input.enquiryId,
          visitAt: new Date(input.visitAt),
          status: "PROPOSED",
          notes: input.notes ?? null,
        },
        include: {
          enquiry: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
              property: {
                select: { id: true, title: true, city: true, locality: true },
              },
            },
          },
        },
      }),
      prisma.enquiry.update({
        where: { id: input.enquiryId },
        data: { status: "VISIT_SCHEDULED" },
      }),
    ]);

    return appointment;
  }

  static async list(userId: string, role: string) {
    const where: Prisma.AppointmentWhereInput = {};

    if (role === "OWNER") {
      where.enquiry = {
        property: {
          ownerId: userId,
          deletedAt: null,
        },
      };
    } else if (role !== "ADMIN") {
      where.enquiry = {
        userId,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        enquiry: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
            property: {
              select: { id: true, title: true, city: true, locality: true },
            },
          },
        },
      },
      orderBy: { visitAt: "asc" },
    });

    return appointments;
  }

  static async update(id: string, userId: string, role: string, input: AppointmentUpdate) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        enquiry: {
          include: {
            property: {
              select: { ownerId: true },
            },
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    const isAuthor = appointment.enquiry.userId === userId;
    const isOwner = appointment.enquiry.property.ownerId === userId;
    const isAdmin = role === "ADMIN";

    if (!isAuthor && !isOwner && !isAdmin) {
      throw new ForbiddenError("Not authorized to update this appointment");
    }

    const updateData: Prisma.AppointmentUpdateInput = {};
    if (input.status) updateData.status = input.status;
    if (input.visitAt) updateData.visitAt = new Date(input.visitAt);
    if (input.notes !== undefined) updateData.notes = input.notes;

    // Synchronize enquiry status depending on appointment progression
    const enquiryUpdate: Prisma.EnquiryUpdateInput = {};
    if (input.status === "CONFIRMED") {
      enquiryUpdate.status = "VISIT_SCHEDULED";
    } else if (input.status === "COMPLETED") {
      enquiryUpdate.status = "NEGOTIATING";
    }

    const [updated] = await prisma.$transaction([
      prisma.appointment.update({
        where: { id },
        data: updateData,
        include: {
          enquiry: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
              property: {
                select: { id: true, title: true, city: true, locality: true },
              },
            },
          },
        },
      }),
      ...(Object.keys(enquiryUpdate).length > 0
        ? [
            prisma.enquiry.update({
              where: { id: appointment.enquiryId },
              data: enquiryUpdate,
            }),
          ]
        : []),
    ]);

    return updated;
  }
}
