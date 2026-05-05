import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { ResetPasswordInvalidToken } from '@/features/auth/components/reset-password-invalid-token';
import { ResetPasswordSuccess } from '@/features/auth/components/reset-password-success';
import { useValidatePasswordResetToken } from '@/features/auth/hooks/use-validate-password-reset-token';
import { Spinner } from '@/shared/components/ui/spinner';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { isValid, loading } = useValidatePasswordResetToken(token);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Spinner size="md" />
        <p className="text-sm text-muted-foreground">Validating link…</p>
      </div>
    );
  }

  if (!isValid) {
    return <ResetPasswordInvalidToken />;
  }

  if (isSuccess) {
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
          setIsSuccess(true);
        }}
      />
    </>
  );
}
