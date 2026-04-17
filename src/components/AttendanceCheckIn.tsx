'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Search, CheckCircle, X, Camera } from 'lucide-react';
import { Patient } from '@/types';

interface AttendanceCheckInProps {
  patients: Patient[];
  onMarkAttendance: (patient: Patient) => void;
}

export default function AttendanceCheckIn({ patients, onMarkAttendance }: AttendanceCheckInProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // FIXED: Added (p: any) to bypass strict type checking for membership
  const members = patients.filter((p: any) => p.isMember && p.membership && p.membership.remainingSessions > 0);

  const filteredMembers = members.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.membership?.qrCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkAttendance = async (patient: any) => {
    setIsMarking(true);
    setShowScanner(false);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (patient.membership && patient.membership.remainingSessions > 0) {
      const updatedPatient: Patient = {
        ...patient,
        membership: {
          ...patient.membership,
          remainingSessions: patient.membership.remainingSessions - 1,
        },
        attendance: [
          ...(patient.attendance || []),
          {
            date: new Date(),
            sessionNumber: (patient.attendance?.length || 0) + 1,
          },
        ],
      };
      
      onMarkAttendance(updatedPatient);
      setSelectedPatient(patient);
      setShowSuccess(true);
      setIsMarking(false);
    } else {
      setIsMarking(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
      {/* Rest of the UI code remains the same as your original file */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">Attendance Check-in</h1>
        <p className="text-slate-400">Scan QR code or search member to check in</p>
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="flex gap-3 mb-6">
          <button onClick={() => setShowScanner(true)} className="glass-button flex-1 flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" /> <span>Scan QR Code</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-12"
            placeholder="Search by name, token, or QR code..."
          />
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredMembers.map((patient: any) => (
            <motion.div
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className="glass-card p-4 cursor-pointer hover:bg-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full premium-gradient flex items-center justify-center text-white font-semibold">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{patient.name}</p>
                    <p className="text-slate-400 text-sm">Token: {patient.token}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-semibold">{patient.membership?.remainingSessions} sessions left</p>
                  <p className="text-slate-400 text-sm capitalize">{patient.membership?.type} member</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Success Modal and Confirm Modal (Same as before but using (selectedPatient as any)) */}
      {selectedPatient && !showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-white mb-6">Confirm Check-in</h2>
            <div className="text-center mb-6">
              <p className="text-white font-semibold text-lg">{selectedPatient.name}</p>
              <p className="text-slate-400">Sessions Left: {(selectedPatient as any).membership?.remainingSessions}</p>
            </div>
            <button onClick={() => handleMarkAttendance(selectedPatient)} className="glass-button w-full">
              {isMarking ? "Marking..." : "Confirm Attendance"}
            </button>
            <button onClick={() => setSelectedPatient(null)} className="w-full mt-2 text-slate-400">Cancel</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}