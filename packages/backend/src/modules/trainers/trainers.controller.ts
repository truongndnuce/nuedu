import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '@common/decorators/permissions.decorator';
import { Public } from '@common/decorators/public.decorator';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@ApiTags('Trainers')
@Controller('trainers')
export class TrainersController {
  constructor(private readonly service: TrainersService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List active trainers (public)' })
  findAll() {
    return this.service.findAll();
  }

  @Get('admin')
  @ApiBearerAuth()
  @Permissions('trainers.view', 'trainers.manage')
  @ApiOperation({ summary: 'List all trainers including inactive (admin)' })
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  @Post()
  @ApiBearerAuth()
  @Permissions('trainers.manage')
  @ApiOperation({ summary: 'Create trainer' })
  create(@Body() dto: CreateTrainerDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Permissions('trainers.manage')
  @ApiOperation({ summary: 'Update trainer' })
  update(@Param('id') id: string, @Body() dto: UpdateTrainerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Permissions('trainers.manage')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete trainer' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
