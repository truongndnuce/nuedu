import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

const LEAD_RECIPIENTS_KEY = 'lead_recipients';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeadRecipients(): Promise<string[]> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: LEAD_RECIPIENTS_KEY },
    });
    if (!setting) return [];
    try {
      return JSON.parse(setting.value) as string[];
    } catch {
      return [];
    }
  }

  async setLeadRecipients(emails: string[]): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key: LEAD_RECIPIENTS_KEY },
      create: { key: LEAD_RECIPIENTS_KEY, value: JSON.stringify(emails) },
      update: { value: JSON.stringify(emails) },
    });
  }
}
