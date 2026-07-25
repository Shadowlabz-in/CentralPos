import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseErrorMessage } from '@/services/auth.service';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthTextField from '@/components/auth/AuthTextField';
import AuthButton from '@/components/auth/AuthButton';
import GoogleButton from '@/components/auth/GoogleButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password) { setError('Password is required'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = '/catalogue';
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const code = e?.code || '';
      const msg = code ? getFirebaseErrorMessage(code) : (e.message || 'Login failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      window.location.href = '/catalogue';
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const code = e?.code || '';
      const msg = code ? getFirebaseErrorMessage(code) : (e.message || 'Google sign in failed');
      setError(msg);
    } finally {
      setGoogleLoading(false);
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or continue with</span>
            </div>
          </div>

          <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign up
            </Link>
          </p>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
