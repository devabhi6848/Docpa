import { Patient } from "./patient";

export type TokenStatus = "waiting" | "with_doctor" | "completed" | "cancelled" | "no_show";
export type VisitType = "new_visit" | "follow_up" | "emergency" | "report_review" | "vaccination";
export type PriorityLevel = "normal" | "urgent" | "emergency";

export interface AppointmentToken {
  _id: string;
  clinic_id: string;
  doctor_id: {
    _id: string;
    name: string;
    email?: string;
  } | string;
  patient_id: Patient;
  vitals_id?: any;
  token_number: number;
  token_code: string;
  date: string;
  status: TokenStatus;
  visit_type: VisitType;
  priority: PriorityLevel;
  chief_complaint?: string;
  arrival_time?: string;
  consultation_start_time?: string;
  consultation_end_time?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueueSummary {
  total: number;
  waiting: number;
  with_doctor: number;
  completed: number;
  cancelled: number;
}

export interface TodayQueueResponse {
  tokens: AppointmentToken[];
  stats: QueueSummary;
  date: string;
}
