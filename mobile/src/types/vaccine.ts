export type VaccineStatus = "upcoming" | "due" | "given" | "missed";

export interface PatientVaccine {
  _id: string;
  patient_id: string;
  clinic_id: string;
  doctor_id?: any;
  vaccine_name: string;
  disease_covered?: string;
  age_milestone: string;
  dose_number: string;
  due_date: string;
  given_date?: string;
  status: VaccineStatus;
  brand_name?: string;
  batch_number?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VaccineScheduleResponse {
  patient: any;
  summary: {
    total: number;
    given: number;
    due: number;
    upcoming: number;
    missed: number;
  };
  schedule: PatientVaccine[];
}
