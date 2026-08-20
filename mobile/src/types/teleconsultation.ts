export type CallType = "video" | "audio";
export type TeleconsultationStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface Teleconsultation {
  _id: string;
  meeting_id: string;
  clinic_id: any;
  doctor_id: any;
  patient_id: any;
  appointment_id?: any;
  call_type: CallType;
  status: TeleconsultationStatus;
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  room_url: string;
  doctor_notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
