import { Eye, EyeOff } from 'lucide-react';
import { type ComponentProps, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'>;

export function PasswordInput(props: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} className="pr-9" {...props} />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={show ? 'Hide password' : 'Show password'}
              onClick={() => setShow(prev => !prev)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{show ? 'Hide password' : 'Show password'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
