import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDB4xQVevUgCBXm1AqmPDnsPxBphPYNinE",
  authDomain: "assetflow-244f5.firebaseapp.com",
  projectId: "assetflow-244f5",
  storageBucket: "assetflow-244f5.firebasestorage.app",
  messagingSenderId: "87912549371",
  appId: "1:87912549371:web:b80bbfdd065a76c50e595e",
  measurementId: "G-RVPQE33NN1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth & Google Auth Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
