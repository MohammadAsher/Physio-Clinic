'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();

          if (userData) {
            const user: User = {
              id: firebaseUser.uid,
              name: userData.name,
              email: userData.email,
              phone: userData.phone || '',
              role: userData.role || 'patient',
              createdAt: userData.createdAt?.toDate() || new Date(),
              status: userData.status,
              assignedDoctorId: userData.assignedDoctorId,
              assignedDoctorName: userData.assignedDoctorName,
              isMember: userData.isMember,
              membershipStatus: userData.membershipStatus,
              membershipType: userData.membershipType,
              totalFees: userData.totalFees,
              membershipRequestDate: userData.membershipRequestDate?.toDate(),
              submittedTrxID: userData.submittedTrxID,
              profileCompleted: userData.profileCompleted || false,
              doctorProfile: userData.doctorProfile,
              patientProfile: userData.patientProfile,
            };
            setUser(user);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}