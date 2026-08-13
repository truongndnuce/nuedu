import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  nameVi: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  nameEn: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;
}
