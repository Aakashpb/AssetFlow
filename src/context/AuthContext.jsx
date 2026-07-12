import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('af_user');
    const savedRole = localStorage.getItem('af_role');
    if (savedUser && savedRole) {
      setUser({
        email: savedUser,
        role: savedRole,
        name: savedUser === 'alex.vance@assetflow.com' ? 'Alexander Vance' : 'Corporate User',
        avatar: savedUser === 'alex.vance@assetflow.com' ? 'AV' : 'CU'
      });
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Basic verification for mock logic
    if (email && password) {
      const defaultRole = email === 'alex.vance@assetflow.com' ? 'Admin' : 'Employee';
      const authenticatedUser = {
        email,
        role: defaultRole,
        name: email === 'alex.vance@assetflow.com' ? 'Alexander Vance' : 'Corporate User',
        avatar: email === 'alex.vance@assetflow.com' ? 'AV' : 'CU'
      };
      setUser(authenticatedUser);
      localStorage.setItem('af_user', email);
      localStorage.setItem('af_role', defaultRole);
      return true;
    }
    return false;
  };

  const changeSimulatedRole = (role) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('af_role', role);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('af_user');
    localStorage.removeItem('af_role');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changeSimulatedRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
