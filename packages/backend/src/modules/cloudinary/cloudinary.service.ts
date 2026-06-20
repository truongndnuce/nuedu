import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as crypto from 'crypto';

@Injectable()
export class CloudinaryService {
  private readonly apiSecret: string;
  private readonly apiKey: string;
  private readonly cloudName: string;
  private readonly folderPrefix: string;
  private readonly privateUrlTtl: number;

  constructor(private readonly config: ConfigService) {
    this.cloudName = config.get<string>('cloudinary.cloudName')!;
    this.apiKey = config.get<string>('cloudinary.apiKey')!;
    this.apiSecret = config.get<string>('cloudinary.apiSecret')!;
    this.folderPrefix = config.get<string>('cloudinary.folderPrefix', 'nuedu');
    this.privateUrlTtl = config.get<number>('cloudinary.privateUrlTtl', 3600);

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    });
  }

  generatePublicId(folder: string): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const uuid = crypto.randomUUID();
    return `${this.folderPrefix}/${folder}/${yyyy}/${mm}/${uuid}`;
  }

  generateUploadSignature(
    publicId: string,
    resourceType: string,
    folder: string,
  ): { signature: string; timestamp: number; apiKey: string; cloudName: string; uploadUrl: string } {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = {
      folder,
      public_id: publicId,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, this.apiSecret);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;

    return { signature, timestamp, apiKey: this.apiKey, cloudName: this.cloudName, uploadUrl };
  }

  verifyUploadResponse(publicId: string, version: number, receivedSignature: string): boolean {
    const expectedSig = cloudinary.utils.api_sign_request(
      { public_id: publicId, version },
      this.apiSecret,
    );
    return expectedSig === receivedSignature;
  }

  async deleteResource(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
  }

  generatePrivateUrl(publicId: string): string {
    const expiresAt = Math.round(Date.now() / 1000) + this.privateUrlTtl;
    return cloudinary.utils.private_download_url(publicId, '', {
      expires_at: expiresAt,
      attachment: false,
    });
  }
}
