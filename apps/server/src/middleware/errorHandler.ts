import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid input", details: err.flatten() },
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: err.message },
    });
  }
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Unknown error" } });
}
