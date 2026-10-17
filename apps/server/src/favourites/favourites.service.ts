import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../middleware/errors.js";

export class FavouritesService {
  static async list(userId: string) {
    const favourites = await prisma.favourite.findMany({
      where: {
        userId,
        property: {
          deletedAt: null,
        },
      },
      include: {
        property: {
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
            },
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return favourites.map((f) => ({
      ...f,
      property: {
        ...f.property,
        price: Number(f.property.price),
        depositAmount: f.property.depositAmount ? Number(f.property.depositAmount) : null,
        isFavourited: true,
      },
    }));
  }

  static async add(userId: string, propertyId: string) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    });

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const favourite = await prisma.favourite.upsert({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
      create: {
        userId,
        propertyId,
      },
      update: {},
    });

    return favourite;
  }

  static async remove(userId: string, propertyId: string) {
    await prisma.favourite.deleteMany({
      where: {
        userId,
        propertyId,
      },
    });
  }
}
