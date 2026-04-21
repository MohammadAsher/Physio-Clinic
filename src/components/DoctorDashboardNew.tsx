'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Activity, CheckCircle, ChevronRight, X, Calendar, MapPin, Camera, UserPlus } from 'lucide-react';
import { Patient, User, DoctorView } from '@/types';
import { EXERCISES } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import ImageUpload from './ImageUpload';
import SmartGreeting from './SmartGreeting';
import DailyTip from './DailyTip';
import CounterAnimation from './CounterAnimation';

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
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(user?.profilePicture || user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    education: user?.doctorProfile?.education || '',
    experience: user?.doctorProfile?.experience || '',
    specialization: user?.doctorProfile?.specialization || '',
    timings: user?.doctorProfile?.timings || '9:00 AM - 5:00 PM',
  });
  const [availableDays, setAvailableDays] = useState<string[]>(user?.doctorProfile?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  const isProfileComplete = user?.profileCompleted && user?.doctorProfile?.education;

  useEffect(() => {
    // Auto-show profile completion modal if profile is incomplete
    if (!isProfileComplete) {
      setShowProfileModal(true);
    }
  }, [isProfileComplete]);

  useEffect(() => {
    setProfileImage(user?.profilePicture || user?.avatar || '');
  }, [user]);

  const handleDoctorCheckIn = async () => {
    if (!user?.id) return;
    setIsCheckingIn(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceRef = collection(db, 'attendance');
      const q = query(attendanceRef, where('userId', '==', user.id), where('date', '==', today));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(attendanceRef, {
          userId: user.id,
          date: today,
          timestamp: new Date(),
          role: 'doctor'
        });
        setIsCheckedIn(true);
      } else {
        setIsCheckedIn(true);
      }
    } catch (err) {
      console.error('Error checking in:', err);
    }
    setIsCheckingIn(false);
  };

  const waitingPatients = patients.filter(p => p.status === 'waiting' || p.status === 'assigned' || p.patientStatus === 'waiting');
  const consultingPatients = patients.filter(p => p.status === 'consulting' || p.patientStatus === 'consulting');

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setSelectedExercises(patient.exercises || []);
  };

  const handleStartConsultation = () => {
    if (!selectedPatient) return;
    const updated = { ...selectedPatient, status: 'consulting' as const };
    onUpdatePatient(updated);
    setSelectedPatient(updated); 
    setShowExerciseModal(true);
  };

  const handleCompleteConsultation = () => {
    if (!selectedPatient) return;
    const updated = { 
      ...selectedPatient, 
      status: 'completed' as const,
      exercises: selectedExercises 
    };
    onUpdatePatient(updated);
    setSelectedPatient(null);
    setShowExerciseModal(false);
    setActiveView('patients');
  };

  const toggleExercise = (exercise: any) => {
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id);
      if (exists) return prev.filter(e => e.id !== exercise.id);
      return [...prev, exercise];
    });
  };

  const handleImageUpload = async (url: string) => {
    setProfileImage(url);
    if (!user?.id) return;
    try {
      await updateDoc(doc(db, 'users', user.id), {
        profilePicture: url,
        avatar: url
      });
    } catch (err) {
      console.error('Error updating profile picture:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const updateData: any = {
        profileCompleted: true,
        doctorProfile: {
          education: profileData.education,
          experience: profileData.experience,
          specialization: profileData.specialization,
          availableDays,
          timings: profileData.timings,
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
    }
    setSavingProfile(false);
  };

  return (
    <div className="min-h-screen flex text-slate-200">
      {/* Sidebar */}
      <aside className="w-72 glass-card border-r border-white/10 rounded-none flex flex-col bg-black/20 backdrop-blur-md">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <ImageUpload
              currentImage={profileImage}
              userId={user?.id || ''}
              onImageUpload={handleImageUpload}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">Dr. {user?.name}</p>
              <p className="text-primary text-xs uppercase tracking-wider font-bold">Physiotherapist</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-4">
          {[
            { id: 'waiting', label: 'Waiting List', icon: <Users className="w-5 h-5" />, count: waitingPatients.length },
            { id: 'consultation', label: 'In Progress', icon: <Activity className="w-5 h-5" />, count: consultingPatients.length },
            { id: 'patients', label: 'Patient History', icon: <Calendar className="w-5 h-5" />, count: patients.length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as DoctorView)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeView === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]'
              }`}
            >
               <div className="flex items-center gap-3">
                 {item.icon}
                 <span className="font-medium">{item.label}</span>
               </div>
               <span className={`px-2 py-0.5 rounded-full text-xs ${activeView === item.id ? 'bg-white/20' : 'bg-white/5'}`}>
                 <CounterAnimation value={item.count} duration={1} />
               </span>
             </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {isCheckedIn ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Checked In</span>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDoctorCheckIn}
              disabled={isCheckingIn}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)] transition-all mb-8"
            >
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{isCheckingIn ? 'Checking in...' : 'Check In'}</span>
            </motion.button>
          )}
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)] transition-all">
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="px-4 py-6 border-b border-white/5 bg-black/10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {activeView === 'waiting' ? 'Patient Queue' : activeView === 'consultation' ? 'Live Consultations' : 'All Records'}
          </h1>
        </header>

        {/* Profile Completion Banner */}
        {!isProfileComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 glass-card p-4 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <p className="text-amber-200 font-medium">Complete your profile to get started</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileModal(true)}
              className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/30 hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)] transition-colors"
            >
              Complete Now
            </motion.button>
          </motion.div>
        )}

        <main className="flex-1 max-w-7xl mx-auto px-4 py-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
               {activeView === 'waiting' && (
                 <div className="space-y-6">
                   <SmartGreeting name={user?.name || 'Doctor'} />
                   <DailyTip />
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-card p-6 bg-white/5">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" /> Upcoming Patients
                    </h2>
                    <div className="space-y-3">
                      {waitingPatients.map((patient) => (
                        <div 
                          key={patient.id} 
                          onClick={() => handleSelectPatient(patient)}
                            className={`p-4 rounded-xl cursor-pointer border transition-all ${
                              selectedPatient?.id === patient.id 
                                ? 'border-primary bg-primary/10 shadow-md' 
                                : 'border-white/5 hover:border-white/20 bg-white/5 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]'
                            }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white">{patient.name}</span>
                            <span className="text-xs text-slate-500">Token #{patient.token}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-6 bg-white/5 border-l border-white/10">
                    {selectedPatient ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-white">{selectedPatient.name}</h3>
                          <p className="text-slate-400">Status: <span className="text-yellow-500 capitalize">{selectedPatient.status}</span></p>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                          <p className="text-xs text-slate-500 uppercase font-bold mb-2">Diagnosis/Condition</p>
                          <p className="text-slate-300">{(selectedPatient as any).medicalCondition || "No condition specified"}</p>
                        </div>

                        {selectedPatient.status === 'waiting' ? (
                          <button 
                            onClick={handleStartConsultation}
                            className="w-full py-4 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)] transition-all shadow-lg shadow-primary/20"
                          >
                            Start Checkup <ChevronRight className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => setShowExerciseModal(true)}
                            className="w-full py-4 rounded-xl border border-primary text-primary font-bold hover:bg-primary/10 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)] transition-all"
                          >
                            Edit Exercises
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        <Users className="w-12 h-12 mb-2 opacity-20" />
                        <p>Select a patient to begin</p>
                 </div>
                  </div>
                  </div>
                </div>
              )}

               {activeView === 'patients' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patients.map(p => (
                    <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-white">{p.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${(p as any).status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {(p as any).status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">Token: {p.token}</p>
                      <div className="flex flex-wrap gap-1">
                        {(p as any).exercises?.map((ex: any) => (
                          <span key={ex.id} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-400 border border-white/5">{ex.name}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showExerciseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowExerciseModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Prescribe Exercises</h2>
                  <p className="text-sm text-slate-400">Assigning for {selectedPatient?.name}</p>
                </div>
                <button onClick={() => setShowExerciseModal(false)} className="p-2 hover:bg-white/10 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-full transition-colors">
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
                  onClick={handleCompleteConsultation}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)]"
                >
                  Complete & Save Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Completion Modal */}
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
              className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Complete Your Profile</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                   className="p-2 hover:bg-white/10 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <ImageUpload
                    currentImage={profileImage}
                    userId={user?.id || ''}
                    onImageUpload={handleImageUpload}
                    size="lg"
                  />
                </div>
                <p className="text-slate-400 text-xs text-center mb-4">Upload your professional profile photo</p>

                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Education</label>
                  <input
                    type="text"
                    value={profileData.education}
                    onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                    placeholder="e.g., PhD in Physical Therapy, Harvard University"
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
                className="w-full mt-6 py-3 rounded-xl premium-gradient text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)]"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}