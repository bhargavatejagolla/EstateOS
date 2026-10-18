import type { Request, Response, NextFunction } from "express";
import * as notificationService from "./notification.service.js";

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await notificationService.getUserNotifications(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const result = await notificationService.markAsRead(userId, id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await notificationService.markAllAsRead(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
