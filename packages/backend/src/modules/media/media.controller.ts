import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Permissions } from '@common/decorators/permissions.decorator';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { ListMediaDto } from './dto/list-media.dto';
import { SignUploadDto } from './dto/sign-upload.dto';
import { MediaService } from './media.service';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post('sign-upload')
  @Permissions('media.upload')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Get signed upload params for direct Cloudinary upload (F-022)' })
  signUpload(@Body() dto: SignUploadDto, @CurrentUser('id') userId: string) {
    return this.service.signUpload(dto, userId);
  }

  @Post(':id/confirm')
  @Permissions('media.upload')
  @ApiOperation({ summary: 'Confirm Cloudinary upload and finalize Media record (F-023)' })
  confirmUpload(
    @Param('id') id: string,
    @Body() dto: ConfirmUploadDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.confirmUpload(id, dto, userId);
  }

  @Get()
  @Permissions('media.view')
  @ApiOperation({ summary: 'List own uploads (F-024)' })
  list(@Query() dto: ListMediaDto, @CurrentUser('id') userId: string) {
    return this.service.list(dto, userId);
  }

  @Delete(':id')
  @Permissions('media.delete.own')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete media (F-024)' })
  delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('effectivePermissions') perms: string[],
  ) {
    const canDeleteAny = perms.includes('media.delete.any');
    return this.service.delete(id, userId, canDeleteAny);
  }

  @Get(':id/url')
  @Permissions('media.view')
  @ApiOperation({ summary: 'Get private download URL (F-025)' })
  getPrivateUrl(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.getPrivateUrl(id, userId);
  }
}
