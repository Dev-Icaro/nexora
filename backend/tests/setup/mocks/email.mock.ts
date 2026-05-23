import { vi } from 'vitest';

import type { IEmailService } from '@/services/email/email.service.interface';

export function createMockEmailService(): IEmailService & { sendEmail: ReturnType<typeof vi.fn> } {
  return {
    sendEmail: vi.fn().mockResolvedValue(undefined),
  };
}
