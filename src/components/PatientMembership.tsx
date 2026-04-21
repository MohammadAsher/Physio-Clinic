'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Crown, QrCode, Sparkles, CreditCard, X } from 'lucide-react';
import { Patient, Membership } from '@/types';
import { generateQRCode } from '@/lib/data';

interface PatientMembershipProps {
  patient: Patient | null;
}

const membershipTypes = {
  silver: { sessions: 12, price: 10000, name: 'Silver', color: 'from-gray-400 to-gray-600', features: ['12 Sessions', 'Basic Exercises', 'Email Support'] },
  gold: { sessions: 24, price: 18000, name: 'Gold', color: 'from-yellow-400 to-yellow-600', features: ['24 Sessions', 'Premium Exercises', 'Priority Support', 'Free T-Shirt'] },
  platinum: { sessions: 36, price: 25000, name: 'Platinum', color: 'from-purple-400 to-purple-600', features: ['Unlimited Sessions', 'Personal Trainer', '24/7 Support', 'VIP Lounge Access'] },
  custom: { sessions: 0, price: 0, name: 'Custom', color: 'from-blue-500 to-red-500', features: [] },
};

export default function PatientMembership({ patient }: PatientMembershipProps) {
  const [selectedType, setSelectedType] = useState<'silver' | 'gold' | 'platinum'>('silver');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!patient?.isMember) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">Membership</h2>
          <p className="text-slate-400">Upgrade to unlock premium features and track your progress</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {(Object.keys(membershipTypes) as Array<'silver' | 'gold' | 'platinum'>).map((type) => (
            <motion.div
              key={type}
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass-card p-5 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${membershipTypes[type].color} flex items-center justify-center mb-4`}>
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">{membershipTypes[type].name}</h3>
              <p className="text-gradient text-2xl font-bold mb-4">{membershipTypes[type].price.toLocaleString()} RS</p>
              <div className="space-y-2">
                {membershipTypes[type].features.map((feature, i) => (
                  <p key={i} className="text-slate-400 text-sm flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    {feature}
                  </p>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedType(type);
                  setShowUpgrade(true);
                }}
                className="glass-button w-full mt-6"
              >
                Choose Plan
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Confirm Upgrade</h3>
                <button onClick={() => setShowUpgrade(false)} className="p-2 hover:bg-white/10 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="text-center mb-6">
                <p className="text-slate-400 mb-2">You're upgrading to</p>
                <p className="text-2xl font-bold text-gradient">{membershipTypes[selectedType].name}</p>
                <p className="text-3xl font-bold text-white mt-2">{membershipTypes[selectedType].price.toLocaleString()} RS</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isUpgrading}
                onClick={() => setIsUpgrading(true)}
                className="glass-button w-full flex items-center justify-center gap-2"
              >
                {isUpgrading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay & Upgrade</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  }

  const membership = patient.membership!;
  const progress = ((membership.totalSessions - membership.remainingSessions) / membership.totalSessions) * 100;
  const isCustom = !!patient?.totalFees || membership.type === 'custom';
  const planDisplay = isCustom
    ? `Custom (${patient.totalFees?.toLocaleString()} PKR)`
    : `${membershipTypes[membership.type as keyof typeof membershipTypes].name} Member`;
  const gradientClass = `bg-gradient-to-br ${membershipTypes[membership.type as keyof typeof membershipTypes].color}`;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Your Membership</h2>
        <p className="text-slate-400">View your digital access card and membership details</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY }}
          className="relative"
        >
          <div className={`glass-card p-6 ${gradientClass} relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-white" />
                  <span className="text-white font-semibold text-lg">{planDisplay}</span>
                </div>
                <Sparkles className="w-6 h-6 text-white/80" />
              </div>

              <div className="mb-6">
                <p className="text-white/80 text-sm mb-1">Patient</p>
                <div className="flex items-center gap-3">
                  {(patient.avatar || patient.profilePicture) && (
                    <img
                      src={patient.avatar || patient.profilePicture}
                      alt={patient.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    />
                  )}
                  <p className="text-white font-semibold text-lg">{patient.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white/80 text-sm">Sessions Remaining</p>
                  <p className="text-white font-bold text-3xl">{membership.remainingSessions}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">Total Sessions</p>
                  <p className="text-white font-semibold text-lg">{membership.totalSessions}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
                <p className="text-white/80 text-xs mt-2">{Math.round(progress)}% completed</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                <QrCode className="w-8 h-8 text-white" />
                <div className="flex-1">
                  <p className="text-white text-xs">Digital Access Card</p>
                  <p className="text-white/80 text-xs truncate">{membership.qrCode}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Membership Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span className="text-slate-400">Plan Type</span>
              <span className="text-white font-medium capitalize">{membership.type}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span className="text-slate-400">Start Date</span>
              <span className="text-white font-medium">
                {new Date(membership.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span className="text-slate-400">Sessions Attended</span>
              <span className="text-primary font-medium">{patient.attendance?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span className="text-slate-400">Sessions Remaining</span>
              <span className="text-sky font-medium">{membership.remainingSessions}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}