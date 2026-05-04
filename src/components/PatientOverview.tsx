'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Activity, CheckCircle, Crown, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { User, Patient } from '@/types';
import CounterAnimation from './CounterAnimation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import PrescriptionPDF from './PrescriptionPDF';

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
  
  // Smart Session Warning - Show luxury toast when 2 or fewer sessions remain
  const showSessionWarning = isMember && remainingSessions > 0 && remainingSessions <= 2;

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

     {/* Enhanced Message Carousel */}
     const [messageIndex, setMessageIndex] = useState(0);
     const messages = [
       'Verifying your details...',
       'Assigning your specialist...',
       'Preparing your premium profile...',
       'Almost there, just a moment...'
     ];
     
     useEffect(() => {
       if (isPendingApproval) {
         const interval = setInterval(() => {
           setMessageIndex(prev => (prev + 1) % messages.length);
         }, 2500);
         return () => clearInterval(interval);
       }
     }, [isPendingApproval]);

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={slideUpVariant} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name.split(' ')[0]}!</h2>
          <p className="text-slate-400">Here's an overview of your physiotherapy journey</p>
        </div>
        {isMember && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-xl bg-gradient-to-r ${planColor} text-white font-bold shadow-lg flex items-center gap-2`}
          >
            <Crown className="w-4 h-4" />
            {planName} Plan
          </motion.div>
        )}
      </motion.div>

      {/* Smart Session Warning - Luxury Toast Alert */}
      <AnimatePresence>
        {showSessionWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="premium-glass relative overflow-hidden rounded-2xl border border-amber-500/30"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 40px rgba(245, 158, 11, 0.15), inset 0 0 20px rgba(245, 158, 11, 0.05)'
            }}
          >
            {/* Animated glowing border */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute -inset-px bg-gradient-to-r from-amber-500/40 to-yellow-500/40 rounded-2xl blur-sm"
            />
            
            {/* Decorative corner accents */}
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            
            <div className="relative z-10 p-6">
              <div className="flex items-start gap-4">
                {/* Animated warning icon */}
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: 'easeInOut'
                  }}
                  className="relative flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-lg opacity-50 animate-pulse" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </motion.div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">Limited Sessions Remaining</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                      {remainingSessions} {remainingSessions === 1 ? 'session' : 'sessions'} left
                    </span>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                    Your wellness journey is just getting started! Only <span className="text-yellow-400 font-semibold">{remainingSessions}</span> session{remainingSessions > 1 ? 's' : ''} remaining. Renew your membership now to stay on track and maintain your progress.
                  </p>
                  
                  {/* Progress indicator */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Sessions completed: {completedSessions}</span>
                      <span>Total: {totalSessions}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      // Scroll to membership section or trigger upgrade
                      const membershipSection = document.querySelector('.membership-section');
                      if (membershipSection) {
                        membershipSection.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        onUpgradeClick?.();
                      }
                    }}
                    className="w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Renew Membership Now
                    </span>
                  </motion.button>
                  
                  {/* Subtle decorative elements */}
                  <div className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500/10 to-amber-500/10 blur-2xl" />
                  <div className="absolute -top-2 -left-2 w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500/10 to-amber-500/10 blur-2xl" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowTreatmentPlan(false)} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4 text-slate-400" />
            </motion.button>
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

      {/* Prescription Download Section */}
      {(user as any).prescription && (
        <motion.div variants={slideUpVariant} className="premium-glass p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Treatment Prescription</h3>
          </div>
          <PrescriptionPDF
            patientName={user.name}
            doctorName={(user as any).assignedDoctorName?.replace('Dr. ', '') || 'Doctor'}
            date={new Date().toLocaleDateString()}
            diagnosis={(user as any).prescription?.diagnosis || 'General physiotherapy'}
            exercises={(user as any).prescription?.exercises || []}
            notes={(user as any).prescription?.notes || ''}
          />
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

        {/* ENHANCED MEMBERSHIP CARD - Premium Glass with Shimmer & Glow */}
        <motion.div
          variants={slideUpVariant}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-[12px] border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)]"
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(12px)'
          }}
        >
          {/* Shimmering golden gradient overlay */}
          {isMember && (
            <motion.div
              animate={{
                background: [
                  'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3), transparent)',
                  'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3), transparent)',
                  'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3), transparent)'
                ],
                backgroundPosition: ['-200% 0', '200% 0', '-200% 0'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute inset-0 opacity-20"
            />
          )}
          
          <h3 className="text-xl font-semibold text-white mb-4 relative z-10">Membership Status</h3>
          
          {isMember ? (
            <div className="relative z-10 space-y-4">
              {/* Plan Badge - Floating Glass with Shimmer */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex justify-center"
              >
                <div className={`px-6 py-3 rounded-full bg-gradient-to-r ${planColor} text-white font-bold shadow-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30 animate-pulse" />
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    <span className="relative z-10">{planName}</span>
                  </div>
                </div>
              </motion.div>
              
              {/* ENHANCED QR CODE with Cyan Glow */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex justify-center cursor-pointer"
                onClick={() => setShowQRModal(true)}
              >
                <div className="relative p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                  {/* Cyan glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl blur-lg opacity-50 animate-pulse" />
                  <div className="relative bg-white p-3 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <QRCodeSVG value={user.id} size={100} />
                  </div>
                </div>
              </motion.div>
              
              {/* Additional Info Row */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10"
              >
                <span className="text-slate-400">Total Fees</span>
                <span className="text-white font-medium bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  {user.totalFees ? `PKR ${user.totalFees.toLocaleString()}` : 'Premium Member'}
                </span>
              </motion.div>
            </div>
          ) : (
            <motion.div 
              className="text-center py-4 relative z-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              {/* Enhanced Approval Pending State */}
              {isPendingApproval ? (
                <motion.div
                  variants={slideUpVariant}
                  className="premium-glass relative overflow-hidden rounded-2xl p-6 border-2"
                  style={{
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="absolute -inset-px bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-2xl blur-sm"
                  />
                  
                  <div className="relative z-10 flex flex-col items-center text-center py-4">
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      className="relative mb-4"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/50 to-yellow-500/50 rounded-full blur-xl animate-pulse" />
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                        <div className="w-7 h-7 text-white">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                          </svg>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/40 to-yellow-500/40 rounded-full blur-md opacity-75 animate-pulse" />
                      <div className="relative px-5 py-2 rounded-full bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.1),_0_0_30px_rgba(245,158,11,0.2)]">
                        <span className="text-sm font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent uppercase tracking-wider">
                          ⚡ Approval Pending
                        </span>
                      </div>
                    </motion.div>

                    <div className="relative h-12 my-3 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={messages[messageIndex]}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 flex flex-col items-center justify-center"
                        >
                          <p className="text-slate-400 text-xs mb-1">{messages[messageIndex]}</p>
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  opacity: [0.3, 1, 0.3],
                                  y: [0, -2, 0]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                  ease: 'easeInOut'
                                }}
                                className="w-1 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                              />
                            ))}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <p className="text-xs text-slate-500">Estimated: 1-2 hours</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button onClick={onUpgradeClick} className="w-full premium-gradient text-white rounded-xl py-3 font-bold hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all">
                    Upgrade Now
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 max-w-sm w-full text-center relative">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 p-1"><X className="w-5 h-5 text-slate-400" /></motion.button>
              <h2 className="text-xl font-bold text-white mb-4">Membership QR Code</h2>
              <div className="bg-white p-4 inline-block rounded-2xl mb-4 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                <QRCodeSVG value={user.id} size={200} />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowQRModal(false)} className="w-full py-3 premium-gradient rounded-xl font-bold">Close</motion.button>
            </motion.div>
          </div>
        )}

        {showSessionHistoryModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-lg bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Session History</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowSessionHistoryModal(false)}><X className="w-5 h-5 text-slate-400" /></motion.button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {userData?.activityLog?.filter((l:any) => l.type === 'session_completed').map((log:any, i:number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between">
                    <div><p className="text-white font-medium">Session {log.sessionNumber}</p><p className="text-slate-400 text-xs">{log.therapistName}</p></div>
                    <p className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleDateString()}</p>
                  </motion.div>
                )) || <p className="text-center text-slate-500">No sessions yet</p>}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowSessionHistoryModal(false)} className="w-full mt-6 py-3 premium-gradient rounded-xl">Close</motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}