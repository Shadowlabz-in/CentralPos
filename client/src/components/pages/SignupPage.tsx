import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, MailCheck } from 'lucide-react';
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
  const [verificationSent, setVerificationSent] = useState(false);
  const { signup, resendVerification } = useAuth();

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
      await signup(email, password);
      setVerificationSent(true);
    } catch (err: any) {
      const code = err?.code || '';
      setError(code ? getFirebaseErrorMessage(code) : (err.message || 'Sign up failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    try {
      await resendVerification();
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    }
  }

  if (verificationSent) {
    return (
      <AuthLayout>
        <div className="animate-[fadeIn_0.4s_ease-out]">
          <AuthCard>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Verify your email</h1>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                A verification email has been sent to{' '}
                <strong className="text-gray-700">{email}</strong>.
                Click the link in the email to activate your account.
              </p>
              <p className="mt-4 text-xs text-gray-400">
                Didn't receive the email?{' '}
                <button onClick={handleResend} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Resend
                </button>
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary/90"
              >
                Back to Sign in
              </Link>
            </div>
          </AuthCard>
        </div>
      </AuthLayout>
    );
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
