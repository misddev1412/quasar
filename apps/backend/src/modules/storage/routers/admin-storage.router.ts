import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { StorageService } from '../services/storage.service';
import { FileUploadService } from '../services/file-upload.service';
import { ResponseService } from '../../shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

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
  s3CdnUrl: z.string().optional(),
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
        s3CdnUrl: config.cdnUrl || '',
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
      const settings: Record<string, string> = {};

      // Always save base configuration
      settings['storage.provider'] = input.provider;
      settings['storage.max_file_size'] = input.maxFileSize.toString();
      settings['storage.allowed_file_types'] = JSON.stringify(input.allowedFileTypes);
      // Process local storage settings - save if provided (not empty)
      if (input.localUploadPath !== undefined && input.localUploadPath !== '') {
        settings['storage.local.upload_path'] = input.localUploadPath;
      }
      if (input.localBaseUrl !== undefined && input.localBaseUrl !== '') {
        settings['storage.local.base_url'] = input.localBaseUrl;
      }

      // Process S3 settings - save if provided (not empty or undefined)
      if (input.s3AccessKey !== undefined && input.s3AccessKey !== '') {
        settings['storage.s3.access_key'] = input.s3AccessKey;
      }
      if (input.s3SecretKey !== undefined && input.s3SecretKey !== '') {
        settings['storage.s3.secret_key'] = input.s3SecretKey;
      }
      if (input.s3Region !== undefined && input.s3Region !== '') {
        settings['storage.s3.region'] = input.s3Region;
      }
      if (input.s3Bucket !== undefined && input.s3Bucket !== '') {
        settings['storage.s3.bucket'] = input.s3Bucket;
      }
      if (input.s3Endpoint !== undefined && input.s3Endpoint !== '') {
        settings['storage.s3.endpoint'] = input.s3Endpoint;
      }
      if (input.s3ForcePathStyle !== undefined) {
        settings['storage.s3.force_path_style'] = input.s3ForcePathStyle.toString();
      }
      if (input.s3CdnUrl !== undefined && input.s3CdnUrl !== '') {
        settings['storage.s3.cdn_url'] = input.s3CdnUrl;
      }

      // Save all settings
      await this.storageService.updateStorageSettings(settings);

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
        // Test S3 connection
        // Get credentials from input settings first, fallback to saved config if not provided
        let accessKey = input.settings['storage.s3.access_key'];
        let secretKey = input.settings['storage.s3.secret_key'];
        let region = input.settings['storage.s3.region'];
        let bucket = input.settings['storage.s3.bucket'];
        let endpoint = input.settings['storage.s3.endpoint'];
        let forcePathStyle = input.settings['storage.s3.force_path_style'] === 'true';

        // If credentials not provided in test input, try to get from saved config
        if (!accessKey || !secretKey) {
          try {
            const savedConfig = await this.storageService.getAllStorageConfig() as any;
            if (!accessKey && savedConfig.accessKey) {
              accessKey = savedConfig.accessKey;
            }
            if (!secretKey && savedConfig.secretKey) {
              secretKey = savedConfig.secretKey;
            }
            if (!region && savedConfig.region) {
              region = savedConfig.region;
            }
            if (!bucket && savedConfig.bucket) {
              bucket = savedConfig.bucket;
            }
            if (!endpoint && savedConfig.endpoint) {
              endpoint = savedConfig.endpoint;
            }
            if (forcePathStyle === false && savedConfig.forcePathStyle !== undefined) {
              forcePathStyle = savedConfig.forcePathStyle;
            }
          } catch (error) {
            // If we can't get saved config, continue with validation below
          }
        }

        // Set defaults
        region = region || 'us-east-1';
        endpoint = endpoint || undefined;

        // Validate required fields
        if (!accessKey || !secretKey) {
          return this.responseHandler.createTrpcSuccess({ 
            success: false,
            message: 'S3 Access Key and Secret Key are required for connection test. Please provide them in the form or ensure they are saved in configuration.' 
          });
        }

        if (!bucket) {
          return this.responseHandler.createTrpcSuccess({ 
            success: false,
            message: 'S3 Bucket name is required for connection test' 
          });
        }

        try {
          // Create S3 client with provided credentials
          const s3Client = new S3Client({
            region,
            credentials: {
              accessKeyId: accessKey,
              secretAccessKey: secretKey,
            },
            endpoint: endpoint || undefined,
            forcePathStyle: forcePathStyle || false,
          });

          // Test connection by checking if bucket exists and is accessible
          const headBucketCommand = new HeadBucketCommand({
            Bucket: bucket,
          });

          await s3Client.send(headBucketCommand);

          return this.responseHandler.createTrpcSuccess({ 
            success: true,
            message: `Successfully connected to S3 bucket "${bucket}" in region "${region}"` 
          });
        } catch (error: any) {
          // Handle specific AWS errors
          let errorMessage = 'Failed to connect to S3';
          
          if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            errorMessage = `Bucket "${bucket}" not found. Please check the bucket name.`;
          } else if (error.name === 'Forbidden' || error.$metadata?.httpStatusCode === 403) {
            errorMessage = `Access denied to bucket "${bucket}". Please check your credentials and bucket permissions.`;
          } else if (error.name === 'InvalidAccessKeyId') {
            errorMessage = 'Invalid Access Key ID. Please check your credentials.';
          } else if (error.name === 'SignatureDoesNotMatch') {
            errorMessage = 'Invalid Secret Access Key. Please check your credentials.';
          } else if (error.name === 'NetworkingError' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            errorMessage = `Cannot reach S3 endpoint. Please check your endpoint URL and network connection.${endpoint ? ` Endpoint: ${endpoint}` : ''}`;
          } else if (error.message) {
            errorMessage = `S3 connection test failed: ${error.message}`;
          }

          return this.responseHandler.createTrpcSuccess({ 
            success: false,
            message: errorMessage 
          });
        }
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
