import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength, ValidateIf } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password', 'customRoleId'] as const)) {
  @ApiPropertyOptional({ description: 'Leave empty to keep current password' })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ description: 'Custom role ID or null to remove', nullable: true })
  @IsUUID()
  @ValidateIf((o) => o.customRoleId !== null)
  @IsOptional()
  customRoleId?: string | null;
}
