import { format, addDays, isWeekend, startOfMonth, getDaysInMonth, parse } from 'date-fns';

export interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
  booked?: boolean;
}

export interface DoctorTimings {
  availableDays: string[];
  timingFrom: string;
  timingTo: string;
  slotDuration: number;
}

export const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAME_TO_INDEX: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

export const DEFAULT_WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function normalizeDayName(input: string): string {
  const lower = input.toLowerCase().trim();

  for (let i = 0; i < FULL_DAY_NAMES.length; i++) {
    if (FULL_DAY_NAMES[i].toLowerCase() === lower) return FULL_DAY_NAMES[i];
    if (SHORT_DAY_NAMES[i].toLowerCase() === lower) return FULL_DAY_NAMES[i];
  }

  const longToShort: Record<string, string> = {
    sunday: 'Sun', monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
    thursday: 'Thu', friday: 'Fri', saturday: 'Sat',
  };

  const shortName = longToShort[lower];
  return shortName || input;
}

export function getNormalizedAvailableDays(availableDays: string[]): string[] {
  if (!availableDays || availableDays.length === 0) {
    return [...DEFAULT_WORKING_DAYS];
  }
  return availableDays.map(normalizeDayName);
}

export function parseTimings(timings: string): { start: string; end: string } | null {
  if (!timings) return null;

  const match = timings.match(/(\d{1,2}:\d{2})\s*(AM|PM)?\s*[-–]\s*(\d{1,2}:\d{2})\s*(AM|PM)?/i);
  if (!match) return null;

  const startTime = match[1] + (match[2] || '');
  const endTime = match[3] + (match[4] || '');
  return { start: startTime, end: endTime };
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr || timeStr.trim() === '') return NaN;

  const trimmed = timeStr.trim();
  const [time, period] = trimmed.split(/(AM|PM)/i);
  let [hours, minutes] = time.trim().split(':').map(Number);

  if (period && period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period && period.toUpperCase() === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function generateTimeSlots(startTime: string, endTime: string, duration: number): TimeSlot[] {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const slots: TimeSlot[] = [];

  for (let mins = startMinutes; mins < endMinutes; mins += duration) {
    const endSlot = mins + duration;
    if (endSlot <= endMinutes) {
      const timeStr = minutesToTime(mins);
      slots.push({
        time: timeStr,
        display: timeStr,
        available: true,
      });
    }
  }

  return slots;
}

export function getDoctorTimings(doctor: any): DoctorTimings {
  const profile = doctor?.doctorProfile || {};

  const timings = profile.timings || '';
  const parsed = parseTimings(timings);

  let timingFrom = '';
  let timingTo = '';

  if (parsed) {
    timingFrom = parsed.start;
    timingTo = parsed.end;
  } else {
    const defaultMatch = timings.match(/(\d{1,2}(?::\d{2})?)\s*(AM|PM)?\s*[-–]\s*(\d{1,2}(?::\d{2})?)\s*(AM|PM)?/i);
    if (defaultMatch) {
      timingFrom = defaultMatch[1] + ':00' + (defaultMatch[2] || '');
      timingTo = defaultMatch[3] + ':00' + (defaultMatch[4] || '');
    }
  }

  return {
    availableDays: getNormalizedAvailableDays(profile.availableDays || []),
    timingFrom: timingFrom || '06:00 PM',
    timingTo: timingTo || '09:00 PM',
    slotDuration: profile.slotDuration || 20,
  };
}

export function getAvailableDates(availableDays: string[], monthsAhead: number = 2): Date[] {
  const normalizedDays = getNormalizedAvailableDays(availableDays);
  const dates: Date[] = [];
  const today = new Date();
  const totalDays = monthsAhead * 30;

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(today, i);
    const dayName = FULL_DAY_NAMES[date.getDay()];
    if (normalizedDays.includes(dayName)) {
      dates.push(date);
    }
  }

  return dates;
}

export function isWorkingDay(date: Date, availableDays: string[]): boolean {
  const dayName = FULL_DAY_NAMES[date.getDay()];
  const normalizedDays = getNormalizedAvailableDays(availableDays);
  return normalizedDays.includes(dayName);
}

export interface DoctorLeave {
  id?: string;
  doctorId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  createdAt?: Date;
}

export function isDateOnLeave(date: Date, leaves: DoctorLeave[]): boolean {
  const checkDate = format(date, 'yyyy-MM-dd');
  return leaves.some(leave => {
    const start = leave.startDate;
    const end = leave.endDate;
    return checkDate >= start && checkDate <= end;
  });
}

export function isDateUnavailable(date: Date, availableDays: string[], leaves: DoctorLeave[]): boolean {
  if (isDateInPast(date)) return true;
  if (!isWorkingDay(date, availableDays)) return true;
  if (isDateOnLeave(date, leaves)) return true;
  return false;
}

export function formatDate(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy');
}

export function formatDateShort(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

export function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

export function generateTokenNumber(date: Date, existingTokens: number): string {
  const day = format(date, 'dd');
  const month = format(date, 'MM');
  const year = format(date, 'yy');
  const token = (existingTokens + 1).toString().padStart(2, '0');
  return `${day}${month}${year}-${token}`;
}

export function generateAppointmentToken(date: Date, existingTokens: number): string {
  const year = format(date, 'yyyy');
  const token = (existingTokens + 1).toString().padStart(4, '0');
  return `#APP-${year}-${token}`;
}

export function isPhysiotherapySpecialty(specialty: string | undefined): boolean {
  if (!specialty) return false;
  const lower = specialty.toLowerCase();
  return lower.includes('physiotherapy') || lower.includes('physical therapy');
}
