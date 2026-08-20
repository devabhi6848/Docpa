export type NutritionalStatus =
  | "Normal"
  | "Mild Underweight"
  | "Moderate Underweight"
  | "Severe Underweight"
  | "Overweight"
  | "Obese";

export interface GrowthRecord {
  _id: string;
  patient_id: string;
  clinic_id: string;
  recorded_date: string;
  age_in_months: number;
  weight_kg?: number;
  height_cm?: number;
  head_circumference_cm?: number;
  bmi?: number;
  weight_percentile?: number;
  height_percentile?: number;
  head_percentile?: number;
  developmental_milestones?: string[];
  nutritional_status?: NutritionalStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GrowthHistoryResponse {
  patient: any;
  records: GrowthRecord[];
}
