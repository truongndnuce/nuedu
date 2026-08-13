import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsString, Max } from 'class-validator';

export enum UploadFolder {
  POSTS = 'posts',
  CHAT = 'chat',
  AVATARS = 'avatars',
}

export class SignUploadDto {
  @ApiProperty({ enum: UploadFolder })
  @IsEnum(UploadFolder)
  folder: UploadFolder;

  @ApiProperty({ enum: ['image', 'raw', 'video'] })
  @IsIn(['image', 'raw', 'video'])
  resourceType: 'image' | 'raw' | 'video';

  @ApiProperty()
  @IsString()
  filename: string;

  @ApiProperty()
  @IsString()
  mimeType: string;

  @ApiProperty()
  @IsInt()
  @Max(25 * 1024 * 1024)
  size: number;
}
