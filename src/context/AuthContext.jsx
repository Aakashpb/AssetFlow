import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEFAULT_ADMIN = {
  uid: 'dev-admin-uid',
  name: 'Alexander Vance',
  email: 'alex.vance@assetflow.com',
  role: 'Admin',
  department: 'IT Operations',
  avatar: 'AV',
  provider: 'Local'
};

export const AuthProvider = ({ children }) => {
  // Default user to Admin to remove the login constraint completely
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('af_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.user || parsed;
      } catch (e) {
        return DEFAULT_ADMIN;
      }
    }
    return DEFAULT_ADMIN;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    // Return success to support login overrides if called
    return { success: true };
  };

  const loginWithGoogle = async () => {
    return { success: true };
  };

  const register = async (name, email, password, department) => {
    return { success: true };
  };

  const changeSimulatedRole = (role) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('af_user_session', JSON.stringify({ token: 'mock-session-token', user: updatedUser }));
    }
  };

  const logout = () => {
    // Keep user logged in but allow resets
    setUser(DEFAULT_ADMIN);
    localStorage.removeItem('af_user_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, changeSimulatedRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
