import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';

export function ResetPasswordSuccess() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Password updated</h1>
        <p className="text-sm text-muted-foreground">Your password has been changed successfully.</p>
      </div>

      <div className="flex flex-col items-center gap-4 py-2 pb-6">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Check className="size-6 text-primary" strokeWidth={2.5} />
        </div>
        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          All active sessions have been signed out. You can now sign in with your new password.
        </p>
      </div>

      <Button className="w-full" asChild>
        <Link to="/login">Back to sign in</Link>
      </Button>
    </>
  );
}
