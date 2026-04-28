'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Activity, CheckCircle, Crown, X, FileText, Upload, Image } from 'lucide-react';
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
  const [assignedExercises, setAssignedExercises] = useState<any[]>([]);
  const [assignedTherapistName, setAssignedTherapistName] = useState<string | null>(null);

   const [userData, setUserData] = useState<any>(null);

  // Real-time listener for user data to get session counts and assigned exercises
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
  
   const prescribedExercises = userData?.prescribedExercises || [];
     
   const membershipAmount = user.totalFees || 0;

   // Compute plan color and name
   const getPlanDetails = () => {
     if (!isMember || !user.totalFees) {
       return { planColor: 'from-gray-500 to-gray-600', planName: 'No Plan' };
     }
     const amount = user.totalFees;
     if (amount >= 3000 && amount <= 7000) {
       return { planColor: 'from-slate-400 to-slate-500', planName: 'Silver' };
     } else if (amount > 7000 && amount <= 12000) {
       return { planColor: 'from-amber-400 to-yellow-500', planName: 'Gold' };
     } else if (amount > 12000) {
       return { planColor: 'from-blue-400 to-purple-500', planName: 'Diamond' };
     }
     return { planColor: 'from-gray-500 to-gray-600', planName: 'Custom' };
   };

   const { planColor, planName } = getPlanDetails();

   const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const slideUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }
    },
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={slideUpVariant}
        className="flex items-center justify-between"
      >
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
        {[  
          { label: 'Completed Sessions', value: completedSessions, icon: <CheckCircle className="w-6 h-6" />, color: 'red' },
          { label: 'Remaining Sessions', value: remainingSessions, icon: <Calendar className="w-6 h-6" />, color: 'blue' },
           { label: 'Exercises Assigned', value: assignedExercises.length, icon: <Activity className="w-6 h-6" />, color: 'red', clickable: true },
          { 
            label: 'Total Progress', 
            value: `${Math.round(progress)}%`, 
            icon: <Clock className="w-6 h-6" />, 
            color: 'blue',
            isPercentage: true 
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={slideUpVariant}
             whileHover={{ scale: assignedExercises.length > 0 ? 1.02 : 1, y: assignedExercises.length > 0 ? -4 : 0 }}
             whileTap={{ scale: assignedExercises.length > 0 ? 0.98 : 1 }}
             onClick={() => {
               if (assignedExercises.length > 0) {
                 setShowExercisesModal(true);
               } else {
                 const planSection = document.getElementById('treatment-plan');
                 if (planSection) {
                   planSection.scrollIntoView({ behavior: 'smooth' });
                 }
               }
             }}
             className={`premium-glass p-5 cursor-pointer ${assignedExercises.length > 0 ? 'hover:border-red-500/50 hover:shadow-red-500/10' : ''}`}
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color === 'red' ? 'red-gradient' : 'blue-gradient'} flex items-center justify-center text-white mb-4 shadow-lg`}>
              {stat.icon}
            </div>
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color === 'red' ? 'text-primary' : 'text-sky'}`}>
              {typeof stat.value === 'number' && !stat.isPercentage ? (
                <CounterAnimation value={stat.value} duration={1.5} />
              ) : (
                stat.value
              )}
            </p>
          </motion.div>
        ))}
      </div>

       {/* My Treatment Plan Section */}
       {assignedExercises.length > 0 && assignedTherapistName && (
         <motion.div
           variants={slideUpVariant}
           className="premium-glass p-6"
         >
           <div className="flex items-center gap-3 mb-6">
             <Activity className="w-6 h-6 text-sky" />
             <h2 className="text-xl font-semibold text-white">My Treatment Plan</h2>
           </div>
           
           <div className="flex items-center gap-2 mb-4 p-3 bg-sky-500/10 rounded-lg">
             <span className="text-slate-400">Assigned Therapist:</span>
             <span className="text-sky-400 font-semibold">{assignedTherapistName}</span>
           </div>
 
           <div className="space-y-3">
             {assignedExercises.map((exercise, index) => (
               <motion.div
                 key={index}
                 variants={slideUpVariant}
                 className="p-4 bg-white/5 rounded-xl border border-white/5"
               >
                 <div className="flex items-start justify-between">
                   <div className="flex-1">
                     <h4 className="text-white font-semibold flex items-center gap-2">
                       <span className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-xs text-sky-400">
                         {index + 1}
                       </span>
                       {exercise.name || exercise.title || 'Exercise'}
                     </h4>
                     <p className="text-slate-400 text-sm mt-1">
                       {exercise.description || exercise.instructions || 'No description'}
                     </p>
                   </div>
                 </div>
 
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700">
                   {exercise.duration && (
                     <div className="text-center">
                       <p className="text-slate-400 text-xs">Duration</p>
                       <p className="text-white font-semibold text-sm">{exercise.duration} mins</p>
                     </div>
                   )}
                   {exercise.sets && (
                     <div className="text-center">
                       <p className="text-slate-400 text-xs">Sets</p>
                       <p className="text-white font-semibold text-sm">{exercise.sets}</p>
                     </div>
                   )}
                   {exercise.reps && (
                     <div className="text-center">
                       <p className="text-slate-400 text-xs">Reps</p>
                       <p className="text-white font-semibold text-sm">{exercise.reps}</p>
                     </div>
                   )}
                   {exercise.frequency && (
                     <div className="text-center">
                       <p className="text-slate-400 text-xs">Frequency</p>
                       <p className="text-white font-semibold text-sm">{exercise.frequency}</p>
                     </div>
                   )}
                 </div>
               </motion.div>
             ))}
           </div>
         </motion.div>
       )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={slideUpVariant}
          className="premium-glass p-6"
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
              <span className="text-slate-400">{remainingSessions} remaining</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={slideUpVariant}
          className="premium-glass p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Membership Status</h3>
          
          {isMember ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400">Plan</span>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-gold" />
                  <span className="text-gold font-medium">
                    {user.totalFees ? `Custom (${user.totalFees.toLocaleString()} PKR)` : (user.membershipType ? user.membershipType.charAt(0).toUpperCase() + user.membershipType.slice(1) : 'None')}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400">Valid Since</span>
                <span className="text-white font-medium">
                  {user.membershipRequestDate ? new Date(user.membershipRequestDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowQRModal(true)}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:shadow-crimson-glow transition-all"
              >
                <span className="text-slate-400">QR Code</span>
                <div className="flex items-center gap-2">
                  <QRCodeSVG value={user.id} className="w-5 h-5 text-primary" />
                  <span className="text-primary text-sm font-mono">{user.id.substring(0, 8)}</span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowQRModal(true)}
                className="mt-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 cursor-pointer hover:shadow-crimson-glow transition-all"
              >
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center">
                    <QRCodeSVG value={user.id} className="w-full h-full" />
                  </div>
                </div>
                <p className="text-center text-xs text-slate-400 mt-2">Scan to mark attendance</p>
              </motion.div>
            </motion.div>
          ) : isPendingApproval ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ scale: [1, 1.1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center"
              >
                <Clock className="w-8 h-8 text-amber-500" />
              </motion.div>
              <p className="text-amber-400 font-semibold mb-2">Pending Approval</p>
              <p className="text-slate-400 text-sm">Your membership request is being reviewed.</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">You're not a member yet</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onUpgradeClick}
                className="glass-button blue"
              >
                Upgrade to Member
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="glass-card p-8 max-w-sm w-full text-center"
            >
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
              
              <h2 className="text-xl font-semibold text-white mb-4">Membership QR Code</h2>
              
              <div className="bg-white rounded-2xl p-6 inline-block mb-4">
                <QRCodeSVG value={user.id} size={200} />
              </div>
              
              <p className="text-slate-300 text-sm mb-4">
                Present this QR to Clinic Reception for Attendance
              </p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowQRModal(false)}
                className="w-full py-3 rounded-xl premium-gradient text-white font-semibold hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)]"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Exercises Modal */}
        <AnimatePresence>
          {showExercisesModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">My Exercises</h2>
                  <button
                    onClick={() => setShowExercisesModal(false)}
                    className="p-2 hover:bg-white/10 hover:scale-[1.02] hover:shadow-crimson-glow rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {assignedExercises.length > 0 ? (
                  <div className="space-y-4">
                    {assignedExercises.map((exercise, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white/5 rounded-xl border border-white/5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-crimson-700 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <h3 className="text-lg font-semibold text-white">
                              {exercise.name || exercise.title || 'Exercise'}
                            </h3>
                          </div>
                        </div>
                        
                        <p className="text-slate-400 text-sm mb-4 pl-10">
                          {exercise.description || exercise.instructions || 'No description'}
                        </p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pl-10">
                          {exercise.sets && (
                            <div className="text-center">
                              <p className="text-slate-400 text-xs">Sets</p>
                              <p className="text-primary font-bold text-sm">{exercise.sets}</p>
                            </div>
                          )}
                          {exercise.reps && (
                            <div className="text-center">
                              <p className="text-slate-400 text-xs">Reps</p>
                              <p className="text-primary font-bold text-sm">{exercise.reps}</p>
                            </div>
                          )}
                          {exercise.frequency && (
                            <div className="text-center">
                              <p className="text-slate-400 text-xs">Frequency</p>
                              <p className="text-sky font-bold text-sm">{exercise.frequency}</p>
                            </div>
                          )}
                          {exercise.duration && (
                            <div className="text-center">
                              <p className="text-slate-400 text-xs">Duration</p>
                              <p className="text-sky font-bold text-sm">{exercise.duration} min</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm">No exercises assigned yet</p>
                    <p className="text-slate-500 text-xs mt-2">Contact your therapist to get started</p>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowExercisesModal(false)}
                  className="w-full mt-6 py-3 rounded-xl premium-gradient text-white font-semibold hover:shadow-crimson-intense transition-all"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
           )}
        </AnimatePresence>
    </motion.div>
  );
}

