import { NavigatorScreenParams } from "@react-navigation/native";
import { AppointmentToken } from "../types/queue";

export type AuthStackParamList = {
  Login: undefined;
  Otp: { identifier: string; type: "email" | "phone"; isRegister?: boolean; role?: string };
  Register: undefined;
};

export type MainTabParamList = {
  QueueTab: undefined;
  PatientsTab: undefined;
  BillingTab: undefined;
  AnalyticsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainTabs: NavigatorScreenParams<MainTabParamList>;

  // Feature Screens & Modals
  GenerateToken: undefined;
  TvDisplay: { clinicId: string };
  PatientDetail: { patientId: string };
  AddPatient: undefined;
  VitalsTimeline: { patientId: string; patientName?: string };
  PrescriptionCreate: { token?: AppointmentToken; patientId?: string };
  PrescriptionDetail: { prescriptionId: string };
  TemplateManager: undefined;
  VaccineSchedule: { patientId: string; patientName?: string };
  GrowthTracker: { patientId: string; patientName?: string };
  CreateInvoice: { token?: AppointmentToken; patientId?: string };
  TeleconsultationList: undefined;
  VideoCall: { meetingId: string; roomUrl?: string };
  ClinicSettings: undefined;
  StaffManagement: undefined;
};
