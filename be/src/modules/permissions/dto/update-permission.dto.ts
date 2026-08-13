import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'events' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  group?: string;

  @ApiPropertyOptional({ example: 'CRUD events' })
  @IsString()
  @IsOptional()
  description?: string;
}
