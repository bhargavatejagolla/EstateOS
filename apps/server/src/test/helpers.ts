import { prisma } from "../lib/prisma.js";

export async function cleanDb() {
  try {
    await prisma.auditLog.deleteMany();
    await prisma.maintenanceUpdate.deleteMany();
    await prisma.maintenanceRequest.deleteMany();
    await prisma.paymentAllocation.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.rentObligation.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.enquiry.deleteMany();
    await prisma.lease.deleteMany();
    await prisma.favourite.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.propertyImage.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();
  } catch {
    // Graceful cleanup
  }
}
