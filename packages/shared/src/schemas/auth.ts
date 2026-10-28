import { z } from "zod";

export const RoleEnum = z.enum(["ADMIN", "OWNER", "TENANT", "RENTER"]);
export type Role = z.infer<typeof RoleEnum>;

export const RegisterInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  role: z.enum(["OWNER", "RENTER", "TENANT"]).default("RENTER"),
  phone: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined))
    .refine((val) => !val || val.length >= 7, {
      message: "Phone number must have at least 7 digits",
    }),
});

export const LoginInputSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const AuthUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleEnum,
  phone: z.string().nullable().optional(),
});

export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
  accessToken: z.string(),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export const UserPublicSchema = AuthUserSchema;
export type UserPublic = AuthUser;
