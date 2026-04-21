'use client';

import { motion } from 'framer-motion';
import { Stethoscope, Heart, Activity } from 'lucide-react';

interface MedicalEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function MedicalEmptyState({
  title = 'No Data Available',
  description = 'It looks like there\'s nothing to show here yet.',
  actionLabel,
  onAction,
  className = '',
}: MedicalEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}
    >
      {/* 3D Medical Illustration */}
      <div className="relative mb-8">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotateY: [0, 10, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-48 h-48"
          style={{ perspective: '1000px' }}
        >
          {/* Stethoscope Icon with glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500/20 to-blue-500/20 blur-2xl animate-pulse" />
          </div>
          <div className="relative z-10 w-32 h-32 rounded-full glass-card flex items-center justify-center">
            <Stethoscope className="w-16 h-16 text-white" />
          </div>
          
          {/* Floating decorative elements */}
          <motion.div
            animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
          >
            <Heart className="w-5 h-5 text-white" />
          </motion.div>
          
          <motion.div
            animate={{ y: [0, 15, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
          >
            <Activity className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
      </div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center max-w-md"
      >
        <h3 className="text-2xl font-bold text-gold mb-2">{title}</h3>
        <p className="text-slate-400 mb-6">{description}</p>
        
        {actionLabel && onAction && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAction}
            className="glass-button px-8 py-3"
          >
            {actionLabel}
          </motion.button>
        )}
      </motion.div>

      {/* Decorative particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-red-400 to-blue-400 opacity-30"
            initial={{
              x: Math.random() * 400,
              y: Math.random() * 400,
            }}
            animate={{
              y: [null, -20],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
