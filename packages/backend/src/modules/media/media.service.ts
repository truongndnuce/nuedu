import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MediaResourceType, MediaStatus } from '@prisma/client';
import { PrismaService } from '@config/prisma.service';
import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';
import { CloudinaryUrlBuilderService } from '@modules/cloudinary/cloudinary-url-builder.service';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { ListMediaDto } from './dto/list-media.dto';
import { SignUploadDto, UploadFolder } from './dto/sign-upload.dto';

const IMAGE_MIME_WHITELIST = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const IMAGE_MAX_SIZE = 10 * 1024 * 1024;
const RAW_MAX_SIZE = 25 * 1024 * 1024;

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly urlBuilder: CloudinaryUrlBuilderService,
  ) {}

  async signUpload(dto: SignUploadDto, userId: string) {
    if (dto.resourceType === 'image') {
      if (!IMAGE_MIME_WHITELIST.includes(dto.mimeType)) {
        throw new BadRequestException(`MIME type ${dto.mimeType} is not allowed for image uploads`);
      }
      if (dto.size > IMAGE_MAX_SIZE) {
        throw new BadRequestException('Image size must not exceed 10MB');
      }
    } else if (dto.resourceType === 'raw') {
      if (dto.size > RAW_MAX_SIZE) {
        throw new BadRequestException('File size must not exceed 25MB');
      }
    }

    const publicId = this.cloudinary.generatePublicId(dto.folder);
    const resourceTypeMap: Record<string, MediaResourceType> = {
      image: MediaResourceType.IMAGE,
      video: MediaResourceType.VIDEO,
      raw: MediaResourceType.RAW,
    };

    const media = await this.prisma.media.create({
      data: {
        originalName: dto.filename,
        mimeType: dto.mimeType,
        size: dto.size,
        resourceType: resourceTypeMap[dto.resourceType],
        cloudinaryId: publicId,
        folder: dto.folder,
        isPrivate: dto.folder === UploadFolder.CHAT,
        status: MediaStatus.PENDING,
        uploadedById: userId,
      },
    });

    const signatureData = this.cloudinary.generateUploadSignature(publicId, dto.resourceType, dto.folder);

    return {
      mediaId: media.id,
      publicId,
      ...signatureData,
    };
  }

  async confirmUpload(mediaId: string, dto: ConfirmUploadDto, userId: string) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media not found');
    if (media.uploadedById !== userId) throw new ForbiddenException('Not your upload');
    if (media.status === MediaStatus.CONFIRMED) throw new BadRequestException('Already confirmed');

    const isValid = this.cloudinary.verifyUploadResponse(dto.public_id, dto.version, dto.signature);
    if (!isValid) throw new BadRequestException('Invalid upload signature');

    const updated = await this.prisma.media.update({
      where: { id: mediaId },
      data: {
        cloudinaryUrl: dto.secure_url,
        format: dto.format,
        width: dto.width,
        height: dto.height,
        size: dto.bytes,
        status: MediaStatus.CONFIRMED,
      },
    });

    return this.toDto(updated);
  }

  async list(dto: ListMediaDto, userId: string) {
    const { page = 1, limit = 20, resourceType, folder } = dto;
    const skip = (page - 1) * limit;

    const where = {
      uploadedById: userId,
      status: MediaStatus.CONFIRMED,
      ...(resourceType && { resourceType }),
      ...(folder && { folder }),
    };

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.media.count({ where }),
    ]);

    return {
      items: items.map((m) => this.toDto(m)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(mediaId: string, userId: string, canDeleteAny: boolean) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
      include: { postsAsFeatured: { select: { id: true } } },
    });
    if (!media) throw new NotFoundException('Media not found');

    if (!canDeleteAny && media.uploadedById !== userId) {
      throw new ForbiddenException('You can only delete your own uploads');
    }

    if (media.postsAsFeatured.length > 0) {
      throw new BadRequestException('Cannot delete media used as a featured image in posts');
    }

    const resourceTypeMap: Record<MediaResourceType, 'image' | 'video' | 'raw'> = {
      IMAGE: 'image',
      VIDEO: 'video',
      RAW: 'raw',
    };

    if (media.status === MediaStatus.CONFIRMED) {
      await this.cloudinary.deleteResource(media.cloudinaryId, resourceTypeMap[media.resourceType]);
    }

    await this.prisma.media.delete({ where: { id: mediaId } });
  }

  async getPrivateUrl(mediaId: string, userId: string) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media not found');

    if (!media.isPrivate) {
      return { url: media.cloudinaryUrl };
    }

    if (media.uploadedById !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const url = this.cloudinary.generatePrivateUrl(media.cloudinaryId);
    return { url };
  }

  private toDto(media: any) {
    const variants = media.status === MediaStatus.CONFIRMED && media.resourceType === MediaResourceType.IMAGE
      ? this.urlBuilder.withVariants(media.cloudinaryId)
      : undefined;

    return {
      id: media.id,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
      resourceType: media.resourceType,
      cloudinaryId: media.cloudinaryId,
      cloudinaryUrl: media.cloudinaryUrl,
      folder: media.folder,
      format: media.format,
      width: media.width,
      height: media.height,
      isPrivate: media.isPrivate,
      status: media.status,
      createdAt: media.createdAt,
      variants,
    };
  }
}
