'use client';

import { format } from 'date-fns';

export interface PendingAppointment {
  id: string;
  appointmentId?: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  slot: string;
  token: string;
  amount: number;
  transactionId?: string;
  paymentProofUrl?: string;
  status: 'pending_verification';
  createdAt: string;
}

export interface ConfirmedAppointment {
  id: string;
  appointmentId?: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  slot: string;
  token: string;
  amount: number;
  transactionId?: string;
  paymentProofUrl?: string;
  status: 'confirmed';
  verifiedAt: string;
  verifiedBy: string;
}

const PENDING_KEY = 'pendingAppointments';
const CONFIRMED_KEY = 'confirmedAppointments';

function readStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writeStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function getPendingAppointments(): PendingAppointment[] {
  return readStorage<PendingAppointment>(PENDING_KEY);
}

export function getConfirmedAppointments(): ConfirmedAppointment[] {
  return readStorage<ConfirmedAppointment>(CONFIRMED_KEY);
}

export function getConfirmedAppointmentsByDoctor(doctorId: string): ConfirmedAppointment[] {
  return getConfirmedAppointments()
    .filter(a => a.doctorId === doctorId)
    .sort((a, b) => {
      const ta = new Date(`${a.date}T${a.slot}`).getTime();
      const tb = new Date(`${b.date}T${b.slot}`).getTime();
      return ta - tb;
    });
}

export function addPendingAppointment(appointment: Omit<PendingAppointment, 'id' | 'createdAt'> & { id?: string }): PendingAppointment {
  const existing = readStorage<PendingAppointment>(PENDING_KEY);
  const record: PendingAppointment = {
    ...appointment,
    id: appointment.id || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  writeStorage<PendingAppointment>(PENDING_KEY, [record, ...existing]);
  return record;
}

export function approveAppointment(pendingId: string, doctorId: string): ConfirmedAppointment | null {
  const pending = readStorage<PendingAppointment>(PENDING_KEY);
  const found = pending.find(a => a.id === pendingId);
  if (!found) return null;

  // Remove from pending
  writeStorage<PendingAppointment>(
    PENDING_KEY,
    pending.filter(a => a.id !== pendingId)
  );

  // Add to confirmed
  const confirmed: ConfirmedAppointment = {
    id: found.id,
    appointmentId: found.appointmentId,
    patientName: found.patientName,
    patientPhone: found.patientPhone,
    doctorId,
    doctorName: found.doctorName,
    doctorSpecialty: found.doctorSpecialty,
    date: found.date,
    slot: found.slot,
    token: found.token,
    amount: found.amount,
    transactionId: found.transactionId,
    paymentProofUrl: found.paymentProofUrl,
    status: 'confirmed',
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'Admin',
  };

  const existingConfirmed = readStorage<ConfirmedAppointment>(CONFIRMED_KEY);
  writeStorage<ConfirmedAppointment>(CONFIRMED_KEY, [confirmed, ...existingConfirmed]);
  return confirmed;
}

export function removePendingAppointment(id: string): void {
  const pending = readStorage<PendingAppointment>(PENDING_KEY);
  writeStorage<PendingAppointment>(PENDING_KEY, pending.filter(a => a.id !== id));
}

export function clearAllAppointments(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_KEY);
  localStorage.removeItem(CONFIRMED_KEY);
}

export function formatSlotDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}
