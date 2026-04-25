import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Check } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import type { ProfileUser } from '@/features/profile/api/profile.types';
import { AvatarUploadModal } from '@/features/profile/components/avatar-upload-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { cn, getInitials } from '@/shared/lib/utils';

const personalInfoSchema = z.object({
  bio: z.string().max(160, 'Bio must be at most 160 characters').or(z.literal('')),
  position: z.string().max(60, 'Position must be at most 60 characters').or(z.literal('')),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

type PersonalInformationFormProps = {
  profile: ProfileUser;
  loading: boolean;
  onSubmit: (values: { bio?: string; position?: string }) => Promise<boolean>;
};

// Matches design: muted bg, invisible border until focused, ring-shadow on focus
const inputCls =
  'h-auto w-full bg-muted dark:bg-muted border border-transparent rounded-lg ' +
  'px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground ' +
  'outline-none transition-[border-color,box-shadow] duration-150 ' +
  'focus-visible:border-ring focus-visible:ring-0 focus-visible:ring-transparent ' +
  'focus-visible:shadow-[0_0_0_2px_oklch(0.72_0.17_55_/_25%)]';

function FieldHint({ children }: { children: ReactNode }) {
  return <span className="text-[11px] text-muted-foreground">{children}</span>;
}

export function PersonalInformationForm({ profile, loading, onSubmit }: PersonalInformationFormProps) {
  const [saved, setSaved] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      bio: profile.bio ?? '',
      position: profile.position ?? '',
    },
  });

  const { isDirty, isSubmitting } = form.formState;
  const bioValue = useWatch({ control: form.control, name: 'bio' });
  const bioLen = (bioValue ?? '').length;

  async function handleSubmit(values: PersonalInfoFormValues) {
    const success = await onSubmit({
      bio: values.bio || undefined,
      position: values.position || undefined,
    });
    if (success) {
      form.reset(values);
      setSaved(true);
    }
  }

  return (
    <>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Section header */}
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-base font-semibold">Personal information</h2>
          <p className="text-[13px] text-muted-foreground mt-1">Update your profile details and public identity.</p>
        </div>

        {/* Section body */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="p-6 flex flex-col gap-5">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Avatar className="size-[72px]">
                    {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.username} />}
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold text-2xl">
                      {getInitials(profile.username)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    aria-label="Change profile photo"
                    className="absolute bottom-0 right-0 size-[26px] rounded-full bg-primary border-2 border-card flex items-center justify-center text-primary-foreground cursor-pointer"
                  >
                    <Camera className="size-[14px]" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium">Profile photo</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">JPG, PNG or GIF — max 5MB</p>
                </div>
              </div>

              {/* Position + Username (2-col) */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1.5 space-y-0">
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input className={inputCls} placeholder="e.g. Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-1.5">
                  <FormLabel>Username</FormLabel>
                  <Input
                    className={cn(inputCls, 'text-muted-foreground cursor-default')}
                    value={profile.username}
                    readOnly
                    tabIndex={-1}
                  />
                  <FieldHint>nexora.app/{profile.username}</FieldHint>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <FormLabel>Email address</FormLabel>
                <Input
                  className={cn(inputCls, 'text-muted-foreground cursor-default')}
                  value={profile.email}
                  readOnly
                  tabIndex={-1}
                />
                <FieldHint>Used for login and notifications</FieldHint>
              </div>

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1.5 space-y-0">
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <textarea
                        className={cn(inputCls, 'resize-none leading-[1.65] min-h-[80px]')}
                        placeholder="Tell people about yourself…"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex items-start justify-between">
                      <FormMessage className="text-[11px]" />
                      <span
                        className={cn(
                          'text-[11px] ml-auto',
                          bioLen > 160 ? 'text-destructive' : 'text-muted-foreground',
                        )}
                      >
                        {bioLen} / 160
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              {/* Save */}
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={!isDirty || isSubmitting || loading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-[oklch(0.78_0.17_55)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saved ? (
                    <>
                      <Check className="size-3.5" strokeWidth={2.5} />
                      Saved
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      <AvatarUploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
