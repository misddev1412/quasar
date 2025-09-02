import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaType } from '../entities/media.entity';
import { FileUploadService } from './file-upload.service';
import { CreateMediaDto, UpdateMediaDto, MediaListQueryDto } from '../dto/media.dto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async createMedia(
    data: {
      originalName: string;
      filename: string;
      url: string;
      mimeType: string;
      size: number;
      folder?: string;
      alt?: string;
      caption?: string;
      description?: string;
      provider?: string;
    },
    userId: string | null
  ): Promise<Media> {
    try {
      // Determine media type from mime type
      const mediaType = this.getMediaTypeFromMimeType(data.mimeType);

      // Create media record in database
      const media = this.mediaRepository.create({
        filename: data.filename,
        originalName: data.originalName,
        url: data.url,
        mimeType: data.mimeType,
        type: mediaType,
        size: data.size,
        folder: data.folder || 'media',
        provider: data.provider || 'local',
        alt: data.alt,
        caption: data.caption,
        description: data.description,
        userId,
      });

      const savedMedia = await this.mediaRepository.save(media);
      this.logger.log(`Media record created successfully: ${savedMedia.id} by user ${userId}`);
      
      return savedMedia;
    } catch (error) {
      this.logger.error(`Failed to create media record for user ${userId}:`, error);
      throw new BadRequestException(error.message || 'Failed to create media record');
    }
  }

  async uploadMedia(
    file: any,
    userId: string,
    metadata: Partial<CreateMediaDto> = {}
  ): Promise<Media> {
    try {
      // Upload file using existing file upload service
      const uploadResult = await this.fileUploadService.uploadFile(file, {
        folder: metadata.folder || 'media',
        maxSize: metadata.maxSize,
      });

      // Create media record using the new createMedia method
      return await this.createMedia({
        originalName: uploadResult.originalName,
        filename: uploadResult.filename,
        url: uploadResult.url,
        mimeType: file.mimetype,
        size: file.size,
        folder: metadata.folder || 'media',
        provider: uploadResult.provider,
        alt: metadata.alt,
        caption: metadata.caption,
        description: metadata.description,
      }, userId);
    } catch (error) {
      this.logger.error(`Failed to upload media for user ${userId}:`, error);
      throw new BadRequestException(error.message || 'Failed to upload media');
    }
  }

  async getUserMedia(
    userId: string,
    query: MediaListQueryDto = {}
  ): Promise<{ media: Media[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      type,
      folder,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .where('media.userId = :userId', { userId });

    // Filter by type
    if (type) {
      queryBuilder.andWhere('media.type = :type', { type });
    }

    // Filter by folder
    if (folder) {
      queryBuilder.andWhere('media.folder = :folder', { folder });
    }

    // Search by filename or original name
    if (search) {
      queryBuilder.andWhere(
        '(media.filename ILIKE :search OR media.originalName ILIKE :search OR media.alt ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`media.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [media, total] = await queryBuilder.getManyAndCount();

    return { media, total };
  }

  async getMediaById(id: string, userId?: string): Promise<Media> {
    const queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .where('media.id = :id', { id });

    // If userId is provided, ensure the media belongs to the user
    if (userId) {
      queryBuilder.andWhere('media.userId = :userId', { userId });
    }

    const media = await queryBuilder.getOne();

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async updateMedia(
    id: string,
    userId: string,
    updateData: UpdateMediaDto
  ): Promise<Media> {
    const media = await this.getMediaById(id, userId);

    // Update metadata
    Object.assign(media, {
      alt: updateData.alt ?? media.alt,
      caption: updateData.caption ?? media.caption,
      description: updateData.description ?? media.description,
    });

    const updatedMedia = await this.mediaRepository.save(media);
    this.logger.log(`Media updated: ${id} by user ${userId}`);

    return updatedMedia;
  }

  async deleteMedia(id: string, userId: string): Promise<void> {
    const media = await this.getMediaById(id, userId);

    try {
      // Delete the physical file
      await this.fileUploadService.deleteFile(media.url);

      // Delete the database record
      await this.mediaRepository.remove(media);

      this.logger.log(`Media deleted: ${id} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete media ${id}:`, error);
      throw new BadRequestException('Failed to delete media file');
    }
  }

  async deleteMultipleMedia(ids: string[], userId: string): Promise<{ deleted: number; failed: string[] }> {
    const failed: string[] = [];
    let deleted = 0;

    for (const id of ids) {
      try {
        await this.deleteMedia(id, userId);
        deleted++;
      } catch (error) {
        failed.push(id);
        this.logger.warn(`Failed to delete media ${id}:`, error.message);
      }
    }

    return { deleted, failed };
  }

  async getMediaStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Record<MediaType, number>;
    byFolder: Record<string, number>;
  }> {
    const media = await this.mediaRepository.find({
      where: { userId },
    });

    const stats = {
      totalFiles: media.length,
      totalSize: media.reduce((sum, m) => sum + Number(m.size), 0),
      byType: Object.values(MediaType).reduce((acc, type) => {
        acc[type] = media.filter(m => m.type === type).length;
        return acc;
      }, {} as Record<MediaType, number>),
      byFolder: media.reduce((acc, m) => {
        acc[m.folder] = (acc[m.folder] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  }

  private getMediaTypeFromMimeType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) {
      return MediaType.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return MediaType.VIDEO;
    } else if (mimeType.startsWith('audio/')) {
      return MediaType.AUDIO;
    } else if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text') ||
      mimeType.includes('sheet')
    ) {
      return MediaType.DOCUMENT;
    }
    return MediaType.OTHER;
  }
}