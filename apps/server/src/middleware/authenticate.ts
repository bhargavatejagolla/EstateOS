import type { Request, Response, NextFunction } from "express";
import { TokenService } from "../auth/token.service.js";
import { UnauthorizedError } from "./errors.js";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("Bearer token not found");
  }

  try {
    const payload = TokenService.verifyAccessToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}
