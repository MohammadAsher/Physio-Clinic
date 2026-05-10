'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'doctor') router.push('/doctor');
      else if (user.role === 'therapist') router.push('/therapist');
      else router.push('/patient');
    }
  }, [user, router]);

  const handleSuccess = () => {
    // Navigation handled by useEffect on auth change
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-card border-b-0 border-x-0 rounded-none px-6 py-8">
        <div className="max-w-md mx-auto flex flex-col items-center gap-2">
          <Logo width={180} height={60} showTagline={true} />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AuthForm
            mode={mode}
            onSuccess={handleSuccess}
            onSwitchMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
            onBack={handleBack}
          />
        </motion.div>
      </main>
    </div>
  );
}