import { zodResolver } from '@hookform/resolvers/zod';
import { Image, Mic, Video, X } from 'lucide-react';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/shared/components/ui/form';
import { Textarea } from '@/shared/components/ui/textarea';

const SUPPORTED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];

const postSchema = z.object({
  body: z.string().trim().min(1),
  mediaFile: z
    .instanceof(File)
    .refine(
      f => SUPPORTED_MEDIA_TYPES.includes(f.type),
      'Unsupported file type. Please use JPG, PNG, GIF, WEBP, MP4, or WEBM.',
    )
    .optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

type PostComposerProps = {
  username: string;
  loading: boolean;
  onSubmit: (body: string, mediaFile?: File) => Promise<boolean>;
};

export function PostComposer({ username, loading, onSubmit }: PostComposerProps) {
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    mode: 'onChange',
    defaultValues: { body: '' },
  });
  const { isValid } = form.formState;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    form.setValue('mediaFile', file, { shouldValidate: true });

    if (SUPPORTED_MEDIA_TYPES.includes(file.type)) {
      setPreviewUrl(URL.createObjectURL(file));
      setIsVideo(file.type.startsWith('video/'));
    } else {
      setPreviewUrl(null);
    }

    e.target.value = '';
  };

  const handleRemoveMedia = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setIsVideo(false);
    form.setValue('mediaFile', undefined, { shouldValidate: true });
  };

  const handleSubmit = async (values: PostFormValues) => {
    const success = await onSubmit(values.body, values.mediaFile);
    if (success) {
      form.reset();
      handleRemoveMedia();
    }
  };

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-4 space-y-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex items-center gap-3">
              <Avatar className="size-10 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem className="relative flex-1">
                    <FormControl>
                      <Textarea placeholder="What is happening!?" className="bg-muted border-0 pr-10" {...field} />
                    </FormControl>
                    <Mic className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mediaFile"
              render={() => (
                <FormItem className="pl-13">
                  {previewUrl && (
                    <div className="relative mt-2 inline-block">
                      {isVideo ? (
                        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                          <Video className="size-4" />
                          Video attached
                        </div>
                      ) : (
                        <img src={previewUrl} alt="Media preview" className="max-h-40 rounded-md object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveMedia}
                        className="absolute right-1.5 top-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full bg-foreground text-background"
                        aria-label="Remove media"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex items-center justify-between pl-13 mt-3">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Image className="size-4" />
                  Media Content
                </button>
                {/* <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Hash className="size-4" />
                  Hashtags
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-4" />
                  Schedule
                </span> */}
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="rounded-full"
                disabled={!isValid || loading}
              >
                Post
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
