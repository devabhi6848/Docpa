import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number").optional(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(["patient", "doctor", "admin"]),
  })
  .refine((data) => !!data.email || !!data.phone, {
    message: "Either email or phone is required",
    path: ["email"],
  });

export const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => !!data.email || !!data.phone, {
    message: "Either email or phone is required",
    path: ["email"],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
