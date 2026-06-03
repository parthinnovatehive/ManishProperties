"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'user' | 'agent' | 'admin' | 'super-admin' | null;

interface AuthContextProps {
  role: Role;
  email: string | null;
  login: (email: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('estate_role') as Role) || null;
    }
    return null;
  });
  const [email, setEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('estate_email');
    }
    return null;
  });

  const login = (email: string, role: Role) => {
    setEmail(email);
    setRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('estate_email', email);
      localStorage.setItem('estate_role', role || '');
      if (role === 'admin' || role === 'super-admin') {
        localStorage.setItem('adminToken', 'mock-admin-token');
      }
    }
  };

  const logout = () => {
    setEmail(null);
    setRole(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('estate_email');
      localStorage.removeItem('estate_role');
      localStorage.removeItem('adminToken');
    }
  };

  return (
    <AuthContext.Provider value={{ role, email, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
