'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Activity, CheckCircle, Crown, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { User, Patient } from '@/types';

interface PatientOverviewProps {
  user: User;
  patient?: Patient | null;
  onUpgradeClick?: () => void;
  isMember?: boolean;
  isPendingApproval?: boolean;
}

export default function PatientOverview({ user, patient, onUpgradeClick, isMember, isPendingApproval }: PatientOverviewProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const completedSessions = patient?.attendance?.length || 0;
  const totalSessions = patient?.membership?.totalSessions || 10;
  const remainingSessions = patient?.membership?.remainingSessions || 5;
  const progress = totalSessions > 0 ? ((totalSessions - remainingSessions) / totalSessions) * 100 : 0;

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
          { label: 'Remaining Sessions', value: remainingSessions, icon: <Calendar className="w-6 h-6" />, color: 'blue' },
          { label: 'Exercises Assigned', value: patient?.exercises?.length || 0, icon: <Activity className="w-6 h-6" />, color: 'red' },
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
              <span className="text-slate-400">{remainingSessions} remaining</span>
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
          
          {isMember ? (
<motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="space-y-3"
             >
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                 <span className="text-slate-400">Plan</span>
                 <div className="flex items-center gap-2">
                   <Crown className="w-4 h-4 text-amber-400" />
                   <span className="text-amber-400 font-medium capitalize">{user.membershipType || 'silver'}</span>
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
                 className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer"
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
                 className="mt-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 cursor-pointer"
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
                animate={{ pulse: 2 }}
                transition={{ repeat: Infinity, duration: 2 }}
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
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
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
                className="w-full py-3 rounded-xl premium-gradient text-white font-semibold"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}