import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all permission keys with groups' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('role-defaults')
  @ApiOperation({ summary: 'Default permissions per role' })
  roleDefaults() {
    return this.permissionsService.getRoleDefaults();
  }
}
