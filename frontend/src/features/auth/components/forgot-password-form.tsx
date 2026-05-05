import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { FormError } from '@/shared/components/ui/form-error';
import { Input } from '@/shared/components/ui/input';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email is too long')
    .email('Enter a valid email address')
    .trim(),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

type ForgotPasswordFormProps = {
  formId?: string;
  onSubmit: (values: ForgotPasswordFormValues) => void | Promise<void>;
  onValidityChange?: (isValid: boolean) => void;
  isLoading?: boolean;
  error?: string;
};

export function ForgotPasswordForm({ formId, onSubmit, onValidityChange, isLoading, error }: ForgotPasswordFormProps) {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const { isValid } = form.formState;

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <FormError message={error} />}
      </form>
    </Form>
  );
}
