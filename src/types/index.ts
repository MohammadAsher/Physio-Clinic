export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin' | 'therapist';
  avatar?: string;
  profilePicture?: string;
  createdAt: Date;
  status?: 'unassigned' | 'assigned' | 'waiting' | 'consulting' | 'completed';
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedTherapistId?: string;
  assignedTherapistName?: string;
  isMember?: boolean;
  membershipStatus?: 'pending' | 'active' | 'expired' | 'pendingApproval' | 'rejected';
  membershipType?: 'silver' | 'gold' | 'platinum' | 'custom';
  totalFees?: number;
  totalSessions?: number;
  completedSessions?: number;
  membershipRequestDate?: Date;
  submittedTrxID?: string;
  profileCompleted?: boolean;
  doctorProfile?: {
    education?: string;
    experience?: string;
    specialization?: string;
    availableDays?: string[];
    timings?: string;
    profilePicture?: string;
  };
  patientProfile?: {
    age?: number;
    gender?: string;
    medicalHistory?: string;
    profilePicture?: string;
  };
  appointments?: Appointment[];
  reports?: any[]; // Base64 medical reports
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
  prescription?: {
    diagnosis: string;
    exercises: string[];
    notes: string;
  };
}

export interface Report {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'other';
  uploadedAt: Date;
  userId?: string;
  showToDoctor?: boolean;
  reportName?: string;
}

export interface Patient {
  id: string;
  userId?: string;
  name: string;
  phone?: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  status: 'waiting' | 'consulting' | 'completed';
  checkInTime: any;
  token: any;
  isMember?: boolean;
  membershipStatus?: string;
  membershipType?: string;
  attendance?: any[];
  medicalCondition?: any;
  membership?: any;
  exercises?: any[];
  prescribedExercises?: any[];
  lastUpdated?: any;
  totalFees?: number;
  profilePicture?: string;
  avatar?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedTherapistId?: string;
  assignedTherapistName?: string;
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
  type: 'silver' | 'gold' | 'platinum' | 'custom';
  totalSessions: number;
  remainingSessions: number;
  startDate: Date;
  endDate?: Date;
  qrCode: string;
  totalFees?: number;
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
  uploadedBy?: string;
  doctorId?: string;
  showToDoctor?: boolean;
  reportName?: string;
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
