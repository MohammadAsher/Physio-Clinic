'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { ClinicType, CLINIC_TYPES } from '@/types/clinic';
import Logo from './Logo';

interface ClinicTypeSetupProps {
  initialType?: ClinicType;
  onNext: (clinicType: ClinicType) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

const slideUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

export default function ClinicTypeSetup({
  initialType = 'physiotherapy',
  onNext,
  onBack,
  isLoading = false,
}: ClinicTypeSetupProps) {
  const [selectedType, setSelectedType] = useState<ClinicType>(initialType);

  const handleSelect = (type: ClinicType) => {
    setSelectedType(type);
  };

  const handleNext = () => {
    onNext(selectedType);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-card p-8">
        {onBack && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="mb-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-400 rotate-180" />
          </motion.button>
        )}

        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo width={160} height={48} showTagline={false} />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Select Your Clinic Type
          </h1>
          <p className="text-slate-400">
            This determines your dashboard layout, navigation, and available staff roles.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {CLINIC_TYPES.map((type, index) => {
            const isSelected = selectedType === type.value;
            const isDefault = type.isDefault;

            return (
              <motion.div
                key={type.value}
                variants={slideUpVariant}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(type.value)}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left
                    ${
                      isSelected
                        ? 'border-rose-500/50 bg-rose-500/10 shadow-lg shadow-rose-900/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }
                  `}
                >
                  <div
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0
                      ${
                        isSelected
                          ? `bg-gradient-to-br ${type.primaryColor}`
                          : 'bg-white/5 border border-white/10'
                      }
                    `}
                  >
                    <span>{type.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{type.label}</h3>
                      {isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5">{type.description}</p>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6"
            >
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Selected: {CLINIC_TYPES.find(t => t.value === selectedType)?.label}
              </h4>
              <p className="text-slate-300 text-sm">
                {selectedType === 'physiotherapy'
                  ? 'Therapist dashboard, queues, session trackers, and treatment logs will be enabled. Staff roles include "Therapist".'
                  : `Therapist features will be hidden. Treatment personnel will be labeled as "${CLINIC_TYPES.find(t => t.value === selectedType)?.label === 'General Physician / Multi-Specialty' ? 'Doctor' : CLINIC_TYPES.find(t => t.value === selectedType)?.label}".`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-crimson-700 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-lg shadow-rose-900/30"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Saving...</span>
            </>
          ) : (
            <span>Continue</span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
