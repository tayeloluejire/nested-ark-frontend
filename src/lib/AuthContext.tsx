'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

export type UserRole = 'GOVERNMENT' | 'INVESTOR' | 'CONTRACTOR' | 'ADMIN' | 'VERIFIER' | 'SUPPLIER' | 'BANK';

interface User { id: string; email: string; role: UserRole; full_name: string; }
interface AuthContextType {
  user: User | null; token: string | null; isLoading: boolean; isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (email: string, password: string, full_name: string, role: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Single source of truth for post-login routing */
export function getRoleRoute(role: UserRole): string {
  switch (role) {
    case 'ADMIN':       return '/admin';
    case 'GOVERNMENT':  return '/gov';        // ← dedicated Government portal
    case 'INVESTOR':    return '/portfolio';   // ← Investor lands on portfolio
    case 'CONTRACTOR':  return '/projects';
    case 'SUPPLIER':    return '/supplier';
    case 'BANK':        return '/bank';
    case 'VERIFIER':    return '/admin/approval';
    default:            return '/dashboard';
  }
}

/** Page-level access guard — used by each page's useEffect */
export function canAccess(role: UserRole, path: string): boolean {
  if (role === 'ADMIN') return true;            // Admin sees everything
  const rules: Record<string, UserRole[]> = {
    '/admin':          ['ADMIN'],               // ADMIN ONLY for /admin/*
    '/gov':            ['GOVERNMENT'],          // Government dedicated portal
    '/portfolio':      ['INVESTOR'],
    '/investments':    ['INVESTOR'],
    '/supplier':       ['SUPPLIER'],
    '/bank':           ['BANK'],
    '/projects':       ['GOVERNMENT', 'CONTRACTOR', 'SUPPLIER', 'ADMIN'],
    '/milestones':     ['GOVERNMENT', 'CONTRACTOR', 'ADMIN', 'VERIFIER'],
    '/ledger':         ['ADMIN', 'GOVERNMENT', 'BANK', 'INVESTOR', 'VERIFIER'],
    '/dashboard':      ['INVESTOR', 'CONTRACTOR', 'SUPPLIER', 'BANK', 'GOVERNMENT', 'ADMIN', 'VERIFIER'],
    '/kyc':            ['INVESTOR', 'CONTRACTOR', 'SUPPLIER', 'BANK'],
    '/map':            ['INVESTOR', 'GOVERNMENT', 'ADMIN', 'BANK', 'CONTRACTOR'],
  };
  for (const [prefix, allowed] of Object.entries(rules)) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      return (allowed as string[]).includes(role);
    }
  }
  return true; // public routes
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
    if (storedToken) fetchUser(storedToken);
    else setIsLoading(false);
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
