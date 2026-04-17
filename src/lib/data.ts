import { Exercise, Milestone } from '@/types';

export const EXERCISES: Exercise[] = [
  { id: '1', name: 'Stretching Routine', description: 'Full body stretching exercises', duration: 15, sets: 3, reps: 10 },
  { id: '2', name: 'Resistance Band Work', description: 'Upper body strengthening', duration: 20, sets: 4, reps: 12 },
  { id: '3', name: 'Balance Training', description: 'Core stability and balance exercises', duration: 15, sets: 3, reps: 8 },
  { id: '4', name: 'Joint Mobilization', description: 'Knee and hip joint mobility', duration: 20, sets: 3, reps: 15 },
  { id: '5', name: 'Pain Management', description: 'TENS and manual therapy', duration: 25, sets: 1, reps: 1 },
  { id: '6', name: 'Posture Correction', description: 'Spine alignment exercises', duration: 15, sets: 3, reps: 10 },
  { id: '7', name: 'Gait Training', description: 'Walking pattern correction', duration: 20, sets: 2, reps: 1 },
  { id: '8', name: 'Aquatic Therapy', description: 'Water-based rehabilitation', duration: 30, sets: 1, reps: 1 },
];

export const MILESTONES: Milestone[] = [
  { id: '1', name: 'Starter', description: 'Complete your first session', requiredSessions: 1, icon: '🌱', unlocked: false },
  { id: '2', name: 'Getting Started', description: 'Complete 3 sessions', requiredSessions: 3, icon: '🌿', unlocked: false },
  { id: '3', name: 'Halfway There!', description: 'Complete 50% of your sessions', requiredSessions: 6, icon: '🌳', unlocked: false },
  { id: '4', name: 'Almost Done', description: 'Complete 10 sessions', requiredSessions: 10, icon: '⭐', unlocked: false },
  { id: '5', name: 'Recovery Master', description: 'Complete all 12 sessions', requiredSessions: 12, icon: '🏆', unlocked: false },
];

export const generateToken = (): string => {
  const prefix = 'PHY';
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${random}-${number}`;
};

export const generateQRCode = (patientId: string): string => {
  return `PHY-QR-${patientId}-${Date.now()}`;
};
