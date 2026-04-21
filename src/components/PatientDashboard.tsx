'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Dumbbell, CreditCard, TrendingUp, LogOut, Menu, X, UserCheck, FileText, Upload, Image, File, Copy, Check, Sparkles, Crown, UserPlus, Calculator } from 'lucide-react';
import { User, PatientView } from '@/types';
import PatientOverview from './PatientOverview';
import PatientExercises from './PatientExercises';
import PatientMembership from './PatientMembership';
import PatientProgress from './PatientProgress';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import ImageUpload from './ImageUpload';
import SmartGreeting from './SmartGreeting';
import DailyTip from './DailyTip';
import MedicalEmptyState from './MedicalEmptyState';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  useEffect(() => {
    setProfileImage(user?.patientProfile?.profilePicture || user?.avatar || '');
    setProfileData({
      age: user?.patientProfile?.age || '',
      gender: user?.patientProfile?.gender || '',
      medicalHistory: user?.patientProfile?.medicalHistory || '',
    });
  }, [user]);

  const isAssigned = user.status === 'assigned' && user.assignedDoctorName;
  const isMember = user.isMember && user.membershipStatus === 'active';
  const isPendingApproval = user.membershipStatus === 'pendingApproval';
  const isProfileComplete = user?.profileCompleted && user?.patientProfile?.age;

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = onSnapshot(collection(db, 'users', user.id, 'reports'), (snapshot) => {
        const fetchedReports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate()
        }));
        setReports(fetchedReports);
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    
    setUploading(true);
    try {
      const fileRef = ref(storage, `reports/${user.id}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      
      await addDoc(collection(db, 'users', user.id, 'reports'), {
        fileName: file.name,
        fileUrl: downloadUrl,
        fileType,
        uploadedAt: new Date()
      });
    } catch (err) {
      console.error('Error uploading file:', err);
    }
    setUploading(false);
  };

  const handleSubmitMembershipRequest = async () => {
    if (!trxId.trim() || !user?.id) return;
    
    setSubmitting(true);
    try {
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

  const handleImageUpload = async (url: string) => {
    setProfileImage(url);
    if (!user?.id) return;
    try {
      await updateDoc(doc(db, 'users', user.id), {
        profilePicture: url,
        avatar: url,
        'patientProfile.profilePicture': url
      });
    } catch (err) {
      console.error('Error updating profile picture:', err);
    }
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
            className="space-y-6"
          >
            <motion.div variants={slideUpVariant} className="glass-card-interactive p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Upload Medical Reports</h2>
              <p className="text-slate-400 text-sm mb-4">Upload PDF or images (MRI, X-rays) for your doctor to view</p>
              <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-primary/50 hover:scale-[1.02] hover:shadow-crimson-glow transition-all">
                <input type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-300 font-medium">
                    {uploading ? 'Uploading...' : 'Click to upload files'}
                  </p>
                  <p className="text-slate-500 text-sm mt-1">PDF or Images (MRI, X-rays)</p>
                </div>
              </label>
            </motion.div>
            
            <motion.div variants={slideUpVariant} className="glass-card-interactive p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Your Reports</h2>
              {reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <motion.div
                      key={report.id}
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
                          <p className="text-slate-400 text-xs">{report.uploadedAt?.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm hover:bg-primary/30 hover:scale-[1.02] hover:shadow-crimson-glow transition-all"
                      >
                        View
                      </a>
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
    <div className="min-h-screen flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -280,
        }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-72 glass-card border-r border-white/10 rounded-none flex flex-col bg-black/20"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <ImageUpload
              currentImage={profileImage}
              userId={user?.id || ''}
              onImageUpload={handleImageUpload}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{user.name}</p>
              <p className="text-slate-400 text-sm">Patient Profile</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveView(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeView === item.id
                  ? 'premium-gradient text-white shadow-lg shadow-crimson-intense'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 hover:shadow-crimson-glow'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-white hover:bg-red-500 hover:shadow-crimson-intense transition-all border border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
        <header className="glass-card border-t-0 border-x-0 rounded-none px-4 py-4 flex items-center justify-between bg-black/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-400" />
          </button>
          
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

        {isAssigned ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 glass-card p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full premium-gradient flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Assigned Specialist</p>
                <p className="text-white font-semibold text-lg">{user.assignedDoctorName}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 glass-card p-4 bg-amber-500/5 border border-amber-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-amber-500 font-semibold uppercase text-xs tracking-widest">Status: Queue</p>
                <p className="text-slate-400 text-sm">Assigning a physiotherapist shortly...</p>
              </div>
            </div>
          </motion.div>
        )}

        <main className="flex-1 max-w-7xl mx-auto px-4 py-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
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
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full premium-gradient flex items-center justify-center"
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">Request Sent!</h2>
                  <p className="text-slate-400">We'll review your payment and activate your membership shortly.</p>
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

                  <p className="text-slate-400 text-sm mb-6">
                    To activate your membership, please pay the fees at the Clinic Reception or transfer to our bank account below.
                  </p>

                  <div className="glass-card p-4 rounded-xl mb-6">
                    <div className="flex items-center justify-between mb-2">
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
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-slate-400 text-sm">Title</span>
                      <span className="text-white font-medium">Physio Clinic</span>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
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
    </div>
  );
}