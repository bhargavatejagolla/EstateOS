import type { Request, Response } from "express";
import {
  PropertyCreateSchema,
  PropertyUpdateSchema,
  PropertySearchQuerySchema,
} from "@estateos/shared";
import { PropertyService } from "./property.service.js";
import { getYieldEstimate } from "../modules/yield/yield.service.js";
import { BadRequestError, UnauthorizedError } from "../middleware/errors.js";

function getParam(param: string | string[] | undefined, name: string): string {
  const val = Array.isArray(param) ? param[0] : param;
  if (!val) {
    throw new BadRequestError(`Missing parameter: ${name}`);
  }
  return val;
}

export class PropertyController {
  static async search(req: Request, res: Response): Promise<void> {
    const query = PropertySearchQuerySchema.parse(req.query);
    const result = await PropertyService.search(query, req.user?.id);
    res.status(200).json(result);
  }

  static async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const input = PropertyCreateSchema.parse(req.body);
    const property = await PropertyService.create(req.user.id, input);

    res.status(201).json(property);
  }

  static async getMine(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const properties = await PropertyService.getMyProperties(req.user.id);
    res.status(200).json(properties);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const id = getParam(req.params.id, "id");
    const property = await PropertyService.getById(id, req.user?.id);
    res.status(200).json(property);
  }

  static async publish(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const id = getParam(req.params.id, "id");
    const property = await PropertyService.publish(id, req.user.id, req.user.role);
    res.status(200).json(property);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id = getParam(req.params.id, "id");
    const input = PropertyUpdateSchema.parse(req.body);
    const property = await PropertyService.update(id, input);
    res.status(200).json(property);
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id = getParam(req.params.id, "id");
    await PropertyService.delete(id);
    res.status(204).send();
  }

  static async uploadImage(req: Request, res: Response): Promise<void> {
    const id = getParam(req.params.id, "id");
    if (!req.file) {
      throw new BadRequestError("No image file provided");
    }

    const image = await PropertyService.addImage(id, req.file.buffer, req.file.mimetype);
    res.status(201).json(image);
  }

  static async deleteImage(req: Request, res: Response): Promise<void> {
    const id = getParam(req.params.id, "id");
    const imageId = getParam(req.params.imageId, "imageId");
    await PropertyService.deleteImage(id, imageId);
    res.status(204).send();
  }

  static async getMapPins(_req: Request, res: Response): Promise<void> {
    const pins = await PropertyService.getMapPins();
    res.status(200).json(pins);
  }

  static async getYield(req: Request, res: Response): Promise<void> {
    const id = getParam(req.params.id, "id");
    const result = await getYieldEstimate(id);
    res.status(200).json(result);
  }
}
