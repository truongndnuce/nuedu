import { Body, Controller, Get, HttpCode, Put } from '@nestjs/common';
import { IsArray, IsEmail, ArrayMaxSize } from 'class-validator';
import { AdminOnly } from '../../common/decorators';
import { SettingsService } from './settings.service';

class SetLeadRecipientsDto {
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayMaxSize(20)
  emails: string[];
}

@AdminOnly()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('lead-recipients')
  async getLeadRecipients() {
    const emails = await this.settingsService.getLeadRecipients();
    return { emails };
  }

  @Put('lead-recipients')
  @HttpCode(200)
  async setLeadRecipients(@Body() dto: SetLeadRecipientsDto) {
    await this.settingsService.setLeadRecipients(dto.emails);
    return { ok: true };
  }
}
