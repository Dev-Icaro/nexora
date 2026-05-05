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
  const [formValid, setFormValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [prevIsSuccess, setPrevIsSuccess] = useState(isSuccess ?? false);

  // This block avoid using set state inside useEffect
  // and trigger react-hook linting error
  if (isSuccess && !prevIsSuccess) {
    setPrevIsSuccess(true);
    setShowSuccess(true);
  } else if (!isSuccess && prevIsSuccess) {
    setPrevIsSuccess(false);
  }

  async function handleSubmit(values: ForgotPasswordFormValues) {
    if (onSubmit) {
      await onSubmit(values);
    }
  }

  function handleRetry() {
    setShowSuccess(false);
    setFormValid(false);
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setShowSuccess(false);
      setFormValid(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {showSuccess ? (
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
              isLoading={isLoading}
              error={error}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading} size="lg">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" form={FORM_ID} disabled={!formValid || isLoading} size="lg">
                {isLoading ? (
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
