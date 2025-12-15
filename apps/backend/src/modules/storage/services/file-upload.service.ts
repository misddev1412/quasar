import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { StorageService } from './storage.service';
import { UploadResult, FileUploadOptions, S3StorageConfig } from '../interfaces/storage.interface';
import { buildS3PublicUrl, extractS3KeyFromUrl } from '../utils/storage-url.util';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

// File interface for uploaded files (similar to Express.Multer.File)
interface UploadedFile {
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  fieldname?: string;
  filename?: string;
  path?: string;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(private readonly storageService: StorageService) {}

  async uploadFile(
    file: UploadedFile,
    options: FileUploadOptions = {}
  ): Promise<UploadResult> {
    const config = await this.storageService.getStorageConfig();
    const allowedTypes = options.allowedTypes ?? config.allowedFileTypes;
    
    // Validate file
    this.validateFile(file, allowedTypes, options.maxSize || config.maxFileSize);

    // Generate filename
    const filename = options.filename || this.generateFilename(file.originalname);
    const folder = options.folder || 'general';

    if (config.provider === 's3') {
      return this.uploadToS3(file, filename, folder, config);
    } else {
      return this.uploadToLocal(file, filename, folder, config);
    }
  }

  private validateFile(file: UploadedFile, allowedTypes: string[], maxSize: number): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > maxSize) {
      throw new BadRequestException(`File too large. Maximum size is ${maxSize} bytes`);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not allowed`);
    }
  }

  private generateFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${name}-${timestamp}-${random}${ext}`;
  }

  private async uploadToLocal(
    file: UploadedFile,
    filename: string,
    folder: string,
    config: any
  ): Promise<UploadResult> {
    const uploadDir = path.join(process.cwd(), config.uploadPath, folder);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    
    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    const url = `${config.baseUrl}/${config.uploadPath}/${folder}/${filename}`;

    return {
      url,
      filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      provider: 'local',
    };
  }

  private async uploadToS3(
    file: UploadedFile,
    filename: string,
    folder: string,
    config: any
  ): Promise<UploadResult> {
    const s3Config = config as S3StorageConfig;

    if (!s3Config.accessKey || !s3Config.secretKey || !s3Config.bucket) {
      throw new BadRequestException('S3 is selected but credentials or bucket are missing in configuration');
    }

    const s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKey,
        secretAccessKey: s3Config.secretKey,
      },
      endpoint: s3Config.endpoint || undefined,
      forcePathStyle: s3Config.forcePathStyle || false,
    });

    const key = `${folder}/${filename}`;

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: s3Config.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        })
      );

      const url = buildS3PublicUrl(s3Config, key);

      return {
        url,
        filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        provider: 's3',
      };
    } catch (error: any) {
      this.logger.error('Failed to upload file to S3', error);
      throw new BadRequestException(error?.message || 'S3 upload failed');
    }
  }

  async deleteFile(url: string): Promise<void> {
    const config = await this.storageService.getStorageConfig();

    if (config.provider === 's3') {
      const s3Config = config as S3StorageConfig;
      const key = extractS3KeyFromUrl(url, {
        bucket: s3Config.bucket,
        cdnUrl: s3Config.cdnUrl,
        endpoint: s3Config.endpoint,
      });

      if (!key) {
        throw new BadRequestException('Unable to determine S3 object key from URL');
      }

      const s3Client = new S3Client({
        region: s3Config.region,
        credentials: {
          accessKeyId: s3Config.accessKey,
          secretAccessKey: s3Config.secretKey,
        },
        endpoint: s3Config.endpoint || undefined,
        forcePathStyle: s3Config.forcePathStyle || false,
      });

      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: s3Config.bucket,
            Key: key,
          })
        );
        this.logger.log(`Deleted S3 object: ${key}`);
      } catch (error: any) {
        this.logger.error(`Failed to delete S3 object: ${key}`, error);
        throw new BadRequestException(error?.message || 'Failed to delete S3 file');
      }
    } else {
      // Local file deletion
      try {
        const urlPath = new URL(url).pathname;
        const filePath = path.join(process.cwd(), urlPath);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.logger.log(`Deleted local file: ${filePath}`);
        }
      } catch (error) {
        this.logger.error(`Failed to delete file: ${url}`, error);
      }
    }
  }

}
