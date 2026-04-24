import { UploadCloud } from 'lucide-react';
import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

type AvatarUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AvatarUploadModal({ open, onOpenChange }: AvatarUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError('Only JPEG, PNG, and WebP files are accepted.');
      setPreview(null);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('File must be under 5 MB.');
      setPreview(null);
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleClose() {
    setPreview(null);
    setError(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Upload avatar</DialogTitle>
        </DialogHeader>

        <div
          role="button"
          tabIndex={0}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          )}
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={e => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="size-24 rounded-full object-cover" />
          ) : (
            <>
              <UploadCloud className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Drag & drop or <span className="text-primary font-medium">browse</span>
                <br />
                <span className="text-xs">JPEG, PNG, WebP · max 5 MB</span>
              </p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleInputChange}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={!preview} onClick={handleClose}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
