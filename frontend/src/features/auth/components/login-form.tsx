import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { FormError } from '@/shared/components/ui/form-error';
import { Input } from '@/shared/components/ui/input';
import { PasswordInput } from '@/shared/components/ui/password-input';
import { Separator } from '@/shared/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

import type { LoginRequest } from '../api/auth.types';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email is too long')
    .email('Enter a valid email address')
    .trim(),
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  onSubmit: (values: LoginRequest) => void | Promise<void>;
  onGithubLogin: () => void;
  error?: string | null;
  isLoading?: boolean;
};

export function LoginForm({ onSubmit, onGithubLogin, error, isLoading }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });
  const { isValid } = form.formState;
  const email = useWatch({ control: form.control, name: 'email', defaultValue: '' });
  const password = useWatch({ control: form.control, name: 'password', defaultValue: '' });

  const inputsFilled = !!email && !!password;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                <PasswordInput placeholder="••••••••" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <FormError message={error} />}

        <Button type="submit" className="w-full" disabled={!inputsFilled || !isValid || isLoading}>
          Sign in
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Don&rsquo;t have an account?{' '}
          <Link to={'/signup'} className="font-medium text-primary hover:underline">
            Sign up
          </Link>
          <br />
          <a href="#" className="text-left font-medium text-primary hover:underline">
            Forgot password?
          </a>
        </p>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">Or continue with</span>
          <Separator className="flex-1" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Sign in with GitHub"
                  onClick={onGithubLogin}
                  disabled={isLoading}
                  className="size-10 rounded-full"
                >
                  <img src="/github.svg" alt="GitHub" className="size-8 dark:invert" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Sign in with GitHub</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </form>
    </Form>
  );
}
