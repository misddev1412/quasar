import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { UploadResult, FileUploadOptions } from '../interfaces/storage.interface';
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
    
    // Validate file
    this.validateFile(file, config.allowedFileTypes, options.maxSize || config.maxFileSize);

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
    // Note: This is a placeholder for S3 upload implementation
    // You would need to install AWS SDK and implement actual S3 upload
    // For now, we'll throw an error to indicate it's not implemented
    throw new BadRequestException('S3 upload not yet implemented. Please install AWS SDK and implement S3 upload logic.');

    /*
    // Example S3 implementation (requires AWS SDK):
    const AWS = require('aws-sdk');
    
    const s3 = new AWS.S3({
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
      region: config.region,
      endpoint: config.endpoint,
      s3ForcePathStyle: config.forcePathStyle,
    });

    const key = `${folder}/${filename}`;
    
    const uploadParams = {
      Bucket: config.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // or whatever ACL you need
    };

    const result = await s3.upload(uploadParams).promise();

    return {
      url: result.Location,
      filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      provider: 's3',
    };
    */
  }

  async deleteFile(url: string): Promise<void> {
    const config = await this.storageService.getStorageConfig();

    if (config.provider === 's3') {
      // Implement S3 deletion
      throw new BadRequestException('S3 file deletion not yet implemented');
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