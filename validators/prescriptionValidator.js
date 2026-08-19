import { z } from "zod";

const prescribedMedicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  generic_name: z.string().optional(),
  dosage_form: z.string().optional(),
  dose: z.string().optional(),
  frequency: z.string().min(1, "Frequency is required (e.g. 1-0-1)"),
  timing: z.string().optional(),
  duration_days: z.number().min(1).optional(),
  instructions: z.string().optional(),
});

const vitalsSnapshotSchema = z.object({
  bp_systolic: z.number().optional(),
  bp_diastolic: z.number().optional(),
  pulse_rate: z.number().optional(),
  temperature_f: z.number().optional(),
  spo2_percent: z.number().optional(),
  weight_kg: z.number().optional(),
  height_cm: z.number().optional(),
  bmi: z.number().optional(),
  head_circumference_cm: z.number().optional(),
});

export const createPrescriptionSchema = z.object({
  clinic_id: z.string().min(1, "Clinic ID is required"),
  patient_id: z.string().min(1, "Patient ID is required"),
  appointment_id: z.string().optional(),
  vitals_snapshot: vitalsSnapshotSchema.optional(),
  chief_complaints: z.array(z.string()).optional(),
  diagnosis: z.array(z.string()).min(1, "At least one provisional diagnosis is recommended").optional(),
  clinical_notes: z.string().optional(),
  medicines: z.array(prescribedMedicineSchema).min(1, "At least one medicine is required"),
  investigations: z.array(z.string()).optional(),
  general_advice: z.string().optional(),
  follow_up_date: z.string().optional(),
});
