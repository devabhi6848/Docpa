import { z } from "zod";

export const createPatientSchema = z.object({
  clinic_id: z.string().min(1, "Clinic ID is required"),
  name: z.string().min(2, "Patient name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number"),
  email: z.string().email().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]),
  dob: z.string().optional(),
  age_years: z.number().min(0).max(130).optional(),
  age_months: z.number().min(0).max(11).optional(),
  age_days: z.number().min(0).max(30).optional(),
  blood_group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"]).optional(),
  allergies: z.array(z.string()).optional(),
  chronic_conditions: z.array(z.string()).optional(),
  guardian_name: z.string().optional(),
  guardian_relationship: z.enum(["Father", "Mother", "Spouse", "Guardian", "Self", "Other"]).optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export const recordVitalsSchema = z.object({
  bp_systolic: z.number().min(40).max(300).optional(),
  bp_diastolic: z.number().min(20).max(200).optional(),
  pulse_rate: z.number().min(20).max(250).optional(),
  temperature_f: z.number().min(90).max(110).optional(),
  spo2_percent: z.number().min(40).max(100).optional(),
  respiratory_rate: z.number().min(5).max(100).optional(),
  weight_kg: z.number().min(0.5).max(500).optional(),
  height_cm: z.number().min(20).max(250).optional(),
  head_circumference_cm: z.number().min(10).max(100).optional(),
  rbs_mg_dl: z.number().min(10).max(1000).optional(),
  notes: z.string().max(500).optional(),
  appointment_id: z.string().optional(),
});
