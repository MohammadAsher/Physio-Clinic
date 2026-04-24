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
  arrayUnion
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
}

export default function DoctorDashboard({ user, patients, onUpdatePatient, onLogout }: DoctorDashboardProps) {
  const [activeView, setActiveView] = useState<DoctorView>('waiting');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(user?.profilePicture || user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Reports State
  const [patientReports, setPatientReports] = useState<PatientReport[]>([]);
  
  // Profile Data State (no file upload)
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    education: user?.doctorProfile?.education || '',
    experience: user?.doctorProfile?.experience || '',
    specialization: user?.doctorProfile?.specialization || '',
    availableDays: user?.doctorProfile?.availableDays || [],
    startTime: user?.doctorProfile?.startTime || '9:00 AM',
    endTime: user?.doctorProfile?.endTime || '5:00 PM',
  });

  // File viewer modal state
  const [selectedReport, setSelectedReport] = useState<{ fileUrl: string; fileName: string; fileType: 'image' | 'pdf' | 'other' } | null>(null);

  // Real-time profile completion state
  const [profileCompleted, setProfileCompleted] = useState<boolean>(!!(user?.profileCompleted && user?.doctorProfile?.education && user?.doctorProfile?.specialization));

  // Sync profile completion status in real-time
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isComplete = !!(data?.profileCompleted && data?.doctorProfile?.education && data?.doctorProfile?.specialization);
        setProfileCompleted(isComplete);
      }
    });
    return () => unsubscribe();
  }, [user?.id]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeOptions = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

  const isStep1Complete = !!profileData.education && !!profileData.specialization;
  const isStep2Complete = !!profileData.experience;
  const isStep3Complete = profileData.availableDays.length > 0 && !!profileData.startTime && !!profileData.endTime;
  const canSubmit = isStep1Complete && isStep2Complete && isStep3Complete;

  const toggleDay = (day: string) => {
    const newDays = profileData.availableDays.filter((d: string) => d !== day);
    setProfileData({ ...profileData, availableDays: newDays });
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setSelectedExercises(patient.exercises || []);
  };

  const toggleExercise = (exercise: any) => {
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id);
      if (exists) return prev.filter(e => e.id !== exercise.id);
      return [...prev, exercise];
    });
  };

  const handleSaveExercises = async () => {
    if (!selectedPatient?.id) return;
    try {
      // Save exercises to the patient's document
      await updateDoc(doc(db, 'users', selectedPatient.id), {
        exercises: selectedExercises
      });
      // Update local state
      setSelectedPatient({ ...selectedPatient, exercises: selectedExercises });
      setShowExerciseModal(false);
      alert('Exercises assigned successfully!');
    } catch (err) {
      console.error('Error saving exercises:', err);
      alert('Failed to save exercises. Please try again.');
    }
  };

  // Profile status check - use real-time state
  const isProfileComplete = profileCompleted;

   // Fetch patient reports from their document's reports array
   useEffect(() => {
    const patientId = selectedPatient?.id || selectedPatient?.userId;
    if (patientId) {
      setPatientReports(selectedPatient?.reports || []);
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
          setPatientReports(reports);
        }
      });
      return () => unsubscribe();
    } else {
      setPatientReports([]);
    }
  }, [selectedPatient?.id, selectedPatient?.userId]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const updateData = {
        profileCompleted: true,
        doctorProfile: { 
          education: profileData.education,
          specialization: profileData.specialization,
          experience: profileData.experience,
          availableDays: profileData.availableDays,
          startTime: profileData.startTime,
          endTime: profileData.endTime,
          timings: `${profileData.startTime} - ${profileData.endTime}`
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

  const handleStartSession = () => {
    if (!selectedPatient) return;
    const updatedPatient = { ...selectedPatient, status: 'consulting' as const };
    onUpdatePatient(updatedPatient);
    setSelectedPatient(updatedPatient);
  };

  return (
    <div className="min-h-screen flex text-slate-200 bg-[#050505]">
      {/* Sidebar - Enhanced Glassmorphism */}
      <aside className="w-72 border-r border-white/10 flex flex-col bg-black/60 backdrop-blur-xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-20 left-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative p-6 border-b border-white/10">
          <div className="flex flex-col items-center gap-3 text-center">
            {/* Profile Image Section */}
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
                {profileData.specialization || 'Physiotherapist'}
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

          {/* Complete Profile Button (If incomplete) */}
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
                      {/* Exercise badges */}
                      {patient.exercises && patient.exercises.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {patient.exercises.slice(0, 2).map((ex: any, idx: number) => (
                            <span key={idx} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                              {ex.name}
                            </span>
                          ))}
                          {patient.exercises.length > 2 && (
                            <span className="text-[10px] text-slate-500">+{patient.exercises.length - 2}</span>
                          )}
                        </div>
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
                     {/* Ambient glow */}
                     <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                     
                     <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                       <div>
                         <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
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

                     {/* Reports Section - Ultra Luxury */}
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.2 }}
                       className="relative rounded-3xl p-8 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
                     >
                       {/* Ambient glow effect */}
                       <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                       <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
                       
                       {/* Gold-Embossed Header */}
                       <h4 className="relative text-lg font-bold bg-gold-gradient bg-clip-text text-transparent mb-6 flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
                           <FileText className="w-5 h-5 text-gold" />
                         </div>
                         Medical Reports & Documents
                       </h4>

                       {/* Reports List */}
                       <div className="space-y-3 mb-6">
                         {patientReports.length > 0 ? (
                           patientReports.map((report, index) => (
                             <motion.div
                               key={report.id}
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
                                     {report.uploadedAt.toLocaleDateString('en-US', {
                                       day: 'numeric',
                                       month: 'short',
                                       year: 'numeric'
                                     })}
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

      {/* Profile Completion Modal - Multi-Step Ultra Luxury */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.6, bounce: 0.2 }}
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
                  <p className="text-slate-400 text-sm mt-2">
                    Step {currentStep} of 3: {currentStep === 1 ? 'Education & Credentials' : currentStep === 2 ? 'Specialization & Experience' : 'Availability'}
                  </p>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className={`w-3 h-3 rounded-full transition-all ${currentStep === step ? 'bg-rose-500 w-8' : currentStep > step ? 'bg-rose-500/50' : 'bg-white/20'}`} />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold mb-2 block">
                          Profile Picture
                        </label>
                        <div className="flex justify-center mb-4">
                          <ImageUpload
                            currentImage={profileImage}
                            userId={user?.id || ''}
                            onImageUpload={(url) => setProfileImage(url)}
                            size="lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold mb-2 block">
                          Degree Title
                        </label>
                        <input 
                          type="text" 
                          value={profileData.education}
                          onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                          placeholder="e.g. MBBS, DPT, BPT"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-white placeholder:text-slate-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold mb-2 block">
                          Specialization
                        </label>
                        <input 
                          type="text" 
                          value={profileData.specialization}
                          onChange={(e) => setProfileData({...profileData, specialization: e.target.value})}
                          placeholder="e.g. Orthopedic, Sports, Neuro"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-white placeholder:text-slate-600"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep(2)}
                        disabled={!isStep1Complete}
                        className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider text-sm"
                      >
                        Next: Specialization
                      </motion.button>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold mb-2 block">
                          Specialization
                        </label>
                        <input 
                          type="text" 
                          value={profileData.specialization}
                          onChange={(e) => setProfileData({...profileData, specialization: e.target.value})}
                          placeholder="e.g. Orthopedic Physiotherapist"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-white placeholder:text-slate-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold mb-2 block">
                          Years of Experience
                        </label>
                        <input 
                          type="text" 
                          value={profileData.experience}
                          onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                          placeholder="e.g. 5+ Years"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-white placeholder:text-slate-600"
                        />
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCurrentStep(1)}
                          className="flex-1 py-4 bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all uppercase tracking-wider text-sm"
                        >
                          Back
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCurrentStep(3)}
                          disabled={!isStep2Complete}
                          className="flex-1 py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider text-sm"
                        >
                          Next: Availability
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold mb-2 block">
                          Working Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {daysOfWeek.map((day) => (
                            <button
                              key={day}
                              onClick={() => toggleDay(day)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                profileData.availableDays.includes(day)
                                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/30'
                                  : 'bg-white/5 text-slate-400 border border-white/10 hover:border-rose-500/30'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold mb-2 block">
                          Timings
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <select
                              value={profileData.startTime}
                              onChange={(e) => setProfileData({...profileData, startTime: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-white"
                            >
                              {timeOptions.map((time) => (
                                <option key={time} value={time} className="bg-black text-white">{time}</option>
                              ))}
                            </select>
                          </div>
                          <span className="text-slate-400">to</span>
                          <div className="flex-1">
                            <select
                              value={profileData.endTime}
                              onChange={(e) => setProfileData({...profileData, endTime: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-white"
                            >
                              {timeOptions.map((time) => (
                                <option key={time} value={time} className="bg-black text-white">{time}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCurrentStep(2)}
                          className="flex-1 py-4 bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all uppercase tracking-wider text-sm"
                        >
                          Back
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.01, boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveProfile}
                          disabled={savingProfile || !canSubmit}
                          className="flex-1 py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider text-sm"
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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