import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UploadedFiles,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { GetCurrentUserId } from '../decorators/current-user.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../services/file-upload.service';
import { MediaService } from '../services/media.service';
import { ResponseService } from '../../shared/services/response.service';
import { StorageService } from '../services/storage.service';
import * as multer from 'multer';

// Multer configuration for memory storage
const multerOptions = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
};

interface UploadResponse {
  id?: string;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  provider: string;
}

@Controller()
export class UploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly mediaService: MediaService,
    private readonly responseService: ResponseService,
    private readonly storageService: StorageService,
  ) {}

  @Get('uploads/:folder/:filename')
  async serveStaticFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ): Promise<void> {
    if (!folder || !filename) {
      throw new NotFoundException('File path not provided');
    }
    
    const filePath = `${folder}/${filename}`;
    // Use process.cwd() but go up to the workspace root first, then down to the uploads
    const workspaceRoot = process.cwd().includes('/apps/backend') 
      ? path.resolve(process.cwd(), '../..')  // If running from apps/backend, go up 2 levels
      : process.cwd(); // If running from workspace root, stay there
    const absolutePath = path.join(workspaceRoot, 'apps', 'backend', 'uploads', filePath);

    try {
      // Check if file exists
      if (!fs.existsSync(absolutePath)) {
        throw new NotFoundException(`File not found at: ${absolutePath}`);
      }

      // Get file stats to determine content type and size
      const stats = fs.statSync(absolutePath);
      if (!stats.isFile()) {
        throw new NotFoundException('File not found');
      }

      // Set appropriate headers
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      
      // Stream the file
      const fileStream = fs.createReadStream(absolutePath);
      fileStream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('File not found');
    }
  }

  @Post('api/upload/single')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadSingle(
    @UploadedFile() file: any,
    @GetCurrentUserId() userId: string,
    @Body('folder') folder: string = 'general',
    @Body('alt') alt: string = '',
    @Body('caption') caption: string = '',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      // Upload file using FileUploadService
      const uploadResult = await this.fileUploadService.uploadFile(file, {
        folder,
        maxSize: 50 * 1024 * 1024, // 50MB
      });

      // Save media record to database with current user ID
      const mediaRecord = await this.mediaService.createMedia({
        originalName: uploadResult.originalName,
        filename: uploadResult.filename,
        url: uploadResult.url,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        folder,
        alt: alt || uploadResult.originalName.replace(/\.[^/.]+$/, ''), // Remove extension for alt
        caption,
      }, userId);

      const response: UploadResponse = {
        id: mediaRecord.id,
        url: uploadResult.url,
        filename: uploadResult.filename,
        originalName: uploadResult.originalName,
        size: uploadResult.size,
        mimeType: uploadResult.mimeType,
        provider: uploadResult.provider,
      };

      return { success: true, data: response, message: 'File uploaded successfully' };
    } catch (error) {
      throw new BadRequestException(error.message || 'Upload failed');
    }
  }

  @Post('api/upload/multiple')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 20, multerOptions)) // Max 20 files
  async uploadMultiple(
    @UploadedFiles() files: any[],
    @GetCurrentUserId() userId: string,
    @Body('folder') folder: string = 'gallery',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    try {
      const uploadResults: UploadResponse[] = [];

      // Process each file
      for (const file of files) {
        // Upload file using FileUploadService
        const uploadResult = await this.fileUploadService.uploadFile(file, {
          folder,
          maxSize: 50 * 1024 * 1024, // 50MB
        });

        // Save media record to database with current user ID
        const mediaRecord = await this.mediaService.createMedia({
          originalName: uploadResult.originalName,
          filename: uploadResult.filename,
          url: uploadResult.url,
          mimeType: uploadResult.mimeType,
          size: uploadResult.size,
          folder,
          alt: uploadResult.originalName.replace(/\.[^/.]+$/, ''), // Remove extension for alt
          caption: '',
        }, userId);

        uploadResults.push({
          id: mediaRecord.id,
          url: uploadResult.url,
          filename: uploadResult.filename,
          originalName: uploadResult.originalName,
          size: uploadResult.size,
          mimeType: uploadResult.mimeType,
          provider: uploadResult.provider,
        });
      }

      return { 
        success: true, 
        data: uploadResults, 
        message: `${uploadResults.length} files uploaded successfully` 
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Upload failed');
    }
  }

  @Post('api/upload/gallery')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 15, multerOptions)) // Max 15 files for gallery
  async uploadGallery(
    @UploadedFiles() files: any[],
    @GetCurrentUserId() userId: string,
    @Body('folder') folder: string = 'gallery',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    try {
      const uploadResults: UploadResponse[] = [];

      // Process each file with order
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload file using FileUploadService
        const uploadResult = await this.fileUploadService.uploadFile(file, {
          folder,
          maxSize: 10 * 1024 * 1024, // 10MB for gallery images
        });

        // Save media record to database with current user ID
        const mediaRecord = await this.mediaService.createMedia({
          originalName: uploadResult.originalName,
          filename: uploadResult.filename,
          url: uploadResult.url,
          mimeType: uploadResult.mimeType,
          size: uploadResult.size,
          folder,
          alt: uploadResult.originalName.replace(/\.[^/.]+$/, ''), // Remove extension for alt
          caption: '',
        }, userId);

        uploadResults.push({
          id: mediaRecord.id,
          url: uploadResult.url,
          filename: uploadResult.filename,
          originalName: uploadResult.originalName,
          size: uploadResult.size,
          mimeType: uploadResult.mimeType,
          provider: uploadResult.provider,
        });
      }

      // Return results with order preserved
      return { 
        success: true, 
        data: uploadResults, 
        message: `${uploadResults.length} gallery images uploaded successfully` 
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Gallery upload failed');
    }
  }

  // Generate presigned URLs for direct S3 upload
  @Post('api/upload/presigned-url/single')
  @HttpCode(HttpStatus.OK)
  async generatePresignedUrl(
    @Body() body: {
      filename: string;
      contentType: string;
      folder?: string;
    }
  ) {
    const config = await this.storageService.getStorageConfig();
    
    if (config.provider !== 's3') {
      throw new BadRequestException('Presigned URLs are only available for S3 storage');
    }

    try {
      const presignedUrl = await this.storageService.generatePresignedUrl(
        body.filename,
        body.contentType,
        body.folder || 'general'
      );

      return { 
        success: true, 
        data: presignedUrl, 
        message: 'Presigned URL generated successfully' 
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to generate presigned URL');
    }
  }

  @Post('api/upload/presigned-url/gallery')
  @HttpCode(HttpStatus.OK)
  async generateGalleryPresignedUrls(
    @Body() body: {
      files: Array<{
        filename: string;
        contentType: string;
      }>;
      folder?: string;
    }
  ) {
    const config = await this.storageService.getStorageConfig();
    
    if (config.provider !== 's3') {
      throw new BadRequestException('Presigned URLs are only available for S3 storage');
    }

    try {
      const presignedUrls = await Promise.all(
        body.files.map(file => 
          this.storageService.generatePresignedUrl(
            file.filename,
            file.contentType,
            body.folder || 'gallery'
          )
        )
      );

      return { 
        success: true, 
        data: presignedUrls, 
        message: `${presignedUrls.length} presigned URLs generated successfully` 
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to generate presigned URLs');
    }
  }

  // Save media record after successful S3 upload
  @Post('api/upload/confirm-upload')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async confirmUpload(
    @GetCurrentUserId() userId: string,
    @Body() body: {
      url: string;
      filename: string;
      originalName: string;
      size: number;
      mimeType: string;
      folder: string;
      alt?: string;
      caption?: string;
    }
  ) {
    try {
      // Save media record to database with current user ID
      const mediaRecord = await this.mediaService.createMedia({
        originalName: body.originalName,
        filename: body.filename,
        url: body.url,
        mimeType: body.mimeType,
        size: body.size,
        folder: body.folder,
        alt: body.alt || body.originalName.replace(/\.[^/.]+$/, ''),
        caption: body.caption || '',
      }, userId);

      const response = {
        id: mediaRecord.id,
        url: body.url,
        filename: body.filename,
        originalName: body.originalName,
        size: body.size,
        mimeType: body.mimeType,
        provider: 's3',
      };

      return { 
        success: true, 
        data: response, 
        message: 'Upload confirmed and media record saved' 
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to confirm upload');
    }
  }
}