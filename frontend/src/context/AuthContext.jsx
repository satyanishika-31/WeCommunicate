import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services';
import { initialUsers } from '../api/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wecomm_current_user');
    return saved ? JSON.parse(saved) : initialUsers[0]; // Default demo user: Rahul Sharma
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || 'demo-jwt-token');

  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('wecomm_theme', 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme('light');
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.user) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('token', res.token);
      localStorage.setItem('wecomm_current_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.user) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('token', res.token);
      localStorage.setItem('wecomm_current_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('wecomm_current_user');
  };

  const switchRole = (newRole) => {
    // Quick demo role switch utility for instantaneous user/manager/admin testing!
    let matchingUser = initialUsers.find((u) => u.role === newRole);
    if (!matchingUser) {
      matchingUser = { ...user, role: newRole };
    }
    setUser(matchingUser);
    localStorage.setItem('wecomm_current_user', JSON.stringify(matchingUser));
  };

  const updateProfile = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('wecomm_current_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'USER',
        residentType: user?.residentType || 'OWNER',
        token,
        isAuthenticated: !!user,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
