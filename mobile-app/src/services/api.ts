import { QueueItem, Appointment, Patient, ClinicMetrics, User } from '../types';

export const API_BASE_URL = 'https://docpa.onrender.com/api/v1';

// Initial Mock Seed for Live Offline / Fallback OPD Simulation
export const INITIAL_QUEUE: QueueItem[] = [
  {
    id: 'tok-101',
    tokenNumber: 14,
    patientName: 'Rahul Sharma',
    patientPhone: '+91 98765 43210',
    patientAge: 38,
    gender: 'MALE',
    doctorName: 'Dr. A. Verma (Cardiologist)',
    status: 'SERVING',
    estimatedWaitMinutes: 0,
    checkedInAt: '10:15 AM',
    notes: 'Routine ECG Followup',
  },
  {
    id: 'tok-102',
    tokenNumber: 15,
    patientName: 'Priya Mehra',
    patientPhone: '+91 98112 34567',
    patientAge: 29,
    gender: 'FEMALE',
    doctorName: 'Dr. A. Verma (Cardiologist)',
    status: 'WAITING',
    estimatedWaitMinutes: 8,
    checkedInAt: '10:22 AM',
  },
  {
    id: 'tok-103',
    tokenNumber: 16,
    patientName: 'Amit Patel',
    patientPhone: '+91 99001 22334',
    patientAge: 62,
    gender: 'MALE',
    doctorName: 'Dr. A. Verma (Cardiologist)',
    status: 'WAITING',
    estimatedWaitMinutes: 16,
    checkedInAt: '10:30 AM',
    notes: 'Hypertension review',
  },
  {
    id: 'tok-104',
    tokenNumber: 17,
    patientName: 'Kavita Sundaram',
    patientPhone: '+91 97654 11223',
    patientAge: 45,
    gender: 'FEMALE',
    doctorName: 'Dr. A. Verma (Cardiologist)',
    status: 'WAITING',
    estimatedWaitMinutes: 24,
    checkedInAt: '10:45 AM',
  },
  {
    id: 'tok-100',
    tokenNumber: 13,
    patientName: 'Suresh Raina',
    patientPhone: '+91 91234 56789',
    patientAge: 51,
    gender: 'MALE',
    doctorName: 'Dr. A. Verma (Cardiologist)',
    status: 'COMPLETED',
    estimatedWaitMinutes: 0,
    checkedInAt: '09:50 AM',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-201',
    patientName: 'Rahul Sharma',
    patientPhone: '+91 98765 43210',
    timeSlot: '10:15 AM - 10:30 AM',
    doctorName: 'Dr. A. Verma',
    department: 'Cardiology',
    status: 'IN_CONSULTATION',
    tokenNumber: 14,
  },
  {
    id: 'apt-202',
    patientName: 'Priya Mehra',
    patientPhone: '+91 98112 34567',
    timeSlot: '10:30 AM - 10:45 AM',
    doctorName: 'Dr. A. Verma',
    department: 'Cardiology',
    status: 'CHECKED_IN',
    tokenNumber: 15,
  },
  {
    id: 'apt-203',
    patientName: 'Amit Patel',
    patientPhone: '+91 99001 22334',
    timeSlot: '10:45 AM - 11:00 AM',
    doctorName: 'Dr. A. Verma',
    department: 'Cardiology',
    status: 'CHECKED_IN',
    tokenNumber: 16,
  },
  {
    id: 'apt-204',
    patientName: 'Kavita Sundaram',
    patientPhone: '+91 97654 11223',
    timeSlot: '11:00 AM - 11:15 AM',
    doctorName: 'Dr. A. Verma',
    department: 'Cardiology',
    status: 'CONFIRMED',
    tokenNumber: 17,
  },
  {
    id: 'apt-205',
    patientName: 'Vikram Sengupta',
    patientPhone: '+91 98300 99887',
    timeSlot: '11:15 AM - 11:30 AM',
    doctorName: 'Dr. A. Verma',
    department: 'Cardiology',
    status: 'CONFIRMED',
  },
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    age: 38,
    gender: 'MALE',
    uhid: 'UHID-2026-0891',
    lastVisit: 'Today',
    bloodGroup: 'B+',
  },
  {
    id: 'pat-2',
    name: 'Priya Mehra',
    phone: '+91 98112 34567',
    age: 29,
    gender: 'FEMALE',
    uhid: 'UHID-2026-0914',
    lastVisit: '12 Aug 2026',
    bloodGroup: 'O+',
  },
  {
    id: 'pat-3',
    name: 'Amit Patel',
    phone: '+91 99001 22334',
    age: 62,
    gender: 'MALE',
    uhid: 'UHID-2025-4412',
    lastVisit: '15 Jul 2026',
    bloodGroup: 'A+',
  },
  {
    id: 'pat-4',
    name: 'Kavita Sundaram',
    phone: '+91 97654 11223',
    age: 45,
    gender: 'FEMALE',
    uhid: 'UHID-2026-1102',
    lastVisit: 'First Visit',
    bloodGroup: 'AB+',
  },
];

class DocpaApiService {
  private authToken: string | null = null;

  setToken(token: string) {
    this.authToken = token;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        return {
          user: data.user || { id: 'u1', name: email.split('@')[0], email, role: 'DOCTOR', clinicName: 'Docpa City Clinic' },
          token: data.token || 'docpa-token-sample',
        };
      }
    } catch (e) {
      console.log('Docpa API Login Fallback:', e);
    }
    // Fallback for seamless demo / offline preview
    return {
      user: {
        id: 'u-101',
        name: 'Dr. Anand Verma',
        email,
        role: 'DOCTOR',
        clinicName: 'Docpa Healthcare Care Center',
      },
      token: 'demo-docpa-jwt-token',
    };
  }

  async checkServerHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const api = new DocpaApiService();
