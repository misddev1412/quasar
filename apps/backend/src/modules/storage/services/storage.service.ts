import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingEntity } from '../../settings/entities/setting.entity';
import { LocalStorageConfig, S3StorageConfig, StorageConfig } from '../interfaces/storage.interface';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @InjectRepository(SettingEntity)
    private readonly settingRepository: Repository<SettingEntity>,
  ) {}

  async getStorageConfig(): Promise<LocalStorageConfig | S3StorageConfig> {
    const settings = await this.getStorageSettings();
    
    const provider = settings['storage.provider'] || 'local';
    const maxFileSize = parseInt(settings['storage.max_file_size']) || 10485760; // 10MB
    let allowedFileTypes: string[] = [];
    
    try {
      allowedFileTypes = JSON.parse(settings['storage.allowed_file_types'] || '[]');
    } catch (e) {
      this.logger.warn('Failed to parse allowed file types, using defaults');
      allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    }

    const baseConfig = {
      provider,
      maxFileSize,
      allowedFileTypes,
    };

    if (provider === 's3') {
      return {
        ...baseConfig,
        provider: 's3',
        accessKey: settings['storage.s3.access_key'] || '',
        secretKey: settings['storage.s3.secret_key'] || '',
        region: settings['storage.s3.region'] || 'us-east-1',
        bucket: settings['storage.s3.bucket'] || '',
        endpoint: settings['storage.s3.endpoint'] || undefined,
        forcePathStyle: settings['storage.s3.force_path_style'] === 'true',
      } as S3StorageConfig;
    }

    return {
      ...baseConfig,
      provider: 'local',
      uploadPath: settings['storage.local.upload_path'] || 'uploads',
      baseUrl: settings['storage.local.base_url'] || 'http://localhost:3001',
    } as LocalStorageConfig;
  }

  async getAllStorageConfig() {
    const settings = await this.getStorageSettings();
    
    const provider = settings['storage.provider'] || 'local';
    const maxFileSize = parseInt(settings['storage.max_file_size']) || 10485760; // 10MB
    let allowedFileTypes: string[] = [];
    
    try {
      allowedFileTypes = JSON.parse(settings['storage.allowed_file_types'] || '[]');
    } catch (e) {
      this.logger.warn('Failed to parse allowed file types, using defaults');
      allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    }

    return {
      provider,
      maxFileSize,
      allowedFileTypes,
      // Local settings
      uploadPath: settings['storage.local.upload_path'] || 'uploads',
      baseUrl: settings['storage.local.base_url'] || 'http://localhost:3001',
      // S3 settings
      accessKey: settings['storage.s3.access_key'] || '',
      secretKey: settings['storage.s3.secret_key'] || '',
      region: settings['storage.s3.region'] || 'us-east-1',
      bucket: settings['storage.s3.bucket'] || '',
      endpoint: settings['storage.s3.endpoint'] || '',
      forcePathStyle: settings['storage.s3.force_path_style'] === 'true',
    };
  }

  private async getStorageSettings(): Promise<Record<string, string>> {
    const storageSettings = await this.settingRepository.find({
      where: { group: 'storage' },
    });

    const settings: Record<string, string> = {};
    storageSettings.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    return settings;
  }

  async updateStorageSettings(settings: Record<string, string>): Promise<void> {
    console.log('🔍 [STORAGE SERVICE] updateStorageSettings called with:', JSON.stringify(settings, null, 2));
    
    for (const [key, value] of Object.entries(settings)) {
      if (key.startsWith('storage.')) {
        console.log(`⚙️ [STORAGE SERVICE] Processing setting: ${key} = ${key.includes('key') ? '[REDACTED]' : value}`);
        await this.updateSetting(key, value);
        console.log(`✅ [STORAGE SERVICE] Successfully updated: ${key}`);
      } else {
        console.log(`⚠️ [STORAGE SERVICE] Skipping non-storage setting: ${key}`);
      }
    }
    console.log('🎉 [STORAGE SERVICE] All settings processed successfully');
  }

  private async updateSetting(key: string, value: string): Promise<void> {
    console.log(`🔍 [STORAGE SERVICE] Looking up setting: ${key}`);
    const setting = await this.settingRepository.findOne({ where: { key } });
    
    if (setting) {
      console.log(`📝 [STORAGE SERVICE] Found existing setting: ${key} (current value: ${key.includes('key') ? '[REDACTED]' : setting.value})`);
      const oldValue = setting.value;
      setting.value = value;
      await this.settingRepository.save(setting);
      console.log(`✅ [STORAGE SERVICE] Updated setting: ${key} from "${key.includes('key') ? '[REDACTED]' : oldValue}" to "${key.includes('key') ? '[REDACTED]' : value}"`);
    } else {
      console.log(`🆕 [STORAGE SERVICE] Creating new setting: ${key}`);
      const newSetting = this.settingRepository.create({
        key,
        value,
        type: 'string',
        group: 'storage',
        isPublic: false,
        description: `Auto-created storage setting: ${key}`
      });
      const savedSetting = await this.settingRepository.save(newSetting);
      console.log(`✅ [STORAGE SERVICE] Created new setting: ${key} with ID: ${savedSetting.id}`);
      this.logger.log(`Created new setting: ${key}`);
    }
  }

  async generatePresignedUrl(
    originalFilename: string,
    contentType: string,
    folder: string = 'general',
    expiresIn: number = 3600 // 1 hour default
  ): Promise<{
    uploadUrl: string;
    downloadUrl: string;
    key: string;
    filename: string;
  }> {
    const config = await this.getStorageConfig();

    if (config.provider !== 's3') {
      throw new BadRequestException('Presigned URLs are only available for S3 storage');
    }

    const s3Config = config as S3StorageConfig;

    // Generate unique filename
    const filename = this.generateUniqueFilename(originalFilename);
    const key = `${folder}/${filename}`;

    // Create S3 client
    const s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKey,
        secretAccessKey: s3Config.secretKey,
      },
      endpoint: s3Config.endpoint || undefined,
      forcePathStyle: s3Config.forcePathStyle || false,
    });

    // Create the command for uploading
    const command = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      ContentType: contentType,
      // ACL: 'public-read', // You can configure this based on your needs
    });

    try {
      // Generate presigned URL for upload
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

      // Construct download URL (public URL after upload)
      const downloadUrl = s3Config.endpoint 
        ? `${s3Config.endpoint}/${s3Config.bucket}/${key}`
        : `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${key}`;

      return {
        uploadUrl,
        downloadUrl,
        key,
        filename,
      };
    } catch (error) {
      this.logger.error('Failed to generate presigned URL:', error);
      throw new BadRequestException('Failed to generate presigned URL: ' + error.message);
    }
  }

  private generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${name}-${timestamp}-${random}${ext}`;
  }
}