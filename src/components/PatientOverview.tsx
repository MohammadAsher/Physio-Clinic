'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Activity, CheckCircle, Crown, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { User, Patient } from '@/types';
import CounterAnimation from './CounterAnimation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface PatientOverviewProps {
  user: User;
  patient?: Patient | null;
  onUpgradeClick?: () => void;
  isMember?: boolean;
  isPendingApproval?: boolean;
}

export default function PatientOverview({ user, patient, onUpgradeClick, isMember, isPendingApproval }: PatientOverviewProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showExercisesModal, setShowExercisesModal] = useState(false);
  const [showSessionHistoryModal, setShowSessionHistoryModal] = useState(false);
  const [assignedExercises, setAssignedExercises] = useState<any[]>([]);
  const [assignedTherapistName, setAssignedTherapistName] = useState<string | null>(null);
  const [showTreatmentPlan, setShowTreatmentPlan] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Real-time listener for user data
  useEffect(() => {
    if (!user?.id) return;
    
    const userDocRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setAssignedExercises(data.assignedExercises || []);
        setAssignedTherapistName(data.assignedTherapistName || null);
      }
    });
    
    return () => unsubscribe();
  }, [user?.id]);

  const completedSessions = userData?.completedSessions || 0;
  const totalSessions = userData?.totalSessions || 0;
  const remainingSessions = totalSessions > 0 ? totalSessions - completedSessions : 0;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Compute plan details
  const getPlanDetails = () => {
    if (!isMember) {
      return { planColor: 'from-gray-500 to-gray-600', planName: 'No Plan' };
    }
    // isMember is true
    if (!user.totalFees) {
      // Premium Member with gold gradient
      return { planColor: 'from-amber-400 to-yellow-500', planName: 'Premium Member' };
    }
    const amount = user.totalFees;
    if (amount >= 3000 && amount <= 7000) return { planColor: 'from-slate-400 to-slate-500', planName: 'Silver' };
    if (amount > 7000 && amount <= 12000) return { planColor: 'from-amber-400 to-yellow-500', planName: 'Gold' };
    if (amount > 12000) return { planColor: 'from-blue-400 to-purple-500', planName: 'Diamond' };
    return { planColor: 'from-gray-500 to-gray-600', planName: 'Custom' };
  };

  const { planColor, planName } = getPlanDetails();

  const slideUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    },
  };

  const stats = [
    { label: 'Completed Sessions', value: completedSessions, icon: <CheckCircle className="w-6 h-6" />, color: 'red', sessionHistory: true },
    { label: 'Remaining Sessions', value: remainingSessions, icon: <Calendar className="w-6 h-6" />, color: 'blue' },
    { label: 'Exercises Assigned', value: assignedExercises.length, icon: <Activity className="w-6 h-6" />, color: 'red', clickable: true },
    { label: 'Total Progress', value: `${Math.round(progress)}%`, icon: <Clock className="w-6 h-6" />, color: 'blue', isPercentage: true },
  ];

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={slideUpVariant} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name.split(' ')[0]}!</h2>
          <p className="text-slate-400">Here's an overview of your physiotherapy journey</p>
        </div>
        {isMember && (
          <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${planColor} text-white font-bold shadow-lg`}>
            {planName} Plan
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={slideUpVariant}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (stat.sessionHistory) setShowSessionHistoryModal(true);
              else if (stat.clickable && assignedExercises.length > 0) setShowTreatmentPlan(true);
            }}
            className="premium-glass p-5 cursor-pointer hover:border-red-500/50 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color === 'red' ? 'red-gradient' : 'blue-gradient'} flex items-center justify-center text-white mb-4 shadow-lg`}>
              {stat.icon}
            </div>
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color === 'red' ? 'text-primary' : 'text-sky'}`}>
              {typeof stat.value === 'number' && !stat.isPercentage ? <CounterAnimation value={stat.value} duration={1.5} /> : stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {showTreatmentPlan && assignedExercises.length > 0 && assignedTherapistName && (
        <motion.div variants={slideUpVariant} className="premium-glass p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-sky" />
              <h2 className="text-xl font-semibold text-white">My Treatment Plan</h2>
            </div>
            <button onClick={() => setShowTreatmentPlan(false)} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-4 p-3 bg-sky-500/10 rounded-lg text-sky-400 font-semibold">
            Assigned Therapist: {assignedTherapistName}
          </div>
          <div className="space-y-3">
            {assignedExercises.map((ex, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-xs">{i + 1}</span>
                  {ex.name || ex.title}
                </h4>
                <p className="text-slate-400 text-sm mt-1">{ex.description || 'No description provided'}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={slideUpVariant} className="premium-glass p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Your Progress</h3>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full premium-gradient rounded-full" />
          </div>
          <div className="flex justify-between mt-2 text-sm text-slate-400">
            <span>{completedSessions} completed</span>
            <span>{remainingSessions} remaining</span>
          </div>
        </motion.div>

        <motion.div
          variants={slideUpVariant}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02 }}
           className="premium-glass backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
        >
          {/* Animated gradient background pulse */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50 animate-pulse" />
          <h3 className="text-xl font-semibold text-white mb-4 relative z-10">Membership Status</h3>
          {isMember ? (
            <div className="space-y-4 relative z-10">
              {/* Plan Badge - Floating Glass Pill */}
              <div className="flex justify-center">
                <div className={`px-6 py-2 rounded-full bg-gradient-to-r ${planName === 'Silver' ? 'from-slate-400 to-slate-500' : planName === 'Gold' ? 'from-amber-400 to-yellow-500' : planName === 'Diamond' ? 'from-blue-400 to-purple-500' : 'from-amber-400 to-yellow-500'} text-white font-bold shadow-lg flex items-center gap-2`}>
                  <Crown className="w-4 h-4" />
                  <span>{planName}</span>
                </div>
              </div>
              
              {/* QR Code with white container and glow */}
              <div onClick={() => setShowQRModal(true)} className="flex justify-center cursor-pointer">
                <div className="bg-white rounded-2xl p-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <QRCodeSVG value={user.id} size={120} />
                </div>
              </div>
              
              {/* Additional Info Row */}
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400">Total Fees</span>
                <span className="text-white font-medium">{user.totalFees ? `PKR ${user.totalFees.toLocaleString()}` : 'Premium Member'}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 relative z-10">
              <p className="text-slate-400 mb-4">{isPendingApproval ? 'Approval Pending...' : 'Not a member yet'}</p>
              {!isPendingApproval && <button onClick={onUpgradeClick} className="glass-button blue">Upgrade Now</button>}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass-card p-8 max-w-sm w-full text-center relative">
              <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4"><X className="text-slate-400" /></button>
              <h2 className="text-xl font-bold text-white mb-4">Membership QR</h2>
              <div className="bg-white p-4 inline-block rounded-xl mb-4"><QRCodeSVG value={user.id} size={200} /></div>
              <button onClick={() => setShowQRModal(false)} className="w-full py-3 premium-gradient rounded-xl font-bold">Close</button>
            </motion.div>
          </div>
        )}

        {showSessionHistoryModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="w-full max-w-lg bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Session History</h2>
                <button onClick={() => setShowSessionHistoryModal(false)}><X className="text-slate-400" /></button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {userData?.activityLog?.filter((l:any) => l.type === 'session_completed').map((log:any, i:number) => (
                  <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between">
                    <div><p className="text-white font-medium">Session {log.sessionNumber}</p><p className="text-slate-400 text-xs">{log.therapistName}</p></div>
                    <p className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleDateString()}</p>
                  </div>
                )) || <p className="text-center text-slate-500">No sessions yet</p>}
              </div>
              <button onClick={() => setShowSessionHistoryModal(false)} className="w-full mt-6 py-3 premium-gradient rounded-xl">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}