import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, MinDate } from 'class-validator';

export class SchedulePostDto {
  @ApiProperty({ description: 'ISO8601 datetime, must be > now + 1 minute' })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(() => new Date(Date.now() + 60_000), { message: 'scheduledAt must be at least 1 minute in the future' })
  scheduledAt: Date;
}
