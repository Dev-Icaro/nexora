import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { ResetPasswordInvalidToken } from '@/features/auth/components/reset-password-invalid-token';
import { ResetPasswordSuccess } from '@/features/auth/components/reset-password-success';
import { Spinner } from '@/shared/components/ui/spinner';

type PageState = 'loading' | 'valid' | 'invalid' | 'success';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [pageState, setPageState] = useState<PageState>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!token || token === 'invalid' || token === 'expired') {
        setPageState('invalid');
      } else {
        setPageState('valid');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [token]);

  if (pageState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Spinner size="md" />
        <p className="text-sm text-muted-foreground">Validating link…</p>
      </div>
    );
  }

  if (pageState === 'invalid') {
    return <ResetPasswordInvalidToken />;
  }

  if (pageState === 'success') {
    return <ResetPasswordSuccess />;
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Set a new password</h1>
        <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
      </div>
      <ResetPasswordForm
        isLoading={isSubmitting}
        onSubmit={async () => {
          setIsSubmitting(true);
          await new Promise(resolve => setTimeout(resolve, 1100));
          setIsSubmitting(false);
          setPageState('success');
        }}
      />
    </>
  );
}
