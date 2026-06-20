import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';

class PermissionOverride {
  @ApiProperty({ example: 'posts.update.any' })
  @IsString()
  key: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  granted: boolean;
}

export class UpdatePermissionsDto {
  @ApiProperty({ type: [PermissionOverride] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PermissionOverride)
  permissions: PermissionOverride[];
}
