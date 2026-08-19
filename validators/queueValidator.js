import { z } from "zod";

export const generateTokenSchema = z.object({
  clinic_id: z.string().min(1, "Clinic ID is required"),
  doctor_id: z.string().min(1, "Doctor ID is required"),
  patient_id: z.string().min(1, "Patient ID is required"),
  visit_type: z.enum(["new_visit", "follow_up", "emergency", "report_review", "vaccination"]).optional(),
  priority: z.enum(["normal", "urgent", "emergency"]).optional(),
  chief_complaint: z.string().max(500).optional(),
});

export const updateTokenStatusSchema = z.object({
  status: z.enum(["waiting", "with_doctor", "completed", "cancelled", "no_show"]),
});
