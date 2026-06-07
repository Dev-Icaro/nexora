import { SignupCheckInbox } from '@/features/auth/components/signup-check-inbox';
import { SignupForm } from '@/features/auth/components/signup-form';
import { useRegister } from '@/features/auth/hooks/use-register';
import { useResendVerificationEmail } from '@/features/auth/hooks/use-resend-verification-email';

export function SignupPage() {
  const { register, loading, error, submittedEmail } = useRegister();
  const { resend, loading: resendLoading, cooldownRemaining } = useResendVerificationEmail();

  if (submittedEmail) {
    return (
      <SignupCheckInbox
        email={submittedEmail}
        onResend={() => resend(submittedEmail)}
        resendLoading={resendLoading}
        cooldownRemaining={cooldownRemaining}
      />
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">Join Nexora and start connecting.</p>
      </div>
      <SignupForm
        onSubmit={register}
        onGithubLogin={() => {
          window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/github`;
        }}
        onGoogleLogin={() => {
          window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
        }}
        error={error}
        isLoading={loading}
      />
    </>
  );
}
