import { Resend } from 'resend';

import env from '@/config/environment';
import { BadRequestException } from '@/exceptions';
import logger from '@/utils/logger';

import type { IEmailService, SendEmailOptions } from './email.service.interface';

export class ResendEmailService implements IEmailService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: 'Nexora <noreply@nexora.app>',
      to,
      subject,
      html,
    });

    if (error) {
      logger.error(error);
      throw new BadRequestException('Failed to send email. Please try again.');
    }
  }
}
