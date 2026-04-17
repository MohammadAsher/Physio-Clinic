'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Activity, CheckCircle } from 'lucide-react';
import { User, Patient } from '@/types';

interface PatientOverviewProps {
  user: User;
  patient?: Patient | null;
}

export default function PatientOverview({ user, patient }: PatientOverviewProps) {
  const completedSessions = patient?.attendance.length || 0;
  const totalSessions = patient?.membership?.totalSessions || 0;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name.split(' ')[0]}!</h2>
        <p className="text-slate-400">Here's an overview of your physiotherapy journey</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completed Sessions', value: completedSessions, icon: <CheckCircle className="w-6 h-6" />, color: 'red' },
          { label: 'Remaining Sessions', value: patient?.membership?.remainingSessions || 0, icon: <Calendar className="w-6 h-6" />, color: 'blue' },
          { label: 'Exercises Assigned', value: patient?.exercises.length || 0, icon: <Activity className="w-6 h-6" />, color: 'red' },
          { label: 'Total Progress', value: `${Math.round(progress)}%`, icon: <Clock className="w-6 h-6" />, color: 'blue' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-5"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color === 'red' ? 'red-gradient' : 'blue-gradient'} flex items-center justify-center text-white mb-4`}>
              {stat.icon}
            </div>
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color === 'red' ? 'text-primary' : 'text-sky'}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Your Progress</h3>
          <div className="relative pt-4">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full premium-gradient rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-slate-400">{completedSessions} completed</span>
              <span className="text-slate-400">{totalSessions - completedSessions} remaining</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Membership Status</h3>
          {patient?.isMember ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400">Plan</span>
                <span className="text-white font-medium capitalize">{patient.membership?.type}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400">Valid Since</span>
                <span className="text-white font-medium">
                  {patient.membership?.startDate ? new Date(patient.membership.startDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400">QR Code</span>
                <span className="text-primary text-sm truncate max-w-[150px]">
                  {patient.membership?.qrCode}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">You're not a member yet</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-button blue"
              >
                Upgrade to Member
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}