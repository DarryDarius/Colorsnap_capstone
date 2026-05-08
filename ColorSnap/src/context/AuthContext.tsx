import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AUTH_TOKEN_STORAGE_KEY,
  getCurrentUser,
  loginWithGoogle,
  loginUser,
  registerUser,
  type AuthUser
} from '../services/api';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginGoogle: (credential: string) => Promise<void>;
  register: (input: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!token) {
      setIsLoading(false);
      return;
    }

    getCurrentUser()
      .then((response) => {
        setUser(response.user);
      })
      .catch(() => {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    login: async (email, password) => {
      const response = await loginUser({ email, password });
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
      setUser(response.user);
    },
    loginGoogle: async (credential) => {
      const response = await loginWithGoogle(credential);
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
      setUser(response.user);
    },
    register: async (input) => {
      const response = await registerUser(input);
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
      setUser(response.user);
    },
    logout: () => {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      setUser(null);
    }
  }), [isLoading, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return value;
};
