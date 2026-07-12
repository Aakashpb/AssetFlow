import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state shifts
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          
          // Verify with the backend server and fetch role/department coordinates from MySQL
          // Save temporary session token in localStorage so the request interceptor attaches it
          localStorage.setItem('af_user_session', JSON.stringify({ token: idToken, user: null }));
          
          const data = await api.loginWithGoogle({ credential: idToken, email: firebaseUser.email, name: firebaseUser.displayName });
          
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem('af_user_session', JSON.stringify({ token: idToken, user: data.user }));
          } else {
            // Offline/Mock fallback path
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Corporate Employee',
              email: firebaseUser.email,
              role: 'Employee',
              department: 'IT Operations',
              avatar: (firebaseUser.displayName || 'CE').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
            });
          }
        } catch (error) {
          console.error('Firebase Auth Sync Warning:', error.message);
          // Safety fallback if backend server is offline
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            role: 'Employee',
            department: 'IT Operations',
            avatar: firebaseUser.email.substring(0, 2).toUpperCase()
          });
        }
      } else {
        setUser(null);
        localStorage.removeItem('af_user_session');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      
      // Store token immediately for subsequent API client authorization
      localStorage.setItem('af_user_session', JSON.stringify({ token: idToken, user: null }));
      
      const data = await api.login(email, password);
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem('af_user_session', JSON.stringify({ token: idToken, user: data.user }));
      }
      return { success: true };
    } catch (error) {
      console.error('Firebase Login Error:', error);
      let errMsg = error.message || 'Authentication failed.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errMsg = 'Invalid email or password credentials.';
      }
      return { success: false, error: errMsg };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      
      localStorage.setItem('af_user_session', JSON.stringify({ token: idToken, user: null }));
      
      const data = await api.loginWithGoogle({ credential: idToken, email: cred.user.email, name: cred.user.displayName });
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem('af_user_session', JSON.stringify({ token: idToken, user: data.user }));
      }
      return { success: true };
    } catch (error) {
      console.error('Firebase Google SSO Error:', error);
      return { success: false, error: error.message || 'Google Sign-In failed.' };
    }
  };

  const register = async (name, email, password, department) => {
    try {
      // 1. Provision user inside Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      
      // Store token immediately
      localStorage.setItem('af_user_session', JSON.stringify({ token: idToken, user: null }));
      
      // 2. Synchronize user details (Name, Department, ID) with MySQL backend
      await api.register(name, email, password, department);
      
      return { success: true };
    } catch (error) {
      console.error('Firebase Registration Error:', error);
      return { success: false, error: error.message || 'Account registration failed.' };
    }
  };

  const changeSimulatedRole = (role) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      const savedSession = localStorage.getItem('af_user_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.user) {
          parsed.user.role = role;
        } else {
          parsed.role = role;
        }
        localStorage.setItem('af_user_session', JSON.stringify(parsed));
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Firebase Sign-Out Warning:', e);
    }
    setUser(null);
    localStorage.removeItem('af_user_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, changeSimulatedRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
