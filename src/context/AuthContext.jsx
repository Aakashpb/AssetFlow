import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load active session
    const savedUserSession = localStorage.getItem('af_user_session');
    if (savedUserSession) {
      const session = JSON.parse(savedUserSession);
      setUser(session.user || session);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      // Data contains token and user profile
      const sessionUser = data.user || data;
      setUser(sessionUser);
      localStorage.setItem('af_user_session', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      console.error('Auth Login Error:', error);
      const errMsg = error.response?.data?.error || error.message || 'Authentication failed.';
      return { success: false, error: errMsg };
    }
  };

  const loginWithGoogle = async (googleUser) => {
    try {
      const data = await api.loginWithGoogle(googleUser);
      const sessionUser = data.user || data;
      setUser(sessionUser);
      localStorage.setItem('af_user_session', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      console.error('Google Auth Login Error:', error);
      const errMsg = error.response?.data?.error || error.message || 'Google SSO failed.';
      return { success: false, error: errMsg };
    }
  };

  const register = async (name, email, password, department) => {
    try {
      await api.register(name, email, password, department);
      return { success: true };
    } catch (error) {
      console.error('Auth Registration Error:', error);
      const errMsg = error.response?.data?.error || error.message || 'Registration failed.';
      return { success: false, error: errMsg };
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

  const logout = () => {
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
