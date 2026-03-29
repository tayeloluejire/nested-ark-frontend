'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

export type UserRole = 'GOVERNMENT' | 'INVESTOR' | 'CONTRACTOR' | 'ADMIN';

interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Start as true so pages wait for auth check before rendering redirect logic
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (authToken: string) => {
    try {
      const res = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(res.data.user);
      setToken(authToken);
    } catch {
      // Token invalid or expired — clear it
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      // Always mark loading done, even on error
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      fetchUser(storedToken);
    } else {
      // No token — immediately done loading
      setIsLoading(false);
    }
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const accessToken = res.data.tokens.access_token;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(res.data.user);
  };

  const register = async (
    email: string,
    password: string,
    full_name: string,
    role: string
  ) => {
    const res = await api.post('/api/auth/register', { email, password, full_name, role });
    const accessToken = res.data.tokens.access_token;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(res.data.user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
