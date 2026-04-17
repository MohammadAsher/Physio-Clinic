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
  token: string;
  isMember: boolean;
  attendance: any[];
  medicalCondition?: string; // Add this line
  membership?: {             // Add this block
    type: string;
    remainingSessions: number;
    qrCode: string;
  };
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  sets?: number;
  reps?: number;
}

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