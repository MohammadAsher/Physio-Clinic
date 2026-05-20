'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, CheckCircle, ChevronRight, X,
  FileText, UserCircle, File, Image, History,
  LogOut, Stethoscope, ClipboardList, BadgeCheck,
  Phone, Mail, User, Menu, ChevronDown
} from 'lucide-react';
import { DoctorView, PatientReport } from '@/types';
import { db } from '@/lib/firebase';
import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import ImageUpload from './ImageUpload';
import SmartGreeting from './SmartGreeting';
import FileViewerModal from './FileViewerModal';
import { EXERCISES } from '@/lib/data';
import RoleBasedQuotes from './RoleBasedQuotes';
import CustomDropdown from './CustomDropdown';

// ─── Types ────────────────────────────────────────────────────────────────────
type SidebarView = 'waiting' | 'recent';

interface DoctorDashboardProps {
  patients: any[];
  onUpdatePatient: (patient: any) => void;
  user?: any;
  onLogout?: () => void;
  therapists?: any[];
}

interface RecentSession {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  token?: string;
  medicalCondition?: string;
  prescription?: string;
  diagnosis?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedTherapistId?: string;
  assignedTherapistName?: string;
  assignedExercises?: any[];
  checkedAt?: any;
  createdAt?: any;
  membershipType?: string;
  membershipStatus?: string;
  patientProfile?: any;
  reports?: any[];
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    checked:         { label: 'Completed',       cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    under_treatment: { label: 'Under Treatment', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    consulting:      { label: 'Consulting',      cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    waiting:         { label: 'Waiting',         cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.cls}`}>
      <BadgeCheck className="w-3 h-3" />{s.label}
    </span>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="mt-0.5 p-1.5 rounded-lg bg-white/5 text-rose-400 shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">{label}</p>
        <p className="text-sm text-slate-200 leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

// ─── Native Time Picker ───────────────────────────────────────────────────────
function TimePicker({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-rose-500/50 transition-all [color-scheme:dark] cursor-pointer"
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DoctorDashboard({ user, patients, onUpdatePatient, onLogout }: DoctorDashboardProps) {
  const [activeView, setSidebarView] = useState<SidebarView>('waiting');
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedSession, setSelectedSession] = useState<RecentSession | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(user?.profilePicture || user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ fileUrl: string; fileName: string; fileType: 'image' | 'pdf' | 'other' } | null>(null);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  // Doctor profile form
  const [doctorForm, setDoctorForm] = useState({
    specialization: user?.doctorProfile?.specialization || '',
    education:      user?.doctorProfile?.education || '',
    experience:     user?.doctorProfile?.experience || '',
    timingFrom:     '', // time picker value
    timingTo:       '', // time picker value
    availableDays:  (user?.doctorProfile?.availableDays as string[]) || [],
  });

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const toggleDay = (d: string) => setDoctorForm(p => ({
    ...p,
    availableDays: p.availableDays.includes(d) ? p.availableDays.filter(x => x !== d) : [...p.availableDays, d]
  }));

  // ── Fetch therapists ──────────────────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'therapist'));
    return onSnapshot(q, snap => {
      setTherapists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // ── Fetch recent/completed sessions ──────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'patient'),
      where('assignedDoctorId', '==', user.id),
      where('status', 'in', ['checked', 'under_treatment'])
    );
    return onSnapshot(q, snap => {
      const sessions: RecentSession[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || '',
          email: data.email,
          phone: data.phone,
          token: data.token,
          medicalCondition: data.medicalCondition,
          prescription: data.prescription,
          diagnosis: data.diagnosis,
          assignedDoctorId: data.assignedDoctorId,
          assignedDoctorName: data.assignedDoctorName,
          assignedTherapistId: data.assignedTherapistId,
          assignedTherapistName: data.assignedTherapistName,
          assignedExercises: data.assignedExercises || [],
          checkedAt: data.checkedAt,
          createdAt: data.createdAt,
          membershipType: data.membershipType,
          membershipStatus: data.membershipStatus,
          patientProfile: data.patientProfile,
          status: data.status || 'checked',
        };
      }).sort((a, b) => {
        const tA = a.checkedAt?.toDate?.()?.getTime?.() ?? 0;
        const tB = b.checkedAt?.toDate?.()?.getTime?.() ?? 0;
        return tB - tA;
      });
      setRecentSessions(sessions);
    });
  }, [user?.id]);

  // Active = only not-completed
  const activePatients = patients.filter(p =>
    p.status === 'waiting' || p.status === 'consulting' || p.status === 'assigned'
  );

  const isProfileComplete = !!(user?.profileCompleted && user?.doctorProfile?.education && user?.doctorProfile?.specialization);

  // ── Exercises ─────────────────────────────────────────────────────────────────
  const toggleExercise = (exercise: any) => {
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id);
      return exists ? prev.filter(e => e.id !== exercise.id) : [...prev, exercise];
    });
  };

  const handleSaveExercises = async () => {
    if (!selectedPatient?.assignedTherapistId) { alert('Please select a therapist first'); return; }
    const t = therapists.find(t => t.id === selectedPatient.assignedTherapistId);
    if (!t) { alert('Therapist not found.'); return; }
    try {
      await updateDoc(doc(db, 'users', selectedPatient.id), {
        assignedExercises: selectedExercises,
        assignedTherapistId: selectedPatient.assignedTherapistId,
        assignedTherapistName: t.name,
        status: 'under_treatment',
        prescription: selectedPatient.prescription || '',
        role: 'patient',
        totalSessions: selectedPatient.totalSessions || 10,
        lastUpdated: new Date(),
      });
      setSelectedPatient({ ...selectedPatient, assignedExercises: selectedExercises, status: 'under_treatment' });
      setShowExerciseModal(false);
      alert('Exercise plan assigned successfully!');
    } catch (err) { console.error(err); alert('Failed.'); }
  };

  // ── Profile listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    return onSnapshot(doc(db, 'users', user.id), docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const ok = !!(data?.profileCompleted && data?.doctorProfile?.education && data?.doctorProfile?.specialization);
        setSelectedPatient((prev: any) => prev ? { ...prev, profileCompleted: ok } : null);
      }
    });
  }, [user?.id]);

  // ── Patient reports (privacy filtered) ───────────────────────────────────────
  useEffect(() => {
    const patientId = selectedPatient?.id || selectedPatient?.userId;
    if (!patientId) return;
    return onSnapshot(doc(db, 'users', patientId), docSnap => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      const reports: PatientReport[] = (data?.reports || [])
        .filter((r: any) => r.showToDoctor === true)
        .map((r: any, i: number) => ({
          id: r.id || `report-${i}`,
          fileName: r.fileName,
          reportName: r.reportName || r.fileName,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          uploadedAt: r.uploadedAt?.toDate ? r.uploadedAt.toDate() : new Date(r.uploadedAt),
          showToDoctor: r.showToDoctor,
        }));
      setSelectedPatient((prev: any) => prev ? { ...prev, reports } : null);
    });
  }, [selectedPatient?.id, selectedPatient?.userId]);

  // ── Complete session → moves patient to Recent Sessions ───────────────────────
  const handleCompleteSession = async () => {
    if (!selectedPatient || !user?.id) return;
    setIsCompletingSession(true);
    try {
      await updateDoc(doc(db, 'users', selectedPatient.id), {
        status: 'checked',
        assignedDoctorId: user.id,
        assignedDoctorName: user.name,
        checkedAt: serverTimestamp(),
      });
      setSelectedPatient(null); // immediately remove from active view
    } catch (err) { console.error(err); }
    finally { setIsCompletingSession(false); }
  };

  // ── Save doctor profile ───────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    if (!doctorForm.specialization || !doctorForm.education) {
      alert('Specialization and Education are required.');
      return;
    }
    setSavingProfile(true);
    try {
      const timings = doctorForm.timingFrom && doctorForm.timingTo
        ? `${doctorForm.timingFrom} – ${doctorForm.timingTo}`
        : user?.doctorProfile?.timings || '';
      await updateDoc(doc(db, 'users', user.id), {
        profileCompleted: true,
        avatar: profileImage || user.avatar || '',
        doctorProfile: {
          specialization: doctorForm.specialization,
          education:      doctorForm.education,
          experience:     doctorForm.experience,
          timings,
          availableDays:  doctorForm.availableDays,
          profilePicture: profileImage || user.avatar || '',
        },
      });
      setShowProfileModal(false);
    } catch (err) { console.error(err); alert('Failed to save profile.'); }
    setSavingProfile(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Sidebar content (shared between mobile drawer + desktop)
  // ─────────────────────────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      {/* Profile */}
      <div className="relative p-6 border-b border-white/10">
        <div className="flex flex-col items-center gap-3 text-center">
          <ImageUpload currentImage={profileImage} userId={user?.id || ''} onImageUpload={url => setProfileImage(url)} size="lg" />
          <div>
            <p className="text-white font-bold text-lg tracking-wide">Dr. {user?.name}</p>
            <p className="text-rose-500 text-[10px] uppercase tracking-[0.3em] font-black">
              {user?.doctorProfile?.specialization || 'Physiotherapist'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 p-4 space-y-2">
        {/* Waiting List */}
        <button
          onClick={() => { setSidebarView('waiting'); setSelectedSession(null); setSidebarOpen(false); }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
            activeView === 'waiting'
              ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-900/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Waiting List</span>
          </div>
          <div className="flex items-center gap-2">
            {activePatients.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center justify-center">
                {activePatients.length}
              </span>
            )}
            {activeView === 'waiting' && <ChevronRight className="w-4 h-4" />}
          </div>
        </button>

        {/* Recent Sessions */}
        <button
          onClick={() => { setSidebarView('recent'); setSelectedPatient(null); setSidebarOpen(false); }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
            activeView === 'recent'
              ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-900/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <History className="w-5 h-5" />
            <span className="text-sm font-medium">Recent Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            {recentSessions.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center justify-center">
                {recentSessions.length}
              </span>
            )}
            {activeView === 'recent' && <ChevronRight className="w-4 h-4" />}
          </div>
        </button>

        {/* Complete Profile */}
        {!isProfileComplete && (
          <motion.button
            onClick={() => { setShowProfileModal(true); setSidebarOpen(false); }}
            className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-400 border border-amber-500/30 hover:from-amber-500/20 transition-all"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Complete Profile</span>
          </motion.button>
        )}
      </nav>

      <div className="relative p-4 border-t border-white/10">
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-rose-400 text-xs font-medium transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex text-slate-200 bg-[#050505]">

      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-72 border-r border-white/10 flex-col bg-black/60 backdrop-blur-xl relative overflow-hidden shrink-0">
        <div className="absolute top-20 left-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ─────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col bg-[#0a0a0a] border-r border-white/10 md:hidden"
            >
              <div className="absolute top-20 left-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur-xl">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          <div className="text-center">
            <p className="text-white font-bold text-sm">Dr. {user?.name}</p>
            <p className="text-rose-500 text-[10px] uppercase tracking-widest font-black">
              {activeView === 'waiting' ? 'Waiting List' : 'Recent Sessions'}
            </p>
          </div>
          <div className="w-9" /> {/* spacer */}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            <SmartGreeting name={user?.name || 'Doctor'} />

            {/* ══════════════════════════════════════════════════════════════
                VIEW: WAITING LIST
            ══════════════════════════════════════════════════════════════ */}
            {activeView === 'waiting' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

                {/* Patient Queue */}
                <div className="lg:col-span-1 space-y-3">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-rose-500" /> Patient Queue
                  </h2>

                  {activePatients.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 border-2 border-dashed border-white/5 rounded-2xl">
                      <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No patients in queue</p>
                    </div>
                  ) : (
                    activePatients.map(patient => (
                      <motion.div
                        key={patient.id}
                        onClick={() => { setSelectedPatient(patient); setSelectedExercises(patient.exercises || []); }}
                        className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${
                          selectedPatient?.id === patient.id
                            ? 'bg-gradient-to-br from-rose-500/20 to-rose-500/5 border-rose-500/50 shadow-lg shadow-rose-900/20'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-rose-500/30'
                        }`}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-white text-sm">{patient.name}</p>
                            <p className="text-[10px] text-slate-500 mt-1">Token: #{patient.token}</p>
                            {patient.medicalCondition && (
                              <p className="text-[10px] text-rose-400/80 mt-2 line-clamp-1">{patient.medicalCondition}</p>
                            )}
                            <span className={`inline-block mt-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              patient.status === 'consulting' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                            }`}>
                              {patient.status === 'consulting' ? 'In Session' : 'Waiting'}
                            </span>
                          </div>
                          {selectedPatient?.id === patient.id && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                              <ChevronRight className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Patient Detail Panel */}
                <div className="lg:col-span-2">
                  <AnimatePresence mode="wait">
                    {selectedPatient ? (
                      <motion.div
                        key={selectedPatient.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="relative rounded-3xl p-4 md:p-8 bg-gradient-to-b from-white/5 to-white/2 border border-white/10 shadow-2xl overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Header */}
                        <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-white">{selectedPatient.name}</h3>
                            <p className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                              {selectedPatient.medicalCondition || 'General Consultation'}
                            </p>
                          </div>
                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <motion.button
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                              onClick={() => setShowExerciseModal(true)}
                              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-xs font-bold shadow-lg border border-white/10 uppercase tracking-wider"
                            >
                              Assign Exercises
                            </motion.button>

                            {/* ✅ COMPLETE SESSION — removes patient from active, moves to Recent */}
                            <motion.button
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                              onClick={handleCompleteSession}
                              disabled={isCompletingSession}
                              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl text-xs font-bold shadow-lg border border-white/10 uppercase tracking-wider disabled:opacity-60"
                            >
                              {isCompletingSession ? (
                                <span className="flex items-center justify-center gap-2">
                                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                  Completing...
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-2">
                                  <CheckCircle className="w-4 h-4" /> Complete Session
                                </span>
                              )}
                            </motion.button>
                          </div>
                        </div>

                        {/* Reports */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                          className="rounded-2xl p-4 md:p-6 bg-black/40 border border-white/10"
                        >
                          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-rose-400" /> Medical Reports
                          </h4>
                          <div className="space-y-3">
                            {selectedPatient.reports?.length > 0 ? (
                              selectedPatient.reports.map((report: PatientReport, i: number) => (
                                <div key={report.id || i}
                                  className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 rounded-lg bg-rose-500/10 shrink-0">
                                      {report.fileType === 'image' ? <Image className="w-4 h-4 text-rose-400" /> : <File className="w-4 h-4 text-rose-400" />}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-white truncate">{report.reportName || report.fileName}</p>
                                      <p className="text-xs text-slate-400">
                                        {report.uploadedAt?.toLocaleDateString?.('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setSelectedReport({ fileUrl: report.fileUrl, fileName: report.fileName, fileType: (report.fileType === 'image' || report.fileType === 'pdf') ? report.fileType : 'other' })}
                                    className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 text-xs font-bold hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                  >
                                    View
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-10 text-slate-500">
                                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No shared reports</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <div className="h-64 lg:h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-3xl gap-3">
                        <Stethoscope className="w-10 h-10 opacity-30" />
                        <p className="text-sm">Select a patient to view details</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                VIEW: RECENT SESSIONS
            ══════════════════════════════════════════════════════════════ */}
            {activeView === 'recent' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-8">

                {/* Session list */}
                <div className="lg:col-span-2 space-y-3">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                    <History className="w-4 h-4 text-rose-500" /> Completed Sessions ({recentSessions.length})
                  </h2>

                  {recentSessions.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 border-2 border-dashed border-white/5 rounded-2xl">
                      <History className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No completed sessions yet</p>
                      <p className="text-xs text-slate-700 mt-1">Complete a session from Waiting List</p>
                    </div>
                  ) : (
                    recentSessions.map((session, i) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => setSelectedSession(session)}
                        className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                          selectedSession?.id === session.id
                            ? 'bg-gradient-to-br from-rose-500/20 to-rose-500/5 border-rose-500/50 shadow-lg'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-rose-500/30'
                        }`}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm truncate">{session.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {session.checkedAt?.toDate
                                ? session.checkedAt.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                : session.checkedAt
                                  ? new Date(session.checkedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : 'Date unknown'}
                            </p>
                          </div>
                          <StatusBadge status={session.status} />
                        </div>
                        {session.medicalCondition && (
                          <p className="text-[10px] text-slate-500 mt-2 line-clamp-1">{session.medicalCondition}</p>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Session detail panel */}
                <div className="lg:col-span-3">
                  <AnimatePresence mode="wait">
                    {selectedSession ? (
                      <motion.div
                        key={selectedSession.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="rounded-3xl overflow-hidden bg-gradient-to-b from-white/5 to-white/2 border border-white/10 shadow-2xl"
                      >
                        {/* Session header */}
                        <div className="relative p-5 md:p-6 border-b border-white/10 bg-gradient-to-r from-rose-900/20 to-transparent">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-rose-400" />
                              </div>
                              <div>
                                <h3 className="text-lg md:text-xl font-bold text-white">{selectedSession.name}</h3>
                                <p className="text-xs text-rose-400 font-bold uppercase tracking-widest">
                                  {selectedSession.medicalCondition || 'General Consultation'}
                                </p>
                              </div>
                            </div>
                            <StatusBadge status={selectedSession.status} />
                          </div>
                        </div>

                        <div className="p-4 md:p-6 space-y-4">
                          {/* Time cards */}
                          <div className="grid grid-cols-2 gap-3">
                            {selectedSession.checkedAt && (
                              <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-2 text-rose-400 mb-1">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Session Completed</span>
                                </div>
                                <p className="text-xs md:text-sm font-semibold text-white">
                                  {selectedSession.checkedAt?.toDate
                                    ? selectedSession.checkedAt.toDate().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                                    : new Date(selectedSession.checkedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                              </div>
                            )}
                            {selectedSession.createdAt && (
                              <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-2 text-rose-400 mb-1">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Registered On</span>
                                </div>
                                <p className="text-xs md:text-sm font-semibold text-white">
                                  {selectedSession.createdAt?.toDate
                                    ? selectedSession.createdAt.toDate().toLocaleDateString('en-US', { dateStyle: 'medium' })
                                    : new Date(selectedSession.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Full details */}
                          <div className="rounded-2xl bg-black/30 border border-white/5 overflow-hidden">
                            <div className="px-4 md:px-5 py-3 border-b border-white/5">
                              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 flex items-center gap-2">
                                <ClipboardList className="w-3.5 h-3.5 text-rose-500" /> Patient & Session Details
                              </p>
                            </div>
                            <div className="px-4 md:px-5 divide-y divide-white/5">
                              <DetailRow icon={<User className="w-3.5 h-3.5" />} label="Patient Name" value={selectedSession.name} />
                              <DetailRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={selectedSession.email} />
                              <DetailRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={selectedSession.phone} />
                              <DetailRow icon={<Stethoscope className="w-3.5 h-3.5" />} label="Assigned Doctor" value={selectedSession.assignedDoctorName || user?.name} />
                              <DetailRow icon={<Users className="w-3.5 h-3.5" />} label="Assigned Therapist" value={selectedSession.assignedTherapistName} />
                              <DetailRow icon={<FileText className="w-3.5 h-3.5" />} label="Condition / Complaint" value={selectedSession.medicalCondition} />
                              <DetailRow icon={<ClipboardList className="w-3.5 h-3.5" />} label="Diagnosis" value={selectedSession.diagnosis} />
                              <DetailRow icon={<ClipboardList className="w-3.5 h-3.5" />} label="Treatment / Prescription" value={selectedSession.prescription} />
                              <DetailRow icon={<BadgeCheck className="w-3.5 h-3.5" />} label="Membership"
                                value={selectedSession.membershipType ? `${selectedSession.membershipType} — ${selectedSession.membershipStatus}` : null} />
                            </div>
                          </div>

                          {/* Exercises */}
                          {selectedSession.assignedExercises && selectedSession.assignedExercises.length > 0 && (
                            <div className="rounded-2xl bg-black/30 border border-white/5 overflow-hidden">
                              <div className="px-4 md:px-5 py-3 border-b border-white/5">
                                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 flex items-center gap-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-rose-500" />
                                  Prescribed Exercises ({selectedSession.assignedExercises.length})
                                </p>
                              </div>
                              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {selectedSession.assignedExercises.map((ex: any, i: number) => (
                                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-white">{ex.name}</p>
                                      {ex.description && <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{ex.description}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-3xl gap-3">
                        <History className="w-10 h-10 opacity-30" />
                        <p className="text-sm">Select a session to view full details</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <div className="py-4">
              <RoleBasedQuotes role="doctor" />
            </div>
          </div>
        </main>
      </div>

      {/* ═══ PROFILE MODAL (with time picker) ══════════════════════════════════ */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#111] to-black border border-white/10 shadow-2xl my-8"
            >
              <div className="relative p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Complete Your Profile</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Fill in your details — shown on landing page</p>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Picture */}
                <div className="flex flex-col items-center gap-2">
                  <ImageUpload currentImage={profileImage} userId={user?.id || ''} onImageUpload={url => setProfileImage(url)} size="lg" />
                  <p className="text-xs text-slate-500">Tap to upload picture</p>
                </div>

                {/* Specialization */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-1.5 block">Specialization *</label>
                  <input value={doctorForm.specialization} onChange={e => setDoctorForm(p => ({ ...p, specialization: e.target.value }))}
                    placeholder="e.g. Sports Rehabilitation"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 transition-all" />
                </div>

                {/* Education */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-1.5 block">Education / Degree *</label>
                  <input value={doctorForm.education} onChange={e => setDoctorForm(p => ({ ...p, education: e.target.value }))}
                    placeholder="e.g. DPT, MPT"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 transition-all" />
                </div>

                {/* Experience */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-1.5 block">Experience</label>
                  <input value={doctorForm.experience} onChange={e => setDoctorForm(p => ({ ...p, experience: e.target.value }))}
                    placeholder="e.g. 8 years"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 transition-all" />
                </div>

                {/* ✅ Time Picker — From / To */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block">
                    Available Timings
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">From</p>
                      <TimePicker value={doctorForm.timingFrom} onChange={v => setDoctorForm(p => ({ ...p, timingFrom: v }))} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">To</p>
                      <TimePicker value={doctorForm.timingTo} onChange={v => setDoctorForm(p => ({ ...p, timingTo: v }))} />
                    </div>
                  </div>
                  {doctorForm.timingFrom && doctorForm.timingTo && (
                    <p className="text-xs text-rose-400 mt-1.5">
                      ⏱ {doctorForm.timingFrom} – {doctorForm.timingTo}
                    </p>
                  )}
                </div>

                {/* Available Days */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          doctorForm.availableDays.includes(day)
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                            : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10 hover:text-slate-300'
                        }`}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                >
                  {savingProfile ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      Saving...
                    </>
                  ) : 'Save Profile'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ EXERCISE MODAL ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showExerciseModal && selectedPatient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
              <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">Prescribe Exercises</h2>
                  <p className="text-sm text-slate-400">For {selectedPatient?.name}</p>
                </div>
                <button onClick={() => setShowExerciseModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-4 md:p-6 border-b border-white/5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-3 block">Assign to Therapist</label>
                <CustomDropdown
                  options={therapists.map(t => ({ id: t.id, name: t.name, avatar: t.profilePicture || t.avatar }))}
                  value={selectedPatient?.assignedTherapistId || ''}
                  onChange={id => {
                    const t = therapists.find(t => t.id === id);
                    setSelectedPatient({ ...selectedPatient, assignedTherapistId: id, assignedTherapistName: t?.name || '' });
                  }}
                  placeholder="Select a therapist..."
                />
              </div>

              <div className="p-4 md:p-6 border-b border-white/5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block">Clinical Notes / Prescription</label>
                <textarea value={selectedPatient?.prescription || ''}
                  onChange={e => setSelectedPatient({ ...selectedPatient, prescription: e.target.value })}
                  placeholder="Write clinical notes or prescription for the patient..."
                  className="glass-input w-full py-3 px-4 text-sm rounded-xl resize-y min-h-[100px]" />
              </div>

              <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                {EXERCISES.map(exercise => {
                  const isSelected = selectedExercises.some(e => e.id === exercise.id);
                  return (
                    <div key={exercise.id} onClick={() => toggleExercise(exercise)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all ${
                        isSelected ? 'border-primary bg-primary/10 shadow-inner' : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}>
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-white text-sm">{exercise.name}</h4>
                        {isSelected && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{exercise.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 md:p-6 border-t border-white/5 bg-black/20">
                <button onClick={handleSaveExercises}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all">
                  Save Exercise Plan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Viewer */}
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