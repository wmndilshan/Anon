import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class MediaService {
  constructor(private readonly config: ConfigService) {}

  async saveUploadedFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    const driver = this.config.get<string>('storage.driver') ?? 'local';
    if (driver === 's3') {
      // S3 upload can be implemented with @aws-sdk/client-s3; return public URL from config
      throw new Error('S3 upload not configured in this build — set STORAGE_DRIVER=local');
    }
    const dir = this.config.get<string>('storage.localUploadDir') ?? './uploads';
    const baseUrl = this.config.get<string>('storage.publicBaseUrl') ?? 'http://localhost:4000';
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const ext = file.originalname.includes('.') ? file.originalname.split('.').pop() : 'bin';
    const key = `${randomUUID()}.${ext}`;
    const full = join(dir, key);
    if (file.buffer) {
      await writeFile(full, file.buffer);
    } else {
      throw new Error('Expected in-memory file buffer');
    }
    return { key, url: `${baseUrl}/uploads/${key}` };
  }
}
