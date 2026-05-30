import { useRef, useState } from 'react';

import { ForgotPasswordModal } from '@/features/auth/components/forgot-password-modal';
import { LoginForm } from '@/features/auth/components/login-form';
import { useLogin } from '@/features/auth/hooks/use-login';
import { useRequestPasswordReset } from '@/features/auth/hooks/use-request-password-reset';
import { useResendVerificationEmail } from '@/features/auth/hooks/use-resend-verification-email';

export function LoginPage() {
  const { login, loading, error, errorCode } = useLogin();
  const { requestReset, loading: resetLoading, error: resetError, isSuccess: resetSuccess } = useRequestPasswordReset();
  const { resend, loading: resendLoading, cooldownRemaining } = useResendVerificationEmail();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const lastEmailRef = useRef<string>('');

  const isUnverified = errorCode === 'EMAIL_NOT_VERIFIED';

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    lastEmailRef.current = email;
    await login({ email, password });
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-shadow-muted-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">Welcome back &mdash; let&rsquo;s get you in.</p>
      </div>
      <LoginForm
        onSubmit={handleLogin}
        onGithubLogin={() => {
          window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/github`;
        }}
        onGoogleLogin={() => {
          window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
        }}
        onForgotPassword={() => setForgotPasswordOpen(true)}
        error={error}
        isLoading={loading}
        isUnverified={isUnverified}
        onResendVerification={isUnverified ? () => resend(lastEmailRef.current) : undefined}
        resendLoading={resendLoading}
        resendCooldown={cooldownRemaining}
      />
      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
        onSubmit={({ email }) => requestReset(email)}
        isLoading={resetLoading}
        isSuccess={resetSuccess}
        error={resetError}
      />
    </>
  );
}
