import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, metaService } from '../api/services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wecomm_current_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('wecomm_current_user');
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('wecomm_theme', 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme('light');
  };

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('token', res.token);
        localStorage.setItem('wecomm_current_user', JSON.stringify(res.user));
      }
      return res;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? 'Cannot connect to backend server. Please verify the backend is running.'
          : err.message || 'Login failed. Please check credentials.');
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('token', res.token);
        localStorage.setItem('wecomm_current_user', JSON.stringify(res.user));
      }
      return res;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? 'Cannot connect to backend server. Please verify the backend is running.'
          : err.message || 'Registration failed.');
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('wecomm_current_user');
  };

  const switchRole = (newRole) => {
    // Quick demo role switch utility for instantaneous user/manager/admin testing!
    const matchingUser = {
      ...user,
      role: newRole,
    };
    setUser(matchingUser);
    localStorage.setItem('wecomm_current_user', JSON.stringify(matchingUser));
  };

  const updateProfile = async (updatedFields) => {
    if (!user?.id && !user?._id) {
      throw new Error('You must be logged in to update your profile.');
    }

    const response = await metaService.updateUser(user.id || user._id, updatedFields);
    const updated = response.user;
    setUser(updated);
    localStorage.setItem('wecomm_current_user', JSON.stringify(updated));
    return updated;
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
