import type { Request, Response } from "express";
import { FavouritesService } from "./favourites.service.js";
import { BadRequestError, UnauthorizedError } from "../middleware/errors.js";

function getParam(param: string | string[] | undefined, name: string): string {
  const val = Array.isArray(param) ? param[0] : param;
  if (!val) {
    throw new BadRequestError(`Missing parameter: ${name}`);
  }
  return val;
}

export class FavouritesController {
  static async list(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const favourites = await FavouritesService.list(req.user.id);
    res.status(200).json(favourites);
  }

  static async add(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const propertyId = getParam(req.params.propertyId, "propertyId");
    const favourite = await FavouritesService.add(req.user.id, propertyId);
    res.status(201).json(favourite);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const propertyId = getParam(req.params.propertyId, "propertyId");
    await FavouritesService.remove(req.user.id, propertyId);
    res.status(204).send();
  }
}
