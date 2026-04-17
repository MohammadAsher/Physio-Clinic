'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Calendar, Star, Award, Flame, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Patient } from '@/types';
import { MILESTONES } from '@/lib/data';

interface ProgressTrackerProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
}

export default function ProgressTracker({ patients, selectedPatient, onSelectPatient }: ProgressTrackerProps) {
  const members = patients.filter(p => p.isMember && p.membership);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getMilestones = (completedSessions: number) => {
    return MILESTONES.map(m => ({
      ...m,
      unlocked: completedSessions >= m.requiredSessions,
    }));
  };

  const getCalendarDays = (date: Date, attendanceDates: Date[]) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: { date: Date | null; isAttended: boolean }[] = [];

    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, isAttended: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      const isAttended = attendanceDates.some(
        ad => ad.toDateString() === currentDate.toDateString()
      );
      days.push({ date: currentDate, isAttended });
    }

    return days;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!selectedPatient || !selectedPatient.membership) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gradient mb-2">Progress Tracker</h1>
          <p className="text-slate-400">Select a member to view their progress</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AnimatePresence>
            {members.map((patient) => (
              <motion.div
                key={patient.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectPatient(patient)}
                className="glass-card p-5 cursor-pointer transition-all hover:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full premium-gradient flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {patient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{patient.name}</p>
                    <p className="text-slate-400 text-sm capitalize">{patient.membership?.type} Member</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold text-xl">
                      {patient.attendance.length}/{patient.membership?.totalSessions}
                    </p>
                    <p className="text-slate-400 text-xs">sessions</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {members.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No members found</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  const completedSessions = selectedPatient.attendance.length;
  const totalSessions = selectedPatient.membership.totalSessions;
  const progress = (completedSessions / totalSessions) * 100;
  const milestones = getMilestones(completedSessions);
  const calendarDays = getCalendarDays(
    currentMonth,
    selectedPatient.attendance.map(a => new Date(a.date))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectPatient(null as any)}
        className="glass-button secondary mb-6 flex items-center gap-2"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back to Members</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gradient mb-2">{selectedPatient.name}'s Progress</h1>
        <p className="text-slate-400 capitalize">{selectedPatient.membership?.type} Member</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-white">Session Progress</h2>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * progress) / 100 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold text-gradient"
                  >
                    {Math.round(progress)}%
                  </motion.span>
                  <span className="text-slate-400 text-sm">complete</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="glass-card p-4 text-center">
                <p className="text-slate-400 text-sm">Completed</p>
                <p className="text-white font-bold text-2xl">{completedSessions}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-slate-400 text-sm">Remaining</p>
                <p className="text-primary font-bold text-2xl">{totalSessions - completedSessions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Milestones</h2>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`relative group`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      milestone.unlocked
                        ? 'premium-gradient glow-effect'
                        : 'bg-white/5 grayscale'
                    }`}
                  >
                    {milestone.icon}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <p className="font-medium">{milestone.name}</p>
                    <p className="text-slate-400">{milestone.requiredSessions} sessions</p>
                  </div>
                  {milestone.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {milestones.filter(m => m.unlocked).map((milestone) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                >
                  <Award className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-white font-medium">{milestone.name}</p>
                    <p className="text-slate-400 text-xs">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-white">Session History</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
                </button>
                <span className="text-white font-medium min-w-[100px] text-center">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-slate-500 text-xs py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                    day.date === null
                      ? ''
                      : day.isAttended
                      ? 'premium-gradient glow-effect text-white'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {day.date?.getDate()}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-semibold text-white">Recent Sessions</h2>
            </div>

            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {selectedPatient.attendance.slice().reverse().map((record, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Session {record.sessionNumber}</p>
                      <p className="text-slate-400 text-xs">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </motion.div>
              ))}
              {selectedPatient.attendance.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No sessions attended yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
