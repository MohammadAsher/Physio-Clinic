'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, ArrowRight, CheckCircle, Clock, Dumbbell, ChevronRight, ChevronLeft, Check, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { User, Patient } from '@/types';
import RoleBasedQuotes from './RoleBasedQuotes';

interface TherapistDashboardProps {
  user: User;
  onLogout: () => void;
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

export default function TherapistDashboard({ user, onLogout }: TherapistDashboardProps) {
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
    
    setCompletingSession(patient.id);

    try {
      const newCompleted = (patient.completedSessions || 0) + 1;
      const newTotal = patient.totalSessions || 0;
      const newRemaining = Math.max(0, newTotal - newCompleted);

      const patientRef = doc(db, 'users', patient.id);
      await updateDoc(patientRef, {
        completedSessions: newCompleted,
        remainingSessions: newRemaining,
        lastUpdated: serverTimestamp(),
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 antialiased overflow-x-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '50%' }}
            animate={{ opacity: 1, y: 0, x: '0%' }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-950/40 backdrop-blur-md flex items-center gap-2 max-w-[calc(100vw-32px)] text-sm"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span className="truncate">{toast.message}</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmPatient(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Confirm Session Complete</h3>
                <p className="text-xs sm:text-sm text-slate-400 mb-3">
                  Mark session as complete for <span className="text-white font-semibold block sm:inline">{confirmPatient.name}</span>?
                </p>
                <div className="bg-slate-950/60 rounded-xl py-2 px-3 inline-block text-xs text-slate-400 mb-5 border border-slate-800/60">
                  Current progress: <span className="text-sky-400 font-bold">{confirmPatient.completedSessions || 0}</span> / {confirmPatient.totalSessions || 0} sessions
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmPatient(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-xs font-semibold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCompleteSession(confirmPatient)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg shadow-emerald-950/20 text-xs font-semibold uppercase tracking-wider"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Navbar */}
      <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-900 sticky top-0 z-40 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Dumbbell className="w-4 h-4 text-sky-400" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">Therapist Portal</h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="text-right hidden sm:block min-w-0">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Welcome back</p>
              <p className="text-white text-sm font-semibold truncate max-w-[120px]">{user.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 transition-colors text-xs font-bold uppercase tracking-wide"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Responsive Stats Layout Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-900 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Assigned Patients</p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">{patients.length}</p>
            </div>
          </div>

          <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-900 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">With Exercise Plans</p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {patients.filter(p => hasExercises(p)).length}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-900 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Awaiting Plans</p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {patients.filter(p => !hasExercises(p)).length}
              </p>
            </div>
          </div>
        </section>

        {/* Quotes Integration Row */}
        <div className="w-full overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/10 px-2 sm:px-4">
          <RoleBasedQuotes role="therapist" />
        </div>

        {/* Assigned Patient Table Section Wrapper */}
        <section className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-900 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-900">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              Assigned Patients List
            </h2>
          </div>

          {patients.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-slate-400 text-sm">No patients assigned to you yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-900/60">
              {patients.map((patient, index) => (
                <div
                  key={patient.id}
                  className="p-4 sm:p-6 hover:bg-slate-900/20 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left Column Profile Core Metrics Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 relative">
                      {patient.profilePicture ? (
                        <img
                          src={patient.profilePicture}
                          alt={patient.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sky-400 text-sm font-bold">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">{patient.name}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{patient.email || patient.phone || 'No contact info'}</p>
                    </div>
                  </div>

                  {/* Right Column Action badging and flow controller */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-start lg:justify-end gap-2.5 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-900/40">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {patient.assignedExercises && patient.assignedExercises.length > 0 ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/10">
                          {patient.assignedExercises.length} Exercises
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                          No Plan
                        </span>
                      )}
                      
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/10">
                        {patient.completedSessions || 0}/{patient.totalSessions || 0} Sessions
                      </span>
                      
                      {getRemainingSessions(patient) > 0 && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 animate-pulse">
                          Upcoming
                        </span>
                      )}
                    </div>
                    
                    {/* Operations Controls Row */}
                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-sky-500/10"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => setConfirmPatient(patient)}
                        disabled={completingSession === patient.id || getRemainingSessions(patient) <= 0}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          getRemainingSessions(patient) <= 0
                            ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-transparent'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/10'
                        }`}
                      >
                        {completingSession === patient.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                            <span>...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Treatment Exercise Plan Details Dynamic Sheet Modal */}
        <AnimatePresence>
          {selectedPatient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedPatient(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 15 }}
                transition={{ type: 'spring', damping: 25 }}
                className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Dynamic Header */}
                <div className="p-4 sm:p-5 border-b border-slate-850 flex items-center justify-between gap-4 shrink-0">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-white truncate">Treatment Vault Plan</h2>
                    <p className="text-xs text-slate-400 truncate">{selectedPatient.name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Scrollable Body Segment */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0 scrollbar-thin scrollbar-thumb-slate-800">
                  {/* Patient Identity Meta Block */}
                  <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                        {selectedPatient.profilePicture ? (
                          <img src={selectedPatient.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-sky-400 font-bold text-xs">{selectedPatient.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{selectedPatient.name}</h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{selectedPatient.email || 'No email attached'}</p>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-850 gap-1.5 text-xs">
                      <div className="text-slate-400">
                        Sessions: <span className="text-white font-bold">{selectedPatient.completedSessions || 0}</span> / {selectedPatient.totalSessions || 0}
                      </div>
                      <div className="text-slate-500">
                        Remaining: <span className="text-emerald-400 font-bold">{getRemainingSessions(selectedPatient)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Primary Prescriptions Node */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      Medical Diagnosis / Prescription
                    </h3>
                    {selectedPatient.prescription ? (
                      <div className="bg-emerald-950/10 rounded-xl p-3.5 border border-emerald-900/20">
                        <p className="text-xs sm:text-sm text-emerald-200/90 whitespace-pre-wrap leading-relaxed">
                          {selectedPatient.prescription}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-5 bg-slate-950/20 rounded-xl border border-slate-850">
                        <p className="text-xs text-slate-500">No custom physician note available.</p>
                      </div>
                    )}
                  </div>

                  {/* Exercise Loop Cards Segment */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-sky-400" />
                      Assigned Routines List
                    </h3>

                    {(!selectedPatient.assignedExercises || selectedPatient.assignedExercises.length === 0) ? (
                      <div className="text-center py-8 bg-slate-950/20 rounded-xl border border-slate-850">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                        <p className="text-xs text-slate-400">No targeted workflow strategy allocated yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedPatient.assignedExercises.map((exercise: any, index: number) => (
                          <div
                            key={index}
                            className="bg-slate-950/40 rounded-xl p-4 border border-slate-850 space-y-3"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[10px] font-black text-sky-400 shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-white truncate">{exercise.name || exercise.title || 'Exercise'}</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                  {exercise.description || exercise.instructions || 'No specific dynamic directives added.'}
                                </p>
                              </div>
                            </div>
    
                            {/* Metric Configurations Grid System */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-850/60 text-center">
                              <div className="bg-slate-900/80 rounded-lg p-1.5 border border-slate-850/40">
                                <p className="text-[10px] text-slate-500 uppercase font-medium">Duration</p>
                                <p className="text-xs text-white font-bold mt-0.5 truncate">{exercise.duration || '--'}</p>
                              </div>
                              <div className="bg-slate-900/80 rounded-lg p-1.5 border border-slate-850/40">
                                <p className="text-[10px] text-slate-500 uppercase font-medium">Sets</p>
                                <p className="text-xs text-white font-bold mt-0.5 truncate">{exercise.sets || '--'}</p>
                              </div>
                              <div className="bg-slate-900/80 rounded-lg p-1.5 border border-slate-850/40">
                                <p className="text-[10px] text-slate-500 uppercase font-medium">Reps</p>
                                <p className="text-xs text-white font-bold mt-0.5 truncate">{exercise.reps || '--'}</p>
                              </div>
                              <div className="bg-slate-900/80 rounded-lg p-1.5 border border-slate-850/40">
                                <p className="text-[10px] text-slate-500 uppercase font-medium">Frequency</p>
                                <p className="text-xs text-white font-bold mt-0.5 truncate">{exercise.frequency || '--'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
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