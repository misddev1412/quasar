import { Injectable } from '@nestjs/common';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { Media, MediaType } from '../entities/media.entity';
import { MediaListQueryDto } from '../dto/media.dto';

@Injectable()
export class MediaRepository extends Repository<Media> {
  constructor(private dataSource: DataSource) {
    super(Media, dataSource.createEntityManager());
  }

  /**
   * Find media by user with advanced filtering and pagination
   */
  async findByUserWithFilters(
    userId: string,
    query: MediaListQueryDto
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

    const queryBuilder = this.createQueryBuilder('media')
      .where('media.userId = :userId', { userId });

    this.applyFilters(queryBuilder, { type, folder, search });
    this.applySorting(queryBuilder, sortBy, sortOrder);
    this.applyPagination(queryBuilder, page, limit);

    const [media, total] = await queryBuilder.getManyAndCount();

    return { media, total };
  }

  /**
   * Find media by multiple IDs for a specific user
   */
  async findByIdsAndUser(ids: string[], userId: string): Promise<Media[]> {
    return this.createQueryBuilder('media')
      .where('media.id IN (:...ids)', { ids })
      .andWhere('media.userId = :userId', { userId })
      .getMany();
  }

  /**
   * Get media statistics for a user
   */
  async getStatsForUser(userId: string): Promise<{
    totalFiles: number;
    totalSize: string;
    byType: Record<MediaType, number>;
    byFolder: Record<string, number>;
  }> {
    const media = await this.find({
      where: { userId },
      select: ['type', 'folder', 'size'],
    });

    const totalFiles = media.length;
    const totalSize = media.reduce((sum, m) => sum + Number(m.size), 0);

    const byType = Object.values(MediaType).reduce((acc, type) => {
      acc[type] = media.filter(m => m.type === type).length;
      return acc;
    }, {} as Record<MediaType, number>);

    const byFolder = media.reduce((acc, m) => {
      acc[m.folder] = (acc[m.folder] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFiles,
      totalSize: this.formatFileSize(totalSize),
      byType,
      byFolder,
    };
  }

  /**
   * Find recently uploaded media by user
   */
  async findRecentByUser(userId: string, limit: number = 10): Promise<Media[]> {
    return this.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Find media by folder and user
   */
  async findByFolderAndUser(userId: string, folder: string): Promise<Media[]> {
    return this.find({
      where: { userId, folder },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Delete multiple media records by IDs and user
   */
  async deleteByIdsAndUser(ids: string[], userId: string): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(Media)
      .where('id IN (:...ids)', { ids })
      .andWhere('userId = :userId', { userId })
      .execute();
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Media>,
    filters: { type?: MediaType; folder?: string; search?: string }
  ): void {
    const { type, folder, search } = filters;

    if (type) {
      queryBuilder.andWhere('media.type = :type', { type });
    }

    if (folder) {
      queryBuilder.andWhere('media.folder = :folder', { folder });
    }

    if (search) {
      queryBuilder.andWhere(
        '(media.filename ILIKE :search OR media.originalName ILIKE :search OR media.alt ILIKE :search)',
        { search: `%${search}%` }
      );
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Media>,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC'
  ): void {
    const allowedSortFields = ['createdAt', 'updatedAt', 'filename', 'originalName', 'size'];
    
    if (allowedSortFields.includes(sortBy)) {
      queryBuilder.orderBy(`media.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('media.createdAt', 'DESC');
    }
  }

  private applyPagination(
    queryBuilder: SelectQueryBuilder<Media>,
    page: number,
    limit: number
  ): void {
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${parseFloat(size.toFixed(2))} ${sizes[i]}`;
  }
}