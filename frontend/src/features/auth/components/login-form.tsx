import { Eye, EyeOff } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  onGithubLogin: () => void;
};

export function LoginForm({ onSubmit, onGithubLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  const isSubmitDisabled = email.trim() === '' || password.trim() === '';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            className="pr-9"
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
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
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
  );
}
