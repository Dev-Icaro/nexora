import { SignupForm } from '@/features/auth/components/signup-form';
import { useRegister } from '@/features/auth/hooks/use-register';

export function SignupPage() {
  const { register, loading, error } = useRegister();

  return (
    <>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">Join Nexora and start connecting.</p>
      </div>
      <SignupForm onSubmit={register} error={error} isLoading={loading} />
    </>
  );
}
