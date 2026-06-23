import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class MarkReadDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  upToMessageId?: string;
}
