'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Dumbbell, CreditCard, TrendingUp, LogOut, Menu, X, UserCheck } from 'lucide-react';
import { User, PatientView } from '@/types';
import PatientOverview from './PatientOverview';
import PatientExercises from './PatientExercises';
import PatientMembership from './PatientMembership';
import PatientProgress from './PatientProgress';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

const navItems: { id: PatientView; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'exercises', label: 'Exercises', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'membership', label: 'Membership', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-5 h-5" /> },
];

export default function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [activeView, setActiveView] = useState<PatientView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAssigned = user.status === 'assigned' && user.assignedDoctorName;

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <PatientOverview user={user} />;
      case 'exercises':
        return <PatientExercises patient={null} />;
      case 'membership':
        return <PatientMembership patient={null} />;
      case 'progress':
        return <PatientProgress patient={null} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
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
            <div className="w-12 h-12 rounded-full premium-gradient flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
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
                  ? 'premium-gradient text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-white hover:bg-red-500 transition-all border border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="glass-card border-t-0 border-x-0 rounded-none px-6 py-4 flex items-center justify-between bg-black/10">
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
            {/* Header Logout for Mobile/Tablet */}
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-red-500/10 rounded-lg group transition-all"
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
            className="mx-6 mt-4 glass-card p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
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
            className="mx-6 mt-4 glass-card p-4 bg-amber-500/5 border border-amber-500/20"
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

        <main className="flex-1 p-6 overflow-x-hidden">
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
    </div>
  );
}