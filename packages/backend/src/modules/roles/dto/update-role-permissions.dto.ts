import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiProperty({ type: [String], example: ['posts.create', 'posts.update.own'] })
  @IsArray()
  @IsString({ each: true })
  permissionKeys: string[];
}
