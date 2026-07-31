export type ClinicType =
  | 'physiotherapy'
  | 'dental'
  | 'ent'
  | 'general'
  | 'dermatology'
  | 'ophthalmology';

export type StaffRole =
  | 'patient'
  | 'doctor'
  | 'admin'
  | 'therapist'
  | 'consultant'
  | 'practitioner';

export interface ClinicTypeOption {
  value: ClinicType;
  label: string;
  description: string;
  icon: string;
  primaryColor: string;
  isDefault?: boolean;
}

export const CLINIC_TYPES: ClinicTypeOption[] = [
  {
    value: 'physiotherapy',
    label: 'Physiotherapy',
    description: 'Physical therapy, rehabilitation & wellness',
    icon: '💪',
    primaryColor: 'from-rose-600 to-crimson-700',
    isDefault: true,
  },
  {
    value: 'dental',
    label: 'Dental Clinic',
    description: 'Dental care, oral health & cosmetics',
    icon: '🦷',
    primaryColor: 'from-sky-500 to-blue-600',
  },
  {
    value: 'ent',
    label: 'ENT Clinic',
    description: 'Ear, Nose & Throat specialists',
    icon: '👂',
    primaryColor: 'from-purple-500 to-indigo-600',
  },
  {
    value: 'general',
    label: 'General Physician / Multi-Specialty',
    description: 'General medicine & multi-specialty care',
    icon: '🩺',
    primaryColor: 'from-emerald-500 to-teal-600',
  },
  {
    value: 'dermatology',
    label: 'Dermatology Clinic',
    description: 'Skin, hair & nail care specialists',
    icon: '🔬',
    primaryColor: 'from-amber-500 to-orange-600',
  },
  {
    value: 'ophthalmology',
    label: 'Eye / Ophthalmology Clinic',
    description: 'Eye care & vision specialists',
    icon: '👁️',
    primaryColor: 'from-cyan-500 to-blue-600',
  },
];

export const DEFAULT_CLINIC_TYPE: ClinicType = 'physiotherapy';

export interface ClinicFeatures {
  hasTherapists: boolean;
  hasDentalCharts: boolean;
  hasENTCharts: boolean;
  hasDermatologyCharts: boolean;
  hasOphthalmologyCharts: boolean;
  personnelLabel: string;
  personnelRole: StaffRole;
  showTherapistRoutes: boolean;
  staffRoles: StaffRole[];
}

const PERSONNEL_MAP: Record<ClinicType, { label: string; role: StaffRole }> = {
  physiotherapy: { label: 'Therapist', role: 'therapist' },
  dental: { label: 'Dentist', role: 'doctor' },
  ent: { label: 'ENT Specialist', role: 'doctor' },
  general: { label: 'Doctor', role: 'doctor' },
  dermatology: { label: 'Dermatologist', role: 'doctor' },
  ophthalmology: { label: 'Ophthalmologist', role: 'doctor' },
};

export function getClinicFeatures(clinicType: ClinicType): ClinicFeatures {
  const isPhysiotherapy = clinicType === 'physiotherapy';
  const personnel = PERSONNEL_MAP[clinicType];

  return {
    hasTherapists: isPhysiotherapy,
    hasDentalCharts: clinicType === 'dental',
    hasENTCharts: clinicType === 'ent',
    hasDermatologyCharts: clinicType === 'dermatology',
    hasOphthalmologyCharts: clinicType === 'ophthalmology',
    personnelLabel: personnel.label,
    personnelRole: personnel.role,
    showTherapistRoutes: isPhysiotherapy,
    staffRoles: isPhysiotherapy
      ? ['patient', 'doctor', 'admin', 'therapist']
      : ['patient', 'doctor', 'admin'],
  };
}

export function getClinicTypeLabel(clinicType: ClinicType): string {
  return CLINIC_TYPES.find(ct => ct.value === clinicType)?.label || 'Physiotherapy';
}
