import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUrl, MinLength, ValidateIf } from 'class-validator';

export class CreateTrainerDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  nameVi: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  titleVi: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  bioVi: string;

  @ApiPropertyOptional({ description: 'URL slug; generated from nameVi when omitted' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  headlineVi?: string;

  @ApiPropertyOptional({ description: 'Detail page HTML' })
  @IsString()
  @IsOptional()
  contentVi?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => !!o.facebookUrl)
  @IsUrl()
  facebookUrl?: string;

  @ApiProperty()
  @IsString()
  avatar: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  specialties: string[];

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
