import { z } from "zod";

const rxMedicineItemSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  generic_name: z.string().optional(),
  dosage_form: z.string().optional(),
  dose: z.string().optional(),
  frequency: z.string().optional(),
  timing: z.string().optional(),
  duration_days: z.number().min(1).optional(),
  instructions: z.string().optional(),
});

export const createRxTemplateSchema = z.object({
  clinic_id: z.string().optional(),
  title: z.string().min(2, "Template title is required"),
  specialization: z.string().optional(),
  chief_complaints: z.array(z.string()).optional(),
  diagnosis: z.array(z.string()).optional(),
  medicines: z.array(rxMedicineItemSchema).optional(),
  investigations: z.array(z.string()).optional(),
  advice: z.string().optional(),
});

export const updateRxTemplateSchema = createRxTemplateSchema.partial();
