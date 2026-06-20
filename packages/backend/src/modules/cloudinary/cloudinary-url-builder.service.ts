import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryUrlBuilderService {
  thumbnail(publicId: string, w = 400, h = 225): string {
    return cloudinary.url(publicId, {
      transformation: [{ crop: 'fill', width: w, height: h, fetch_format: 'auto', quality: 'auto' }],
      secure: true,
    });
  }

  featured(publicId: string, w = 1200): string {
    return cloudinary.url(publicId, {
      transformation: [{ width: w, fetch_format: 'auto', quality: 'auto' }],
      secure: true,
    });
  }

  ogImage(publicId: string): string {
    return cloudinary.url(publicId, {
      transformation: [{ crop: 'fill', width: 1200, height: 630, fetch_format: 'jpg', quality: 'auto' }],
      secure: true,
    });
  }

  avatar(publicId: string, size = 96): string {
    return cloudinary.url(publicId, {
      transformation: [{ crop: 'thumb', gravity: 'face', width: size, height: size, radius: 'max', fetch_format: 'auto' }],
      secure: true,
    });
  }

  withVariants(publicId: string): { original: string; thumbnail: string; featured: string; ogImage: string } {
    return {
      original: cloudinary.url(publicId, { secure: true }),
      thumbnail: this.thumbnail(publicId),
      featured: this.featured(publicId),
      ogImage: this.ogImage(publicId),
    };
  }
}
