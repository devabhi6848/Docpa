export interface TimingSlot {
  start_time: string; // e.g. "09:00"
  end_time: string;   // e.g. "13:00"
}

export interface DayTiming {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  is_open: boolean;
  slots: TimingSlot[];
}

export interface LetterheadSettings {
  show_header: boolean;
  header_title: string;
  header_subtitle: string;
  logo_url: string;
  footer_text: string;
  paper_size: "A4" | "A5" | "thermal";
  header_space_mm: number;
  show_qr_code: boolean;
}

export interface Clinic {
  _id: string;
  name: string;
  tagline?: string;
  code?: string;
  owner_id: string;
  phone?: string;
  email?: string;
  emergency_phone?: string;
  address?: {
    street?: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  consultation_fee: number;
  follow_up_fee: number;
  follow_up_validity_days: number;
  token_prefix: string;
  letterhead_settings?: LetterheadSettings;
  timings?: DayTiming[];
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicStaff {
  _id: string;
  clinic_id: string;
  user_id: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    role: string;
  };
  role: "doctor" | "receptionist" | "nurse" | "clinic_admin";
  designation?: string;
  permissions: string[];
  status: "active" | "inactive" | "invited";
  createdAt?: string;
  updatedAt?: string;
}
