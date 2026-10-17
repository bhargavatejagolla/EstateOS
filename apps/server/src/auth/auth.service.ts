import { prisma } from "../lib/prisma.js";
import { PasswordService } from "./password.service.js";
import { TokenService } from "./token.service.js";
import { ConflictError, UnauthorizedError } from "../middleware/errors.js";
import type { RegisterInput, LoginInput } from "@estateos/shared";

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await PasswordService.hash(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role,
        phone: input.phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
    });

    const accessToken = TokenService.signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = TokenService.signRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const tokenHash = TokenService.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return { user, accessToken, refreshToken };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValid = await PasswordService.verify(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const accessToken = TokenService.signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = TokenService.signRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const tokenHash = TokenService.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(rawRefreshToken: string) {
    let payload: { id: string; email: string; role: string };
    try {
      payload = TokenService.verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const tokenHash = TokenService.hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    // Replay attack detection: token missing or already revoked
    if (!storedToken || storedToken.revokedAt !== null) {
      if (storedToken?.userId) {
        // Revoke all tokens for this compromised session
        await prisma.refreshToken.updateMany({
          where: { userId: storedToken.userId },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedError("Replay attack detected. Session revoked.");
    }

    // Check expiration
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token has expired");
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Rotate: Issue new access token + new refresh token
    const newAccessToken = TokenService.signAccessToken({
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    const newRefreshToken = TokenService.signRefreshToken({
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    const newTokenHash = TokenService.hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        tokenHash: newTokenHash,
        expiresAt,
      },
    });

    return {
      user: {
        id: storedToken.user.id,
        name: storedToken.user.name,
        email: storedToken.user.email,
        role: storedToken.user.role,
        phone: storedToken.user.phone,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = TokenService.hashToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      });
    }
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return user;
  }
}
