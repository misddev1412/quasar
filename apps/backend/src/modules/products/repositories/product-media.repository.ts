import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductMedia, MediaType } from '../entities/product-media.entity';

export interface CreateProductMediaDto {
  productId: string;
  type: MediaType;
  url: string;
  altText?: string;
  caption?: string;
  sortOrder?: number;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
  isPrimary?: boolean;
}

export interface UpdateProductMediaDto {
  type?: MediaType;
  url?: string;
  altText?: string;
  caption?: string;
  sortOrder?: number;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
  isPrimary?: boolean;
}

@Injectable()
export class ProductMediaRepository {
  constructor(
    @InjectRepository(ProductMedia)
    private readonly repository: Repository<ProductMedia>,
  ) {}

  async findByProductId(productId: string): Promise<ProductMedia[]> {
    return this.repository.find({
      where: { productId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findByProductIdAndType(productId: string, type: MediaType): Promise<ProductMedia[]> {
    return this.repository.find({
      where: { productId, type },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<ProductMedia | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findPrimaryByProductId(productId: string): Promise<ProductMedia | null> {
    return this.repository.findOne({
      where: { productId, isPrimary: true },
    });
  }

  async create(data: CreateProductMediaDto): Promise<ProductMedia> {
    // If this should be primary, unset other primary media first
    if (data.isPrimary) {
      await this.unsetPrimaryForProduct(data.productId);
    }

    const media = this.repository.create({
      productId: data.productId,
      type: data.type,
      url: data.url,
      altText: data.altText,
      caption: data.caption,
      sortOrder: data.sortOrder ?? 0,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      width: data.width,
      height: data.height,
      duration: data.duration,
      thumbnailUrl: data.thumbnailUrl,
      isPrimary: data.isPrimary ?? false,
    });

    return this.repository.save(media);
  }

  async createMany(mediaData: CreateProductMediaDto[]): Promise<ProductMedia[]> {
    const media = mediaData.map((data) => this.repository.create(data));
    return this.repository.save(media);
  }

  async update(id: string, data: UpdateProductMediaDto): Promise<ProductMedia | null> {
    // If this should be primary, unset other primary media first
    if (data.isPrimary) {
      const media = await this.findById(id);
      if (media) {
        await this.unsetPrimaryForProduct(media.productId);
      }
    }

    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByProductId(productId: string): Promise<boolean> {
    const result = await this.repository.delete({ productId });
    return (result.affected ?? 0) > 0;
  }

  async deleteByProductIdAndType(productId: string, type: MediaType): Promise<boolean> {
    const result = await this.repository.delete({ productId, type });
    return (result.affected ?? 0) > 0;
  }

  async reorderMedia(productId: string, mediaIds: string[]): Promise<void> {
    for (let i = 0; i < mediaIds.length; i++) {
      await this.repository.update(mediaIds[i], { sortOrder: i });
    }
  }

  async setPrimary(id: string): Promise<ProductMedia | null> {
    const media = await this.findById(id);
    if (!media) return null;

    // Unset other primary media for this product
    await this.unsetPrimaryForProduct(media.productId);

    // Set this media as primary
    await this.repository.update(id, { isPrimary: true });
    return this.findById(id);
  }

  private async unsetPrimaryForProduct(productId: string): Promise<void> {
    await this.repository.update(
      { productId, isPrimary: true },
      { isPrimary: false },
    );
  }

  async getMediaStats(productId: string): Promise<{
    totalCount: number;
    imageCount: number;
    videoCount: number;
    audioCount: number;
    documentCount: number;
    otherCount: number;
    totalSize: number;
  }> {
    const media = await this.findByProductId(productId);

    const stats = {
      totalCount: media.length,
      imageCount: 0,
      videoCount: 0,
      audioCount: 0,
      documentCount: 0,
      otherCount: 0,
      totalSize: 0,
    };

    media.forEach((item) => {
      switch (item.type) {
        case MediaType.IMAGE:
          stats.imageCount++;
          break;
        case MediaType.VIDEO:
          stats.videoCount++;
          break;
        case MediaType.AUDIO:
          stats.audioCount++;
          break;
        case MediaType.DOCUMENT:
          stats.documentCount++;
          break;
        default:
          stats.otherCount++;
      }

      if (item.fileSize) {
        stats.totalSize += Number(item.fileSize);
      }
    });

    return stats;
  }
}