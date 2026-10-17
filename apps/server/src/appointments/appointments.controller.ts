import type { Request, Response } from "express";
import { AppointmentCreateSchema, AppointmentUpdateSchema } from "@estateos/shared";
import { AppointmentsService } from "./appointments.service.js";
import { BadRequestError, UnauthorizedError } from "../middleware/errors.js";

function getParam(param: string | string[] | undefined, name: string): string {
  const val = Array.isArray(param) ? param[0] : param;
  if (!val) {
    throw new BadRequestError(`Missing parameter: ${name}`);
  }
  return val;
}

export class AppointmentsController {
  static async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const input = AppointmentCreateSchema.parse(req.body);
    const appointment = await AppointmentsService.create(req.user.id, req.user.role, input);
    res.status(201).json(appointment);
  }

  static async list(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const appointments = await AppointmentsService.list(req.user.id, req.user.role);
    res.status(200).json(appointments);
  }

  static async update(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const id = getParam(req.params.id, "id");
    const input = AppointmentUpdateSchema.parse(req.body);
    const updated = await AppointmentsService.update(id, req.user.id, req.user.role, input);
    res.status(200).json(updated);
  }
}
