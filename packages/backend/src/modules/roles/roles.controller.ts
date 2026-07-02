import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../common/decorators';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@AdminOnly()
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all custom roles' })
  list() {
    return this.rolesService.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom role' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role detail' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role name/description' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a custom role (fails if users are assigned)' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get permission keys for a role' })
  getPermissions(@Param('id') id: string) {
    return this.rolesService.getPermissions(id);
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Set permissions for a role (replaces existing)' })
  updatePermissions(@Param('id') id: string, @Body() dto: UpdateRolePermissionsDto) {
    return this.rolesService.updatePermissions(id, dto);
  }
}
