import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ForbiddenError, ConflictError } from "../../middleware/errors.js";
import { createNotification } from "../notifications/notification.service.js";
import { logAudit } from "../audit/audit.service.js";
import type { PaymentCreate } from "@estateos/shared";

export async function recordPayment(ownerId: string, data: PaymentCreate) {
  return prisma.$transaction(async (tx) => {
    const lease = await tx.lease.findUnique({
      where: { id: data.leaseId },
      include: {
        property: { select: { ownerId: true, title: true } },
        rentObligations: { orderBy: { dueDate: "asc" } },
      },
    });

    if (!lease) {
      throw new NotFoundError("Lease not found");
    }

    if (lease.property.ownerId !== ownerId) {
      throw new ForbiddenError("Forbidden: not your property's lease");
    }

    if (lease.status !== "ACTIVE") {
      throw new ConflictError("Lease must be ACTIVE to receive payments");
    }

    // Create the payment record
    const payment = await tx.payment.create({
      data: {
        leaseId: data.leaseId,
        amount: data.amount,
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        method: data.method,
        reference: data.reference ?? null,
        recordedBy: ownerId,
        notes: data.notes ?? null,
      },
    });

    // FIFO Allocation across obligations
    let remaining = data.amount;
    const allocations: { obligationId: string; amount: number; dueDate?: string }[] = [];

    for (const ob of lease.rentObligations) {
      if (remaining <= 0) break;
      const balance = Number(ob.amountDue) - Number(ob.amountPaid);
      if (balance <= 0) continue;

      const apply = Math.min(balance, remaining);

      await tx.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          rentObligationId: ob.id,
          amount: apply,
        },
      });

      await tx.rentObligation.update({
        where: { id: ob.id },
        data: {
          amountPaid: { increment: apply },
        },
      });

      allocations.push({
        obligationId: ob.id,
        amount: apply,
        dueDate: ob.dueDate.toISOString(),
      });

      remaining -= apply;
    }

    // Overpayment handling: create synthetic credit obligation for the next month
    if (remaining > 0) {
      const lastDue =
        lease.rentObligations[lease.rentObligations.length - 1]?.dueDate ?? new Date();
      const nextDue = new Date(lastDue);
      nextDue.setUTCMonth(nextDue.getUTCMonth() + 1);

      const credit = await tx.rentObligation.create({
        data: {
          leaseId: lease.id,
          dueDate: nextDue,
          amountDue: remaining,
          amountPaid: remaining,
        },
      });

      await tx.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          rentObligationId: credit.id,
          amount: remaining,
        },
      });

      allocations.push({
        obligationId: credit.id,
        amount: remaining,
        dueDate: nextDue.toISOString(),
      });
    }

    // Notify tenant
    await createNotification(tx, {
      userId: lease.tenantId,
      type: "PAYMENT_RECORDED",
      message: `Payment of ₹${data.amount} recorded for ${lease.property.title}`,
      link: `/tenant/leases/${lease.id}`,
    });

    await logAudit(tx, {
      userId: ownerId,
      action: "payment.recorded",
      entity: "Payment",
      entityId: payment.id,
      metadata: { leaseId: payment.leaseId, amount: Number(payment.amount), method: payment.method },
    });

    return {
      id: payment.id,
      leaseId: payment.leaseId,
      amount: Number(payment.amount),
      paidAt: payment.paidAt.toISOString(),
      method: payment.method,
      reference: payment.reference,
      notes: payment.notes,
      allocations,
      createdAt: payment.createdAt.toISOString(),
    };
  });
}

export async function getPayments(user: { id: string; role: string }, leaseId?: string) {
  const whereClause: any = {};

  if (leaseId) {
    whereClause.leaseId = leaseId;
  }

  if (user.role === "OWNER") {
    whereClause.lease = { property: { ownerId: user.id } };
  } else if (user.role !== "ADMIN") {
    whereClause.lease = { tenantId: user.id };
  }

  const payments = await prisma.payment.findMany({
    where: whereClause,
    include: {
      paymentAllocations: {
        include: { rentObligation: true },
      },
      lease: {
        select: {
          id: true,
          property: { select: { id: true, title: true } },
          tenant: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { paidAt: "desc" },
  });

  return payments.map((p) => ({
    id: p.id,
    leaseId: p.leaseId,
    amount: Number(p.amount),
    paidAt: p.paidAt.toISOString(),
    method: p.method,
    reference: p.reference,
    notes: p.notes,
    allocations: p.paymentAllocations.map((a) => ({
      id: a.id,
      obligationId: a.rentObligationId,
      amount: Number(a.amount),
      dueDate: a.rentObligation?.dueDate.toISOString(),
    })),
    lease: p.lease,
    createdAt: p.createdAt.toISOString(),
  }));
}
