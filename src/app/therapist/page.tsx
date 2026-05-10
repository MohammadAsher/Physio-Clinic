'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import TherapistDashboard from '@/components/TherapistDashboard';
import UnauthorizedPage from '@/components/UnauthorizedPage';

function TherapistContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'therapist') {
    return <UnauthorizedPage />;
  }

  return <TherapistDashboard user={user} />;
}

export default function TherapistPage() {
  return (
    <AuthProvider>
      <TherapistContent />
    </AuthProvider>
  );
}