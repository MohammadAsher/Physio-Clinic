'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, Activity, CheckCircle, ChevronRight, X, 
  Calendar, MapPin, FileText, UserCircle, File, Image
} from 'lucide-react';
import { DoctorView, PatientReport } from '@/types';
import { db, storage } from '@/lib/firebase';
import { 
  doc, 
  updateDoc, 
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(user?.profilePicture || user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Reports State
  const [patientReports, setPatientReports] = useState<PatientReport[]>([]);
  
  // Profile Data State
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    education: user?.doctorProfile?.education || '',
    educationCertificate: user?.doctorProfile?.educationCertificate || '',
    experience: user?.doctorProfile?.experience || '',
    specialization: user?.doctorProfile?.specialization || '',
    availableDays: user?.doctorProfile?.availableDays || [],
    startTime: user?.doctorProfile?.startTime || '9:00 AM',
    endTime: user?.doctorProfile?.endTime || '5:00 PM',
  });
  const [uploadingCert, setUploadingCert] = useState(false);
  const [certUploadProgress, setCertUploadProgress] = useState(0);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeOptions = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

  const isStep1Complete = !!profileData.education && !!profileData.specialization;
  const isStep2Complete = !!profileData.experience;
  const isStep3Complete = profileData.availableDays.length > 0 && !!profileData.startTime && !!profileData.endTime;
  const canSubmit = isStep1Complete && isStep2Complete && isStep3Complete;

  const certInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  
  const handleDegreeCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      alert('Please upload a PDF or image file (JPG, PNG)');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 2MB');
      return;
    }

    console.log('Certificate Upload Started:', file.name, file.size, file.type);
    setUploadingCert(true);
    setCertUploadProgress(0);

    try {
      const fileName = `certificates/${user.id}/education_${Date.now()}_${file.name}`;
      console.log('Creating storage reference:', fileName);
      const fileRef = ref(storage, fileName);
      
      console.log('Starting upload task...');
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload Progress:', Math.round(progress) + '%');
            setCertUploadProgress(progress);
          },
          (error) => {
            console.error('Upload Error:', error);
            alert('Upload failed. Please try again.');
            reject(error);
          },
          async () => {
            console.log('Upload complete, getting download URL...');
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Download URL received:', downloadUrl);
            setProfileData({ ...profileData, educationCertificate: downloadUrl });
            resolve();
          }
        );
      });
      console.log('Certificate upload successful!');
    } catch (err) {
      console.error('Error uploading certificate:', err);
      alert('Upload failed. Please try again.');
    }
    setUploadingCert(false);
    if (certInputRef.current) {
      certInputRef.current.value = '';
    }
  };

  const toggleDay = (day: string) => {
    const newDays = profileData.availableDays.includes(day)
      ? profileData.availableDays.filter(d => d !== day)
      : [...profileData.availableDays, day];
    setProfileData({ ...profileData, availableDays: newDays });
  };

  // Profile status check
  const isProfileComplete = !!(user?.doctorProfile?.education && user?.doctorProfile?.specialization);

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

  useEffect(() => {
    if (!isProfileComplete) {
      setShowProfileModal(true);
    }
  }, [isProfileComplete]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const updateData = {
        profileCompleted: true,
        doctorProfile: { 
          education: profileData.education,
          educationCertificate: profileData.educationCertificate,
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
                  onClick={() => setSelectedPatient(patient)}
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
<motion.button
                          whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(225, 29, 72, 0.4)' }}
                          whileTap={{ scale: 0.97 }}
                          className="px-6 py-3 bg-gradient-to-r from-rose-600 to-crimson-700 rounded-xl text-xs font-bold shadow-lg shadow-rose-900/30 backdrop-blur-xl border border-white/10 transition-all uppercase tracking-wider"
                        >
                          Start Session
                        </motion.button>
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
                               <a
                                 href={report.fileUrl}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-300 text-xs font-bold uppercase tracking-wider hover:bg-rose-500/20 hover:scale-105 transition-all border border-rose-500/20"
                               >
                                 View
                               </a>
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
    </div>
  );
}