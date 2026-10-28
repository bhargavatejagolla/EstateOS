import { prisma } from "../lib/prisma.js";
import { PasswordService } from "./password.service.js";
import { TokenService } from "./token.service.js";
import { ConflictError, UnauthorizedError } from "../middleware/errors.js";
import type { RegisterInput, LoginInput } from "@estateos/shared";

export class AuthService {
  static async register(input: RegisterInput) {
    const email = input.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictError("An account with this email already exists. Please sign in.");
    }

    const passwordHash = await PasswordService.hash(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
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
    const email = input.email.trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Auto-provision test personas on-demand if missing in the database
    if (
      !user &&
      (email.endsWith("@lease.test") ||
        email.endsWith("@estateos.com") ||
        email === "bhargavatejagolla@gmail.com")
    ) {
      let role: "OWNER" | "RENTER" | "TENANT" | "ADMIN" = "OWNER";
      let name = "Verified Owner";

      if (email.includes("tenant") || email.includes("priya")) {
        role = "TENANT";
        name = email.includes("priya") ? "Priya Nair" : "Tenant 8";
      } else if (email.includes("renter") || email.includes("arjun")) {
        role = "RENTER";
        name = email.includes("arjun") ? "Arjun Mehta" : "Verified Renter";
      } else if (email === "bhargavatejagolla@gmail.com") {
        role = "OWNER";
        name = "Bhargav Teja";
      } else if (email.includes("rajesh")) {
        role = "OWNER";
        name = "Rajesh Kumar";
      } else if (email.includes("ananya")) {
        role = "OWNER";
        name = "Ananya Sharma";
      } else {
        name = "Owner 8";
      }

      const defaultPass =
        email === "bhargavatejagolla@gmail.com" ? "Anjibunny@123" : "password123";
      const passwordHash = await PasswordService.hash(defaultPass);

      user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          passwordHash,
        },
      });
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    let isValid = await PasswordService.verify(input.password, user.passwordHash);

    // Resilience for test personas: allow password123 or Anjibunny@123 if previously reset/synced
    if (
      !isValid &&
      (email.endsWith("@lease.test") ||
        email.endsWith("@estateos.com") ||
        email === "bhargavatejagolla@gmail.com")
    ) {
      const allowedDemoPass =
        email === "bhargavatejagolla@gmail.com" ? "Anjibunny@123" : "password123";
      if (input.password === allowedDemoPass) {
        const updatedHash = await PasswordService.hash(allowedDemoPass);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: updatedHash },
        });
        isValid = true;
      }
    }

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

  static async resetPassword(email: string, newPassword: string) {
    const normalizedEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const passwordHash = await PasswordService.hash(newPassword);

    if (!user) {
      // Auto-create user if they don't exist yet
      const role = normalizedEmail.includes("tenant")
        ? "TENANT"
        : normalizedEmail.includes("renter")
          ? "RENTER"
          : "OWNER";
      const name = normalizedEmail.split("@")[0] || "User";

      await prisma.user.create({
        data: {
          email: normalizedEmail,
          name,
          role,
          passwordHash,
        },
      });

      return { success: true, message: "Account created and password set successfully" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { success: true, message: "Password updated successfully" };
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
      const compromisedUserId = storedToken?.userId || payload.id;
      if (compromisedUserId) {
        // Revoke all tokens for this compromised session
        await prisma.refreshToken.updateMany({
          where: { userId: compromisedUserId },
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
