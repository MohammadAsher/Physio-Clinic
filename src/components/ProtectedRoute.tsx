'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';

interface ProtectedRouteProps {
  user: User | null;
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ user, allowedRoles, children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      navigate('/unauthorized');
      return;
    }
  }, [user, allowedRoles, navigate]);

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}