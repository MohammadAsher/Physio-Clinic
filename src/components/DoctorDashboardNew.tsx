'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Activity, CheckCircle, ChevronRight, X, Calendar } from 'lucide-react';
import { Patient, User, DoctorView } from '@/types';
import { EXERCISES } from '@/lib/data';

interface DoctorDashboardProps {
  user: User;
  patients: Patient[];
  onUpdatePatient: (patient: Patient) => void;
  onLogout: () => void;
}

export default function DoctorDashboard({ user, patients, onUpdatePatient, onLogout }: DoctorDashboardProps) {
  const [activeView, setActiveView] = useState<DoctorView>('waiting');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<typeof EXERCISES>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  // Filter patients based on status
  const waitingPatients = patients.filter(p => p.status === 'waiting');
  const consultingPatients = patients.filter(p => p.status === 'consulting');

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    // Sync exercises with the selected patient's current data
    setSelectedExercises(patient.exercises || []);
  };

  const handleStartConsultation = () => {
    if (!selectedPatient) return;
    const updated = { ...selectedPatient, status: 'consulting' as const };
    onUpdatePatient(updated);
    // Update local state to reflect status change immediately
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
    setActiveView('patients'); // Redirect to all patients view to see result
  };

  const toggleExercise = (exercise: typeof EXERCISES[0]) => {
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id);
      if (exists) return prev.filter(e => e.id !== exercise.id);
      return [...prev, exercise];
    });
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-72 glass-card border-r border-white/10 rounded-none flex flex-col bg-black/20 backdrop-blur-md">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">Dr. {user.name}</p>
              <p className="text-primary text-xs uppercase tracking-wider font-bold">Physiotherapist</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'waiting', label: 'Waiting List', icon: <Users className="w-5 h-5" />, count: waitingPatients.length },
            { id: 'consultation', label: 'In Progress', icon: <Activity className="w-5 h-5" />, count: consultingPatients.length },
            { id: 'patients', label: 'Patient History', icon: <Calendar className="w-5 h-5" />, count: patients.length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as DoctorView)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeView === item.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeView === item.id ? 'bg-white/20' : 'bg-white/5'}`}>
                {item.count}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="px-8 py-6 border-b border-white/5 bg-black/10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {activeView === 'waiting' ? 'Patient Queue' : activeView === 'consultation' ? 'Live Consultations' : 'All Records'}
          </h1>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {activeView === 'waiting' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: List */}
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
                            selectedPatient?.id === patient.id ? 'border-primary bg-primary/10 shadow-md' : 'border-white/5 hover:border-white/20 bg-white/5'
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

                  {/* Right: Selected Patient Actions */}
                  <div className="glass-card p-6 bg-white/5 border-l border-white/10">
                    {selectedPatient ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-white">{selectedPatient.name}</h3>
                          <p className="text-slate-400">Status: <span className="text-yellow-500 capitalize">{selectedPatient.status}</span></p>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                          <p className="text-xs text-slate-500 uppercase font-bold mb-2">Diagnosis/Condition</p>
                          <p className="text-slate-300">{selectedPatient.medicalCondition || "No condition specified"}</p>
                        </div>

                        {selectedPatient.status === 'waiting' ? (
                          <button 
                            onClick={handleStartConsultation}
                            className="w-full py-4 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                          >
                            Start Checkup <ChevronRight className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => setShowExerciseModal(true)}
                            className="w-full py-4 rounded-xl border border-primary text-primary font-bold hover:bg-primary/10 transition-all"
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
                    )}
                  </div>
                </div>
              )}

              {/* Consultation and All Patients views would follow similar logic here */}
              {activeView === 'patients' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patients.map(p => (
                    <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-white">{p.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {p.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">Token: {p.token}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.exercises?.map(ex => (
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

      {/* Exercise Selection Modal */}
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
                <button onClick={() => setShowExerciseModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
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
                        isSelected ? 'border-primary bg-primary/10 shadow-inner' : 'border-white/5 bg-white/5 hover:bg-white/10'
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
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                >
                  Complete & Save Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}