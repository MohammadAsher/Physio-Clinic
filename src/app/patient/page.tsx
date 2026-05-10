'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import PatientDashboard from '@/components/PatientDashboard';
import UnauthorizedPage from '@/components/UnauthorizedPage';

function PatientContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'patient') {
    return <UnauthorizedPage />;
  }

  return <PatientDashboard user={user} />;
}

export default function PatientPage() {
  return (
    <AuthProvider>
      <PatientContent />
    </AuthProvider>
  );
}