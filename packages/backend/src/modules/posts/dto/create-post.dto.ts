import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  titleVi: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  titleEn: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  excerptVi?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  excerptEn?: string;

  @ApiPropertyOptional({ default: '' })
  @IsString()
  @IsOptional()
  contentVi?: string;

  @ApiPropertyOptional({ default: '' })
  @IsString()
  @IsOptional()
  contentEn?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  featuredImageId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaTitleVi?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaTitleEn?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaDescriptionVi?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaDescriptionEn?: string;
}
