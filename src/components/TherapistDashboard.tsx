'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, ArrowRight, CheckCircle, Clock, Dumbbell, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { User, Patient } from '@/types';
import { useAuth } from '@/context/AuthContext';
import RoleBasedQuotes from './RoleBasedQuotes';

interface TherapistDashboardProps {
  user: User;
}

interface PatientWithExercises extends Patient {
  userId: string;
  assignedTherapistId: string;
  assignedTherapistName: string;
  completedSessions?: number;
  totalSessions?: number;
  assignedExercises?: any[];
  prescription?: string;
}

export default function TherapistDashboard({ user }: TherapistDashboardProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<PatientWithExercises[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithExercises | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completingSession, setCompletingSession] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [confirmPatient, setConfirmPatient] = useState<PatientWithExercises | null>(null);

  // Fetch patients assigned to this therapist in real-time
  useEffect(() => {
    if (!user?.id) return;
    
    const patientsQuery = query(
      collection(db, 'users'),
      where('assignedTherapistId', '==', user.id),
      where('role', '==', 'patient')
    );

    const unsubscribe = onSnapshot(patientsQuery, (snapshot) => {
       const fetchedPatients: PatientWithExercises[] = snapshot.docs.map(doc => {
         const data = doc.data();
         return {
           id: doc.id,
           userId: doc.id,
           name: data.name || '',
           phone: data.phone || '',
           email: data.email || '',
           age: data.age,
           gender: data.gender,
           status: data.status || 'waiting',
           checkInTime: data.checkInTime || null,
           token: data.token || null,
           isMember: data.isMember || false,
           membershipStatus: data.membershipStatus || '',
           assignedDoctorId: data.assignedDoctorId,
           assignedDoctorName: data.assignedDoctorName,
           assignedTherapistId: data.assignedTherapistId,
           assignedTherapistName: data.assignedTherapistName,
           assignedExercises: data.assignedExercises || data.prescribedExercises || [],
           prescription: data.prescription || '',
           lastUpdated: data.lastUpdated?.toDate() || null,
           totalSessions: data.totalSessions || 0,
           completedSessions: data.completedSessions || 0,
           remainingSessions: data.remainingSessions || 0,
         };
       });
      setPatients(fetchedPatients);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Show toast message
  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // Handle complete session with increment
  const handleCompleteSession = async (patient: PatientWithExercises) => {
    if (!patient.id) return;
    
    const confirmed = window.confirm(
      `Are you sure the session is complete for ${patient.name}?\n\n` +
      `This will increment completed sessions from ${patient.completedSessions} to ${(patient.completedSessions || 0) + 1}.`
    );

    if (!confirmed) return;

    setCompletingSession(patient.id);

    try {
      // Calculate new remaining sessions
      const newCompleted = (patient.completedSessions || 0) + 1;
      const newTotal = patient.totalSessions || 0;
      const newRemaining = Math.max(0, newTotal - newCompleted);

      // Update patient document with increment and activity log
      const patientRef = doc(db, 'users', patient.id);
      await updateDoc(patientRef, {
        completedSessions: newCompleted,
        remainingSessions: newRemaining,
        lastUpdated: serverTimestamp(),
        // Add activity log entry
        activityLog: arrayUnion({
          type: 'session_completed',
          therapistId: user?.id,
          therapistName: user?.name,
          timestamp: new Date().toISOString(),
          sessionNumber: newCompleted,
          totalSessions: newTotal,
          message: `Session ${newCompleted} completed by ${user?.name}`
        })
      });

      showToast('Session Marked as Completed');
      setConfirmPatient(null);
    } catch (err) {
      console.error('Error completing session:', err);
      showToast('Failed to record session. Please try again.');
    } finally {
      setCompletingSession(null);
    }
  };

  const hasExercises = (patient: PatientWithExercises) => {
    return patient.assignedExercises && patient.assignedExercises.length > 0;
  };

  const getRemainingSessions = (patient: PatientWithExercises) => {
    const total = patient.totalSessions || 0;
    const completed = patient.completedSessions || 0;
    return Math.max(0, total - completed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 px-6 py-3 rounded-xl bg-emerald-500/90 text-white font-semibold shadow-lg shadow-emerald-900/30 backdrop-blur-xl flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmPatient(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Confirm Session Complete</h3>
                <p className="text-slate-400 mb-4">
                  Mark session as complete for <span className="text-white font-semibold">{confirmPatient.name}</span>?
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  Current progress: {confirmPatient.completedSessions || 0} / {confirmPatient.totalSessions || 0} sessions
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmPatient(null)}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleCompleteSession(confirmPatient);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-900/30"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-sky-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Therapist Portal</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-slate-400 text-sm">Welcome back</p>
              <p className="text-white font-semibold">{user.name}</p>
            </div>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Assigned Patients</p>
                <p className="text-3xl font-bold text-white">{patients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">With Exercise Plans</p>
                <p className="text-3xl font-bold text-white">
                  {patients.filter(p => hasExercises(p)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Awaiting Plans</p>
                <p className="text-3xl font-bold text-white">
                  {patients.filter(p => !hasExercises(p)).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Role-Based Quotes Section */}
        <div className="py-6">
          <RoleBasedQuotes role="therapist" />
        </div>

        {/* Patient List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                Assigned Patients
              </h2>
            </div>

            {patients.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                  <Users className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400">No patients assigned to you yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                <AnimatePresence>
                  {patients.map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border-2 border-rose-400/60">
                            {patient.profilePicture ? (
                              <img
                                src={patient.profilePicture}
                                alt={patient.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sky-400 font-semibold">
                                {patient.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{patient.name}</h3>
                            <p className="text-slate-400 text-sm">{patient.email || patient.phone || 'No contact info'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3">
                            {patient.assignedExercises && patient.assignedExercises.length > 0 ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                {patient.assignedExercises.length} Exercises
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400">
                                No Plan
                              </span>
                            )}
                            
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                              {patient.completedSessions || 0}/{patient.totalSessions || 0} Sessions
                            </span>
                            
                            {getRemainingSessions(patient) > 0 && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 animate-pulse">
                                Upcoming
                              </span>
                            )}
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatient(patient);
                            }}
                            className="px-4 py-2 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            View Plan
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmPatient(patient);
                            }}
                            disabled={completingSession === patient.id || getRemainingSessions(patient) <= 0}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                              getRemainingSessions(patient) <= 0
                                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:shadow-[0_8px_24px_rgba(16,185,129,0.4)]'
                            }`}
                          >
                            {completingSession === patient.id ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                  className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full"
                                />
                                Recording...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Mark Complete
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* Exercise Plan Modal */}
        <AnimatePresence>
          {selectedPatient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedPatient(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25 }}
                className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">Treatment Plan</h2>
                      <p className="text-slate-400 text-sm">{selectedPatient.name}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Patient Info */}
                  <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-rose-400/60">
                        {selectedPatient.profilePicture ? (
                          <img
                            src={selectedPatient.profilePicture}
                            alt={selectedPatient.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sky-400 font-semibold">
                            {selectedPatient.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{selectedPatient.name}</h3>
                        <p className="text-slate-400 text-sm">{selectedPatient.email || selectedPatient.phone || 'No contact info'}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-slate-400">
                            Sessions: <span className="text-white font-medium">{selectedPatient.completedSessions || 0}</span> / {selectedPatient.totalSessions || 0}
                          </span>
                          <span className="text-sm text-slate-400">
                            Remaining: <span className="text-emerald-400 font-medium">{getRemainingSessions(selectedPatient)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedPatient.assignedTherapistName && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">Assigned Therapist:</span>
                        <span className="text-sky-400 font-medium">{selectedPatient.assignedTherapistName}</span>
                      </div>
                    )}
                    
                    {selectedPatient.lastUpdated && (
                      <p className="text-slate-500 text-xs mt-2">
                        Last updated: {selectedPatient.lastUpdated.toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Exercise Plan */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-sky-400" />
                      Prescribed Exercises
                    </h3>

                     {(!selectedPatient.assignedExercises || selectedPatient.assignedExercises.length === 0) ? (
                       <div className="text-center py-8">
                         <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                         <p className="text-slate-400">No exercise plan prescribed yet</p>
                         <p className="text-slate-500 text-sm mt-1">The doctor needs to assign exercises first</p>
                       </div>
                     ) : (
                       <div className="space-y-3">
                         {selectedPatient.assignedExercises.map((exercise: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
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
                                  <p className="text-white font-semibold text-sm">{exercise.duration}</p>
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
                    )}
                  </div>

                   {/* Doctor's Prescription */}
                   <div className="mt-6 pt-6 border-t border-slate-700">
                     <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                       <FileText className="w-5 h-5 text-emerald-400" />
                       Doctor's Prescription
                     </h3>
                     {selectedPatient.prescription ? (
                       <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                         <p className="text-emerald-100 whitespace-pre-wrap">{selectedPatient.prescription}</p>
                       </div>
                     ) : (
                       <div className="text-center py-8">
                         <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                         <p className="text-slate-400">No prescription available yet.</p>
                       </div>
                     )}
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
