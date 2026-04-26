'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, Activity, CheckCircle, ChevronRight, X, 
  Calendar, MapPin, FileText, UserCircle, File, Image
} from 'lucide-react';
import { DoctorView, PatientReport } from '@/types';
import { db } from '@/lib/firebase';
import { 
  doc, 
  updateDoc, 
  onSnapshot,
  arrayUnion,
  collection,
  query,
  where
} from 'firebase/firestore';
import ImageUpload from './ImageUpload';
import SmartGreeting from './SmartGreeting'; 
import DailyTip from './DailyTip';
import CounterAnimation from './CounterAnimation';
import FileViewerModal from './FileViewerModal';
import { EXERCISES } from '@/lib/data';

interface DoctorDashboardProps {
  patients: any[]; 
  onUpdatePatient: (patient: any) => void;
  user?: any;
  onLogout?: () => void;
  therapists?: any[];
}

export default function DoctorDashboard({ user, patients, onUpdatePatient, onLogout }: DoctorDashboardProps) {
  const [activeView, setActiveView] = useState<DoctorView>('waiting');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(user?.profilePicture || user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ fileUrl: string; fileName: string; fileType: 'image' | 'pdf' | 'other' } | null>(null);

  // Real-time therapist list
  const [therapists, setTherapists] = useState<any[]>([]);

  // Fetch therapists data
  useEffect(() => {
    const therapistsQuery = query(collection(db, 'users'), where('role', '==', 'therapist'));
    const unsubscribe = onSnapshot(therapistsQuery, (snapshot) => {
      const therapistList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTherapists(therapistList);
    });
    return () => unsubscribe();
  }, []);

  const isProfileComplete = profileImage && user?.doctorProfile?.education && user?.doctorProfile?.specialization;

  const toggleExercise = (exercise: any) => {
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id);
      if (exists) return prev.filter(e => e.id !== exercise.id);
      return [...prev, exercise];
    });
  };

  const handleSaveExercises = async () => {
    if (!selectedPatient?.id) return;
    
    const selectedTherapist = therapists.find(t => t.id === selectedPatient.assignedTherapistId);
    
    try {
      // Save exercises with therapist assignment and lastUpdated timestamp
      await updateDoc(doc(db, 'users', selectedPatient.id), {
        exercises: selectedExercises,
        prescribedExercises: selectedExercises,
        assignedTherapistId: selectedPatient.assignedTherapistId,
        assignedTherapistName: selectedTherapist ? selectedTherapist.name : selectedPatient.assignedTherapistName,
        lastUpdated: new Date()
      });
      
      // Update local state
      setSelectedPatient({ 
        ...selectedPatient, 
        exercises: selectedExercises,
        prescribedExercises: selectedExercises,
        assignedTherapistId: selectedPatient.assignedTherapistId,
        assignedTherapistName: selectedTherapist ? selectedTherapist.name : selectedPatient.assignedTherapistName,
        lastUpdated: new Date()
      });
      
      setShowExerciseModal(false);
      alert('Exercise plan assigned successfully!');
    } catch (err) {
      console.error('Error saving exercises:', err);
      alert('Failed to assign exercises. Please try again.');
    }
  };

  // Profile status check - use real-time state
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isComplete = !!(data?.profileCompleted && data?.doctorProfile?.education && data?.doctorProfile?.specialization);
        setSelectedPatient(prev => prev ? { ...prev, profileCompleted: isComplete } : null);
      }
    });
    return () => unsubscribe();
  }, [user?.id]);

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setSelectedExercises(patient.exercises || []);
  };

  // Fetch patient reports from their document's reports array
  useEffect(() => {
    const patientId = selectedPatient?.id || selectedPatient?.userId;
    if (patientId) {
      const unsubscribe = onSnapshot(doc(db, 'users', patientId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const reports: PatientReport[] = (data?.reports || []).map((r: any, index: number) => ({
            id: `report-${index}`,
            fileName: r.fileName,
            fileUrl: r.fileUrl,
            fileType: r.fileType,
            uploadedAt: r.uploadedAt?.toDate() || r.uploadedAt || new Date()
          }));
          setSelectedPatient(prev => prev ? { ...prev, reports } : null);
        }
      });
      return () => unsubscribe();
    }
  }, [selectedPatient?.id, selectedPatient?.userId]);

  const handleStartSession = () => {
    if (!selectedPatient) return;
    const updatedPatient = { ...selectedPatient, status: 'consulting' as const };
    onUpdatePatient(updatedPatient);
    setSelectedPatient(updatedPatient);
  };

  const handleSavePatientProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const updateData = {
        profileCompleted: true,
        doctorProfile: { 
          education: '',
          specialization: '',
          experience: '',
          availableDays: [],
          timings: ''
        },
        profilePicture: profileImage,
        avatar: profileImage
      };
      await updateDoc(doc(db, 'users', user.id), updateData);
      setShowProfileModal(false);
      console.log("Profile updated successfully");
    } catch (err) {
      console.error('Error:', err);
    }
    setSavingProfile(false);
  };

  return (
    <div className="min-h-screen flex text-slate-200 bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 flex flex-col bg-black/60 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-20 left-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative p-6 border-b border-white/10">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative group">
              <ImageUpload
                currentImage={profileImage}
                userId={user?.id || ''}
                onImageUpload={(url) => setProfileImage(url)}
                size="lg"
              />
            </div>
            <div>
              <p className="text-white font-bold text-lg tracking-wide">Dr. {user?.name}</p>
              <p className="text-rose-500 text-[10px] uppercase tracking-[0.3em] font-black">
                {user?.doctorProfile?.specialization || 'Physiotherapist'}
              </p>
            </div>
          </div>
        </div>

        <nav className="relative flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveView('waiting')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
              activeView === 'waiting' 
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-900/30' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3"><Users className="w-5 h-5" /> <span className="text-sm font-medium">Waiting List</span></div>
            {activeView === 'waiting' && <ChevronRight className="w-4 h-4" />}
          </button>

          {!isProfileComplete && (
            <motion.button
              onClick={() => setShowProfileModal(true)}
              className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-400 border border-amber-500/30 hover:from-amber-500/20 hover:to-amber-500/10 transition-all shadow-lg shadow-amber-500/10"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Complete Profile</span>
            </motion.button>
          )}
        </nav>
        
        <div className="relative p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full py-3 text-slate-500 hover:text-rose-400 text-xs font-medium transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <SmartGreeting name={user?.name || 'Doctor'} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Patient Queue */}
              <div className="lg:col-span-1 space-y-3">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-rose-500" /> Patient Queue
                </h2>
                {patients.map(patient => (
                  <motion.div
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${
                      selectedPatient?.id === patient.id 
                        ? 'bg-gradient-to-br from-rose-500/20 to-rose-500/5 border-rose-500/50 shadow-lg shadow-rose-900/20' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-rose-500/30 hover:shadow-xl hover:shadow-rose-900/10'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-white text-sm">{patient.name}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Token: #{patient.token}</p>
                        {patient.medicalCondition && (
                          <p className="text-[10px] text-rose-400/80 mt-2 line-clamp-1">
                            {patient.medicalCondition}
                          </p>
                        )}
                      </div>
                      {selectedPatient?.id === patient.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center"
                        >
                          <ChevronRight className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Right: Patient Details & Reports */}
              <div className="lg:col-span-2">
                {selectedPatient ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-b from-white/5 to-white/2 border border-white/10 shadow-2xl overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">
                          {selectedPatient.name}
                        </h3>
                        <p className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                          {selectedPatient.medicalCondition || 'General Consultation'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(225, 29, 72, 0.4)' }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleStartSession}
                          className="px-6 py-3 bg-gradient-to-r from-rose-600 to-crimson-700 rounded-xl text-xs font-bold shadow-lg shadow-rose-900/30 backdrop-blur-xl border border-white/10 transition-all uppercase tracking-wider"
                        >
                          Start Session
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)' }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setShowExerciseModal(true)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-xs font-bold shadow-lg shadow-blue-900/30 backdrop-blur-xl border border-white/10 transition-all uppercase tracking-wider"
                        >
                          Assign Exercises
                        </motion.button>
                      </div>
                    </div>

                    {/* Reports Section */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative rounded-3xl p-8 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
                      
                      <h4 className="relative text-lg font-bold bg-gold-gradient bg-clip-text text-transparent mb-6 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
                          <FileText className="w-5 h-5 text-gold" />
                        </div>
                        Medical Reports & Documents
                      </h4>

                      <div className="space-y-3 mb-6">
                        {selectedPatient.reports && selectedPatient.reports.length > 0 ? (
                          selectedPatient.reports.map((report, index) => (
                            <motion.div
                              key={report.id || index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-rose-500/30 transition-all duration-300"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                  {report.fileType === 'image' ? (
                                    <Image className="w-5 h-5 text-rose-400" />
                                  ) : (
                                    <File className="w-5 h-5 text-rose-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white group-hover:text-rose-300 transition-colors">
                                    {report.fileName}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {report.uploadedAt?.toLocaleDateString('en-US', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    }) || new Date(report.uploadedAt).toLocaleDateString()}
                                    {report.uploadedBy && ` • by ${report.uploadedBy}`}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedReport({
                                  fileUrl: report.fileUrl,
                                  fileName: report.fileName,
                                  fileType: (report.fileType === 'image' || report.fileType === 'pdf') ? report.fileType : 'other'
                                })}
                                className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-300 text-xs font-bold uppercase tracking-wider hover:bg-rose-500/20 hover:scale-105 transition-all border border-rose-500/20"
                              >
                                View
                              </button>
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 rounded-2xl bg-white/5 border border-white/5"
                          >
                            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                            <p className="text-sm text-slate-500">No reports uploaded yet</p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-3xl">
                    Select a patient to view details and reports
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Profile Completion Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#111] to-black border border-white/10 shadow-2xl"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-rose-500/10 blur-3xl pointer-events-none" />
              
              <div className="relative p-8">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold/20 to-rose-500/20 border border-gold/30 flex items-center justify-center shadow-lg shadow-gold/10">
                    <UserCircle className="w-10 h-10 text-gold" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent">
                    Complete Your Profile
                  </h2>
                </div>

                <div className="text-center mb-6">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold mb-2 block">
                    Profile Picture
                  </label>
                  <div className="flex justify-center">
                    <ImageUpload
                      currentImage={profileImage}
                      userId={user?.id || ''}
                      onImageUpload={(url) => setProfileImage(url)}
                      size="lg"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSavePatientProfile}
                  disabled={savingProfile || !profileImage}
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider text-sm"
                >
                  {savingProfile ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Saving...
                    </span>
                  ) : (
                    'Submit Profile'
                  )}
                </motion.button>

                <button
                  onClick={() => setShowProfileModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 hover:scale-[1.02] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exercises Modal */}
      <AnimatePresence>
        {showExerciseModal && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Prescribe Exercises</h2>
                  <p className="text-sm text-slate-400">Assigning for {selectedPatient?.name}</p>
                </div>
                <button 
                  onClick={() => setShowExerciseModal(false)}
                  className="p-2 hover:bg-white/10 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Therapist Assignment */}
              <div className="p-6 border-b border-white/5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold mb-2 block">
                  Assign to Therapist
                </label>
                <select
                  value={selectedPatient?.assignedTherapistId || ''}
                  onChange={(e) => {
                    const therapistId = e.target.value;
                    const therapist = therapists.find(t => t.id === therapistId);
                    setSelectedPatient({
                      ...selectedPatient,
                      assignedTherapistId: therapistId,
                      assignedTherapistName: therapist ? therapist.name : ''
                    });
                  }}
                  className="glass-input w-full py-3 px-4 text-sm rounded-xl cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Select a therapist...</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id} className="bg-slate-900">
                      Dr. {therapist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {EXERCISES.map((exercise) => {
                  const isSelected = selectedExercises.some(e => e.id === exercise.id);
                  return (
                    <div 
                      key={exercise.id} 
                      onClick={() => toggleExercise(exercise)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10 shadow-inner' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-white">{exercise.name}</h4>
                        {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{exercise.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 flex gap-4">
                <button 
                  onClick={handleSaveExercises}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)]"
                >
                  Save Exercise Plan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Viewer Modal */}
      <FileViewerModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        fileUrl={selectedReport?.fileUrl || ''}
        fileName={selectedReport?.fileName || ''}
        fileType={selectedReport?.fileType || 'other'}
      />
    </div>
  );
}
