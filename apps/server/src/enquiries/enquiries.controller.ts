import type { Request, Response } from "express";
import { EnquiryCreateSchema, EnquiryUpdateSchema } from "@estateos/shared";
import { EnquiriesService } from "./enquiries.service.js";
import { BadRequestError, UnauthorizedError } from "../middleware/errors.js";

function getParam(param: string | string[] | undefined, name: string): string {
  const val = Array.isArray(param) ? param[0] : param;
  if (!val) {
    throw new BadRequestError(`Missing parameter: ${name}`);
  }
  return val;
}

export class EnquiriesController {
  static async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const input = EnquiryCreateSchema.parse(req.body);
    const enquiry = await EnquiriesService.create(req.user.id, input);
    res.status(201).json(enquiry);
  }

  static async list(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const propertyId = typeof req.query.propertyId === "string" ? req.query.propertyId : undefined;
    const enquiries = await EnquiriesService.list(req.user.id, req.user.role, propertyId);
    res.status(200).json(enquiries);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const id = getParam(req.params.id, "id");
    const enquiry = await EnquiriesService.getById(id, req.user.id, req.user.role);
    res.status(200).json(enquiry);
  }

  static async update(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const id = getParam(req.params.id, "id");
    const input = EnquiryUpdateSchema.parse(req.body);
    const updated = await EnquiriesService.update(id, req.user.id, req.user.role, input);
    res.status(200).json(updated);
  }
}
