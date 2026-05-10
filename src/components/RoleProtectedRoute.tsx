'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';

interface RoleProtectedRouteProps {
  user: User | null;
  requiredRole: string;
  children: React.ReactNode;
}

export default function RoleProtectedRoute({ user, requiredRole, children }: RoleProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== requiredRole) {
      navigate('/unauthorized');
      return;
    }
  }, [user, requiredRole, navigate]);

  if (!user || user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}