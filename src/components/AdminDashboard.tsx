'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Shield, ArrowRight, X, Check, CheckCircle, Clock, FileText, QrCode, XCircle, PartyPopper, CreditCard, Eye, Download } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { User } from '@/types';
import { ClinicFeatures, ClinicType, CLINIC_TYPES, getClinicTypeLabel } from '@/types/clinic';
import { useClinicContext } from '@/lib/clinicContext';
import { downloadAppointmentReceipt } from '@/lib/pdfReceipt';
import { getPendingAppointments, approveAppointment, getConfirmedAppointments, removePendingAppointment, PendingAppointment, ConfirmedAppointment } from '@/lib/appointmentState';
import CounterAnimation from './CounterAnimation';
import MedicalEmptyState from './MedicalEmptyState';
import RoleBasedQuotes from './RoleBasedQuotes';
import AnalyticsSuite from './AnalyticsSuite';
import PremiumCard from './PremiumCard';
import CustomDropdown from './CustomDropdown';
import FileViewerModal from './FileViewerModal';

interface AdminDashboardProps {
  users: User[];
  onAssignRole: (userId: string, role: 'patient' | 'doctor' | 'therapist') => void;
  onLogout: () => void;
  features?: ClinicFeatures;
  clinicType?: ClinicType;
}

export default function AdminDashboard({ users, onAssignRole, onLogout, features, clinicType }: AdminDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feeInputs, setFeeInputs] = useState<Record<string, string>>({});
  const [sessionInputs, setSessionInputs] = useState<Record<string, string>>({});
  const [membershipRequests, setMembershipRequests] = useState<any[]>([]);
  const [doctorSelections, setDoctorSelections] = useState<Record<string, string>>({});
  const [showClinicTypeModal, setShowClinicTypeModal] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [approvedPayments, setApprovedPayments] = useState<any[]>([]);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotFileName, setScreenshotFileName] = useState('');

  const { setClinicType: updateClinicType } = useClinicContext();
  const hasTherapists = features?.hasTherapists ?? true;

  // Load pending & confirmed appointments from localStorage
  useEffect(() => {
    const loadAppointments = () => {
      const pending = getPendingAppointments();
      setPendingPayments(pending);
      const confirmed = getConfirmedAppointments();
      setApprovedPayments(confirmed);
    };
    loadAppointments();

    // Listen for localStorage changes from other tabs/components
    window.addEventListener('storage', loadAppointments);
    return () => window.removeEventListener('storage', loadAppointments);
  }, []);

  useEffect(() => {
    const doctorList = users.filter(u => u.role === 'doctor');
    setDoctors(doctorList);
  }, [users]);

  // Fetch membership requests in real-time
  useEffect(() => {
    const requestsRef = collection(db, 'membershipRequests');
    const unsubscribe = onSnapshot(requestsRef, (snapshot) => {
     const requests = snapshot.docs.map(doc => ({
       id: doc.id,
       ...doc.data(),
       requestDate: doc.data().requestDate?.toDate() || doc.data().requestDate || new Date()
     } as any));
     setMembershipRequests(requests.filter(r => r.status === 'pending'));
    });
    return () => unsubscribe();
  }, []);

  // Fetch pending payment verifications from Firestore (merged with localStorage)
  useEffect(() => {
    const q = query(
      collection(db, 'appointments'),
      where('status', '==', 'pending_verification')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreData = snapshot.docs.map(doc => ({
        id: doc.id,
        appointmentId: doc.id,
        ...doc.data(),
      }));

      const localPending = getPendingAppointments();
      const firestoreIds = new Set(localPending.map(p => p.appointmentId));

      // Merge: Firestore appointments not already in localStorage
      const merged = [...localPending, ...firestoreData.filter(f => !firestoreIds.has(f.appointmentId))];
      setPendingPayments(merged);
    });
    return () => unsubscribe();
  }, []);

  const patients = users.filter(u => u.role === 'patient');
  const unassignedPatients = patients.filter(u => u.status !== 'assigned');
  const assignedPatients = patients.filter(u => u.status === 'assigned');
  const pendingMembershipRequests = patients.filter(u => u.membershipStatus === 'pending' || u.membershipStatus === 'pendingApproval');

  const handleAssignDoctor = async (patientId: string, doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    // Update local state immediately for UI responsiveness
    setDoctorSelections(prev => ({ ...prev, [patientId]: doctorId }));

    try {
      await updateDoc(doc(db, 'users', patientId), {
        assignedDoctorId: doctorId,
        assignedDoctorName: `Dr. ${doctor.name}`,
        status: 'assigned'
      });
    } catch (err) {
      console.error('Error assigning doctor:', err);
      // Revert on error
      setDoctorSelections(prev => {
        const updated = { ...prev };
        delete updated[patientId];
        return updated;
      });
    }
   };

    const handleApprovePayment = async (id: string) => {
      try {
        const appointment = pendingPayments.find(p => p.id === id);
        if (!appointment) return;

        // Update Firestore if appointmentId exists
        if (appointment.appointmentId) {
          await updateDoc(doc(db, 'appointments', appointment.appointmentId), {
            status: 'confirmed',
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'Admin',
          });
        }

        // Move from pending to confirmed in localStorage, tagging doctorId
        const confirmed = approveAppointment(id, appointment.doctorId || '');

        // Update local state
        setPendingPayments(prev => prev.filter(p => p.id !== id));
        if (confirmed) {
          setApprovedPayments(prev => [confirmed, ...prev]);
        }
      } catch (err) {
        console.error('Error approving payment:', err);
      }
    };

    const handleViewScreenshot = (url: string, fileName: string = 'payment-proof') => {
      setScreenshotUrl(url);
      setScreenshotFileName(fileName);
      setShowScreenshotModal(true);
    };

   const handleUpdateStatus = async (patientId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'users', patientId), { 
        status,
        patientStatus: status 
      });

      if (status === 'consulting' || status === 'completed') {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
          const today = new Date().toISOString().split('T')[0];
          await addDoc(collection(db, 'attendance'), {
            userId: patientId,
            date: today,
            timestamp: new Date(),
            role: 'patient'
          });
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

const handleApproveMembership = async (requestId: string, userId: string, totalSessions: number, fees: number) => {
       if (!totalSessions || totalSessions <= 0) return;
       const totalSessionsNum = Number(totalSessions);
       const feesNum = Number(fees) || 0;
       try {
          // Update the membership request status
          await updateDoc(doc(db, 'membershipRequests', requestId), {
            status: 'approved',
            approvedAt: new Date(),
            totalSessions: totalSessionsNum,
            feesPaid: feesNum
          });
          
          // Update the patient's user document
          await updateDoc(doc(db, 'users', userId), {
            isMember: true,
            membershipStatus: 'active',
            membershipType: 'custom',
            totalSessions: totalSessionsNum,
            totalFees: feesNum,
            completedSessions: 0
          });
          
          // Clear both inputs for this patient
          setFeeInputs({ ...feeInputs, [userId]: '' });
          setSessionInputs({ ...sessionInputs, [userId]: '' });
         
         setShowConfetti(true);
         setTimeout(() => setShowConfetti(false), 3000);
       } catch (err) {
         console.error('Error approving membership:', err);
       }
     };

  const handleRejectMembership = async (requestId: string, userId: string) => {
    try {
      // Update the membership request status
      await updateDoc(doc(db, 'membershipRequests', requestId), {
        status: 'rejected',
        rejectedAt: new Date()
      });
      
      // Update the patient's user document
      await updateDoc(doc(db, 'users', userId), {
        membershipStatus: 'rejected',
        submittedTrxID: null
      });
    } catch (err) {
      console.error('Error rejecting membership:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500/20 text-yellow-400';
      case 'consulting': return 'bg-blue-500/20 text-blue-400';
      case 'completed': 
      case 'assigned': return 'bg-emerald-500/20 text-emerald-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

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

  return (
    <>
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-slate-950 p-4 md:p-6"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          variants={slideUpVariant}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-slate-400">Manage users, patients, and memberships</p>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowClinicTypeModal(true)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-rose-500/30 transition-all text-sm flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Clinic: {clinicType ? getClinicTypeLabel(clinicType) : 'Physiotherapy'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="glass-button secondary flex items-center gap-2"
            >
              <span>Sign Out</span>
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 3 }}
              className="fixed inset-0 z-50 pointer-events-none"
            >
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * window.innerWidth, 
                    y: -20,
                    scale: Math.random() * 0.5 + 0.5
                  }}
                  animate={{ 
                    y: window.innerHeight + 20,
                    rotate: Math.random() * 720
                  }}
                  transition={{ 
                    duration: Math.random() * 2 + 2,
                    ease: 'linear'
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)]
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role-Based Quotes Section */}
        <div className="py-6">
          <RoleBasedQuotes role="admin" />
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Patients', value: patients.length, icon: <Users className="w-5 h-5" />, color: 'blue', backgroundType: 'medical', accent: 'from-blue-500 to-blue-600' },
              { label: 'Doctors', value: doctors.length, icon: <UserCheck className="w-5 h-5" />, color: 'red', backgroundType: 'clinical', accent: 'from-rose-500 to-rose-600' },
              { label: 'Unassigned', value: unassignedPatients.length, icon: <Clock className="w-5 h-5" />, color: 'amber', backgroundType: 'medical', accent: 'from-amber-500 to-amber-600' },
              { label: 'Pending', value: membershipRequests.length, icon: <FileText className="w-5 h-5" />, color: 'purple', backgroundType: 'document', accent: 'from-purple-500 to-purple-600' },
              { label: 'Scan QR', value: '', icon: <QrCode className="w-5 h-5" />, color: 'sky', backgroundType: 'clinical', placeholder: true, accent: 'from-sky-500 to-sky-600' },
            ].map((stat, index) => (
             <PremiumCard
               key={stat.label}
               backgroundImage={stat.backgroundType === 'medical' ? 'https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=800&q=80' : stat.backgroundType === 'clinical' ? 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800&q=80' : stat.backgroundType === 'document' ? 'https://images.unsplash.com/photo-1586983690570-5c6ddc6d9c68?w=800&q=80' : 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80'}
               className="finance"
               onClick={() => {}}
             >
               <div className="p-6">
                 <div className="flex items-center gap-3 mb-4">
                   <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.accent} flex items-center justify-center text-white shadow-lg`}>
                     {stat.icon}
                   </div>
                   <h2 className="text-xl font-semibold text-white drop-shadow-lg">{stat.label}</h2>
                 </div>
                 <p className="text-4xl font-bold text-sky-400 mb-2 drop-shadow-lg">
                   {stat.placeholder ? (
                     <span className="text-lg bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Attendance</span>
                   ) : (
                     <CounterAnimation value={Number(stat.value)} duration={2} />
                   )}
                 </p>
                 <p className="text-slate-300 text-sm">
                   {stat.placeholder ? 'Scan member QR code' : `Total ${stat.label.toLowerCase()}`}
                 </p>
                 {/* Priority badge for patients with low sessions */}
                 {stat.label === 'Patients' && patients.some(p => p.isMember && p.totalSessions && (p.totalSessions - (p.completedSessions || 0)) <= 2) && (
                   <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="absolute top-2 right-2"
                   >
                     <div className="relative">
                       <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-sm opacity-75 animate-pulse" />
                       <div className="relative w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                         ⚠
                       </div>
                     </div>
                   </motion.div>
                 )}
               </div>
             </PremiumCard>
           ))}
         </div>

        {/* Analytics Suite */}
        <AnalyticsSuite isAdmin={true} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-white">Patient Assignment</h2>
            </div>

            <div className="space-y-4">
              {unassignedPatients.map((patient) => (
                <div key={patient.id} className="p-4 bg-white/5 rounded-xl overflow-visible">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full premium-gradient flex items-center justify-center border-2 border-rose-400/60">
                          <span className="text-white font-semibold">
                            {patient.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                       <div>
                        <p className="text-white font-medium">{patient.name}</p>
                        <p className="text-slate-400 text-sm">{patient.email}</p>
                       </div>
                    </div>
                  </div>
                   <div className="mt-3 overflow-visible">
                    <CustomDropdown
                      options={doctors.map(doc => ({
                        id: doc.id,
                        name: `Dr. ${doc.name}`,
                        avatar: doc.profilePicture || doc.avatar,
                      }))}
                      value={doctorSelections[patient.id] || ''}
                      onChange={(doctorId) => handleAssignDoctor(patient.id, doctorId)}
                      placeholder="Assign a doctor..."
                    />
                  </div>
                </div>
              ))}
              {unassignedPatients.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>All patients are assigned</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-sky" />
              <h2 className="text-xl font-semibold text-white">Membership Requests</h2>
            </div>

             <div className="space-y-4">
               {membershipRequests.map((request) => {
                 // Find the corresponding patient from users
                 const patient = users.find(u => u.id === request.patientId);
                 if (!patient) return null;
                 
                 return (
                 <motion.div
                   key={request.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="p-4 glass-card border border-white/10 rounded-xl backdrop-blur-xl"
                 >
                   <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
                       {patient.name.charAt(0).toUpperCase()}
                     </div>
                     <div className="flex-1">
                       <h3 className="text-white font-semibold text-lg">{patient.name}</h3>
                       <p className="text-slate-400 text-sm">{patient.email || patient.phone}</p>
                       <div className="flex items-center gap-2 mt-1">
                         <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                           Pending Approval
                         </span>
                       </div>
                     </div>
                   </div>
                   
                   {request.transactionId && (
                     <div className="mb-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                       <p className="text-amber-400 text-xs mb-1">Transaction ID</p>
                       <p className="text-white font-mono text-sm">{request.transactionId}</p>
                     </div>
                   )}
                   
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-slate-400 text-xs mb-2 block">Fees Paid (PKR)</label>
                        <input
                          type="number"
                          placeholder="e.g., 5000"
                          value={feeInputs[patient.id] || ''}
                          onChange={(e) => setFeeInputs({ ...feeInputs, [patient.id]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-2 block">Total Sessions</label>
                        <input
                          type="number"
                          placeholder="e.g., 10"
                          value={sessionInputs[patient.id] || ''}
                          onChange={(e) => setSessionInputs({ ...sessionInputs, [patient.id]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                        />
                      </div>
                    </div>
                   
<div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const totalSessions = Number(sessionInputs[patient.id]);
                          const fees = Number(feeInputs[patient.id]) || 0;
                          if (totalSessions > 0) {
                            handleApproveMembership(request.id, patient.id, totalSessions, fees);
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium text-sm hover:shadow-[0_8px_24px_rgba(16,185,129,0.4)] transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </motion.button>
                     <motion.button
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={() => handleRejectMembership(request.id, patient.id)}
                       className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium text-sm hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)] transition-all"
                     >
                       <XCircle className="w-4 h-4" />
                       Reject
                     </motion.button>
                   </div>
                 </motion.div>
                 )}
               )}
               {membershipRequests.length === 0 && (
                 <div className="text-center py-12">
                   <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                     <FileText className="w-8 h-8 text-slate-600" />
                   </div>
                   <p className="text-slate-400 text-lg">No pending membership requests</p>
                   <p className="text-slate-500 text-sm mt-1">All membership requests have been processed</p>
                 </div>
               )}
             </div>
         </motion.div>
         </div>

         {/* Pending Payment Confirmations */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="glass-card p-6 mt-6"
         >
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <CreditCard className="w-6 h-6 text-amber-400" />
               <h2 className="text-xl font-semibold text-white">Pending Payment Confirmations</h2>
             </div>
             {pendingPayments.length > 0 && (
               <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                 {pendingPayments.length} pending
               </span>
             )}
           </div>

           {pendingPayments.length === 0 ? (
             <div className="text-center py-12">
               <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                 <CreditCard className="w-8 h-8 text-slate-600" />
               </div>
               <p className="text-slate-400 text-lg">No pending payment confirmations</p>
               <p className="text-slate-500 text-sm mt-1">All bookings have been verified</p>
             </div>
           ) : (
             <div className="space-y-4">
               {pendingPayments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 glass-card border border-amber-500/20 rounded-xl"
                  >
                 <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* Column 1 — Patient & Doctor Info */}
                      <div className="sm:col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {appointment.patientName?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium">{appointment.patientName}</p>
                          <p className="text-slate-400 text-sm">{appointment.patientPhone}</p>
                          <p className="text-slate-300 text-xs mt-0.5">
                            <span className="text-slate-300">Doctor:</span> {appointment.doctorName || 'N/A'}
                          </p>
                          <p className="text-slate-300 text-xs mt-0.5">
                            <span className="text-slate-300">Txn ID:</span> {appointment.transactionId || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Column 2 — Appointment Details (Date, Time & Token) */}
                      <div className="sm:col-span-3 space-y-1.5">
                        <div>
                          <span className="text-slate-300 text-xs font-medium">Date:</span>
                          <span className="text-white text-sm ml-1.5">{appointment.date || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-300 text-xs font-medium">Time:</span>
                          <span className="text-white text-sm ml-1.5">{appointment.slot || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-300 text-xs font-medium">Token:</span>
                          <span className="text-white text-sm ml-1.5">{appointment.token || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Column 3 — Amount & Screenshot */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <div>
                          <span className="text-slate-300 text-xs font-medium">Amount:</span>
                          <span className="text-amber-400 font-bold text-sm ml-1.5">PKR {appointment.amount?.toLocaleString() || '1,000'}</span>
                        </div>
                        {appointment.paymentProofUrl ? (
                          <button
                            onClick={() => handleViewScreenshot(appointment.paymentProofUrl, `${appointment.patientName || 'patient'}-payment-proof`)}
                            className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:bg-white/5 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Screenshot
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">No proof uploaded</span>
                        )}
                      </div>

                      {/* Column 4 — Approve Button */}
                      <div className="sm:col-span-2 sm:ml-auto">
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApprovePayment(appointment.id)}
                          className="w-full px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-900/30"
                        >
                          <Check className="w-4 h-4" />
                          Approve / Confirm
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
               ))}
             </div>
           )}
          </motion.div>

          {/* Approved Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-6 mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">Approved Payments</h2>
            </div>

            {approvedPayments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg">No approved payments</p>
                <p className="text-slate-500 text-sm mt-1">Approved bookings will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedPayments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 glass-card border border-emerald-500/20 rounded-xl"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {appointment.patientName?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium">{appointment.patientName}</p>
                          <p className="text-slate-400 text-sm">{appointment.patientPhone}</p>
                          <p className="text-slate-300 text-xs mt-0.5">
                            <span className="text-slate-300">Doctor:</span> {appointment.doctorName || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="sm:col-span-3 space-y-1.5">
                        <div>
                          <span className="text-slate-300 text-xs font-medium">Token:</span>
                          <span className="text-white text-sm ml-1.5 font-bold">{appointment.token || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-300 text-xs font-medium">Date:</span>
                          <span className="text-white text-sm ml-1.5">{appointment.date || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="sm:col-span-3 space-y-1.5">
                        <div>
                          <span className="text-slate-300 text-xs font-medium">Time:</span>
                          <span className="text-white text-sm ml-1.5">{appointment.slot || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-300 text-xs font-medium">Amount:</span>
                          <span className="text-amber-400 font-bold text-sm ml-1.5">PKR {appointment.amount?.toLocaleString() || '1,000'}</span>
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex gap-2">
                        {appointment.paymentProofUrl && (
                          <button
                            onClick={() => handleViewScreenshot(appointment.paymentProofUrl, `${appointment.patientName || 'patient'}-payment-proof`)}
                            className="p-2 rounded-lg bg-white/5 text-sky-400 hover:bg-white/10 transition-colors"
                            title="View payment screenshot"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => downloadAppointmentReceipt({
                            clinicName: 'Body Experts Clinic',
                            clinicAddress: '123 Wellness Street, Health District',
                            patientName: appointment.patientName,
                            patientPhone: appointment.patientPhone,
                            doctorName: appointment.doctorName || '',
                            doctorSpecialty: appointment.doctorSpecialty || 'General Physician',
                            appointmentDate: appointment.date || '',
                            appointmentTime: appointment.slot || '',
                            amount: appointment.amount || 1000,
                            token: appointment.token || '',
                            appointmentId: appointment.appointmentId || appointment.id,
                            status: 'confirmed',
                            verifiedBy: 'Admin',
                            verifiedAt: appointment.verifiedAt || new Date().toLocaleDateString(),
                          })}
                          className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg transition-all"
                          title="Download official confirmed receipt"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
           </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-white">Assigned Patients - Status Control</h2>
            </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {assignedPatients.map((patient) => (
               <div key={patient.id} className="p-4 glass-card border border-white/10 rounded-xl backdrop-blur-xl">
                 <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-xl premium-gradient flex items-center justify-center border-2 border-rose-400/60">
                     <span className="text-white font-bold text-lg">
                       {patient.name.charAt(0).toUpperCase()}
                     </span>
                   </div>
                   <div className="flex-1">
                     <h3 className="text-white font-semibold text-lg">{patient.name}</h3>
                     <p className="text-slate-400 text-sm">Dr. {patient.assignedDoctorName || 'Unassigned'}</p>
                   </div>
                 </div>
                 
                 {/* Membership Info */}
                  {patient.isMember ? (
                    <div className="mb-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-emerald-400 text-xs font-medium">MEMBER</span>
                        <span className="text-emerald-400 text-xs">
                          {patient.totalFees ? `PKR ${patient.totalFees.toLocaleString()}` : 'Premium'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Sessions: {patient.completedSessions || 0}/{patient.totalSessions || 0}</span>
                        <span className="text-slate-400 text-xs">{patient.membershipType || 'Custom'}</span>
                      </div>
                       {/* Priority Warning Badge for Low Sessions */}
                       {(patient.totalSessions || 0) > 0 && ((patient.totalSessions || 0) - (patient.completedSessions || 0)) <= 2 && (
                         <motion.div
                           initial={{ opacity: 0, y: -10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="mt-3 p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30"
                         >
                           <div className="flex items-center gap-2">
                             <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 animate-pulse" />
                             <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                               Priority: Only {(patient.totalSessions || 0) - (patient.completedSessions || 0)} session{(patient.totalSessions || 0) - (patient.completedSessions || 0) > 1 ? 's' : ''} remaining!
                             </span>
                           </div>
                         </motion.div>
                       )}
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <p className="text-slate-400 text-sm">Not a member</p>
                    </div>
                  )}
                 
                 {/* Status */}
                 <div className="flex items-center gap-2 mb-4">
                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status || 'waiting')}`}>
                     {patient.status === 'assigned' ? 'Waiting' : patient.status || 'waiting'}
                   </span>
                 </div>
                 
                 {/* Action Buttons */}
                 <div className="flex gap-2">
                   <button
                     onClick={() => handleUpdateStatus(patient.id, 'waiting')}
                     className="flex-1 px-2 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs hover:bg-yellow-500/30 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)] transition-colors"
                   >
                     Waiting
                   </button>
                   <button
                     onClick={() => handleUpdateStatus(patient.id, 'consulting')}
                     className="flex-1 px-2 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)] transition-colors"
                   >
                     In Session
                   </button>
                   <button
                     onClick={() => handleUpdateStatus(patient.id, 'completed')}
                     className="flex-1 px-2 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(220,38,38,0.4)] transition-colors"
                   >
                     Done
                   </button>
                 </div>
               </div>
             ))}
             {assignedPatients.length === 0 && (
               <div className="col-span-full text-center py-12">
                 <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                   <Users className="w-8 h-8 text-slate-600" />
                 </div>
                 <p className="text-slate-400 text-lg">No assigned patients yet</p>
                 <p className="text-slate-500 text-sm mt-1">Patients will appear here after assignment</p>
               </div>
             )}
           </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 mt-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-white">User Management</h2>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ scale: 1.01 }}
                className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/5 rounded-xl hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
              >
                <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                   <div className="w-10 h-10 rounded-full premium-gradient flex items-center justify-center border-2 border-rose-400/60">
                     <span className="text-white font-semibold">
                       {user.name.charAt(0).toUpperCase()}
                     </span>
                   </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <p className="text-slate-400 text-sm truncate">{user.email}</p>
                  </div>
                </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'doctor' 
                        ? 'bg-primary/20 text-primary' 
                        : user.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-400'
                        : user.role === 'therapist'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-sky/20 text-sky'
                    }`}>
                      {user.role}
                    </span>
                    {user.role === 'patient' && (
                      <div className="relative">
                        <select
                          value={user.role}
                           onChange={(e) => {
                             const role = e.target.value;
                             if (role !== 'patient') {
                               onAssignRole(user.id, role as 'doctor' | 'patient' | 'therapist');
                             }
                           }}
                          className="bg-slate-800/50 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="patient">Patient</option>
                          <option value="doctor">{features ? features.personnelLabel : 'Doctor'}</option>
                          {hasTherapists && (
                            <option value="therapist">Therapist</option>
                          )}
                        </select>
                      </div>
                    )}
                  </div>
              </motion.div>
            ))}
            {users.length === 0 && (
              <MedicalEmptyState
                title="No Users Yet"
                description="Start by adding your first patient or doctor to the system."
              />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>

    <AnimatePresence>
      {showClinicTypeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-white/10 shadow-2xl my-8"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Change Clinic Type</h2>
              <button
                onClick={() => setShowClinicTypeModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-400 text-sm mb-4">
                Changing the clinic type will update the dashboard layout, navigation, and staff roles across the application.
              </p>
              <div className="space-y-3">
                {CLINIC_TYPES.map((type) => {
                  const isSelected = clinicType === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={async () => {
                        await updateClinicType(type.value);
                        setShowClinicTypeModal(false);
                      }}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left
                        ${
                          isSelected
                            ? 'border-rose-500/50 bg-rose-500/10 shadow-lg shadow-rose-900/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }
                      `}
                    >
                      <div
                        className={`
                          w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0
                          ${
                            isSelected
                              ? `bg-gradient-to-br ${type.primaryColor}`
                              : 'bg-white/5 border border-white/10'
                          }
                        `}
                      >
                        <span>{type.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold">{type.label}</h3>
                          {type.isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mt-0.5">{type.description}</p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
     </AnimatePresence>

     <FileViewerModal
       isOpen={showScreenshotModal}
       onClose={() => setShowScreenshotModal(false)}
       fileUrl={screenshotUrl}
       fileName={screenshotFileName}
       fileType="image"
     />
     </>
   );
 }
