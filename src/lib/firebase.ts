import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIDXfpxstw4H_8OV28XxW6Y8PeQa9LQTo",
  authDomain: "physio-clinic-fb2f5.firebaseapp.com",
  projectId: "physio-clinic-fb2f5",
  storageBucket: "physio-clinic-fb2f5.firebasestorage.app",
  messagingSenderId: "67942996228",
  appId: "1:67942996228:web:7839f3a8bf83549488d851",
  measurementId: "G-NX8WCCZGPE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);