import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Spinner } from '@/shared/components/ui/spinner';

import { ForgotPasswordForm, type ForgotPasswordFormValues } from './forgot-password-form';
import { ForgotPasswordSuccess } from './forgot-password-success';

const FORM_ID = 'forgot-password-form';

type ForgotPasswordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: ForgotPasswordFormValues) => void | Promise<void>;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: string;
};

export function ForgotPasswordModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  isSuccess,
  error,
}: ForgotPasswordModalProps) {
  const [localLoading, setLocalLoading] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const loading = isLoading ?? localLoading;
  const success = isSuccess ?? localSuccess;

  async function handleSubmit(values: ForgotPasswordFormValues) {
    if (onSubmit) {
      await onSubmit(values);
      return;
    }
    setLocalLoading(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1200));
    setLocalLoading(false);
    setLocalSuccess(true);
  }

  function handleRetry() {
    setLocalSuccess(false);
    setFormValid(false);
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setLocalSuccess(false);
      setFormValid(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {success ? (
          <>
            <ForgotPasswordSuccess onRetry={handleRetry} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Forgot your password?</DialogTitle>
              <DialogDescription>
                Enter your email and we&apos;ll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>

            <ForgotPasswordForm
              formId={FORM_ID}
              onSubmit={handleSubmit}
              onValidityChange={setFormValid}
              isLoading={loading}
              error={error}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={loading} size="lg">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" form={FORM_ID} disabled={!formValid || loading} size="lg">
                {loading ? (
                  <>
                    {' '}
                    <Spinner size="sm" className="border-primary-foreground border-t-transparent" /> Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
