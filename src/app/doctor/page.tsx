'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import DoctorDashboardNew from '@/components/DoctorDashboardNew';
import UnauthorizedPage from '@/components/UnauthorizedPage';

function DoctorContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'doctor') {
    return <UnauthorizedPage />;
  }

  return <DoctorDashboardNew user={user} />;
}

export default function DoctorPage() {
  return (
    <AuthProvider>
      <DoctorContent />
    </AuthProvider>
  );
}