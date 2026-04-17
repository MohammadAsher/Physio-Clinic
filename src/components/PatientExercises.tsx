'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Clock, Play, CheckCircle } from 'lucide-react';
import { Patient } from '@/types';

interface PatientExercisesProps {
  patient: Patient | null;
}

export default function PatientExercises({ patient }: PatientExercisesProps) {
  const exercises = patient?.exercises || [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Your Exercises</h2>
        <p className="text-slate-400">Follow your prescribed exercises for optimal recovery</p>
      </motion.div>

      <AnimatePresence>
        {exercises.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl red-gradient flex items-center justify-center text-white">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                    Active
                  </span>
                </div>

                <h3 className="text-white font-semibold text-lg mb-2">{exercise.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{exercise.description}</p>

                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{exercise.duration} min</span>
                  </div>
                  {exercise.sets && (
                    <div className="text-slate-400 text-sm">
                      <span className="text-primary">{exercise.sets}</span> sets
                    </div>
                  )}
                  {exercise.reps && (
                    <div className="text-slate-400 text-sm">
                      <span className="text-sky">{exercise.reps}</span> reps
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-button w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Exercise</span>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center"
          >
            <Dumbbell className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Exercises Assigned</h3>
            <p className="text-slate-400">
              Your doctor hasn't assigned any exercises yet. Check back after your consultation.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}