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

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  function validate(): string | null {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      const auth = await signup(email, password);
      const isSuper = auth.user?.roles?.includes('SUPER_ADMIN');
      window.location.href = isSuper ? '/admin' : '/dashboard';
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const code = e?.code || '';
      setError(code ? getFirebaseErrorMessage(code) : (e.message || 'Sign up failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="animate-[fadeIn_0.4s_ease-out]">
        <AuthCard>
          <AuthHeader title="Create Your Account" subtitle="Sign up to start managing your store." />

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
              placeholder="Create a password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <AuthTextField
              icon={Lock}
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />

            <AuthButton type="submit" loading={loading}>
              Create account
            </AuthButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
