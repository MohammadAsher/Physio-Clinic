'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, LogOut, FileText, Crown, UserPlus, UserCheck, X, Check, Copy, Menu, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import { User, PatientView } from '@/types';
import Logo from './Logo';
import PatientOverview from './PatientOverview';
import ReportsManagement from './ReportsManagement';
import SmartGreeting from './SmartGreeting';
import DailyTip from './DailyTip';
import RoleBasedQuotes from './RoleBasedQuotes';
import PremiumCard from './PremiumCard';
import ImageUpload from './ImageUpload';
import FileViewerModal from './FileViewerModal';
import MedicalEmptyState from './MedicalEmptyState';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

const navItems: { id: PatientView; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'reports', label: 'Medical Vault', icon: <FileText className="w-5 h-5" /> },
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
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(user?.patientProfile?.profilePicture || user?.profilePicture || user?.avatar || '');
  const [profileData, setProfileData] = useState({
    fullName: user?.patientProfile?.fullName || user?.name || '',
    age: user?.patientProfile?.age || '',
    gender: user?.patientProfile?.gender || '',
    bloodGroup: user?.patientProfile?.bloodGroup || '',
    phone: user?.patientProfile?.phone || user?.phone || '',
    emergencyContact: user?.patientProfile?.emergencyContact || '',
    address: user?.patientProfile?.address || '',
    primaryConcern: user?.patientProfile?.primaryConcern || '',
    medicalHistory: user?.patientProfile?.medicalHistory || '',
  });

  // Automatically handle sidebar based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize(); // Set initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setProfileImage(user?.patientProfile?.profilePicture || user?.profilePicture || user?.avatar || '');
    setProfileData({
      fullName: user?.patientProfile?.fullName || user?.name || '',
      age: user?.patientProfile?.age || '',
      gender: user?.patientProfile?.gender || '',
      bloodGroup: user?.patientProfile?.bloodGroup || '',
      phone: user?.patientProfile?.phone || user?.phone || '',
      emergencyContact: user?.patientProfile?.emergencyContact || '',
      address: user?.patientProfile?.address || '',
      primaryConcern: user?.patientProfile?.primaryConcern || '',
      medicalHistory: user?.patientProfile?.medicalHistory || '',
    });
  }, [user]);

  const [freshUserData, setFreshUserData] = useState<User | null>(null);

  const isAssigned = !!freshUserData?.assignedTherapistName;
  const isMember = freshUserData?.isMember && freshUserData?.membershipStatus === 'active';
  const isPendingApproval = freshUserData?.membershipStatus === 'pendingApproval';
  const isProfileComplete = freshUserData?.profileCompleted && freshUserData?.patientProfile?.age;

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.id), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as User;
          setFreshUserData(data);
          setProfileImage(data?.patientProfile?.profilePicture || data?.profilePicture || data?.avatar || '');
          setProfileData({
            fullName: data?.patientProfile?.fullName || data?.name || '',
            age: data?.patientProfile?.age || '',
            gender: data?.patientProfile?.gender || '',
            bloodGroup: data?.patientProfile?.bloodGroup || '',
            phone: data?.patientProfile?.phone || data?.phone || '',
            emergencyContact: data?.patientProfile?.emergencyContact || '',
            address: data?.patientProfile?.address || '',
            primaryConcern: data?.patientProfile?.primaryConcern || '',
            medicalHistory: data?.patientProfile?.medicalHistory || '',
          });
        }
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

  const handleSubmitMembershipRequest = async () => {
    if (!trxId.trim() || !user?.id) return;

    setSubmitting(true);
    try {
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
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowProfileModal(true)}
                className="w-full mb-4 px-4 py-3.5 rounded-xl premium-gradient text-white font-semibold flex items-center justify-center gap-3 shadow-lg shadow-crimson-intense text-sm md:text-base"
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
              <PremiumCard backgroundImage="https://images.unsplash.com/photo-1586983690570-5c6ddc6d9c68?w=800&q=80" className="document p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-600 to-crimson-700 flex items-center justify-center shadow-lg shadow-rose-900/30 flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white drop-shadow-lg">Medical Vault</h3>
                      <p className="text-rose-400 text-xs">{freshUserData?.reports?.length || 0} report(s) uploaded</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveView('reports')}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-xs font-medium hover:bg-white/20 hover:border-white/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    View All <Upload className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {(freshUserData?.reports || []).slice(-3).reverse().map((report: any, idx: number) => (
                    <div
                      key={report.id || idx}
                      onClick={() => setActiveView('reports')}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:border-rose-500/30 transition-all gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex-shrink-0">
                          {report.fileType === 'image' ? (
                            <Upload className="w-3 h-3 text-rose-400" />
                          ) : (
                            <FileText className="w-3 h-3 text-rose-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs truncate max-w-[140px] sm:max-w-[200px]">{report.reportName || report.fileName}</p>
                          <p className="text-slate-500 text-[10px]">{new Date(report.uploadedAt?.seconds ? report.uploadedAt.seconds * 1000 : report.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {report.showToDoctor ? (
                          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">Shared</span>
                        ) : (
                          <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded">Private</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCard>
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
      case 'reports':
        return <ReportsManagement user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      
      {/* Mobile Sidebar Overlay Wrapped inside AnimatePresence Properly */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? 240 : (window.innerWidth < 1024 ? 0 : 68),
          x: window.innerWidth < 1024 && !sidebarOpen ? -240 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed lg:relative top-0 bottom-0 left-0 z-50 bg-black/90 lg:bg-black/60 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen flex-shrink-0 overflow-hidden`}
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          {sidebarOpen && (
            <Logo width={100} height={28} showTagline={false} className="cursor-pointer" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-auto"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                activeView === item.id
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={item.label}
            >
              {item.icon}
              <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                !sidebarOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}>
                {item.label}
              </span>
              {activeView === item.id && sidebarOpen && (
                <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full">
        
        {/* Header */}
        <header className="bg-slate-900/95 backdrop-blur-sm border-b border-white/5 px-4 md:px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors lg:hidden flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent truncate">
              {navItems.find(i => i.id === activeView)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveView('reports')}
              className="px-2.5 md:px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-[11px] md:text-xs font-bold uppercase tracking-wider hover:bg-rose-500/20 transition-all flex items-center gap-1.5 shadow-lg shadow-rose-900/10"
            >
              <FileText className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="hidden xs:inline">Vault</span>
              <span className="xs:hidden">Vault</span>
              {(freshUserData?.reports?.filter((r: any) => r.showToDoctor)?.length ?? 0) > 0 && (
                <span className="bg-emerald-500 text-white text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full">
                  {freshUserData?.reports?.filter((r: any) => r.showToDoctor)?.length}
                </span>
              )}
            </button>

            <button
              onClick={onLogout}
              className="px-2.5 md:px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] md:text-sm font-bold uppercase tracking-wider hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center gap-1.5"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-8">
            
            {/* Treatment Status Bar */}
            {isAssigned ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 glass-card-interactive p-4 md:p-6 rounded-2xl relative overflow-hidden group"
              >
                <div className="absolute -inset-10 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 blur-3xl opacity-50 pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
                    />
                    <span className="text-emerald-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Live Assignment</span>
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-white mb-1">Your Care Team is Ready</h3>
                  <p className="text-slate-300 text-xs md:text-sm mb-6 max-w-md">
                    {freshUserData?.assignedDoctorName ? `Dr. ${freshUserData.assignedDoctorName} has successfully assigned ` : 'We have ' }
                    <span className="font-semibold text-cyan-400">{freshUserData?.assignedTherapistName}</span>
                    {freshUserData?.assignedDoctorName ? ' for your session.' : ' your assigned physiotherapist.'}
                  </p>

                  {/* Care Team Connection Flowchart */}
                  <div className="flex items-center justify-center gap-2 sm:gap-6 w-full max-w-sm">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a2 2 0 11-4 0 2 2 0 014 0zM6 11a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-400 text-[9px] md:text-xs mt-1 truncate max-w-[60px] md:max-w-none">
                        {freshUserData?.assignedDoctorName ? `Dr. ${freshUserData.assignedDoctorName.split(' ')[0]}` : 'Doctor'}
                      </p>
                    </div>

                    <div className="flex-1 relative h-2 min-w-[30px]">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2" />
                      <motion.div
                        animate={{ x: ['0%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="absolute top-0 w-1.5 h-1.5 bg-cyan-400 rounded-full"
                      />
                    </div>

                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center border border-rose-400/40">
                        <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-rose-400" />
                      </div>
                      <p className="text-slate-400 text-[9px] md:text-xs mt-1">You</p>
                    </div>

                    <div className="flex-1 relative h-2 min-w-[30px]">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2" />
                      <motion.div
                        animate={{ x: ['0%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear', delay: 0.5 }}
                        className="absolute top-0 w-1.5 h-1.5 bg-emerald-400 rounded-full"
                      />
                    </div>

                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg">
                        <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <p className="text-slate-400 text-[9px] md:text-xs mt-1 truncate max-w-[60px] md:max-w-none text-center">
                        {freshUserData?.assignedTherapistName ? freshUserData.assignedTherapistName.split(' ')[0] : 'Therapist'}
                      </p>
                    </div>
                  </div>

                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 glass-card p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-amber-500 font-semibold uppercase text-[10px] tracking-widest">Status: Queue</p>
                    <p className="text-slate-400 text-xs md:text-sm">Assigning a physiotherapist shortly...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Motivation Section */}
            <section className="py-4 md:py-6">
              <RoleBasedQuotes role="patient" />
            </section>

            {/* Dynamic Rendering Section */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Membership Modal */}
      <AnimatePresence>
        {showMembershipModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div onClick={() => setShowMembershipModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md glass-card p-5 md:p-8 rounded-2xl shadow-2xl my-auto max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowMembershipModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              {requestSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">Payment Successful!</h2>
                  <p className="text-slate-400 text-sm">Waiting for Admin Approval</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-5">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full premium-gradient flex items-center justify-center">
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gradient">Join Elite Membership</h2>
                  </div>

                  <p className="text-slate-400 text-xs md:text-sm mb-4">
                    Activate your membership by paying the fees via these methods:
                  </p>

                  {/* Bank info */}
                  <div className="glass-card p-3.5 rounded-xl mb-3 text-xs md:text-sm">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">Bank Transfer</h4>
                    <div className="space-y-2 text-slate-300">
                      <div className="flex justify-between"><span className="text-slate-500">Bank</span><span className="text-white font-medium">National Bank</span></div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Account #</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-mono">0000-0000-0000</span>
                          <button onClick={copyToClipboard} className="p-1 hover:bg-white/10 rounded">
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile wallets */}
                  <div className="glass-card p-3.5 rounded-xl mb-4 text-xs md:text-sm">
                    <h4 className="text-white font-semibold mb-2">EasyPaisa / JazzCash</h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between p-2 bg-white/5 rounded"><span className="text-slate-400">EasyPaisa</span><span className="text-white font-mono">0300-1234567</span></div>
                      <div className="flex justify-between p-2 bg-white/5 rounded"><span className="text-slate-400">JazzCash</span><span className="text-white font-mono">0333-1234567</span></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-slate-400 text-xs md:text-sm mb-1.5 block">Receipt Number / Transaction ID</label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g., TRX123456789"
                      className="glass-input w-full text-sm"
                    />
                  </div>

                  <button
                    onClick={handleSubmitMembershipRequest}
                    disabled={!trxId.trim() || submitting}
                    className="w-full py-3 rounded-xl premium-gradient text-white font-bold text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Completion Modal Placeholder */}
      {/* (Baqi dropdown fix code is modal ke andar as-it-is add hojayega) */}

    </div>
  );
}