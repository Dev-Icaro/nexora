import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Hash, Image, Mic } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

const postSchema = z.object({
  body: z.string().trim().min(1),
});

type PostFormValues = z.infer<typeof postSchema>;

export function PostComposer() {
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    mode: 'onChange',
    defaultValues: { body: '' },
  });
  const { isValid } = form.formState;

  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-4 space-y-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => {})}>
            <div className="flex items-center gap-3">
              <Avatar className="size-10 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">JD</AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem className="relative flex-1">
                    <FormControl>
                      <Input placeholder="What is happening!?" className="bg-muted border-0 pr-10" {...field} />
                    </FormControl>
                    <Mic className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between pl-13 mt-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Image className="size-4" />
                  Media Content
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Hash className="size-4" />
                  Hashtags
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-4" />
                  Schedule
                </span>
              </div>
              <Button type="submit" variant="secondary" size="sm" className="rounded-full" disabled={!isValid}>
                Post
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
