import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const user = config.get<string>('mail.gmailUser') ?? '';
    const pass = config.get<string>('mail.gmailAppPassword') ?? '';
    this.from = config.get<string>('mail.from') || `NUEDU <${user}>`;

    if (!user || !pass) {
      this.logger.warn('GMAIL_USER or GMAIL_APP_PASSWORD is not set — emails will be skipped');
      this.transporter = null;
    } else {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
      });
    }
  }

  async send(to: string[], subject: string, html: string): Promise<void> {
    if (!this.transporter || to.length === 0) return;

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error('Failed to send email', err);
    }
  }
}
