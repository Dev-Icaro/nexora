import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { AppearanceSection } from '@/features/settings/components/appearance-section';
import { PersonalInformationForm } from '@/features/settings/components/personal-information-form';
import { useTheme } from '@/shared/hooks/use-theme';

export function SettingsPage() {
  const { preference, setTheme } = useTheme();

  const {
    state: { user: authUser },
  } = useAuth();

  const { user, loading: profileLoading, updateProfile, updateLoading } = useProfile(authUser?.id ?? '');

  if (profileLoading || !user) return null;

  const profile = {
    id: user.id,
    username: user.username,
    email: authUser?.email ?? '',
    bio: user.bio,
    position: user.position,
    avatarUrl: user.avatarUrl,
  };

  return (
    <main className="max-w-[680px] w-full mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <PersonalInformationForm profile={profile} loading={updateLoading} onSubmit={updateProfile} />
      <AppearanceSection value={preference} onValueChange={setTheme} />
    </main>
  );
}
