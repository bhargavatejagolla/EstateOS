import type { Request, Response, NextFunction } from "express";
import * as recommendationService from "./recommendation.service.js";

export async function getRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await recommendationService.getRecommendations(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
