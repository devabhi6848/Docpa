import { PrescribedMedicine } from "./prescription";

export interface RxTemplate {
  _id: string;
  doctor_id: string;
  clinic_id?: string;
  title: string;
  specialization?: string;
  chief_complaints: string[];
  diagnosis: string[];
  medicines: PrescribedMedicine[];
  investigations: string[];
  advice?: string;
  createdAt?: string;
  updatedAt?: string;
}
