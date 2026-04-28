'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Dumbbell, CreditCard, TrendingUp, LogOut, UserCheck, FileText, Upload, Image, File, Copy, Check, Sparkles, Crown, UserPlus, X } from 'lucide-react';
import { User, PatientView } from '@/types';
import Logo from './Logo';
import PatientOverview from './PatientOverview';
import PatientExercises from './PatientExercises';
import PatientMembership from './PatientMembership';
import PatientProgress from './PatientProgress';
import { db } from '@/lib/firebase';
import { doc, updateDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import ImageUpload from './ImageUpload';
import SmartGreeting from './SmartGreeting';
import DailyTip from './DailyTip';
import MedicalEmptyState from './MedicalEmptyState';
import FileViewerModal from './FileViewerModal';
import RoleBasedQuotes from './RoleBasedQuotes';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

const navItems: { id: PatientView; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'exercises', label: 'Exercises', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'membership', label: 'Membership', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'reports', label: 'My Reports', icon: <FileText className="w-5 h-5" /> },
];

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

export default function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [activeView, setActiveView] = useState<PatientView>('overview');
  const [reports, setReports] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(user?.patientProfile?.profilePicture || user?.avatar || '');
  const [profileData, setProfileData] = useState({
    age: user?.patientProfile?.age || '',
    gender: user?.patientProfile?.gender || '',
    medicalHistory: user?.patientProfile?.medicalHistory || '',
  });
  // File viewer modal state
  const [selectedReport, setSelectedReport] = useState<{ fileUrl: string; fileName: string; fileType: 'image' | 'pdf' | 'other' } | null>(null);

  useEffect(() => {
    setProfileImage(user?.patientProfile?.profilePicture || user?.avatar || '');
    setProfileData({
      age: user?.patientProfile?.age || '',
      gender: user?.patientProfile?.gender || '',
      medicalHistory: user?.patientProfile?.medicalHistory || '',
    });
  }, [user]);

  const getPlanBadge = (amount?: number) => {
    if (!amount || amount === 0) return null;
    if (amount >= 3000 && amount <= 7000) {
      return { label: 'Silver', color: 'bg-slate-400 text-white' };
    } else if (amount > 7000 && amount <= 12000) {
      return { label: 'Gold', color: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black' };
    } else if (amount > 12000) {
      return { label: 'Diamond', color: 'bg-gradient-to-r from-blue-400 to-purple-500 text-white' };
    }
    return null;
  };

  const planBadge = getPlanBadge(user?.totalFees);

   const [freshUserData, setFreshUserData] = useState<User | null>(null);
   
    // Computed variables for UI state
    const isAssigned = !!freshUserData?.assignedTherapistName;
    const isMember = freshUserData?.isMember && freshUserData?.membershipStatus === 'active';
    const isPendingApproval = freshUserData?.membershipStatus === 'pendingApproval';
    const isProfileComplete = freshUserData?.profileCompleted && freshUserData?.patientProfile?.age;

   useEffect(() => {
     if (user?.id) {
       setReports(user?.reports || []);
       const unsubscribe = onSnapshot(doc(db, 'users', user.id), (docSnap) => {
         if (docSnap.exists()) {
           const data = docSnap.data() as User;
           setReports(data?.reports || []);
           setFreshUserData(data); // Update fresh user data from Firestore
           
           // Also update local state fields for immediate use
           setProfileImage(data?.patientProfile?.profilePicture || data?.avatar || '');
           setProfileData({
             age: data?.patientProfile?.age || '',
             gender: data?.patientProfile?.gender || '',
             medicalHistory: data?.patientProfile?.medicalHistory || '',
           });
         }
       });
       return () => unsubscribe();
     }
   }, [user?.id]);
   
   // Keep local state in sync with incoming user prop (for initial load)
   useEffect(() => {
     setProfileImage(user?.patientProfile?.profilePicture || user?.avatar || '');
     setProfileData({
       age: user?.patientProfile?.age || '',
       gender: user?.patientProfile?.gender || '',
       medicalHistory: user?.patientProfile?.medicalHistory || '',
     });
   }, [user]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      console.log('Upload Error: No file or user ID');
      return;
    }
    
    console.log('Processing file:', file.name, file.size, file.type);
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      console.log('File converted to Base64, length:', base64.length);
      
      const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
      const newReport = {
        fileName: file.name,
        fileUrl: base64,
        fileType,
        uploadedAt: new Date()
      };
      
      console.log('Saving to Firestore reports array...');
      const currentReports = user?.reports || [];
      await updateDoc(doc(db, 'users', user.id), {
        reports: [...currentReports, newReport]
      });
      console.log('Report saved successfully!');
    } catch (err) {
      console.error('Error saving report:', err);
      alert('Upload failed. Please try again.');
    }
    setUploading(false);
    if (e.target) e.target.value = '';
  };

  const handleSubmitMembershipRequest = async () => {
     if (!trxId.trim() || !user?.id) return;
     
     setSubmitting(true);
     try {
       // Create a membership request document in Firestore
       const requestDoc = {
         patientId: user.id,
         patientName: user.name,
         patientEmail: user.email,
         transactionId: trxId.trim(),
         status: 'pending' as const,
         requestDate: new Date(),
         createdAt: new Date()
       };
       
       await addDoc(collection(db, 'membershipRequests'), requestDoc);
       
       // Also update user document for backwards compatibility and quick lookup
       await updateDoc(doc(db, 'users', user.id), {
         membershipStatus: 'pendingApproval',
         submittedTrxID: trxId.trim(),
         membershipRequestDate: new Date()
       });
       
       setRequestSent(true);
       setTimeout(() => {
         setShowMembershipModal(false);
         setRequestSent(false);
         setTrxId('');
       }, 2000);
     } catch (err) {
       console.error('Error submitting membership request:', err);
     }
     setSubmitting(false);
   };

  const copyToClipboard = () => {
    navigator.clipboard.writeText('0000-0000-0000');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePatientProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const updateData: any = {
        profileCompleted: true,
        patientProfile: {
          age: Number(profileData.age),
          gender: profileData.gender,
          medicalHistory: profileData.medicalHistory,
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

   const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Profile Card with Plan Badge */}
            <motion.div variants={slideUpVariant} className="glass-card-interactive p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <p className="text-slate-400 text-sm">Patient Dashboard</p>
                </div>
                {planBadge && (
                  <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${planBadge.color}`}>
                    {planBadge.label} Plan
                  </div>
                )}
              </div>
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
            
            <motion.div variants={slideUpVariant}>
              <SmartGreeting name={user.name} />
            </motion.div>

            <motion.div variants={slideUpVariant}>
              <DailyTip />
            </motion.div>

             <motion.div variants={slideUpVariant}>
               <div className="glass-card-interactive p-6 rounded-2xl bg-gradient-to-br from-rose-500/10 to-crimson-700/5 border border-rose-500/20">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-600 to-crimson-700 flex items-center justify-center shadow-lg shadow-rose-900/30">
                       <FileText className="w-6 h-6 text-white" />
                     </div>
                     <div>
                       <h3 className="text-lg font-semibold text-white">Medical Reports</h3>
                       <p className="text-rose-400 text-xs">Upload PDF, X-rays, MRI reports</p>
                     </div>
                   </div>
                 </div>
                 <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-rose-500/30 rounded-xl cursor-pointer hover:border-rose-500 hover:bg-rose-500/10 transition-all group">
                   <input 
                     type="file" 
                     accept="image/*,.pdf" 
                     onChange={handleUpload} 
                     className="hidden" 
                     disabled={uploading} 
                   />
                   <div className="text-center">
                     {uploading ? (
                       <>
                         <div className="w-8 h-8 mx-auto mb-2 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                         <p className="text-rose-300 font-medium">Uploading...</p>
                       </>
                     ) : (
                       <>
                         <Upload className="w-10 h-10 mx-auto mb-2 text-rose-400 group-hover:text-rose-300 transition-colors" />
                         <p className="text-rose-200 font-medium">Tap to Upload Report</p>
                         <p className="text-slate-500 text-xs mt-1">PDF, JPG, PNG (Max 10MB)</p>
                       </>
                     )}
                   </div>
                 </label>
                 
                 {/* Recent reports list */}
                 {reports.length > 0 && (
                   <div className="mt-6 space-y-2">
                     <p className="text-slate-400 text-sm mb-2">Recent Uploads:</p>
                     {reports.slice(-3).reverse().map((report) => (
                       <div 
                         key={Math.random()}
                         className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:border-rose-500/30 transition-all"
                         onClick={() => setSelectedReport({
                           fileUrl: report.fileUrl,
                           fileName: report.fileName,
                           fileType: report.fileType
                         })}
                       >
                         <div className="flex items-center gap-2">
                           {report.fileType === 'image' ? (
                             <Image className="w-4 h-4 text-primary" />
                           ) : (
                             <File className="w-4 h-4 text-red-400" />
                           )}
                           <span className="text-white text-sm truncate max-w-[200px]">{report.fileName}</span>
                         </div>
                         <span className="text-rose-400 text-xs">View</span>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </motion.div>

            <motion.div variants={slideUpVariant}>
              <PatientOverview 
                user={user} 
                onUpgradeClick={() => setShowMembershipModal(true)} 
                isMember={isMember}
                isPendingApproval={isPendingApproval}
              />
            </motion.div>
          </motion.div>
        );
      case 'exercises':
        return <PatientExercises patient={null} />;
      case 'membership':
        return <PatientMembership patient={null} />;
      case 'progress':
        return <PatientProgress patient={null} />;
      case 'reports':
        return (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-2xl mx-auto"
          >
            <motion.div variants={slideUpVariant} className="glass-card-interactive p-8 rounded-2xl bg-gradient-to-br from-rose-500/10 to-crimson-700/5 border border-rose-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-600 to-crimson-700 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Upload Medical Reports</h2>
                  <p className="text-rose-400 text-xs">PDF or images (MRI, X-rays) for your doctor</p>
                </div>
              </div>
              <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-rose-500/30 rounded-xl cursor-pointer hover:border-rose-500 hover:bg-rose-500/10 transition-all group">
                <input type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
                <div className="text-center">
                  {uploading ? (
                    <>
                      <div className="w-8 h-8 mx-auto mb-3 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                      <p className="text-rose-300 font-medium">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto mb-3 text-rose-400 group-hover:text-rose-300 transition-colors" />
                      <p className="text-rose-200 font-medium">Click to upload files</p>
                      <p className="text-slate-500 text-sm mt-1">PDF, JPG, PNG (Max 10MB)</p>
                    </>
                  )}
                </div>
              </label>
            </motion.div>
            
            <motion.div variants={slideUpVariant} className="glass-card-interactive p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Your Reports</h2>
              {reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <motion.div
                      key={report.id || Math.random()}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:shadow-crimson-glow transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {report.fileType === 'image' ? (
                          <Image className="w-8 h-8 text-primary" />
                        ) : (
                          <File className="w-8 h-8 text-red-400" />
                        )}
                        <div>
                          <p className="text-white font-medium">{report.fileName}</p>
                          <p className="text-slate-400 text-xs">
                            {report.uploadedAt?.toLocaleDateString?.() || new Date(report.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedReport({
                          fileUrl: report.fileUrl,
                          fileName: report.fileName,
                          fileType: report.fileType
                        })}
                        className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm hover:bg-primary/30 hover:scale-[1.02] hover:shadow-crimson-glow transition-all"
                      >
                        View Report
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <MedicalEmptyState
                  title="No Reports Yet"
                  description="Upload your medical reports, prescriptions, and X-rays for your doctor to review."
                  className="bg-white/5"
                />
              )}
            </motion.div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="glass-card border-t-0 border-x-0 rounded-none px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo width={120} height={36} showTagline={false} className="cursor-pointer" onClick={() => setActiveView('overview')} />
        </div>
        
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          {navItems.find(i => i.id === activeView)?.label}
        </h1>

        <div className="flex items-center gap-2">
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-red-500/10 hover:scale-[1.02] hover:shadow-crimson-glow rounded-lg group transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400" />
          </button>
        </div>
      </header>

       {/* Main Content - Centered */}
       <div className="w-full max-w-6xl mx-auto px-4 py-8">
         {isAssigned ? (
           <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="mt-4 mb-6 glass-card p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
           >
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full premium-gradient flex items-center justify-center border-2 border-rose-400/60">
                   <UserCheck className="w-5 h-5 text-white" />
                 </div>
               <div>
                 <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Status: Assigned</p>
                 <p className="text-white font-semibold text-lg">{freshUserData?.assignedTherapistName}</p>
               </div>
             </div>
           </motion.div>
         ) : (
           <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="mt-4 mb-6 glass-card p-4 bg-amber-500/5 border border-amber-500/20"
           >
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border-2 border-rose-400/60">
                 <UserCheck className="w-5 h-5 text-amber-500" />
               </div>
               <div>
                 <p className="text-amber-500 font-semibold uppercase text-xs tracking-widest">Status: Queue</p>
                 <p className="text-slate-400 text-sm">Assigning a physiotherapist shortly...</p>
               </div>
             </div>
           </motion.div>
         )}

        {/* Role-Based Quotes Section */}
        <section className="py-10 px-4">
          <RoleBasedQuotes role="patient" />
        </section>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showMembershipModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMembershipModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-md glass-card p-8 rounded-2xl shadow-2xl"
            >
              <button
                onClick={() => setShowMembershipModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 hover:scale-[1.02] hover:shadow-crimson-glow rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

                {requestSent ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-white mb-2"
                    >
                      Payment Successful!
                    </motion.h2>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-slate-400"
                    >
                      Waiting for Admin Approval
                    </motion.p>
                    <motion.div
                      initial={{ scale: [1, 1.2, 1] }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="w-4 h-4 mx-auto mt-4 rounded-full bg-emerald-400"
                    />
                  </motion.div>
                ) : (
                <>
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full premium-gradient flex items-center justify-center"
                    >
                      <Crown className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gradient">Join the Elite Membership Program</h2>
                  </div>

                   <p className="text-slate-400 text-sm mb-4">
                     To activate your membership, please pay the fees via the methods below:
                   </p>

                   {/* Bank Transfer Section */}
                   <div className="glass-card p-4 rounded-xl mb-4">
                     <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                       <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                       </svg>
                       Bank Transfer
                     </h4>
                     <div className="space-y-3">
                       <div className="flex items-center justify-between">
                         <span className="text-slate-400 text-sm">Bank Name</span>
                         <span className="text-white font-medium">National Bank</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-slate-400 text-sm">Account Number</span>
                         <div className="flex items-center gap-2">
                           <span className="text-white font-mono">0000-0000-0000</span>
                           <button
                             onClick={copyToClipboard}
                             className="p-1 hover:bg-white/10 hover:scale-[1.02] hover:shadow-crimson-glow rounded transition-colors"
                           >
                             {copied ? (
                               <Check className="w-4 h-4 text-emerald-400" />
                             ) : (
                               <Copy className="w-4 h-4 text-slate-400" />
                             )}
                           </button>
                         </div>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-slate-400 text-sm">Account Title</span>
                         <span className="text-white font-medium">Physio Clinic</span>
                       </div>
                     </div>
                   </div>

                   {/* Digital Payment Section */}
                   <div className="glass-card p-4 rounded-xl mb-4">
                     <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                       <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                       </svg>
                       EasyPaisa / JazzCash
                     </h4>
                     <div className="space-y-3">
                       <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                         <span className="text-slate-400 text-sm">EasyPaisa Number</span>
                         <span className="text-white font-mono">0300-1234567</span>
                       </div>
                       <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                         <span className="text-slate-400 text-sm">JazzCash Number</span>
                         <span className="text-white font-mono">0333-1234567</span>
                       </div>
                      </div>
                    </div>

                   <div className="mb-6">
                    <label className="text-slate-400 text-sm mb-2 block">Enter Receipt Number or Transaction ID</label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g., TRX123456789"
                      className="glass-input w-full"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitMembershipRequest}
                    disabled={!trxId.trim() || submitting}
                    className="w-full py-4 rounded-xl premium-gradient text-white font-bold shadow-lg shadow-[0_8px_24px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </motion.button>
                </>
              )}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Complete Your Profile</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-white/10 hover:scale-[1.02] hover:shadow-crimson-glow rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Profile Picture Upload */}
              <div className="flex justify-center mb-6">
                <ImageUpload
                  currentImage={profileImage}
                  userId={user?.id || ''}
                  onImageUpload={setProfileImage}
                  size="lg"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Age</label>
                  <input
                    type="number"
                    value={profileData.age}
                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                    placeholder="Enter your age"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Gender</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className="glass-input w-full"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Medical History</label>
                  <textarea
                    value={profileData.medicalHistory}
                    onChange={(e) => setProfileData({ ...profileData, medicalHistory: e.target.value })}
                    placeholder="List any existing conditions, allergies, or past injuries..."
                    rows={4}
                    className="glass-input w-full resize-none"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSavePatientProfile}
                disabled={savingProfile || !profileData.age || !profileData.gender}
                className="w-full mt-6 py-3 rounded-xl premium-gradient text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-crimson-intense"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </motion.button>
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