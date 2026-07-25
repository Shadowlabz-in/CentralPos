import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseErrorMessage } from '@/services/auth.service';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import AuthTextField from '@/components/auth/AuthTextField';
import AuthButton from '@/components/auth/AuthButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { sendPasswordResetEmail } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
    } catch (err: any) {
      const code = err?.code || '';
      setError(code ? getFirebaseErrorMessage(code) : (err.message || 'Failed to send reset email'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="animate-[fadeIn_0.4s_ease-out]">
        <AuthCard>
          {!sent ? (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"
              >
                <ArrowLeft size={16} />
                Back to sign in
              </Link>

              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Reset Password</h1>
                <p className="mt-1.5 text-sm text-gray-500">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

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

                <AuthButton type="submit" loading={loading}>
                  Send reset link
                </AuthButton>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                We've sent a password reset link to{' '}
                <strong className="text-gray-700">{email}</strong>.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary/90"
              >
                Back to Sign in
              </Link>
            </div>
          )}
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
