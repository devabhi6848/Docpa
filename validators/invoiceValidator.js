import { z } from "zod";

const invoiceItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.enum(["consultation", "procedure", "vaccine", "lab_test", "pharmacy", "other"]).optional(),
  quantity: z.number().min(1).default(1),
  unit_price: z.number().min(0, "Unit price must be >= 0"),
  tax_rate: z.number().min(0).max(100).optional(),
  total_amount: z.number().min(0),
});

export const createInvoiceSchema = z.object({
  clinic_id: z.string().min(1, "Clinic ID is required"),
  patient_id: z.string().min(1, "Patient ID is required"),
  doctor_id: z.string().optional(),
  appointment_id: z.string().optional(),
  prescription_id: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one billing item is required"),
  subtotal: z.number().min(0),
  discount_amount: z.number().min(0).optional(),
  tax_amount: z.number().min(0).optional(),
  total_payable: z.number().min(0),
  paid_amount: z.number().min(0),
  payment_status: z.enum(["paid", "partial", "unpaid", "refunded"]).optional(),
  payment_method: z.enum(["cash", "upi", "card", "net_banking", "wallet"]).optional(),
  transaction_reference: z.string().optional(),
  notes: z.string().optional(),
});
