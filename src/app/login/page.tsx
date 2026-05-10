'use client';

import { AuthProvider } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';

export default function Login() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}