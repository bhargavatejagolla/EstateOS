import type { Request, Response } from "express";
import { RegisterInputSchema, LoginInputSchema } from "@estateos/shared";
import { AuthService } from "./auth.service.js";
import { env } from "../config/env.js";
import { UnauthorizedError, BadRequestError } from "../middleware/errors.js";

const COOKIE_NAME = "refresh_token";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth",
  });
}

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const input = RegisterInputSchema.parse(req.body);
    const result = await AuthService.register(input);

    setRefreshCookie(res, result.refreshToken);

    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  static async login(req: Request, res: Response): Promise<void> {
    const input = LoginInputSchema.parse(req.body);
    const result = await AuthService.login(input);

    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError("Email and new password are required");
    }
    const result = await AuthService.resetPassword(email, password);
    res.status(200).json(result);
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    const rawRefreshToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;

    if (!rawRefreshToken) {
      throw new UnauthorizedError("Refresh token required");
    }

    const result = await AuthService.refresh(rawRefreshToken);

    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const rawRefreshToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
    await AuthService.logout(rawRefreshToken);
    clearRefreshCookie(res);
    res.status(204).send();
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("User not authenticated");
    }

    const user = await AuthService.getMe(req.user.id);
    res.status(200).json(user);
  }
}
