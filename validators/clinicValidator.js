import { z } from "zod";

const timingSlotSchema = z.object({
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

const dayTimingSchema = z.object({
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  is_open: z.boolean(),
  slots: z.array(timingSlotSchema).optional(),
});

export const createClinicSchema = z.object({
  name: z.string().min(2, "Clinic name must be at least 2 characters").max(150),
  tagline: z.string().max(200).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  emergency_phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      landmark: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  consultation_fee: z.number().min(0).optional(),
  follow_up_fee: z.number().min(0).optional(),
  follow_up_validity_days: z.number().min(0).optional(),
  token_prefix: z.string().max(5).optional(),
  letterhead_settings: z
    .object({
      show_header: z.boolean().optional(),
      header_title: z.string().optional(),
      header_subtitle: z.string().optional(),
      logo_url: z.string().optional(),
      footer_text: z.string().optional(),
      paper_size: z.enum(["A4", "A5", "thermal"]).optional(),
      header_space_mm: z.number().min(0).optional(),
      show_qr_code: z.boolean().optional(),
    })
    .optional(),
  timings: z.array(dayTimingSchema).optional(),
});

export const updateClinicSchema = createClinicSchema.partial();

export const addStaffSchema = z.object({
  identifier: z.string().min(1, "Staff email or phone is required"),
  role: z.enum(["doctor", "receptionist", "nurse", "clinic_admin"]),
  designation: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export const updateStaffSchema = z.object({
  role: z.enum(["doctor", "receptionist", "nurse", "clinic_admin"]).optional(),
  status: z.enum(["active", "inactive", "invited"]).optional(),
  designation: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});
