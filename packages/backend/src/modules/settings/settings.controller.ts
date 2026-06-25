import { Body, Controller, Get, HttpCode, Put } from '@nestjs/common';
import { IsArray, IsEmail, ArrayMaxSize } from 'class-validator';
import { Permissions } from '../../common/decorators';
import { SettingsService } from './settings.service';

class SetLeadRecipientsDto {
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayMaxSize(20)
  emails: string[];
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('lead-recipients')
  @Permissions('settings.manage')
  async getLeadRecipients() {
    const emails = await this.settingsService.getLeadRecipients();
    return { emails };
  }

  @Put('lead-recipients')
  @HttpCode(200)
  @Permissions('settings.manage')
  async setLeadRecipients(@Body() dto: SetLeadRecipientsDto) {
    await this.settingsService.setLeadRecipients(dto.emails);
    return { ok: true };
  }
}
