import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('unibot_token') || null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res.success) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    if (res.success) {
      localStorage.setItem('unibot_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      return res;
    }
  };

  const loginAdmin = async (username, password) => {
    const res = await api.admin.login(username, password);
    if (res.success) {
      localStorage.setItem('unibot_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res;
    }
  };

  const register = async (formData) => {
    const res = await api.auth.register(formData);
    if (res.success) {
      localStorage.setItem('unibot_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      return res;
    }
  };

  const demoLogin = async () => {
    const res = await api.auth.demoLogin();
    if (res.success) {
      localStorage.setItem('unibot_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      return res;
    }
  };

  const logout = () => {
    localStorage.removeItem('unibot_token');
    setToken(null);
    setUser(null);
  };

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuth = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        loginAdmin,
        register,
        demoLogin,
        logout,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuth,
        closeAuth,
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
