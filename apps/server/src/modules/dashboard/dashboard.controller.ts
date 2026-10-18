import type { Request, Response, NextFunction } from "express";
import * as dashboardService from "./dashboard.service.js";

export async function getOwnerDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.id;
    const result = await dashboardService.getOwnerDashboard(ownerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTenantDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user!.id;
    const result = await dashboardService.getTenantDashboard(tenantId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
