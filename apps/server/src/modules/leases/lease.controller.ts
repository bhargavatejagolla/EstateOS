import type { Request, Response, NextFunction } from "express";
import {
  LeaseCreateSchema,
  LeaseAcceptSchema,
  LeaseStatusUpdateSchema,
} from "@estateos/shared";
import * as leaseService from "./lease.service.js";

export async function createLease(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.id;
    const validated = LeaseCreateSchema.parse(req.body);
    const result = await leaseService.createLease(ownerId, validated);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getLeases(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await leaseService.getLeases(req.user!);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getLeaseById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await leaseService.getLeaseById(id, req.user!);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function acceptLease(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const tenantId = req.user!.id;
    const validated = LeaseAcceptSchema.parse(req.body);
    const result = await leaseService.acceptLease(id, tenantId, validated);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateLeaseStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const ownerId = req.user!.id;
    const validated = LeaseStatusUpdateSchema.parse(req.body);
    const result = await leaseService.updateLeaseStatus(id, ownerId, validated);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getLeaseObligations(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await leaseService.getLeaseObligations(id, req.user!);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
