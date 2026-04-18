import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { FormError } from '@/shared/components/ui/form-error';
import { Input } from '@/shared/components/ui/input';
import { PasswordInput } from '@/shared/components/ui/password-input';
import { PasswordStrengthIndicator } from '@/shared/components/ui/password-strength-indicator';
import { Separator } from '@/shared/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

import { getPasswordStrength } from '../utils/password-strength';

const signupSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Username is required')
      .max(32, 'Username must be at most 32 characters')
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Username may only contain letters, numbers, underscores, hyphens, and dots')
      .trim(),
    email: z
      .string()
      .min(1, 'Email is required')
      .max(254, 'Email is too long')
      .email('Enter a valid email address')
      .trim(),
    password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password').max(128, 'Password is too long'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

type SignupFormProps = {
  onSubmit: (values: SignupFormValues) => void | Promise<void>;
  onGithubLogin: () => void;
  onGoogleLogin: () => void;
  error?: string | null;
  isLoading?: boolean;
};

export function SignupForm({ onSubmit, onGithubLogin, onGoogleLogin, error, isLoading }: SignupFormProps) {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });
  const { isValid } = form.formState;
  const password = useWatch({ control: form.control, name: 'password', defaultValue: '' });
  const strength = getPasswordStrength(password);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" placeholder="johndoe" autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="••••••••" autoComplete="new-password" {...field} />
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
                <PasswordInput placeholder="••••••••" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <FormError message={error} />}

        <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
          Create account
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">Or continue with</span>
          <Separator className="flex-1" />
        </div>

        <div className="flex items-center justify-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Sign up with GitHub"
                  onClick={onGithubLogin}
                  disabled={isLoading}
                  className="size-10 rounded-full"
                >
                  <img src="/github.svg" alt="GitHub" className="size-8 dark:invert" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Sign up with GitHub</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Sign up with Google"
                  onClick={onGoogleLogin}
                  disabled={isLoading}
                  className="size-10 rounded-full"
                >
                  <img src="/google.svg" alt="Google" className="size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Sign up with Google</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </form>
    </Form>
  );
}
