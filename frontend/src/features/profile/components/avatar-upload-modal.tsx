import { Loader2, UploadCloud } from 'lucide-react';
import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

type AvatarUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
};

export function AvatarUploadModal({ open, onOpenChange, onUpload, uploading = false }: AvatarUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(selected: File) {
    if (!ACCEPTED_TYPES.has(selected.type)) {
      setError('Only JPEG, PNG, and WebP files are accepted.');
      setPreview(null);
      setFile(null);
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError('File must be under 5 MB.');
      setPreview(null);
      setFile(null);
      return;
    }
    setError(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  }

  function handleClose() {
    setPreview(null);
    setFile(null);
    setError(null);
    onOpenChange(false);
  }

  async function handleSave() {
    if (!file || uploading) return;
    await onUpload(file);
    handleClose();
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
          onDragEnter={e => {
            e.preventDefault();
            dragCounter.current++;
            setIsDragging(true);
          }}
          onDragOver={e => e.preventDefault()}
          onDragLeave={() => {
            dragCounter.current--;
            if (dragCounter.current === 0) setIsDragging(false);
          }}
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
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button disabled={!file || uploading} onClick={handleSave}>
            {uploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
