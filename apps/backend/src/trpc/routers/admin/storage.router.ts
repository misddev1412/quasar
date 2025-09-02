import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { StorageService } from '../../../modules/storage/services/storage.service';
import { FileUploadService } from '../../../modules/storage/services/file-upload.service';
import { ResponseService } from '../../../modules/shared/services/response.service';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../middlewares/admin-role.middleware';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { AuthenticatedContext } from '../../context';

// Zod schemas for validation
const updateStorageConfigSchema = z.object({
  provider: z.enum(['local', 's3']),
  maxFileSize: z.number().min(1024).max(104857600),
  allowedFileTypes: z.array(z.string()),
  
  // Local storage settings
  localUploadPath: z.string().optional(),
  localBaseUrl: z.string().optional(),
  
  // S3 settings
  s3AccessKey: z.string().optional(),
  s3SecretKey: z.string().optional(),
  s3Region: z.string().optional(),
  s3Bucket: z.string().optional(),
  s3Endpoint: z.string().optional(),
  s3ForcePathStyle: z.boolean().optional(),
});

const testStorageConnectionSchema = z.object({
  provider: z.enum(['local', 's3']),
  settings: z.record(z.string()),
});

@Router({ alias: 'adminStorage' })
@Injectable()
export class AdminStorageRouter {
  constructor(
    @Inject(StorageService)
    private readonly storageService: StorageService,
    @Inject(FileUploadService)
    private readonly fileUploadService: FileUploadService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getStorageConfig(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const config = await this.storageService.getAllStorageConfig() as any;
      
      // Remove sensitive information from response
      // Always return all configuration data regardless of current provider
      const safeConfig = {
        provider: config.provider,
        maxFileSize: config.maxFileSize,
        allowedFileTypes: config.allowedFileTypes,
        // Local storage settings
        localUploadPath: config.uploadPath || '',
        localBaseUrl: config.baseUrl || '',
        // S3 settings (with correct property names for frontend)
        s3Region: config.region || '',
        s3Bucket: config.bucket || '',
        s3Endpoint: config.endpoint || '',
        s3ForcePathStyle: config.forcePathStyle || false,
        s3HasCredentials: !!(config.accessKey && config.secretKey),
      };

      return this.responseHandler.createTrpcSuccess(safeConfig);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // Storage module code
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to get storage configuration'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateStorageConfigSchema,
    output: apiResponseSchema,
  })
  async updateStorageConfig(
    @Input() input: z.infer<typeof updateStorageConfigSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      console.log('🔍 [STORAGE UPDATE] Received input:', JSON.stringify(input, null, 2));
      
      const settings: Record<string, string> = {};

      // Always save base configuration
      settings['storage.provider'] = input.provider;
      settings['storage.max_file_size'] = input.maxFileSize.toString();
      settings['storage.allowed_file_types'] = JSON.stringify(input.allowedFileTypes);
      
      console.log('💾 [STORAGE UPDATE] Base settings:', {
        provider: input.provider,
        maxFileSize: input.maxFileSize,
        allowedFileTypes: input.allowedFileTypes
      });

      // Process local storage settings - save if provided (not empty)
      if (input.localUploadPath !== undefined && input.localUploadPath !== '') {
        settings['storage.local.upload_path'] = input.localUploadPath;
        console.log('💾 [STORAGE UPDATE] Local upload path:', input.localUploadPath);
      }
      if (input.localBaseUrl !== undefined && input.localBaseUrl !== '') {
        settings['storage.local.base_url'] = input.localBaseUrl;
        console.log('💾 [STORAGE UPDATE] Local base URL:', input.localBaseUrl);
      }

      // Process S3 settings - save if provided (not empty or undefined)
      if (input.s3AccessKey !== undefined && input.s3AccessKey !== '') {
        settings['storage.s3.access_key'] = input.s3AccessKey;
        console.log('💾 [STORAGE UPDATE] S3 access key: [REDACTED]');
      }
      if (input.s3SecretKey !== undefined && input.s3SecretKey !== '') {
        settings['storage.s3.secret_key'] = input.s3SecretKey;
        console.log('💾 [STORAGE UPDATE] S3 secret key: [REDACTED]');
      }
      if (input.s3Region !== undefined && input.s3Region !== '') {
        settings['storage.s3.region'] = input.s3Region;
        console.log('💾 [STORAGE UPDATE] S3 region:', input.s3Region);
      }
      if (input.s3Bucket !== undefined && input.s3Bucket !== '') {
        settings['storage.s3.bucket'] = input.s3Bucket;
        console.log('💾 [STORAGE UPDATE] S3 bucket:', input.s3Bucket);
      }
      if (input.s3Endpoint !== undefined && input.s3Endpoint !== '') {
        settings['storage.s3.endpoint'] = input.s3Endpoint;
        console.log('💾 [STORAGE UPDATE] S3 endpoint:', input.s3Endpoint);
      }
      if (input.s3ForcePathStyle !== undefined) {
        settings['storage.s3.force_path_style'] = input.s3ForcePathStyle.toString();
        console.log('💾 [STORAGE UPDATE] S3 force path style:', input.s3ForcePathStyle);
      }

      console.log('💾 [STORAGE UPDATE] Final settings to save:', Object.keys(settings).map(key => 
        key.includes('key') ? `${key}: [REDACTED]` : `${key}: ${settings[key]}`
      ));

      // Save all settings
      await this.storageService.updateStorageSettings(settings);

      console.log('✅ [STORAGE UPDATE] Successfully saved all settings');
      return this.responseHandler.createTrpcSuccess({ 
        message: 'Storage configuration updated successfully' 
      });
    } catch (error) {
      console.error('❌ [STORAGE UPDATE] Error:', error);
      throw this.responseHandler.createTRPCError(
        50, // Storage module code
        3,  // OperationCode.UPDATE
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to update storage configuration'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: testStorageConnectionSchema,
    output: apiResponseSchema,
  })
  async testStorageConnection(
    @Input() input: z.infer<typeof testStorageConnectionSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (input.provider === 'local') {
        // Test local storage - check if directory is writable
        const fs = require('fs');
        const path = require('path');
        const uploadPath = input.settings['storage.local.upload_path'] || 'uploads';
        const fullPath = path.join(process.cwd(), uploadPath);
        
        try {
          if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
          }
          
          // Try to write a test file
          const testFile = path.join(fullPath, 'test-write.txt');
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
          
          return this.responseHandler.createTrpcSuccess({ 
            success: true,
            message: 'Local storage connection successful' 
          });
        } catch (error) {
          return this.responseHandler.createTrpcSuccess({ 
            success: false,
            message: `Local storage test failed: ${error.message}` 
          });
        }
      } else if (input.provider === 's3') {
        // For S3, we would need to implement actual S3 connection test
        // This is a placeholder
        return this.responseHandler.createTrpcSuccess({ 
          success: false,
          message: 'S3 connection testing not yet implemented' 
        });
      }

      return this.responseHandler.createTrpcSuccess({ 
        success: false,
        message: 'Unknown storage provider' 
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // Storage module code
        4,  // OperationCode.TEST
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to test storage connection'
      );
    }
  }
}