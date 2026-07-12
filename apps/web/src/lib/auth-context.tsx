'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from './api-client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  activeOrgId: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    name: string;
    organizationName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setActiveOrgId: (orgId: string) => void;
}

const STORAGE_KEY = 'tenantforge_auth';

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredAuth(): Pick<AuthState, 'user' | 'accessToken' | 'refreshToken' | 'activeOrgId'> {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null, refreshToken: null, activeOrgId: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { user: null, accessToken: null, refreshToken: null, activeOrgId: null };
    }
    return JSON.parse(raw) as Pick<AuthState, 'user' | 'accessToken' | 'refreshToken' | 'activeOrgId'>;
  } catch {
    return { user: null, accessToken: null, refreshToken: null, activeOrgId: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    ...loadStoredAuth(),
    isLoading: true,
  });

  useEffect(() => {
    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const persist = useCallback(
    (next: Pick<AuthState, 'user' | 'accessToken' | 'refreshToken' | 'activeOrgId'>) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setState((prev) => ({ ...prev, ...next }));
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiRequest<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', { method: 'POST', body: { email, password } });

      persist({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        activeOrgId: null,
      });
    },
    [persist],
  );

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      name: string;
      organizationName?: string;
    }) => {
      const data = await apiRequest<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>('/auth/register', { method: 'POST', body: input });

      persist({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        activeOrgId: null,
      });
    },
    [persist],
  );

  const logout = useCallback(async () => {
    if (state.refreshToken && state.accessToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: { refreshToken: state.refreshToken },
        token: state.accessToken,
      }).catch(() => undefined);
    }
    localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      activeOrgId: null,
      isLoading: false,
    });
  }, [state.accessToken, state.refreshToken]);

  const setActiveOrgId = useCallback(
    (orgId: string) => {
      persist({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        activeOrgId: orgId,
      });
    },
    [persist, state.accessToken, state.refreshToken, state.user],
  );

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      setActiveOrgId,
    }),
    [state, login, register, logout, setActiveOrgId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
