'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Activity, CheckCircle, ChevronRight, X, UserPlus } from 'lucide-react';
import { Patient, Exercise, User } from '@/types';
import { EXERCISES } from '@/lib/data';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface DoctorDashboardProps {
  patients: Patient[];
  onUpdatePatient: (patient: Patient) => void;
  currentDoctor?: User;
}

interface DoctorDashboardProps {
  patients: Patient[];
  onUpdatePatient: (patient: Patient) => void;
}

export default function DoctorDashboard({ patients, onUpdatePatient, currentDoctor }: DoctorDashboardProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    education: currentDoctor?.doctorProfile?.education || '',
    experience: currentDoctor?.doctorProfile?.experience || '',
    specialization: currentDoctor?.doctorProfile?.specialization || '',
    timings: currentDoctor?.doctorProfile?.timings || '9:00 AM - 5:00 PM',
  });
  const [availableDays, setAvailableDays] = useState<string[]>(currentDoctor?.doctorProfile?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  const isProfileComplete = currentDoctor?.profileCompleted && currentDoctor?.doctorProfile?.education;

  const handleSaveProfile = async () => {
    if (!currentDoctor?.id) return;
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', currentDoctor.id), {
        profileCompleted: true,
        doctorProfile: {
          education: profileData.education,
          experience: profileData.experience,
          specialization: profileData.specialization,
          availableDays,
          timings: profileData.timings,
        },
      });
      setShowProfileModal(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
    setSavingProfile(false);
  };

  const waitingPatients = patients.filter(p => p.status === 'waiting');
  const consultingPatients = patients.filter(p => p.status === 'consulting');

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedExercises((patient as any).exercises || []);
  };

  const handleStartConsultation = () => {
    if (!selectedPatient) return;
    const updated = { ...selectedPatient, status: 'consulting' as const };
    onUpdatePatient(updated);
    setShowExerciseModal(true);
  };

  const handleCompleteConsultation = () => {
    if (!selectedPatient) return;
    const updated = { 
      ...selectedPatient, 
      status: 'completed' as const,
      exercises: selectedExercises 
    };
    onUpdatePatient(updated as any);
    setSelectedPatient(null);
    setShowExerciseModal(false);
  };

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id);
      if (exists) {
        return prev.filter(e => e.id !== exercise.id);
      }
      return [...prev, exercise];
    });
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
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
      className="w-full"
    >
      <motion.div
        variants={slideUpVariant}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gradient mb-2">Doctor Dashboard</h1>
        <p className="text-slate-400">Manage consultations and assign exercises</p>
      </motion.div>

      {!isProfileComplete && (
        <motion.button
          variants={slideUpVariant}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowProfileModal(true)}
          className="w-full mb-6 px-6 py-4 rounded-xl premium-gradient text-white font-semibold flex items-center justify-center gap-3 shadow-lg shadow-crimson-intense"
        >
          <UserPlus className="w-5 h-5" />
          <span>Complete Your Profile</span>
        </motion.button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          variants={staggerContainer}
          className="premium-glass p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Waiting List</h2>
              <p className="text-slate-400 text-sm">{waitingPatients.length} patients waiting</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            <AnimatePresence>
              {waitingPatients.map((patient) => (
                <motion.div
                  key={patient.id}
                  variants={slideUpVariant}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectPatient(patient)}
                  className={`premium-glass p-4 cursor-pointer ${
                    selectedPatient?.id === patient.id 
                      ? 'ring-2 ring-primary bg-primary/20' 
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{patient.name}</p>
                      <p className="text-slate-400 text-sm">Token: {patient.token}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(patient.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {waitingPatients.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No patients in waiting list
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="premium-glass p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Current Consultation</h2>
              <p className="text-slate-400 text-sm">{consultingPatients.length} in progress</p>
            </div>
          </div>

          {selectedPatient ? (
            <motion.div
              variants={slideUpVariant}
              className="space-y-4"
            >
              <div className="premium-glass p-4 bg-primary/10 border-primary/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-semibold text-lg">{selectedPatient.name}</p>
                    <p className="text-slate-400 text-sm">Token: {selectedPatient.token}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                
                {(selectedPatient as any).medicalCondition && (
                  <div className="mb-4">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Condition</p>
                    <p className="text-slate-300 text-sm">{(selectedPatient as any).medicalCondition}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Assigned Exercises</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercises.length > 0 ? (
                      selectedExercises.map(ex => (
                        <span key={ex.id} className="px-3 py-1 rounded-full bg-primary/20 text-primary-light text-sm">
                          {ex.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm italic">No exercises assigned yet</p>
                    )}
                  </div>
                </div>
              </div>

              {!showExerciseModal ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartConsultation}
                  className="glass-button w-full flex items-center justify-center gap-2"
                >
                  <span>Start Consultation & Assign Exercises</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCompleteConsultation}
                  className="glass-button w-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Complete Consultation</span>
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a patient from the waiting list</p>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showExerciseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="premium-glass p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Assign Exercises</h2>
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXERCISES.map((exercise) => {
                  const isSelected = selectedExercises.some(e => e.id === exercise.id);
                  return (
                    <motion.div
                      key={exercise.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleExercise(exercise)}
                      className={`premium-glass p-4 cursor-pointer ${
                        isSelected ? 'ring-2 ring-primary bg-primary/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium">{exercise.name}</p>
                          <p className="text-slate-400 text-sm">{exercise.description}</p>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />}
                      </div>
                      <div className="mt-3 flex gap-4 text-slate-500 text-sm">
                        <span>{exercise.duration} min</span>
                        {exercise.sets && <span>{exercise.sets} sets</span>}
                        {exercise.reps && <span>{exercise.reps} reps</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div className="mt-6 p-4 premium-glass bg-primary/10 border-primary/30">
                <p className="text-slate-300">
                  <span className="text-primary font-medium">{selectedExercises.length}</span> exercises selected
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="premium-glass p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Complete Your Profile</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Education</label>
                  <input
                    type="text"
                    value={profileData.education}
                    onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                    placeholder="e.g., PhD in Physical Therapy"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Experience</label>
                  <input
                    type="text"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                    placeholder="e.g., 10 years"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Specialization</label>
                  <input
                    type="text"
                    value={profileData.specialization}
                    onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                    placeholder="e.g., Sports Rehabilitation"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Timings</label>
                  <input
                    type="text"
                    value={profileData.timings}
                    onChange={(e) => setProfileData({ ...profileData, timings: e.target.value })}
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <button
                        key={day}
                        onClick={() => {
                          setAvailableDays(prev =>
                            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                          );
                        }}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          availableDays.includes(day)
                            ? 'bg-primary text-white'
                            : 'bg-white/10 text-slate-400 hover:bg-white/20'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={savingProfile || !profileData.education || !profileData.specialization}
                className="w-full mt-6 py-3 rounded-xl premium-gradient text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-crimson-intense"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}