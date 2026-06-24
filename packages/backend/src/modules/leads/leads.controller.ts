import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
import { LeadsService } from './leads.service';

class SubmitLeadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Public()
  @Post()
  @HttpCode(200)
  async submit(@Body() dto: SubmitLeadDto) {
    await this.leadsService.submit(dto);
    return { ok: true };
  }
}
