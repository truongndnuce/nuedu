import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ConfirmUploadDto {
  @ApiProperty()
  @IsString()
  public_id: string;

  @ApiProperty()
  @IsInt()
  version: number;

  @ApiProperty()
  @IsString()
  secure_url: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  format?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  width?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  height?: number;

  @ApiProperty()
  @IsInt()
  bytes: number;

  @ApiProperty()
  @IsString()
  resource_type: string;

  @ApiProperty()
  @IsString()
  signature: string;
}
