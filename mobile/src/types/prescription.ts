export interface PrescribedMedicine {
  name: string;
  generic_name?: string;
  dosage_form?: string;
  dose?: string;
  frequency: string;
  timing?: string;
  duration_days?: number;
  instructions?: string;
}

export interface Prescription {
  _id: string;
  prescription_number: string;
  clinic_id: any;
  doctor_id: any;
  patient_id: any;
  appointment_id?: string;
  vitals_snapshot?: {
    bp_systolic?: number;
    bp_diastolic?: number;
    pulse_rate?: number;
    temperature_f?: number;
    spo2_percent?: number;
    weight_kg?: number;
    height_cm?: number;
    bmi?: number;
    head_circumference_cm?: number;
  };
  chief_complaints: string[];
  diagnosis: string[];
  clinical_notes?: string;
  medicines: PrescribedMedicine[];
  investigations: string[];
  general_advice: string;
  follow_up_date?: string;
  status: "draft" | "issued" | "shared_whatsapp";
  pdf_url?: string;
  createdAt?: string;
  updatedAt?: string;
}
