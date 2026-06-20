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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Permissions } from '../../common/decorators';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

interface AuthUser { id: string }

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Permissions('users.read')
  @ApiOperation({ summary: 'List staff users (paginated)' })
  list(@Query() dto: ListUsersDto) {
    return this.usersService.list(dto);
  }

  @Post()
  @Permissions('users.create')
  @ApiOperation({ summary: 'Create staff account' })
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthUser) {
    return this.usersService.create(dto, user.id);
  }

  @Get(':id')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get user detail' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions('users.update')
  @ApiOperation({ summary: 'Update user info' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('users.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete (deactivate) user' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.softDelete(id, user.id);
  }

  @Post(':id/reset-password')
  @Permissions('users.update')
  @ApiOperation({ summary: 'Reset user password and return temporary password' })
  resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }

  @Get(':id/permissions')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get effective permissions for a user' })
  getPermissions(@Param('id') id: string) {
    return this.usersService.getPermissions(id);
  }

  @Put(':id/permissions')
  @Permissions('permissions.assign')
  @ApiOperation({ summary: 'Override permissions for a user' })
  updatePermissions(@Param('id') id: string, @Body() dto: UpdatePermissionsDto) {
    return this.usersService.updatePermissions(id, dto);
  }
}
