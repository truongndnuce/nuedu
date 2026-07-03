import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../common/decorators';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
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

  @Post()
  @AdminOnly()
  @ApiOperation({ summary: 'Create a new permission key (admin only)' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Patch(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update permission group/description (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a permission key (admin only)' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
