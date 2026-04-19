import { CalendarDays, Hash, Image, Mic } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';

export function PostComposer() {
  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">JD</AvatarFallback>
          </Avatar>
          <div className="relative flex-1">
            <Input placeholder="What is happening!?" className="bg-muted border-0 pr-10" readOnly />
            <Mic className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center justify-between pl-13">
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
          <Button variant="secondary" size="sm" className="rounded-full">
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
