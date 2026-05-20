'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Sparkles, Milestone } from 'lucide-react';
import Logo from './Logo';
import AuthForm from '@/components/AuthForm';

interface LoginPageProps {
  onLogin: (user: any) => void;
  onBack: () => void;
}

export default function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSuccess = (user: any) => {
    onLogin(user);
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center font-sans overflow-hidden antialiased">
      
      {/* MAIN CONTAINER SPLIT DESIGN */}
      <div className="w-full h-screen lg:h-[90vh] lg:max-w-6xl lg:rounded-2xl lg:border lg:border-white/10 bg-[#090d16]/40 flex overflow-hidden shadow-2xl relative">
        
        {/* ========================================================================= */}
        {/* LEFT SIDE: FULL BACKGROUND IMAGE PANEL (Changes based on Login / Signup) */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-12 overflow-hidden border-r border-white/5 bg-black">
          
          {/* Dynamic Background Images that cover the entire left section */}
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login-bg"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.35, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center mix-blend-luminosity"
              />
            ) : (
              <motion.div
                key="signup-bg"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.35, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center mix-blend-luminosity"
              />
            )}
          </AnimatePresence>

          {/* Premium Overlay Gradients for smooth text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />
          
          {/* Ambient Glow Circles */}
          <div className="absolute top-[-10%] left-[-15%] w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Content Over the Background */}
          <div className="relative z-10 text-center flex flex-col items-center max-w-sm">
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                /* LOGIN TEXT DETAILS */
                <motion.div
                  key="login-content"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 backdrop-blur-md">
                    <Activity className="w-7 h-7 text-rose-500 animate-[pulse_2.5s_infinite]" />
                  </div>

                  <h2 className="text-3xl font-extrabold tracking-tight text-white mb-3">
                    Welcome Back to <span className="text-rose-500">Physio</span>
                  </h2>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Sign in to manage active doctor schedules, monitor patient queues, and log real-time treatments.
                  </p>

                  <div className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-xs text-slate-300 font-medium tracking-wide">Secure Medical Vault Dashboard</span>
                  </div>
                </motion.div>
              ) : (
                /* SIGNUP TEXT DETAILS */
                <motion.div
                  key="signup-content"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 backdrop-blur-md">
                    <Sparkles className="w-7 h-7 text-indigo-400" />
                  </div>

                  <h2 className="text-3xl font-extrabold tracking-tight text-white mb-3">
                    Begin Your <span className="text-indigo-400">Journey</span>
                  </h2>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    Register today to experience seamless recovery token allocation and custom diagnostic file tracking.
                  </p>

                  <div className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md flex items-center gap-3">
                    <Milestone className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-xs text-slate-300 font-medium tracking-wide">Automated Patient Token Generation</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Developer Credit Tag */}
          <div className="absolute bottom-6 text-[10px] uppercase tracking-[4px] text-slate-500 z-10">
            Developed by <span className="text-rose-500/60 font-bold">M. Asher</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDE: AUTH FORM MODULE */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-8 relative bg-black/40 backdrop-blur-md overflow-y-auto">
          
          <div className="lg:hidden flex flex-col items-center mb-6">
            <Logo width={140} height={45} showTagline={false} />
          </div>

          <div className="hidden lg:flex justify-center mb-4">
            <Logo width={150} height={50} showTagline={false} />
          </div>

          <div className="w-full max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <AuthForm
                  mode={mode}
                  onSuccess={handleSuccess}
                  onSwitchMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  onBack={onBack}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}