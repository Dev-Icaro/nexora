import { Clock, MailCheck } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

type ForgotPasswordSuccessProps = {
  onRetry: () => void;
};

export function ForgotPasswordSuccess({ onRetry }: ForgotPasswordSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-2 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <MailCheck className="size-8 text-primary" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Check your inbox</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If the email is registered, you&apos;ll receive instructions to reset your password.
        </p>
      </div>

      <Badge
        variant="outline"
        className="h-auto gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground"
      >
        <Clock className="size-3" />
        Link expires in 15 minutes
      </Badge>

      <p className="text-xs text-muted-foreground">
        Didn&apos;t receive an email?{' '}
        <Button variant="link" type="button" onClick={onRetry} className="text-xs">
          Try again
        </Button>
      </p>
    </div>
  );
}
