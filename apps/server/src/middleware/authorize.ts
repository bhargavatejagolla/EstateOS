import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";
import { prisma } from "../lib/prisma.js";

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
}

export async function authorizeOwnership(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const rawId = req.params.id;
  const propertyId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!propertyId) {
    throw new NotFoundError("Property ID required");
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { ownerId: true },
  });

  if (!property) {
    throw new NotFoundError("Property not found");
  }

  if (property.ownerId !== req.user.id && req.user.role !== "ADMIN") {
    throw new ForbiddenError("You are not authorized to manage this property");
  }

  next();
}
