import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Bug } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseErrorMessage } from '@/services/auth.service';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthTextField from '@/components/auth/AuthTextField';
import AuthButton from '@/components/auth/AuthButton';

const DEV_ACCOUNTS = [
  { label: 'Super Admin', email: 'superadmin@kapda.com', password: 'superadmin123' },
  { label: 'Admin', email: 'admin@kapda.com', password: 'admin123' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password) { setError('Password is required'); return; }
    setError('');
    setLoading(true);
    try {
      const auth = await login(email, password);
      const isSuper = auth.user?.roles?.includes('SUPER_ADMIN');
      window.location.href = isSuper ? '/admin' : '/catalogue';
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const code = e?.code || '';
      const msg = code ? getFirebaseErrorMessage(code) : (e.message || 'Login failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(email: string, password: string) {
    setError('');
    setLoading(true);
    try {
      const auth = await login(email, password);
      const isSuper = auth.user?.roles?.includes('SUPER_ADMIN');
      window.location.href = isSuper ? '/admin' : '/catalogue';
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const code = e?.code || '';
      const msg = code ? getFirebaseErrorMessage(code) : (e.message || 'Login failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="animate-[fadeIn_0.4s_ease-out]">
        <AuthCard>
          <AuthHeader title="Welcome Back" subtitle="Sign in to continue managing your store." />

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <AuthTextField
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />

            <AuthTextField
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-gray-500">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </Link>
            </div>

            <AuthButton type="submit" loading={loading}>
              Sign in
            </AuthButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign up
            </Link>
          </p>

          <p className="mt-3 text-center">
            <Link to="/centralone" className="text-xs text-gray-400 hover:text-primary transition-colors">
              Visit Central One →
            </Link>
          </p>

          {import.meta.env.DEV && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDev(!showDev)}
                className="flex items-center gap-1.5 mx-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Bug size={12} />
                {showDev ? 'Hide' : 'Dev'} quick login
              </button>
              {showDev && (
                <div className="mt-3 flex flex-col gap-2">
                  {DEV_ACCOUNTS.map((a) => (
                    <button
                      key={a.email}
                      type="button"
                      onClick={() => quickLogin(a.email, a.password)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-sm transition-colors"
                    >
                      <span className="font-medium text-yellow-800">{a.label}</span>
                      <span className="text-xs text-yellow-600">{a.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
