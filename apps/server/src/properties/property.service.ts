import { prisma } from "../lib/prisma.js";
import { CloudinaryService } from "./cloudinary.service.js";
import { NotFoundError } from "../middleware/errors.js";
import type { PropertyCreate, PropertyUpdate } from "@estateos/shared";

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
      where: { ownerId },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    const property = await prisma.property.findUnique({
      where: { id },
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

    return property;
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
    const property = await prisma.property.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    // Clean up associated Cloudinary assets
    for (const img of property.images) {
      await CloudinaryService.deleteImage(img.publicId);
    }

    await prisma.property.delete({ where: { id } });
  }

  static async addImage(propertyId: string, fileBuffer: Buffer) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
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
