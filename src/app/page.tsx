'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, updateDoc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
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
  status: 'unassigned' | 'assigned' | 'waiting' | 'consulting' | 'completed';
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  createdAt: Date;
  isMember?: boolean;
  membershipStatus?: 'pending' | 'active' | 'expired' | 'pendingApproval' | 'rejected';
  membershipType?: 'silver' | 'gold' | 'platinum';
  membershipRequestDate?: Date;
  patientStatus?: string;
  submittedTrxID?: string;
  profileCompleted?: boolean;
  patientProfile?: {
    age?: number;
    gender?: string;
    medicalHistory?: string;
    profilePicture?: string;
  };
}

interface DoctorData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'doctor';
  avatar?: string;
  profileCompleted?: boolean;
  doctorProfile?: {
    education?: string;
    experience?: string;
    specialization?: string;
    availableDays?: string[];
    timings?: string;
  };
}

export default function Home() {
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<FirestorePatient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
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
            isMember: data.isMember,
            membershipStatus: data.membershipStatus,
            membershipType: data.membershipType,
            patientStatus: data.patientStatus,
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
            isMember: data.isMember,
            membershipStatus: data.membershipStatus,
            membershipType: data.membershipType,
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
             isMember: data.isMember,
             membershipStatus: data.membershipStatus,
             membershipType: data.membershipType,
             totalFees: data.totalFees,
             membershipRequestDate: data.membershipRequestDate?.toDate(),
             submittedTrxID: data.submittedTrxID,
             profileCompleted: data.profileCompleted,
             doctorProfile: data.doctorProfile,
           };
         });
         setUsers(fetchedUsers);
       });

       return () => unsubscribe();
     }
   }, [currentUser?.role]);

  useEffect(() => {
    const doctorsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'doctor')
    );
    
    const unsubscribe = onSnapshot(doctorsQuery, (snapshot) => {
      const fetchedDoctors: DoctorData[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          role: 'doctor',
          avatar: data.avatar,
          profileCompleted: data.profileCompleted || false,
          doctorProfile: data.doctorProfile,
        };
      });
      setDoctors(fetchedDoctors);
    });

    return () => unsubscribe();
  }, []);

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
      const updateData: any = {
        patientStatus: status,
      };

      if (status === 'waiting') {
        updateData.status = 'assigned';
      } else if (status === 'consulting' || status === 'completed') {
        updateData.status = 'assigned';

        const today = new Date().toISOString().split('T')[0];
        await addDoc(collection(db, 'attendance'), {
          userId: patientId,
          date: today,
          timestamp: new Date(),
          role: 'patient'
        });
      }

      if (assignedDoctorId) updateData.assignedDoctorId = assignedDoctorId;
      if (assignedDoctorName) updateData.assignedDoctorName = assignedDoctorName;

      await updateDoc(doc(db, 'users', patientId), updateData);
    } catch (err) {
      console.error('Error updating patient status:', err);
    }
  };

  const handleUpdatePatient = (updatedPatient: any) => {
    if (!updatedPatient?.id) return;
    handleUpdatePatientStatus(
      updatedPatient.id,
      updatedPatient.status,
      updatedPatient.assignedDoctorId,
      updatedPatient.assignedDoctorName
    );
  };

  const handleAssignRole = async (userId: string, role: 'patient' | 'doctor') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
    } catch (err) {
      console.error('Error assigning role:', err);
    }
  };

  const handleBookAppointment = async (patientId: string, doctorId?: string, doctorName?: string, type: 'general' | 'specific' = 'general') => {
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId,
        patientName: currentUser?.name || '',
        doctorId: doctorId || null,
        doctorName: doctorName || null,
        date: new Date(),
        status: 'pending',
        type,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error booking appointment:', err);
    }
  };

  const handleCompleteDoctorProfile = async (profileData: any) => {
    if (!currentUser?.id) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        doctorProfile: profileData,
        profileCompleted: true,
      });
    } catch (err) {
      console.error('Error completing profile:', err);
    }
  };

  const handleCompletePatientProfile = async (profileData: any) => {
    if (!currentUser?.id) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        patientProfile: profileData,
        profileCompleted: true,
      });
    } catch (err) {
      console.error('Error completing profile:', err);
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
              doctors={doctors}
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
               patients={patients as any}
               onUpdatePatient={handleUpdatePatient}
               onLogout={handleLogout}
             />
        )}
    </AnimatePresence>
  );
}