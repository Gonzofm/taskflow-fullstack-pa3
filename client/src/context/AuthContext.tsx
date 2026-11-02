import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ApiError, authApi, errorMessage, session } from '../services/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  retry: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(session.getToken()));
  const [authError, setAuthError] = useState<string | null>(null);
  const logout = useCallback(() => { session.clear(); setUser(null); setAuthError(null); }, []);

  const retry = useCallback(async () => {
    if (!session.getToken()) { setLoading(false); return; }
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authApi.me();
      setUser(response.data.user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) logout();
      else setAuthError(errorMessage(error));
    } finally { setLoading(false); }
  }, [logout]);

  useEffect(() => { void retry(); }, [retry]);
  useEffect(() => {
    const onUnauthorized = () => { logout(); setAuthError('Tu sesión ha expirado. Inicia sesión para continuar.'); };
    window.addEventListener('taskflow:unauthorized', onUnauthorized);
    return () => window.removeEventListener('taskflow:unauthorized', onUnauthorized);
  }, [logout]);

  async function login(email: string, password: string) {
    const response = await authApi.login(email, password);
    session.setToken(response.data.token);
    setUser(response.data.user);
    setAuthError(null);
  }
  async function register(name: string, email: string, password: string) {
    const response = await authApi.register(name, email, password);
    session.setToken(response.data.token);
    setUser(response.data.user);
    setAuthError(null);
  }
  return <AuthContext.Provider value={{ user, loading, authError, login, register, logout, retry }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth necesita AuthProvider.');
  return context;
}
