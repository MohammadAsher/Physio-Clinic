'use client';

import { motion } from 'framer-motion';
import { ShieldX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useClinicContext } from '@/lib/clinicContext';

interface ClinicProtectedRouteProps {
  feature: 'therapists' | 'dentalCharts' | 'entCharts' | 'dermatologyCharts' | 'ophthalmologyCharts';
  fallbackTitle?: string;
  fallbackDescription?: string;
  children: React.ReactNode;
}

const FALLBACK_MESSAGES: Record<string, { title: string; description: string }> = {
  therapists: {
    title: 'Therapist Features Not Available',
    description:
      'The Therapist dashboard and related features are only available for Physiotherapy clinics. Switch your clinic type to Physiotherapy to access these features.',
  },
  dentalCharts: {
    title: 'Dental Charts Not Available',
    description:
      'Dental charting features are only available for Dental Clinics. Switch your clinic type to Dental Clinic to access these features.',
  },
  entCharts: {
    title: 'ENT Charts Not Available',
    description:
      'ENT charting features are only available for ENT Clinics. Switch your clinic type to ENT Clinic to access these features.',
  },
  dermatologyCharts: {
    title: 'Dermatology Charts Not Available',
    description:
      'Dermatology charting features are only available for Dermatology Clinics. Switch your clinic type to Dermatology Clinic to access these features.',
  },
  ophthalmologyCharts: {
    title: 'Ophthalmology Charts Not Available',
    description:
      'Ophthalmology charting features are only available for Eye / Ophthalmology Clinics. Switch your clinic type to access these features.',
  },
};

export default function ClinicProtectedRoute({
  feature,
  fallbackTitle,
  fallbackDescription,
  children,
}: ClinicProtectedRouteProps) {
  const { features } = useClinicContext();

  const featureMap: Record<string, boolean> = {
    therapists: features.showTherapistRoutes,
    dentalCharts: features.hasDentalCharts,
    entCharts: features.hasENTCharts,
    dermatologyCharts: features.hasDermatologyCharts,
    ophthalmologyCharts: features.hasOphthalmologyCharts,
  };

  const isAllowed = featureMap[feature] ?? true;

  if (!isAllowed) {
    const fallback = FALLBACK_MESSAGES[feature];
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"
          >
            <ShieldX className="w-10 h-10 text-red-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">
            {fallbackTitle || fallback?.title}
          </h1>
          <p className="text-slate-400 mb-8">
            {fallbackDescription || fallback?.description}
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-button px-6 py-3 flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
