import { LoginForm } from '@/features/auth/components/login-form';

export function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* LEFT — Auth panel */}
      <main className="flex flex-1 flex-col items-center justify-center px-8 py-12 md:max-w-[45%]">
        <div className="w-full max-w-sm">
          <span className="block mb-6">
            <img src="/logo.png" alt="Nexora" className="size-15" />
            <span className="text-md font-semibold text-center">Nexora</span>
          </span>
          <div className="mb-6 flex flex-col gap-1">
            <h1 className="text-3xl font-semibold text-shadow-muted-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground">Welcome back &mdash; let&rsquo;s get you in.</p>
          </div>
          <LoginForm onSubmit={() => {}} onGithubLogin={() => {}} />
        </div>
      </main>

      {/* RIGHT — Brand panel (hidden on mobile) */}
      <aside
        className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-l border-border px-12 md:flex bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('/login-background.png')",
        }}
      >
        {/* Large decorative logo — blurred background fill */}
        <img src="/logo.png" alt="" aria-hidden="true" className="size-72" />

        {/* Brand content */}
        <div className="relative z-10 flex flex-col items-center gap-5 text-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-secondary">Welcome to Nexora</h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Connect with people, share your thoughts, and discover what&rsquo;s happening in your world &mdash; all in
              real time.
            </p>
          </div>
        </div>

        {/* Feature highlight card — bottom right */}
        <div className="absolute bottom-8 right-8 w-64 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Real-time conversations</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Join live discussions and never miss a moment with instant updates.
          </p>
        </div>
      </aside>
    </div>
  );
}
