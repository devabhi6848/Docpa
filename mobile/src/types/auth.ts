export type UserRole = "patient" | "doctor" | "receptionist" | "nurse" | "clinic_admin" | "admin";

export interface User {
  _id: string;
  name?: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  active_clinic_id?: string | null;
  auth_providers?: string[];
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: User;
  tokens: AuthTokens;
  activeClinic?: any;
}

export interface DoctorProfile {
  _id: string;
  user_id: string;
  title: string;
  qualifications: string[];
  specializations: string[];
  medical_registration_number: string;
  state_medical_council: string;
  experience_years: number;
  bio: string;
  signature_url: string;
  default_rx_notes: string;
  createdAt?: string;
  updatedAt?: string;
}
