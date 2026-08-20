export type TokenStatus = 'SERVING' | 'WAITING' | 'COMPLETED' | 'SKIPPED' | 'EMERGENCY';
export type AppointmentStatus = 'CONFIRMED' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
export type TabType = 'queue' | 'appointments' | 'patients' | 'overview' | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';
  clinicName?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  uhid: string; // Unique Healthcare ID
  lastVisit?: string;
  bloodGroup?: string;
}

export interface QueueItem {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  doctorName: string;
  status: TokenStatus;
  estimatedWaitMinutes: number;
  checkedInAt: string;
  notes?: string;
  isEmergency?: boolean;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  timeSlot: string;
  doctorName: string;
  department: string;
  status: AppointmentStatus;
  tokenNumber?: number;
}

export interface ClinicMetrics {
  totalTokensToday: number;
  servedCount: number;
  waitingCount: number;
  skippedCount: number;
  avgConsultationMinutes: number;
  currentServingToken: number;
}
