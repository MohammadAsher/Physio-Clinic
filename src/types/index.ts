export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar?: string;
  createdAt: Date;
  status?: 'unassigned' | 'assigned';
  assignedDoctorId?: string;
  assignedDoctorName?: string;
}

export interface Patient {
  id: string;
  name: string;
  status: 'waiting' | 'consulting' | 'completed';
  checkInTime: any;
  token: any;           // Changed to any
  isMember?: any;       // Changed to any
  attendance?: any[];
  medicalCondition?: any;
  membership?: any;     // Changed to any
  exercises?: any[];    // Is line se image_74cbe0.png wala error jayega
}

export interface Exercise {
  id: string;
  name: string;
  duration: any;
  sets?: any;
  reps?: any;
  description?: any;
}

export interface FirestorePatient extends Patient {}

export interface Membership {
  id: string;
  type: 'silver' | 'gold' | 'platinum';
  totalSessions: number;
  remainingSessions: number;
  startDate: Date;
  endDate?: Date;
  qrCode: string;
}

export interface AttendanceRecord {
  date: Date;
  sessionNumber: number;
  notes?: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  requiredSessions: number;
  icon: string;
  unlocked: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
}

export type AuthView = 'landing' | 'login' | 'signup';
export type DashboardView = 'patient' | 'doctor';
export type PatientView = 'overview' | 'exercises' | 'membership' | 'progress';
export type DoctorView = 'waiting' | 'consultation' | 'patients';