import { SignupForm } from '@/features/auth/components/signup-form';

export function SignupPage() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">Join Nexora and start connecting.</p>
      </div>
      <SignupForm onSubmit={() => {}} />
    </>
  );
}
