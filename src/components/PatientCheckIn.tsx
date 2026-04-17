'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, Calendar, Heart, MapPin, CheckCircle, Ticket, ArrowRight } from 'lucide-react';
import { Patient } from '@/types';
import { generateToken } from '@/lib/data';

interface PatientCheckInProps {
  onPatientRegistered: (patient: Patient) => void;
}

export default function PatientCheckIn({ onPatientRegistered }: PatientCheckInProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    address: '',
    medicalCondition: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const token = generateToken();
    setGeneratedToken(token);
    setShowSuccess(true);

    const newPatient: Patient = {
      id: Date.now().toString(),
      userId: '',
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender,
      address: formData.address || undefined,
      medicalCondition: formData.medicalCondition || undefined,
      token,
      checkInTime: new Date(),
      status: 'waiting',
      exercises: [],
      isMember: false,
      attendance: [],
    };

    setTimeout(() => {
      onPatientRegistered(newPatient);
      setIsProcessing(false);
    }, 2500);
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-card p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gradient mb-2">Patient Registration</h1>
          <p className="text-slate-400">Complete the form below to check in</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.form
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm text-slate-300 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass-input w-full pl-12"
                      placeholder="Enter your full name"
                    />
                  </div>
                </motion.div>

                <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm text-slate-300 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="glass-input w-full pl-12"
                      placeholder="Enter phone number"
                    />
                  </div>
                </motion.div>

                <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm text-slate-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="glass-input w-full pl-12"
                      placeholder="Enter email (optional)"
                    />
                  </div>
                </motion.div>

                <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm text-slate-300 mb-2">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="glass-input w-full pl-12"
                      placeholder="Enter age"
                    />
                  </div>
                </motion.div>

                <motion.div custom={4} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm text-slate-300 mb-2">Gender</label>
                  <div className="flex gap-3">
                    {(['male', 'female', 'other'] as const).map((g) => (
                      <motion.button
                        key={g}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.gender === g
                            ? 'premium-gradient text-white'
                            : 'glass-input text-slate-300'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div custom={5} variants={inputVariants} initial="hidden" animate="visible">
                  <label className="block text-sm text-slate-300 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="glass-input w-full pl-12"
                      placeholder="Enter address (optional)"
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div custom={6} variants={inputVariants} initial="hidden" animate="visible">
                <label className="block text-sm text-slate-300 mb-2">Medical Condition / Notes</label>
                <div className="relative">
                  <Heart className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <textarea
                    value={formData.medicalCondition}
                    onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
                    className="glass-input w-full pl-12 min-h-[100px] resize-none"
                    placeholder="Describe your condition or reason for visit (optional)"
                  />
                </div>
              </motion.div>

              <motion.div
                custom={7}
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                className="glass-card p-4 bg-indigo-500/10 border-indigo-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Consultation Fee</p>
                    <p className="text-slate-400 text-sm">One-time payment at check-in</p>
                  </div>
                  <p className="text-2xl font-bold text-gradient">1,000 RS</p>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-button w-full flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <span>Complete Registration & Pay</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full premium-gradient flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Registration Successful!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 mb-6"
              >
                Your digital token has been generated
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6 inline-block"
              >
                <p className="text-slate-400 text-sm mb-2">Your Token</p>
                <div className="flex items-center justify-center gap-2">
                  <Ticket className="w-6 h-6 text-primary" />
                  <p className="text-2xl font-bold text-gradient">{generatedToken}</p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-slate-500 text-sm mt-6"
              >
                Please proceed to the waiting area...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
