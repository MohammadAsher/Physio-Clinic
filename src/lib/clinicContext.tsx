'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ClinicType,
  ClinicFeatures,
  DEFAULT_CLINIC_TYPE,
  getClinicFeatures,
  getClinicTypeLabel,
} from '@/types/clinic';

interface ClinicContextType {
  clinicType: ClinicType;
  features: ClinicFeatures;
  isLoading: boolean;
  isConfigured: boolean;
  setClinicType: (type: ClinicType) => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const CLINIC_CONFIG_ID = 'default';
const STORAGE_KEY = 'bodyExperts_clinicType';

export function useClinicContext() {
  const ctx = useContext(ClinicContext);
  if (!ctx) {
    throw new Error('useClinicContext must be used within a ClinicProvider');
  }
  return ctx;
}

export function useClinicContextSafe() {
  return useContext(ClinicContext);
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [clinicType, setClinicTypeState] = useState<ClinicType>(DEFAULT_CLINIC_TYPE);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadClinicType = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && isMounted) {
          setClinicTypeState(stored as ClinicType);
        }

        const docSnap = await getDoc(doc(db, 'clinic', CLINIC_CONFIG_ID));
        if (isMounted && docSnap.exists()) {
          const data = docSnap.data();
          if (data?.type) {
            const type = data.type as ClinicType;
            setClinicTypeState(type);
            localStorage.setItem(STORAGE_KEY, type);
            setIsConfigured(true);
          }
        } else if (isMounted) {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setIsConfigured(true);
          }
        }
      } catch (err) {
        console.error('Error loading clinic config:', err);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && isMounted) {
          setClinicTypeState(stored as ClinicType);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadClinicType();

    const unsub = onSnapshot(doc(db, 'clinic', CLINIC_CONFIG_ID), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.type) {
          const type = data.type as ClinicType;
          if (type !== clinicType) {
            setClinicTypeState(type);
            localStorage.setItem(STORAGE_KEY, type);
          }
          setIsConfigured(true);
        }
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const setClinicType = async (type: ClinicType) => {
    try {
      const existing = await getDoc(doc(db, 'clinic', CLINIC_CONFIG_ID));
      await setDoc(
        doc(db, 'clinic', CLINIC_CONFIG_ID),
        {
          type,
          updatedAt: new Date(),
          ...(existing.exists()
            ? {}
            : { createdAt: new Date(), name: getClinicTypeLabel(type) }),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Error saving clinic config:', err);
    }
    localStorage.setItem(STORAGE_KEY, type);
    setClinicTypeState(type);
    setIsConfigured(true);
  };

  const features = getClinicFeatures(clinicType);

  return (
    <ClinicContext.Provider
      value={{ clinicType, features, isLoading, isConfigured, setClinicType }}
    >
      {children}
    </ClinicContext.Provider>
  );
}
