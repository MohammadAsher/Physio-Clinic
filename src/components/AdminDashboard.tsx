'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Shield, ArrowRight, X, Check, Clock, FileText, QrCode, XCircle, PartyPopper } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { User } from '@/types';

interface AdminDashboardProps {
  users: User[];
  onAssignRole: (userId: string, role: 'patient' | 'doctor') => void;
  onLogout: () => void;
}

export default function AdminDashboard({ users, onAssignRole, onLogout }: AdminDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const doctorList = users.filter(u => u.role === 'doctor');
    setDoctors(doctorList);
  }, [users]);

  const patients = users.filter(u => u.role === 'patient');
  const unassignedPatients = patients.filter(u => u.status !== 'assigned');
  const assignedPatients = patients.filter(u => u.status === 'assigned');
  const pendingMembershipRequests = patients.filter(u => u.membershipStatus === 'pending' || u.membershipStatus === 'pendingApproval');

  const handleAssignDoctor = async (patientId: string, doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;
    
    try {
      await updateDoc(doc(db, 'users', patientId), {
        assignedDoctorId: doctorId,
        assignedDoctorName: `Dr. ${doctor.name}`,
        status: 'assigned'
      });
    } catch (err) {
      console.error('Error assigning doctor:', err);
    }
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

  const handleApproveMembership = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isMember: true,
        membershipStatus: 'active',
        membershipType: 'silver'
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      console.error('Error approving membership:', err);
    }
  };

  const handleRejectMembership = async (userId: string) => {
    try {
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
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-slate-400">Manage users, patients, and memberships</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className="glass-button secondary flex items-center gap-2"
          >
            <span>Sign Out</span>
          </motion.button>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl blue-gradient flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Patients</h2>
            </div>
            <p className="text-4xl font-bold text-sky mb-2">{patients.length}</p>
            <p className="text-slate-400 text-sm">Registered patients</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl red-gradient flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Doctors</h2>
            </div>
            <p className="text-4xl font-bold text-primary mb-2">{doctors.length}</p>
            <p className="text-slate-400 text-sm">Active physiotherapists</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">Unassigned</h2>
            </div>
            <p className="text-4xl font-bold text-amber-500 mb-2">{unassignedPatients.length}</p>
            <p className="text-slate-400 text-sm">Awaiting assignment</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">Pending</h2>
            </div>
            <p className="text-4xl font-bold text-purple-500 mb-2">{pendingMembershipRequests.length}</p>
            <p className="text-slate-400 text-sm">Membership requests</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-white">Scan QR</h2>
            </div>
            <p className="text-xl font-bold text-primary mb-2">Attendance</p>
            <p className="text-slate-400 text-sm">Scan member QR code</p>
          </motion.div>
        </div>

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
                <div key={patient.id} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full premium-gradient flex items-center justify-center">
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
                  <select
                    className="glass-input w-full text-sm"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAssignDoctor(patient.id, e.target.value);
                      }
                    }}
                  >
                    <option value="" disabled>Assign a doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name}
                      </option>
                    ))}
                  </select>
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
              {pendingMembershipRequests.map((patient) => (
                <div key={patient.id} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-purple-400 font-semibold">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{patient.name}</p>
                        <p className="text-slate-400 text-xs">
                          Status: {(patient as any).membershipStatus === 'pendingApproval' ? 'Pending Approval' : 'Waiting for Payment'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {(patient as any).submittedTrxID && (
                    <div className="mb-3 p-2 bg-amber-500/10 rounded-lg">
                      <p className="text-amber-400 text-xs mb-1">Transaction ID</p>
                      <p className="text-white font-mono text-sm">{(patient as any).submittedTrxID}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {(patient as any).membershipStatus === 'pendingApproval' ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApproveMembership(patient.id)}
                          className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRejectMembership(patient.id)}
                          className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </motion.button>
                      </>
                    ) : (
                      <div className="flex-1 px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm text-center">
                        Awaiting Payment
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {pendingMembershipRequests.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending membership requests</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

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
              <div key={patient.id} className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full premium-gradient flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {patient.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{patient.name}</p>
                      <p className="text-slate-400 text-xs">Dr. {patient.assignedDoctorName}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status || 'waiting')}`}>
                    {patient.status === 'assigned' ? 'Waiting' : patient.status || 'waiting'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(patient.id, 'waiting')}
                    className="flex-1 px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs hover:bg-yellow-500/30 transition-colors"
                  >
                    Waiting
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(patient.id, 'consulting')}
                    className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-colors"
                  >
                    In Consultation
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(patient.id, 'completed')}
                    className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ))}
            {assignedPatients.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No assigned patients yet</p>
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
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full premium-gradient flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'doctor' 
                      ? 'bg-primary/20 text-primary' 
                      : user.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-sky/20 text-sky'
                  }`}>
                    {user.role}
                  </span>
                  {user.role === 'patient' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onAssignRole(user.id, 'doctor')}
                      className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-sm hover:bg-primary/30 transition-colors"
                    >
                      Make Doctor
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users registered yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}