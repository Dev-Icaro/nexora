import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  onGithubLogin: () => void;
};

export function LoginForm({ onSubmit, onGithubLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSubmit = form.handleSubmit(({ email, password }) => {
    onSubmit(email, password);
  });

  const formValues = form.getValues();
  const inputsFilled = useMemo(() => !!formValues.email && !!formValues.password, [formValues]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-9"
                    {...field}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">{showPassword ? 'Hide password' : 'Show password'}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={!inputsFilled}>
          Sign in
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Don&rsquo;t have an account?{' '}
          <a href="#" className="font-medium text-primary hover:underline">
            Sign up
          </a>
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
