'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, Activity, CheckCircle, ChevronRight, X, 
  Calendar, MapPin, FileText, Upload, UserCircle, File, Image, Loader2
} from 'lucide-react';
import { DoctorView, PatientReport } from '@/types';
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  updateDoc, 
  onSnapshot,
  addDoc
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
  const [uploadingReport, setUploadingReport] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile Data State
  const [profileData, setProfileData] = useState({
    education: user?.doctorProfile?.education || '',
    experience: user?.doctorProfile?.experience || '',
    specialization: user?.doctorProfile?.specialization || '',
    timings: user?.doctorProfile?.timings || '9:00 AM - 5:00 PM',
  });

  // Profile status check
  const isProfileComplete = !!(user?.doctorProfile?.education && user?.doctorProfile?.specialization);

  // Fetch patient reports in real-time
  useEffect(() => {
    const patientId = selectedPatient?.id || selectedPatient?.userId;
    if (patientId) {
      const reportsRef = collection(db, 'users', patientId, 'reports');
      const unsubscribe = onSnapshot(reportsRef, (snapshot) => {
        const reports: PatientReport[] = snapshot.docs.map(doc => ({
          id: doc.id,
          fileName: doc.data().fileName,
          fileUrl: doc.data().fileUrl,
          fileType: doc.data().fileType,
          uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
        }));
        setPatientReports(reports);
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
        doctorProfile: { ...profileData },
        profilePicture: profileImage,
        avatar: profileImage
      };
      await updateDoc(doc(db, 'users', user.id), updateData);
      setShowProfileModal(false);
      // Show success toast instead of alert in production
      console.log("Profile updated successfully");
    } catch (err) {
      console.error('Error:', err);
    }
    setSavingProfile(false);
  };

  // Doctor uploads report for patient
  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const patientId = selectedPatient?.id || selectedPatient?.userId;
    if (!file || !patientId) return;

    setUploadingReport(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const fileRef = ref(storage, `reports/${patientId}/${fileName}`);

      // Upload with progress tracking using resumable upload
      const uploadTask = uploadBytesResumable(fileRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

            await addDoc(collection(db, 'users', patientId, 'reports'), {
              fileName: file.name,
              fileUrl: downloadUrl,
              fileType,
              uploadedAt: new Date(),
              uploadedBy: user.name,
              doctorId: user.id
            });
            resolve();
          }
        );
      });

      setUploadProgress(0);
    } catch (err) {
      console.error('Error uploading report:', err);
    }
    setUploadingReport(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                         whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(220,38,38,0.4)' }}
                         whileTap={{ scale: 0.97 }}
                         className="px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-500 rounded-xl text-xs font-bold shadow-lg shadow-rose-900/30 transition-all uppercase tracking-wider"
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

                       {/* Upload Section */}
                       <div className="relative">
                         <input
                           id="doctor-report-upload"
                           ref={fileInputRef}
                           type="file"
                           accept="image/*,.pdf,.png,.jpg,.jpeg"
                           onChange={handleReportUpload}
                           className="hidden"
                           disabled={uploadingReport}
                         />
                         
                         {!uploadingReport ? (
                           <motion.label
                             whileHover={{ scale: 1.01 }}
                             whileTap={{ scale: 0.99 }}
                             htmlFor="doctor-report-upload"
                             className="flex items-center justify-center w-full p-6 border-2 border-dashed border-rose-500/30 rounded-2xl cursor-pointer hover:border-rose-500 hover:bg-rose-500/5 transition-all group"
                           >
                             <div className="text-center">
                               <div className="relative mb-2">
                                 <Upload className="w-8 h-8 mx-auto text-rose-400 group-hover:text-rose-300 transition-colors" />
                               </div>
                               <p className="text-sm font-semibold text-rose-200">
                                 Upload Medical Report
                               </p>
                               <p className="text-xs text-slate-500 mt-1">
                                 PDF, JPG, PNG (Maximum 10MB)
                               </p>
                             </div>
                           </motion.label>
                         ) : (
                           <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                             <div className="flex items-center gap-4">
                               <div className="relative w-10 h-10">
                                 <motion.div
                                   animate={{ rotate: 360 }}
                                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                   className="w-full h-full rounded-full border-2 border-rose-500/30 border-t-rose-500"
                                 />
                                 <Loader2 className="w-5 h-5 absolute inset-0 m-auto text-rose-400 animate-pulse" />
                               </div>
                               <div className="flex-1">
                                 <p className="text-sm font-semibold text-rose-200 mb-2">
                                   Uploading... {Math.round(uploadProgress)}%
                                 </p>
                                 <div className="h-2 bg-rose-500/20 rounded-full overflow-hidden">
                                   <motion.div
                                     initial={{ width: 0 }}
                                     animate={{ width: `${uploadProgress}%` }}
                                     transition={{ duration: 0.3 }}
                                     className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                                   />
                                 </div>
                               </div>
                             </div>
                           </div>
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

      {/* Profile Completion Modal - Ultra Luxury */}
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
              {/* Ambient decoration */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-rose-500/10 blur-3xl pointer-events-none" />
              
              <div className="relative p-8">
                {/* Gold-Embossed Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold/20 to-rose-500/20 border border-gold/30 flex items-center justify-center shadow-lg shadow-gold/10"
                  >
                    <UserCircle className="w-10 h-10 text-gold" />
                  </motion.div>
                  <h2 className="text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent">
                    Complete Your Profile
                  </h2>
                  <p className="text-slate-400 text-sm mt-2">
                    Build trust with your patients by sharing your credentials
                  </p>
                </div>

                <div className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gold mb-2 block">
                      Education
                    </label>
                    <input 
                      type="text" 
                      value={profileData.education}
                      onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                      placeholder="e.g. MBBS, DPT from Dow University"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-white placeholder:text-slate-600"
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
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
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
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
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.01, boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="w-full py-4 mt-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider text-sm"
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
                      'Save Profile'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}