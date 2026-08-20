export type DosageForm =
  | "Tablet"
  | "Capsule"
  | "Syrup"
  | "Suspension"
  | "Drops"
  | "Injection"
  | "Ointment"
  | "Cream"
  | "Gel"
  | "Inhaler"
  | "Rotacap"
  | "Respules"
  | "Mouthwash"
  | "Powder"
  | "Sachet"
  | "Lotion"
  | "Ear Drops"
  | "Eye Drops"
  | "Nasal Spray";

export interface Medicine {
  _id: string;
  name: string;
  generic_name?: string;
  dosage_form: DosageForm;
  strength?: string;
  default_frequency?: string;
  default_timing?: string;
  default_duration_days?: number;
  instructions?: string;
  is_custom?: boolean;
  doctor_id?: string;
  createdAt?: string;
}
