'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import UnauthorizedPage from '@/components/UnauthorizedPage';

function AdminContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <UnauthorizedPage />;
  }

  return <AdminDashboard />;
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}