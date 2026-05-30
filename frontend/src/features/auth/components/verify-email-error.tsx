import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';

type VerifyEmailErrorProps = {
  email: string | null;
  onResend: () => Promise<void>;
  resendLoading: boolean;
  cooldownRemaining: number;
};

export function VerifyEmailError({ email, onResend, resendLoading, cooldownRemaining }: VerifyEmailErrorProps) {
  const isOnCooldown = cooldownRemaining > 0;

  return (
    <>
      <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 py-1 pl-2 pr-2.5">
        <AlertCircle className="size-3.5 text-destructive/70" />
        <span className="text-xs font-medium text-destructive/70">Link unavailable</span>
      </div>

      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight">Verification failed</h1>
        <p className="text-sm leading-relaxed">This verification link is invalid or has expired.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Verification links expire after 24 hours and can only be used once. Request a new one below.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {email && (
          <Button className="w-full" onClick={onResend} disabled={resendLoading || isOnCooldown}>
            {isOnCooldown ? `Resend available in ${cooldownRemaining}s` : 'Resend verification email'}
          </Button>
        )}

        <Button variant="ghost" className="w-full text-sm text-muted-foreground" asChild>
          <Link to="/login">
            <ArrowLeft className="size-3.5" /> Back to sign in
          </Link>
        </Button>
      </div>
    </>
  );
}
