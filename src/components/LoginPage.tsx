'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import AuthForm from '@/components/AuthForm';

interface LoginPageProps {
  onLogin: (user: any) => void;
  onBack: () => void;
}

export default function LoginPage({
  onLogin,
  onBack,
}: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSuccess = (user: any) => {
    onLogin(user);
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden selection:bg-cyan-500/30">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">

        {/* ===================================================== */}
        {/* LEFT SIDE IMAGE FLIP (Desktop Only) */}
        {/* ===================================================== */}
        <div className="hidden lg:flex lg:w-1/2 h-[720px] max-w-xl [perspective:1500px]">
          <motion.div
            animate={{
              rotateY: mode === 'login' ? 0 : 180,
            }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="relative w-full h-full [transform-style:preserve-3d]"
          >
            {/* LOGIN SIDE IMAGE */}
            <div className="absolute inset-0 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-black/90 [backface-visibility:hidden]">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px]" />
              <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-rose-500/25 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-indigo-500/25 blur-[120px] rounded-full" />

              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-12">
                <Logo width={180} height={55} showTagline={false} />
                <h2 className="text-4xl font-extrabold text-white tracking-tight mt-12 mb-4">
                  Welcome Back
                </h2>
                <p className="text-slate-300 leading-relaxed max-w-sm text-sm font-medium">
                  Sign in to manage doctor schedules, patient records and appointments securely.
                </p>
              </div>
            </div>

            {/* SIGNUP SIDE IMAGE */}
            <div className="absolute inset-0 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-black/90 [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px]" />
              <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-500/25 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-rose-500/25 blur-[120px] rounded-full" />

              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-12">
                <Logo width={180} height={55} showTagline={false} />
                <h2 className="text-4xl font-extrabold text-white tracking-tight mt-12 mb-4">
                  Create Account
                </h2>
                <p className="text-slate-300 leading-relaxed max-w-sm text-sm font-medium">
                  Join Body Experts and experience modern physiotherapy care with smart management.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===================================================== */}
        {/* RIGHT SIDE FORM WITH HIDDEN SCROLLBARS */}
        {/* ===================================================== */}
        <div className="w-full lg:w-1/2 max-w-md">
          
          {/* MOBILE LOGO */}
          <div className="flex lg:hidden justify-center mb-6">
            <Logo width={160} height={48} showTagline={false} />
          </div>

          {/* FORM CONTAINER FLIP */}
          <div className="w-full min-h-[620px] sm:min-h-[660px] lg:h-[720px] [perspective:1500px]">
            <motion.div
              animate={{
                rotateY: mode === 'login' ? 0 : 180,
              }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="relative w-full h-full [transform-style:preserve-3d]"
            >
              
              {/* LOGIN FORM CARD */}
              <div className="absolute inset-0 rounded-[32px] bg-[#0b1120]/85 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/90 flex flex-col justify-center [backface-visibility:hidden] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />
                
                {/* Scrollbar hidden styling applied here */}
                <div className="p-6 sm:p-10 overflow-y-auto max-h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <AuthForm
                    mode="login"
                    onSuccess={handleSuccess}
                    onSwitchMode={() => setMode('signup')}
                    onBack={onBack}
                  />
                </div>
              </div>

              {/* SIGNUP FORM CARD */}
              <div className="absolute inset-0 rounded-[32px] bg-[#0b1120]/85 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/90 flex flex-col justify-center [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
                
                {/* Scrollbar hidden styling applied here */}
                <div className="p-6 sm:p-10 overflow-y-auto max-h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [transform:rotateY(0deg)]">
                  <AuthForm
                    mode="signup"
                    onSuccess={handleSuccess}
                    onSwitchMode={() => setMode('login')}
                    onBack={onBack}
                  />
                </div>
              </div>

            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  );
}