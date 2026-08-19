import { z } from "zod";

const roleEnum = z.enum(["patient", "doctor", "receptionist", "nurse", "clinic_admin", "admin"]).optional();

export const registerSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number").optional(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: roleEnum,
  })
  .refine((data) => !data.email || !data.phone, {
    message: "Either email or phone is required",
    path: ["email"],
  });

export const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => !data.email || !data.phone, {
    message: "Either email or phone is required",
    path: ["email"],
  });

export const sendOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier (email or phone) is required"),
  type: z.enum(["email", "phone"], {
    errorMap: () => ({ message: "Type must be either 'email' or 'phone'" }),
  }),
});

export const otpRegisterSchema = z.object({
  name: z.string().optional(),
  identifier: z.string().min(1, "Identifier (email or phone) is required"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  type: z.enum(["email", "phone"]),
  role: roleEnum,
  password: z.string().min(8, "Password must be at least 8 characters long").optional(),
});

export const otpLoginSchema = z.object({
  identifier: z.string().min(1, "Identifier (email or phone) is required"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  type: z.enum(["email", "phone"]),
  role: roleEnum,
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, "Google ID Token is required"),
  role: roleEnum,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
