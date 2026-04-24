'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
            onBack={onBack}
          />
        </motion.div>
      </main>
    </div>
  );
}