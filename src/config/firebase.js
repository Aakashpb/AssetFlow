import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRBkcKep37AwAoVU1m1BN6AoDLMNhs91g",
  authDomain: "my-project-66efd.firebaseapp.com",
  projectId: "my-project-66efd",
  storageBucket: "my-project-66efd.firebasestorage.app",
  messagingSenderId: "21032188592",
  appId: "1:21032188592:web:2de515ddba2e5a76ced975",
  measurementId: "G-EBEXRG48QX"
};

// Initialize Firebase safely checking for duplicate apps during Vite HMR hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
