import type { Request, Response, NextFunction } from "express";
import * as yieldService from "./yield.service.js";

export async function getYield(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await yieldService.getYieldEstimate(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
