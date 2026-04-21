'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Calendar, Star, Award, Flame, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Patient } from '@/types';
import { MILESTONES } from '@/lib/data';
import CounterAnimation from './CounterAnimation';
import CircularProgress from './CircularProgress';
import MedicalEmptyState from './MedicalEmptyState';

interface PatientProgressProps {
  patient: Patient | null;
}

export default function PatientProgress({ patient }: PatientProgressProps) {
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

  if (!patient) {
    return (
      <MedicalEmptyState
        title="No Patient Data"
        description="Select a patient to view their progress and achievements."
      />
    );
  }

  const completedSessions = patient.attendance?.length || 0;
  const totalSessions = patient.membership?.totalSessions || 12;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const milestones = getMilestones(completedSessions);
  const calendarDays = getCalendarDays(
    currentMonth,
    (patient.attendance || []).map(a => new Date(a.date))
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Your Progress</h2>
        <p className="text-slate-400">Track your recovery journey and achievements</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-white">Session Progress</h3>
          </div>

          <div className="flex items-center justify-center">
            <CircularProgress
              value={completedSessions}
              max={totalSessions}
              size={160}
              strokeWidth={12}
              label="Progress"
              color="red"
              showPercentage={true}
            />
          </div>

           <div className="mt-6 grid grid-cols-2 gap-4">
             <div className="glass-card p-4 text-center">
               <p className="text-slate-400 text-sm">Completed</p>
               <p className="text-primary font-bold text-2xl">
                 <CounterAnimation value={completedSessions} duration={1.5} />
               </p>
             </div>
             <div className="glass-card p-4 text-center">
               <p className="text-slate-400 text-sm">Remaining</p>
               <p className="text-sky font-bold text-2xl">
                 <CounterAnimation value={totalSessions - completedSessions} duration={1.5} />
               </p>
             </div>
           </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-semibold text-white">Milestones</h3>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="relative group"
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
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
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

          <div className="space-y-2 max-h-[150px] overflow-y-auto">
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
            {milestones.filter(m => m.unlocked).length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">
                Complete sessions to unlock milestones!
              </p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-white">Session History</h3>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Flame className="w-6 h-6 text-orange-400" />
          <h3 className="text-xl font-semibold text-white">Recent Sessions</h3>
        </div>

        <div className="space-y-3 max-h-[200px] overflow-y-auto">
          {(patient.attendance || []).slice().reverse().map((record, index) => (
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
          {(patient.attendance || []).length === 0 && (
            <div className="text-center py-6 text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No sessions attended yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}