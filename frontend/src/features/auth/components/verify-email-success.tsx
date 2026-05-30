import { MailCheck } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

type VerifyEmailSuccessProps = {
  onContinue: () => void;
};

export function VerifyEmailSuccess({ onContinue }: VerifyEmailSuccessProps) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Email verified</h1>
        <p className="text-sm text-muted-foreground">Your account is now active.</p>
      </div>

      <div className="flex flex-col items-center gap-4 py-2 pb-6">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="size-6 text-primary" strokeWidth={2.5} />
        </div>
        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          You&apos;re being signed in&hellip; You&apos;ll be redirected automatically in a moment.
        </p>
      </div>

      <Button className="w-full" onClick={onContinue}>
        Continue to Nexora
      </Button>
    </>
  );
}
