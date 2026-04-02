'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

// UPDATED: Added SUPPLIER and BANK to the official roles
export type UserRole = 'GOVERNMENT' | 'INVESTOR' | 'CONTRACTOR' | 'ADMIN' | 'VERIFIER' | 'SUPPLIER' | 'BANK';

interface User { id: string; email: string; role: UserRole; full_name: string; }
interface AuthContextType {
  user: User | null; token: string | null; isLoading: boolean; isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (email: string, password: string, full_name: string, role: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// FIXED: Routing logic now handles all specialized infrastructure portals
export function getRoleRoute(role: UserRole): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'GOVERNMENT') return '/admin/approval';
  if (role === 'INVESTOR') return '/investments';
  if (role === 'CONTRACTOR') return '/projects';
  if (role === 'SUPPLIER') return '/projects'; // Suppliers manage inventory in project view
  if (role === 'BANK') return '/ledger';      // Banks focus on capital verification
  if (role === 'VERIFIER') return '/admin/approval';
  return '/dashboard';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (authToken: string) => {
    try {
      const res = await api.get('/api/auth/me', { headers: { Authorization: `Bearer ${authToken}` } });
      setUser(res.data.user); setToken(authToken);
    } catch {
      localStorage.removeItem('token'); setToken(null); setUser(null);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) { fetchUser(storedToken); } else { setIsLoading(false); }
  }, [fetchUser]);

  const login = async (email: string, password: string): Promise<string> => {
    const res = await api.post('/api/auth/login', { email: email.toLowerCase(), password });
    const accessToken = res.data.tokens.access_token;
    localStorage.setItem('token', accessToken);
    setToken(accessToken); setUser(res.data.user);
    return getRoleRoute(res.data.user.role as UserRole);
  };

  const register = async (email: string, password: string, full_name: string, role: string): Promise<string> => {
    const res = await api.post('/api/auth/register', { email: email.toLowerCase(), password, full_name, role });
    const accessToken = res.data.tokens.access_token;
    localStorage.setItem('token', accessToken);
    setToken(accessToken); setUser(res.data.user);
    return getRoleRoute(res.data.user.role as UserRole);
  };

  const logout = () => { setUser(null); setToken(null); localStorage.removeItem('token'); };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}