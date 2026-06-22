import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTrainerDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  nameVi: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  nameEn: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  titleVi: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  titleEn: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  bioVi: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  bioEn: string;

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
