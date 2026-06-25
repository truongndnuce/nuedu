import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { MailModule } from '../mail/mail.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [MailModule, SettingsModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
