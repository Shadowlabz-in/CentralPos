import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  firstName?: string;
  lastName?: string;
  phone?: string;
  storeId?: string;
  isActive?: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

interface AuthContextType {
  auth: AuthState;
  login: (email: string, password: string) => Promise<AuthState>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  userPermissions: string[];
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const STORAGE_KEY = 'kapda_auth';

function loadAuth(): AuthState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { accessToken: null, refreshToken: null, user: null };
}

function saveAuth(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadAuth();
    if (stored.accessToken) {
      setAuth(stored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    const newAuth: AuthState = {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      user: data.data.user,
    };
    saveAuth(newAuth);
    setAuth(newAuth);
    return newAuth;
  }, []);

  const logout = useCallback(async () => {
    if (auth.accessToken) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });
      } catch {}
    }
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ accessToken: null, refreshToken: null, user: null });
  }, [auth.accessToken]);

  const userPermissions = auth.user?.permissions || [];

  const hasPermission = useCallback(
    (permission: string) => userPermissions.includes(permission),
    [userPermissions],
  );

  const hasRole = useCallback(
    (role: string) => auth.user?.roles?.includes(role) ?? false,
    [auth.user?.roles],
  );

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        isAuthenticated: !!auth.accessToken,
        isLoading,
        hasPermission,
        hasRole,
        userPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getAccessToken(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { accessToken } = JSON.parse(stored);
      return accessToken || null;
    }
  } catch {}
  return null;
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}
