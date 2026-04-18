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
  isMember?: boolean;
  membershipStatus?: 'pending' | 'active' | 'expired' | 'pendingApproval' | 'rejected';
  membershipType?: 'silver' | 'gold' | 'platinum';
  membershipRequestDate?: Date;
  submittedTrxID?: string;
  profileCompleted?: boolean;
  doctorProfile?: {
    education?: string;
    experience?: string;
    specialization?: string;
    availableDays?: string[];
    timings?: string;
  };
  patientProfile?: {
    age?: number;
    gender?: string;
    medicalHistory?: string;
    profilePicture?: string;
  };
  appointments?: Appointment[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
  type: 'general' | 'specific';
}

export interface Patient {
  id: string;
  name: string;
  status: 'waiting' | 'consulting' | 'completed';
  checkInTime: any;
  token: any;
  isMember?: any;
  attendance?: any[];
  medicalCondition?: any;
  membership?: any;
  exercises?: any[];
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

export interface AttendanceLog {
  id?: string;
  userId: string;
  date: string;
  timestamp: any;
  role: 'doctor' | 'patient';
}

export interface PatientReport {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
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
export type PatientView = 'overview' | 'exercises' | 'membership' | 'progress' | 'reports';
export type DoctorView = 'waiting' | 'consultation' | 'patients';