import { z } from "zod";

const roleEnum = z.enum(["patient", "doctor", "receptionist", "nurse", "clinic_admin", "admin"]).optional();

export const registerSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number").optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: roleEnum,
    clinic_name: z.string().optional(),
    specialization: z.string().optional(),
    registration_number: z.string().optional(),
    consultation_fee: z.number().optional(),
  })
  .refine(
    (data) =>
      Boolean(
        (data.email && data.email.trim().length > 0) ||
        (data.phone && data.phone.trim().length > 0)
      ),
    {
      message: "At least one of email or phone is required",
      path: ["email"],
    }
  );

export const loginSchema = z
  .object({
    identifier: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    password: z.string().min(1, "Password is required"),
  })
  .refine(
    (data) => Boolean(data.identifier || data.email || data.phone),
    {
      message: "Either identifier, email or phone is required",
      path: ["email"],
    }
  );

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
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
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
