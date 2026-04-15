import { LoginForm } from '@/features/auth/components/login-form';
import { useLogin } from '@/features/auth/hooks/use-login';

export function LoginPage() {
  const { login, loading, error } = useLogin();

  return (
    <>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-shadow-muted-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">Welcome back &mdash; let&rsquo;s get you in.</p>
      </div>
      <LoginForm onSubmit={login} onGithubLogin={() => {}} error={error} isLoading={loading} />
    </>
  );
}
