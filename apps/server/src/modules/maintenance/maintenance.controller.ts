import type { Request, Response, NextFunction } from "express";
import { MaintenanceCreateSchema, MaintenanceStatusUpdateSchema } from "@estateos/shared";
import * as maintenanceService from "./maintenance.service.js";

export async function createMaintenance(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user!.id;
    const validated = MaintenanceCreateSchema.parse(req.body);
    const result = await maintenanceService.createMaintenanceRequest(tenantId, validated);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMaintenanceList(req: Request, res: Response, next: NextFunction) {
  try {
    const propertyId = req.query.propertyId as string | undefined;
    const status = req.query.status as any | undefined;
    const result = await maintenanceService.getMaintenanceList(req.user!, { propertyId, status });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMaintenanceById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await maintenanceService.getMaintenanceById(id, req.user!);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateMaintenanceStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const validated = MaintenanceStatusUpdateSchema.parse(req.body);
    const result = await maintenanceService.updateMaintenanceStatus(id, userId, validated);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
