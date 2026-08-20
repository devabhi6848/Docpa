export interface Vitals {
  _id?: string;
  patient_id?: string;
  clinic_id?: string;
  appointment_id?: string;
  recorded_at?: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  pulse_rate?: number;
  temperature_f?: number;
  spo2_percent?: number;
  respiratory_rate?: number;
  weight_kg?: number;
  height_cm?: number;
  bmi?: number;
  head_circumference_cm?: number;
  rbs_mg_dl?: number;
  notes?: string;
  createdAt?: string;
}

export interface Patient {
  _id: string;
  clinic_id: string;
  uhid: string;
  name: string;
  phone: string;
  email?: string;
  gender: "male" | "female" | "other";
  dob?: string;
  age_years?: number;
  age_months?: number;
  age_days?: number;
  blood_group?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "unknown";
  national_id?: string;
  emergency_contact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  allergies?: string[];
  chronic_conditions?: string[];
  confidential_notes?: string;
  guardian_name?: string;
  guardian_relationship?: "Father" | "Mother" | "Spouse" | "Guardian" | "Self" | "Other";
  address?: {
    street?: string;
    city?: string;
    pincode?: string;
  };
  last_visit_date?: string;
  total_visits?: number;
  latestVitals?: Vitals;
  createdAt?: string;
  updatedAt?: string;
}
