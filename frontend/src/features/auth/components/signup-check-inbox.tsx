import { Clock, MailCheck } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

type SignupCheckInboxProps = {
  email: string;
  onResend: () => Promise<void>;
  resendLoading: boolean;
  cooldownRemaining: number;
};

export function SignupCheckInbox({ email, onResend, resendLoading, cooldownRemaining }: SignupCheckInboxProps) {
  const isOnCooldown = cooldownRemaining > 0;

  return (
    <div className="flex flex-col items-center gap-5 py-2 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <MailCheck className="size-8 text-primary" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Check your inbox</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a verification link to <span className="font-medium text-foreground">{email}</span>. Click the link to
          activate your account.
        </p>
      </div>

      <Badge
        variant="outline"
        className="h-auto gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground"
      >
        <Clock className="size-3" />
        Link expires in 24 hours
      </Badge>

      <p className="text-xs text-muted-foreground">
        {isOnCooldown ? (
          <>Resend available in {cooldownRemaining}s</>
        ) : (
          <>
            Didn&apos;t receive an email?{' '}
            <Button variant="link" type="button" onClick={onResend} disabled={resendLoading} className="text-xs">
              Resend email
            </Button>
          </>
        )}
      </p>
    </div>
  );
}
