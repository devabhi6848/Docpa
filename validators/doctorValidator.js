import { z } from "zod";

export const doctorProfileSchema = z.object({
  title: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  medical_registration_number: z.string().optional(),
  state_medical_council: z.string().optional(),
  experience_years: z.number().min(0).optional(),
  bio: z.string().max(1000).optional(),
  signature_url: z.string().optional(),
  default_rx_notes: z.string().optional(),
});
