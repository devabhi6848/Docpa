export const ENDPOINTS = {
  // Auth
  AUTH_METHODS: "/v1/users/auth-methods",
  REGISTER: "/v1/users/register",
  LOGIN: "/v1/users/login",
  SEND_OTP: "/v1/users/otp/send",
  OTP_REGISTER: "/v1/users/otp/register",
  OTP_VERIFY: "/v1/users/otp/verify",
  GOOGLE_LOGIN: "/v1/users/google",
  ME: "/v1/users/me",
  REFRESH_TOKEN: "/v1/users/refresh",
  LOGOUT: "/v1/users/logout",

  // Clinics
  MY_CLINICS: "/v1/clinics/my-clinics",
  SWITCH_ACTIVE_CLINIC: "/v1/clinics/switch-active",
  CLINICS: "/v1/clinics",
  CLINIC_BY_ID: (id: string) => `/v1/clinics/${id}`,
  CLINIC_STAFF: (id: string) => `/v1/clinics/${id}/staff`,
  CLINIC_STAFF_MEMBER: (id: string, staffId: string) => `/v1/clinics/${id}/staff/${staffId}`,

  // Doctor Profile
  DOCTOR_PROFILE: "/v1/doctors/profile",

  // Queue & OPD Tokens
  GENERATE_TOKEN: "/v1/queue/token",
  TODAY_QUEUE: "/v1/queue/today",
  TOKEN_STATUS: (id: string) => `/v1/queue/${id}/status`,
  TV_DISPLAY: (clinicId: string) => `/v1/queue/tv-display/${clinicId}`,

  // Patients
  PATIENT_SEARCH: "/v1/patients/search",
  PATIENTS: "/v1/patients",
  PATIENT_BY_ID: (id: string) => `/v1/patients/${id}`,
  PATIENT_VITALS: (id: string) => `/v1/patients/${id}/vitals`,

  // Prescriptions
  PRESCRIPTIONS: "/v1/prescriptions",
  PRESCRIPTION_BY_ID: (id: string) => `/v1/prescriptions/${id}`,
  PATIENT_PRESCRIPTIONS: (patientId: string) => `/v1/prescriptions/patient/${patientId}`,

  // Medicines
  MEDICINES_SEARCH: "/v1/medicines/search",
  MEDICINES: "/v1/medicines",

  // Templates
  TEMPLATES: "/v1/templates",
  TEMPLATE_BY_ID: (id: string) => `/v1/templates/${id}`,

  // Pediatric & Vaccines
  GROWTH_RECORD: (patientId: string) => `/v1/growth/patient/${patientId}`,
  VACCINE_SCHEDULE: (patientId: string) => `/v1/vaccines/patient/${patientId}`,
  MARK_VACCINE_GIVEN: (id: string) => `/v1/vaccines/${id}/given`,

  // Billing
  INVOICES: "/v1/invoices",
  INVOICE_BY_ID: (id: string) => `/v1/invoices/${id}`,
  DAILY_COLLECTION: "/v1/invoices/daily-collection",

  // Teleconsultation
  TELECONSULTATIONS: "/v1/teleconsultations",
  TELECONSULTATION_ROOM: (meetingId: string) => `/v1/teleconsultations/room/${meetingId}`,
  TELECONSULTATION_STATUS: (meetingId: string) => `/v1/teleconsultations/room/${meetingId}/status`,

  // Analytics
  ANALYTICS_SUMMARY: "/v1/analytics/summary",
};
