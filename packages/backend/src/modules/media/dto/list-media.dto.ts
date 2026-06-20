import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MediaResourceType } from '@prisma/client';

export class ListMediaDto {
  @ApiPropertyOptional({ enum: MediaResourceType })
  @IsEnum(MediaResourceType)
  @IsOptional()
  resourceType?: MediaResourceType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  folder?: string;

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
