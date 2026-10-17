import { prisma } from "../lib/prisma.js";
import { CloudinaryService } from "./cloudinary.service.js";
import { NotFoundError, ForbiddenError } from "../middleware/errors.js";
import type { PropertyCreate, PropertyUpdate, PropertySearchQuery } from "@estateos/shared";
import type { Prisma } from "@prisma/client";

export class PropertyService {
  static async create(ownerId: string, input: PropertyCreate) {
    const property = await prisma.property.create({
      data: {
        ownerId,
        title: input.title,
        description: input.description,
        price: input.price,
        depositAmount: input.depositAmount ?? null,
        city: input.city,
        locality: input.locality,
        address: input.address,
        pincode: input.pincode ?? null,
        propertyType: input.propertyType,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        areaSqft: input.areaSqft,
        furnishing: input.furnishing,
        amenities: input.amenities || [],
        availability: input.availability || "AVAILABLE_NOW",
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return property;
  }

  static async getMyProperties(ownerId: string) {
    return prisma.property.findMany({
      where: { ownerId, deletedAt: null },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { enquiries: true, favourites: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string, currentUserId?: string) {
    const property = await prisma.property.findFirst({
      where: { id, deletedAt: null },
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
    });

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    let isFavourited = false;
    if (currentUserId) {
      const fav = await prisma.favourite.findUnique({
        where: {
          userId_propertyId: {
            userId: currentUserId,
            propertyId: id,
          },
        },
      });
      isFavourited = !!fav;
    }

    return {
      ...property,
      price: Number(property.price),
      depositAmount: property.depositAmount ? Number(property.depositAmount) : null,
      isFavourited,
    };
  }

  static async search(query: PropertySearchQuery, currentUserId?: string) {
    const where: Prisma.PropertyWhereInput = {
      deletedAt: null,
      status: "ACTIVE",
    };

    if (query.city) {
      where.city = { contains: query.city, mode: "insensitive" };
    }

    if (query.locality) {
      where.locality = { contains: query.locality, mode: "insensitive" };
    }

    if (query.propertyType) {
      where.propertyType = query.propertyType;
    }

    if (query.furnishing) {
      where.furnishing = query.furnishing;
    }

    if (query.bedrooms !== undefined) {
      where.bedrooms = query.bedrooms;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      };
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
        { locality: { contains: query.q, mode: "insensitive" } },
        { city: { contains: query.q, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: "desc" };
    if (query.sortBy === "price_asc") {
      orderBy = { price: "asc" };
    } else if (query.sortBy === "price_desc") {
      orderBy = { price: "desc" };
    }

    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const [total, rawProperties] = await prisma.$transaction([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
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
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    let favouritedSet = new Set<string>();
    if (currentUserId && rawProperties.length > 0) {
      const favs = await prisma.favourite.findMany({
        where: {
          userId: currentUserId,
          propertyId: { in: rawProperties.map((p) => p.id) },
        },
        select: { propertyId: true },
      });
      favouritedSet = new Set(favs.map((f) => f.propertyId));
    }

    const properties = rawProperties.map((p) => ({
      ...p,
      price: Number(p.price),
      depositAmount: p.depositAmount ? Number(p.depositAmount) : null,
      isFavourited: favouritedSet.has(p.id),
    }));

    return {
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async publish(id: string, userId: string, role: string) {
    const property = await prisma.property.findFirst({
      where: { id, deletedAt: null },
    });

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    if (role !== "ADMIN" && property.ownerId !== userId) {
      throw new ForbiddenError("You can only publish your own properties");
    }

    const nextStatus = property.status === "ACTIVE" ? "DRAFT" : "ACTIVE";

    const updated = await prisma.property.update({
      where: { id },
      data: { status: nextStatus },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return updated;
  }

  static async update(id: string, input: PropertyUpdate) {
    const data: Record<string, unknown> = { ...input };

    const updated = await prisma.property.update({
      where: { id },
      data,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return updated;
  }

  static async delete(id: string) {
    const property = await prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: { images: true },
    });

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    // Soft delete by updating deletedAt timestamp
    await prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async addImage(propertyId: string, fileBuffer: Buffer) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      include: { images: true },
    });

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const { url, publicId } = await CloudinaryService.uploadBuffer(
      fileBuffer,
      `estateos/properties/${propertyId}`
    );

    const isFirstImage = property.images.length === 0;

    const image = await prisma.propertyImage.create({
      data: {
        propertyId,
        url,
        publicId,
        isPrimary: isFirstImage,
        sortOrder: property.images.length,
      },
    });

    return image;
  }

  static async deleteImage(propertyId: string, imageId: string) {
    const image = await prisma.propertyImage.findFirst({
      where: { id: imageId, propertyId },
    });

    if (!image) {
      throw new NotFoundError("Image not found");
    }

    await CloudinaryService.deleteImage(image.publicId);

    await prisma.propertyImage.delete({
      where: { id: imageId },
    });
  }
}
