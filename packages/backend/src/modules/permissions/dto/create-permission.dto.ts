import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'events.manage' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(\.[a-z0-9]+)+$/, {
    message: 'key must be lowercase dot-separated segments, e.g. "events.manage"',
  })
  key: string;

  @ApiProperty({ example: 'events' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  group: string;

  @ApiPropertyOptional({ example: 'CRUD events' })
  @IsString()
  @IsOptional()
  description?: string;
}
