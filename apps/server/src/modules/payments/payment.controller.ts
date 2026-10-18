import type { Request, Response, NextFunction } from "express";
import { PaymentCreateSchema } from "@estateos/shared";
import * as paymentService from "./payment.service.js";

export async function recordPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.id;
    const validated = PaymentCreateSchema.parse(req.body);
    const result = await paymentService.recordPayment(ownerId, validated);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const leaseId = req.query.leaseId as string | undefined;
    const result = await paymentService.getPayments(req.user!, leaseId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
