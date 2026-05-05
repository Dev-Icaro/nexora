import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { FormError } from '@/shared/components/ui/form-error';
import { PasswordInput } from '@/shared/components/ui/password-input';
import { PasswordStrengthIndicator } from '@/shared/components/ui/password-strength-indicator';
import { Spinner } from '@/shared/components/ui/spinner';

import { getPasswordStrength } from '../utils/password-strength';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

type ResetPasswordFormProps = {
  onSubmit: (values: ResetPasswordFormValues) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
};

const RULES = [
  { label: 'At least 8 characters', check: (p: string) => p.length >= 8 },
  { label: 'Contains a number', check: (p: string) => /\d/.test(p) },
  { label: 'Contains uppercase letter', check: (p: string) => /[A-Z]/.test(p) },
];

export function ResetPasswordForm({ onSubmit, isLoading, error }: ResetPasswordFormProps) {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const { isValid, touchedFields } = form.formState;
  const password = useWatch({ control: form.control, name: 'password', defaultValue: '' });
  const confirmPassword = useWatch({ control: form.control, name: 'confirmPassword', defaultValue: '' });
  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="••••••••" autoComplete="new-password" disabled={isLoading} {...field} />
              </FormControl>
              {password.length > 0 && (
                <PasswordStrengthIndicator score={strength.score} level={strength.level} label={strength.label} />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="••••••••" autoComplete="new-password" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
              {touchedFields.confirmPassword && passwordsMatch && (
                <p className="flex items-center gap-1 text-xs text-green-500">
                  <Check className="size-3" strokeWidth={3} /> Passwords match
                </p>
              )}
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-1">
          {RULES.map(rule => {
            const met = rule.check(password);
            return (
              <div
                key={rule.label}
                className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-green-500' : 'text-muted-foreground'}`}
              >
                <div
                  className={`flex size-3 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${met ? 'border-green-500 bg-green-500' : 'border-muted-foreground'}`}
                >
                  {met && <Check className="size-2 text-white" strokeWidth={3} />}
                </div>
                {rule.label}
              </div>
            );
          })}
        </div>

        {error && <FormError message={error} />}

        <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
          {isLoading ? (
            <>
              <Spinner size="sm" />
              Updating…
            </>
          ) : (
            'Update password'
          )}
        </Button>
      </form>
    </Form>
  );
}
