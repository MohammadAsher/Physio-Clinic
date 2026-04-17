'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User as UserType } from '@/types';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess: (user: UserType) => void;
  onSwitchMode: () => void;
  onBack: () => void;
}

export default function AuthForm({ mode, onSuccess, onSwitchMode, onBack }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let userCredential;

      if (mode === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          role: 'patient',
          status: 'unassigned',
          createdAt: new Date(),
        });
      }

      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();

      onSuccess({
        id: userCredential.user.uid,
        name: userData?.name || formData.name,
        email: userData?.email || formData.email,
        phone: userData?.phone || formData.phone,
        role: userData?.role || 'patient',
        createdAt: userData?.createdAt?.toDate() || new Date(),
      });
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card p-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="mb-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </motion.button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-400">
            {mode === 'login' 
              ? 'Sign in to access your dashboard' 
              : 'Join us for premium physiotherapy care'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-primary text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="block text-sm text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full pl-12"
                  placeholder="Enter your full name"
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass-input w-full pl-12"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="block text-sm text-slate-300 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="glass-input w-full pl-12"
                  placeholder="Enter your phone number"
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="glass-input w-full pl-12 pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot Password?
              </button>
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="glass-button w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={onSwitchMode}
              className="text-primary hover:underline font-medium"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}