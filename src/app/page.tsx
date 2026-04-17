'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, updateDoc, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';
import { generateToken, generateQRCode } from '@/lib/data';

import LandingPage from '@/components/LandingPage';
import LoginPage from '@/components/LoginPage';
import PatientDashboard from '@/components/PatientDashboard';
import DoctorDashboardNew from '@/components/DoctorDashboardNew';
import AdminDashboard from '@/components/AdminDashboard';

type AuthView = 'landing' | 'login' | 'signup';

interface FirestorePatient {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  status: 'unassigned' | 'assigned';
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  createdAt: Date;
}

export default function Home() {
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<FirestorePatient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            };
            setCurrentUser(user);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'doctor') {
      const patientsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'patient')
      );

      const unsubscribe = onSnapshot(patientsQuery, (snapshot) => {
        const fetchedPatients: FirestorePatient[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: doc.id,
            name: data.name || '',
            phone: data.phone || '',
            email: data.email,
            status: data.status || 'unassigned',
            assignedDoctorId: data.assignedDoctorId,
            assignedDoctorName: data.assignedDoctorName,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setPatients(fetchedPatients);
      });

      return () => unsubscribe();
    }
  }, [currentUser?.role]);

  useEffect(() => {
    if (currentUser?.role === 'patient') {
      const unsubscribe = onSnapshot(doc(db, 'users', currentUser.id), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentUser(prev => prev ? {
            ...prev,
            status: data.status,
            assignedDoctorId: data.assignedDoctorId,
            assignedDoctorName: data.assignedDoctorName,
          } : null);
        }
      });

      return () => unsubscribe();
    }
   }, [currentUser?.role, currentUser?.id]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const fetchedUsers: User[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'patient',
            avatar: data.avatar,
            createdAt: data.createdAt?.toDate() || new Date(),
            status: data.status,
            assignedDoctorId: data.assignedDoctorId,
            assignedDoctorName: data.assignedDoctorName,
          };
        });
        setUsers(fetchedUsers);
      });

      return () => unsubscribe();
    }
  }, [currentUser?.role]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    }
    setCurrentUser(null);
    setAuthView('landing');
    setPatients([]);
    setUsers([]);
  };

  const handleUpdatePatientStatus = async (patientId: string, status: string, assignedDoctorId?: string, assignedDoctorName?: string) => {
    try {
      await updateDoc(doc(db, 'users', patientId), {
        status,
        assignedDoctorId: assignedDoctorId || null,
        assignedDoctorName: assignedDoctorName || null,
      });
    } catch (err) {
      console.error('Error updating patient status:', err);
    }
  };

  const handleAssignRole = async (userId: string, role: 'patient' | 'doctor') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
    } catch (err) {
      console.error('Error assigning role:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!currentUser ? (
        <motion.div
          key={authView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {authView === 'landing' && (
            <LandingPage
              onLogin={() => setAuthView('login')}
              onSignup={() => setAuthView('signup')}
            />
          )}
          {(authView === 'login' || authView === 'signup') && (
            <LoginPage
              onLogin={handleLogin}
              onBack={() => setAuthView('landing')}
            />
          )}
        </motion.div>
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard
            users={users}
            onAssignRole={handleAssignRole}
            onLogout={handleLogout}
          />
        ) : currentUser.role === 'patient' ? (
         <PatientDashboard
           user={currentUser}
           onLogout={handleLogout}
         />
       ) : (
         <DoctorDashboardNew
           user={currentUser}
           patients={patients as any} // @ts-ignore
           onUpdatePatient={handleUpdatePatientStatus}
           onLogout={handleLogout}
         />
       )}
    </AnimatePresence>
  );
}

// Final build trigger for Vercel