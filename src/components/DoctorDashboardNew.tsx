'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, Activity, CheckCircle, ChevronRight, X, 
  Calendar, FileText, UserCircle, File, Image, Briefcase,
  BookOpen, Award, Info, Camera
} from 'lucide-react';
import { DoctorView, PatientReport } from '@/types';
import { db } from '@/lib/firebase';
import { 
  doc, 
  updateDoc, 
  onSnapshot,
  collection,
  query,
  where
} from 'firebase/firestore';
import ImageUpload from './ImageUpload';
import SmartGreeting from './SmartGreeting'; 
import DailyTip from './DailyTip';
import FileViewerModal from './FileViewerModal';
import { EXERCISES } from '@/lib/data';
import RoleBasedQuotes from './RoleBasedQuotes';
import PremiumCard from './PremiumCard';
import CustomDropdown from './CustomDropdown';

interface DoctorDashboardProps {
  patients: any[]; 
  onUpdatePatient: (patient: any) => void;
  user?: any;
  onLogout?: () => void;
  therapists?: any[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorDashboard({ user, patients, onUpdatePatient, onLogout }: DoctorDashboardProps) {
  const [activeView, setActiveView] = useState<DoctorView>('waiting');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(
    user?.doctorProfile?.profilePicture || user?.profilePicture || user?.avatar || ''
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ fileUrl: string; fileName: string; fileType: 'image' | 'pdf' | 'other' } | null>(null);
  const [liveUser, setLiveUser] = useState<any>(user);

  // Doctor profile form fields
  const [profileForm, setProfileForm] = useState({
    fullName: user?.name || '',
    specialization: user?.doctorProfile?.specialization || '',
    experience: user?.doctorProfile?.experience || '',
    education: user?.doctorProfile?.education || '',
    timings: user?.doctorProfile?.timings || '9:00 AM - 5:00 PM',
    about: user?.doctorProfile?.about || '',
    qualifications: user?.doctorProfile?.qualifications || '',
  });
  const [availableDays, setAvailableDays] = useState<string[]>(
    user?.doctorProfile?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  );

  // Real-time therapist list
  const [therapists, setTherapists] = useState<any[]>([]);

  // Listen to live user data
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveUser({ id: user.id, ...data });
        setProfileImage(
          data?.doctorProfile?.profilePicture || data?.profilePicture || data?.avatar || ''
        );
        setProfileForm(prev => ({
          fullName: data?.name || prev.fullName,
          specialization: data?.doctorProfile?.specialization || prev.specialization,
          experience: data?.doctorProfile?.experience || prev.experience,
          education: data?.doctorProfile?.education || prev.education,
          timings: data?.doctorProfile?.timings || prev.timings,
          about: data?.doctorProfile?.about || prev.about,
          qualifications: data?.doctorProfile?.qualifications || prev.qualifications,
        }));
        setAvailableDays(data?.doctorProfile?.availableDays || availableDays);
      }
    });
    return () => unsubscribe();
  }, [user?.id]);

  // Fetch therapists
  useEffect(() => {
    const therapistsQuery = query(collection(db, 'users'), where('role', '==', 'therapist'));
    const unsubscribe = onSnapshot(therapistsQuery, (snapshot) => {
      const therapistList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTherapists(therapistList);
    });
    return () => unsubscribe();
  }, []);

  const isProfileComplete = !!(
    liveUser?.profileCompleted &&
    liveUser?.doctorProfile?.education &&
    liveUser?.doctorProfile?.specialization
  );

  const toggleExercise = (exercise: any) => {
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id);
      if (exists) return prev.filter(e => e.id !== exercise.id);
      return [...prev, exercise];
    });
  };

  const handleSaveExercises = async () => {
    if (!selectedPatient?.assignedTherapistId) {
      alert('Please select a therapist first');
      return;
    }
    const selectedTherapist = therapists.find(t => t.id === selectedPatient.assignedTherapistId);
    if (!selectedTherapist) {
      alert('Selected therapist not found. Please select a valid therapist.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', selectedPatient.id), {
        assignedExercises: selectedExercises,
        assignedTherapistId: selectedPatient.assignedTherapistId,
        assignedTherapistName: selectedTherapist.name,
        status: 'under_treatment',
        prescription: selectedPatient.prescription || '',
        role: 'patient',
        totalSessions: selectedPatient.totalSessions || 10,
        lastUpdated: new Date()
      });
      setSelectedPatient({ 
        ...selectedPatient, 
        assignedExercises: selectedExercises,
        assignedTherapistId: selectedPatient.assignedTherapistId,
        assignedTherapistName: selectedTherapist.name,
        status: 'under_treatment',
        lastUpdated: new Date()
      });
      setShowExerciseModal(false);
      alert('Exercise plan assigned successfully!');
    } catch (err) {
      console.error('Error saving exercises:', err);
      alert('Failed to assign exercises. Please try again.');
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setSelectedExercises(patient.exercises || []);
  };

  // Fetch patient reports (only shared ones)
  useEffect(() => {
    const patientId = selectedPatient?.id || selectedPatient?.userId;
    if (!patientId) return;
    const unsubscribe = onSnapshot(doc(db, 'users', patientId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const allReports = data?.reports || [];
        const filteredReports = allReports.filter((r: any) => r.showToDoctor === true);
        const reports: PatientReport[] = filteredReports.map((r: any, index: number) => ({
          id: r.id || `report-${index}`,
          fileName: r.fileName,
          reportName: r.reportName || r.fileName,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          uploadedAt: r.uploadedAt?.toDate ? r.uploadedAt.toDate() : new Date(r.uploadedAt),
          showToDoctor: r.showToDoctor,
        }));
        setSelectedPatient((prev: any) => prev ? { ...prev, reports } : null);
      }
    });
    return () => unsubscribe();
  }, [selectedPatient?.id, selectedPatient?.userId]);

  // Save full doctor profile
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    if (!profileForm.specialization || !profileForm.education) {
      alert('Specialization and Education are required.');
      return;
    }
    setSavingProfile(true);
    try {
      const updateData: any = {
        name: profileForm.fullName || user?.name,
        profileCompleted: true,
        doctorProfile: {
          specialization: profileForm.specialization,
          experience: profileForm.experience,
          education: profileForm.education,
          timings: profileForm.timings,
          about: profileForm.about,
          qualifications: profileForm.qualifications,
          availableDays,
          profilePicture: profileImage,
        },
      };
      if (profileImage) {
        updateData.profilePicture = profileImage;
        updateData.avatar = profileImage;
      }
      await updateDoc(doc(db, 'users', user.id), updateData);
      setShowProfileModal(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    }
    setSavingProfile(false);
  };

  const toggleDay = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
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
              <p className="text-white font-bold text-lg tracking-wide">Dr. {liveUser?.name || user?.name}</p>
              <p className="text-rose-500 text-[10px] uppercase tracking-[0.3em] font-black">
                {liveUser?.doctorProfile?.specialization || 'Physiotherapist'}
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

          {isProfileComplete && (
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-xs font-medium">Edit Profile</span>
            </button>
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
            <SmartGreeting name={liveUser?.name || user?.name || 'Doctor'} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Patient Queue */}
              <div className="lg:col-span-1 space-y-3">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-rose-500" /> Patient Queue
                </h2>
                {patients.length === 0 && (
                  <div className="text-center py-12 text-slate-600 border border-dashed border-white/5 rounded-2xl">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No patients in queue</p>
                  </div>
                )}
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
                        {/* Start Session button REMOVED per requirements */}
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
                       
                      <h4 className="relative text-lg font-bold text-rose-300 mb-6 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                          <FileText className="w-5 h-5 text-rose-400" />
                        </div>
                        Medical Reports & Documents
                      </h4>

                      <div className="space-y-3 mb-6">
                        {selectedPatient.reports && selectedPatient.reports.length > 0 ? (
                          selectedPatient.reports.map((report: PatientReport, index: number) => (
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
                                    {report.reportName || report.fileName}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {new Date(report.uploadedAt).toLocaleDateString('en-US', {
                                      day: 'numeric', month: 'short', year: 'numeric'
                                    })}
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
                            <p className="text-sm text-slate-500">No shared reports to display</p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-3xl min-h-[300px]">
                    Select a patient to view details and reports
                  </div>
                )}
              </div>
            </div>
            
            <div className="py-6">
              <RoleBasedQuotes role="doctor" />
            </div>
          </div>
        </main>
      </div>

      {/* ─── Doctor Profile Modal (Full Form) ─── */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-2xl relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#111] to-black border border-white/10 shadow-2xl my-8"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-rose-500/10 blur-3xl pointer-events-none" />
              
              <div className="relative p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-800/20 border border-rose-500/30 flex items-center justify-center shadow-lg">
                    <UserCircle className="w-9 h-9 text-rose-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {isProfileComplete ? 'Edit Your Profile' : 'Complete Your Profile'}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Your info will appear on the landing page</p>
                </div>

                {/* Profile Picture */}
                <div className="text-center mb-8">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-rose-400 mb-3 block flex items-center justify-center gap-2">
                    <Camera className="w-3 h-3" /> Profile Picture
                  </label>
                  <div className="flex justify-center">
                    <ImageUpload
                      currentImage={profileImage}
                      userId={user?.id || ''}
                      onImageUpload={(url) => setProfileImage(url)}
                      size="lg"
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-2">Click to upload photo</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block flex items-center gap-2">
                      <UserCircle className="w-3 h-3" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                      placeholder="e.g., Dr. Sarah Ahmed"
                      className="glass-input w-full"
                    />
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block flex items-center gap-2">
                      <Briefcase className="w-3 h-3" /> Specialization <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.specialization}
                      onChange={e => setProfileForm(p => ({ ...p, specialization: e.target.value }))}
                      placeholder="e.g., Sports Rehabilitation"
                      className="glass-input w-full"
                    />
                  </div>

                  {/* Education */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> Education <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.education}
                      onChange={e => setProfileForm(p => ({ ...p, education: e.target.value }))}
                      placeholder="e.g., PhD in Physical Therapy, Harvard"
                      className="glass-input w-full"
                    />
                  </div>

                  {/* Qualifications */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block flex items-center gap-2">
                      <Award className="w-3 h-3" /> Qualifications
                    </label>
                    <input
                      type="text"
                      value={profileForm.qualifications}
                      onChange={e => setProfileForm(p => ({ ...p, qualifications: e.target.value }))}
                      placeholder="e.g., DPT, MPT, CSCS"
                      className="glass-input w-full"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Experience
                    </label>
                    <input
                      type="text"
                      value={profileForm.experience}
                      onChange={e => setProfileForm(p => ({ ...p, experience: e.target.value }))}
                      placeholder="e.g., 10 years"
                      className="glass-input w-full"
                    />
                  </div>

                  {/* Timings */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Timings
                    </label>
                    <input
                      type="text"
                      value={profileForm.timings}
                      onChange={e => setProfileForm(p => ({ ...p, timings: e.target.value }))}
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                      className="glass-input w-full"
                    />
                  </div>

                  {/* Available Days */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-3 block flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Available Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            availableDays.includes(day)
                              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* About / Bio */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block flex items-center gap-2">
                      <Info className="w-3 h-3" /> About / Bio
                    </label>
                    <textarea
                      value={profileForm.about}
                      onChange={e => setProfileForm(p => ({ ...p, about: e.target.value }))}
                      placeholder="Brief description about yourself, your approach, and expertise..."
                      rows={3}
                      className="glass-input w-full resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !profileForm.specialization || !profileForm.education}
                  className="w-full mt-8 py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider text-sm"
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
                    isProfileComplete ? 'Update Profile' : 'Save Profile'
                  )}
                </motion.button>

                <button
                  onClick={() => setShowProfileModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
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
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Therapist Assignment */}
              <div className="p-6 border-b border-white/5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-rose-400 mb-3 block">
                  Assign to Therapist
                </label>
                <CustomDropdown
                  options={therapists.map(t => ({
                    id: t.id,
                    name: t.name,
                    avatar: t.doctorProfile?.profilePicture || t.profilePicture || t.avatar,
                  }))}
                  value={selectedPatient?.assignedTherapistId || ''}
                  onChange={(therapistId) => {
                    const therapist = therapists.find(t => t.id === therapistId);
                    setSelectedPatient({
                      ...selectedPatient,
                      assignedTherapistId: therapistId,
                      assignedTherapistName: therapist ? therapist.name : ''
                    });
                  }}
                  placeholder="Select a therapist..."
                />
              </div>

              {/* Prescription Notes */}
              <div className="p-6 border-b border-white/5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-rose-400 mb-2 block">
                  Clinical Notes / Prescription
                </label>
                <textarea
                  value={selectedPatient?.prescription || ''}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, prescription: e.target.value })}
                  placeholder="Write clinical notes or prescription for the patient..."
                  className="glass-input w-full py-3 px-4 text-sm rounded-xl resize-y min-h-[100px]"
                />
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto">
                {EXERCISES.map((exercise) => {
                  const isSelected = selectedExercises.some(e => e.id === exercise.id);
                  return (
                    <div 
                      key={exercise.id} 
                      onClick={() => toggleExercise(exercise)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all ${
                        isSelected 
                          ? 'border-rose-500 bg-rose-500/10 shadow-inner' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-rose-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-white text-sm">{exercise.name}</h4>
                        {isSelected && <CheckCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{exercise.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20">
                <button 
                  onClick={handleSaveExercises}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg"
                >
                  Save Exercise Plan ({selectedExercises.length} selected)
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