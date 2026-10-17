import { prisma } from "../lib/prisma.js";

export async function cleanDb() {
  try {
    await prisma.refreshToken.deleteMany();
    await prisma.propertyImage.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();
  } catch {
    // Graceful cleanup
  }
}
