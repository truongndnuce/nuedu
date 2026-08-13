import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryUrlBuilderService } from './cloudinary-url-builder.service';

@Global()
@Module({
  providers: [CloudinaryService, CloudinaryUrlBuilderService],
  exports: [CloudinaryService, CloudinaryUrlBuilderService],
})
export class CloudinaryModule {}
