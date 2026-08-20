export type InvoiceCategory = "consultation" | "procedure" | "vaccine" | "lab_test" | "pharmacy" | "other";
export type PaymentStatus = "paid" | "partial" | "unpaid" | "refunded";
export type PaymentMethod = "cash" | "upi" | "card" | "net_banking" | "wallet";

export interface InvoiceItem {
  name: string;
  category?: InvoiceCategory;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  total_amount: number;
}

export interface Invoice {
  _id: string;
  invoice_number: string;
  clinic_id: any;
  doctor_id?: any;
  patient_id: any;
  appointment_id?: any;
  prescription_id?: any;
  items: InvoiceItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_payable: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  transaction_reference?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyCollectionResponse {
  date: string;
  summary: {
    total_invoices: number;
    total_billed: number;
    total_collected: number;
    pending_amount: number;
    payment_methods_breakdown: Record<string, number>;
  };
  invoices: Invoice[];
}
