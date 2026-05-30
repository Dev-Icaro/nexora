import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { VerifyEmailError } from '@/features/auth/components/verify-email-error';
import { VerifyEmailSuccess } from '@/features/auth/components/verify-email-success';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useResendVerificationEmail } from '@/features/auth/hooks/use-resend-verification-email';
import { useVerifyEmail } from '@/features/auth/hooks/use-verify-email';
import { Spinner } from '@/shared/components/ui/spinner';

type Session = NonNullable<Awaited<ReturnType<ReturnType<typeof useVerifyEmail>['verify']>>>;

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const navigate = useNavigate();
  const auth = useAuth();

  const { verify, loading } = useVerifyEmail();
  const { resend, loading: resendLoading, cooldownRemaining } = useResendVerificationEmail();

  const [session, setSession] = useState<Session | null>(null);
  const [failed, setFailed] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasVerified = useRef(false);

  const handleContinue = () => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    if (session) {
      auth.login(session.user, session.accessToken);
      navigate('/');
    }
  };

  useEffect(() => {
    if (!token || hasVerified.current) return;
    hasVerified.current = true;

    const run = async () => {
      const result = await verify(token);
      if (result) {
        setSession(result);
        redirectTimerRef.current = setTimeout(() => {
          auth.login(result.user, result.accessToken);
          navigate('/');
        }, 3000);
      } else {
        setFailed(true);
      }
    };

    void run();

    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [token, verify, auth, navigate]);

  if (!token || loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Spinner size="md" />
        <p className="text-sm text-muted-foreground">Verifying your email&hellip;</p>
      </div>
    );
  }

  if (session) {
    return <VerifyEmailSuccess onContinue={handleContinue} />;
  }

  if (failed) {
    return (
      <VerifyEmailError
        email={email}
        onResend={() => resend(email!)}
        resendLoading={resendLoading}
        cooldownRemaining={cooldownRemaining}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Spinner size="md" />
      <p className="text-sm text-muted-foreground">Verifying your email&hellip;</p>
    </div>
  );
}
