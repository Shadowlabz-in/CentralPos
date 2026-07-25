import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  sendPasswordReset,
  resendVerificationEmail,
  signOut as firebaseSignOut,
  getFirebaseIdToken,
  onFirebaseAuthStateChanged,
} from '@/services/auth.service';

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
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<AuthState>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<AuthState>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
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
  } catch {
    // invalid stored data
  }
  return { accessToken: null, refreshToken: null, user: null };
}

function saveAuth(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

async function exchangeFirebaseToken(idToken: string): Promise<AuthState> {
  const res = await fetch(`${API_BASE}/auth/firebase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Authentication failed');
  const newAuth: AuthState = {
    accessToken: data.data.accessToken,
    refreshToken: data.data.refreshToken,
    user: data.data.user,
  };
  saveAuth(newAuth);
  return newAuth;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ accessToken: null, refreshToken: null, user: null });
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    let initDone = false;

    const unsubscribe = onFirebaseAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (user) {
        const stored = loadAuth();
        if (!stored.accessToken) {
          try {
            const idToken = await getFirebaseIdToken(user);
            const newAuth = await exchangeFirebaseToken(idToken);
            setAuth(newAuth);
          } catch {
            // silent fail — user can try again via login page
          }
        }
      }
      if (!initDone) {
        initDone = true;
        setIsLoading(false);
      }
    });

    const stored = loadAuth();
    if (stored.accessToken) {
      setAuth(stored);
    }

    return () => {
      unsubscribe();
      initDone = true;
    };
  }, []);

  const setAuthAndPersist = useCallback((newAuth: AuthState) => {
    saveAuth(newAuth);
    setAuth(newAuth);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    const exchangeWithFirebaseUser = async (fbUser: FirebaseUser) => {
      const idToken = await getFirebaseIdToken(fbUser);
      const newAuth = await exchangeFirebaseToken(idToken);
      setAuthAndPersist(newAuth);
      return newAuth;
    };

    if (firebaseUser && firebaseUser.email?.toLowerCase() === normalizedEmail) {
      try {
        return await exchangeWithFirebaseUser(firebaseUser);
      } catch {
        // ID token refresh failed — fall through to sign-in
      }
    }

    try {
      const user = await signInWithEmail(email, password);
      setFirebaseUser(user);
      return await exchangeWithFirebaseUser(user);
    } catch {
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
      setAuthAndPersist(newAuth);
      return newAuth;
    }
  }, [setAuthAndPersist, firebaseUser]);

  const signup = useCallback(async (email: string, password: string) => {
    const user = await signUpWithEmail(email, password);
    setFirebaseUser(user);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const user = await signInWithGoogle();
    if (!user) throw new Error('Google sign in failed');
    setFirebaseUser(user);
    const idToken = await getFirebaseIdToken(user);
    const newAuth = await exchangeFirebaseToken(idToken);
    setAuthAndPersist(newAuth);
    return newAuth;
  }, [setAuthAndPersist]);

  const logout = useCallback(async () => {
    if (auth.accessToken) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });
      } catch {
        // ignore logout api error
      }
    }
    await firebaseSignOut().catch(() => {});
    clearAuth();
    setAuth({ accessToken: null, refreshToken: null, user: null });
  }, [auth.accessToken]);

  const sendPasswordResetEmailFn = useCallback(async (email: string) => {
    await sendPasswordReset(email);
  }, []);

  const resendVerification = useCallback(async () => {
    if (firebaseUser) {
      await resendVerificationEmail(firebaseUser);
    }
  }, [firebaseUser]);

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
        firebaseUser,
        login,
        signup,
        loginWithGoogle,
        logout,
        sendPasswordResetEmail: sendPasswordResetEmailFn,
        resendVerification,
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
  } catch {
    // ignore
  }
  return null;
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...getAuthHeaders() };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}
