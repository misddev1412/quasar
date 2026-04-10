import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InquiryRepository } from '@backend/modules/support/repositories/inquiry.repository';
import { Inquiry, InquiryStatus } from '@backend/modules/support/entities/inquiry.entity';
import { Product } from '@backend/modules/products/entities/product.entity';
import { ProductMedia, MediaType } from '@backend/modules/products/entities/product-media.entity';
import { ProductVariant } from '@backend/modules/products/entities/product-variant.entity';

export interface CreateInquiryDto {
    name: string;
    email: string;
    phone: string;
    message?: string;
    subject?: string;
    productId?: string;
    serviceId?: string;
    url?: string;
    metadata?: Record<string, any>;
}

@Injectable()
export class InquiryService {
    constructor(
        private readonly inquiryRepository: InquiryRepository,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(ProductMedia)
        private readonly productMediaRepository: Repository<ProductMedia>,
        @InjectRepository(ProductVariant)
        private readonly productVariantRepository: Repository<ProductVariant>,
    ) { }

    async createInquiry(dto: CreateInquiryDto): Promise<Inquiry> {
        const metadata = await this.buildInquiryMetadata(dto);
        const inquiry = this.inquiryRepository.create({
            ...dto,
            metadata,
            status: InquiryStatus.PENDING,
        });
        return this.inquiryRepository.save(inquiry);
    }

    async findInquiryById(id: string): Promise<Inquiry | null> {
        return this.inquiryRepository.findById(id);
    }

    async findPaginated(params: {
        page: number;
        limit: number;
        search?: string;
        status?: InquiryStatus;
    }): Promise<{ items: Inquiry[]; total: number; page: number; limit: number; totalPages: number }> {
        return this.inquiryRepository.findPaginated(params);
    }

    async findContactPricePaginated(params: {
        page: number;
        limit: number;
        search?: string;
        status?: InquiryStatus;
    }): Promise<{ items: Inquiry[]; total: number; page: number; limit: number; totalPages: number }> {
        const result = await this.inquiryRepository.findContactPricePaginated(params);
        const items = await Promise.all(result.items.map((item) => this.enrichInquiryWithProductSnapshot(item)));
        return {
            ...result,
            items,
        };
    }

    private async buildInquiryMetadata(dto: CreateInquiryDto): Promise<Record<string, any> | undefined> {
        const currentMetadata = dto.metadata && typeof dto.metadata === 'object' ? { ...dto.metadata } : {};
        const subject = dto.subject || '';
        const isContactPriceInquiry =
            currentMetadata.inquiryType === 'CONTACT_PRICE'
            || currentMetadata.source === 'CONTACT_PRICE'
            || subject.startsWith('Inquiry for ');

        if (isContactPriceInquiry) {
            currentMetadata.inquiryType = 'CONTACT_PRICE';
            currentMetadata.source = 'CONTACT_PRICE';
        }

        if (dto.productId) {
            const existingSnapshot =
                currentMetadata.productSnapshot && typeof currentMetadata.productSnapshot === 'object'
                    ? currentMetadata.productSnapshot as Record<string, any>
                    : {};
            const dbSnapshot = await this.getProductSnapshotFromDb(dto.productId);
            const existingPrimaryImage = this.normalizeSnapshotImage(existingSnapshot.primaryImage);

            if (dbSnapshot || Object.keys(existingSnapshot).length > 0) {
                currentMetadata.productSnapshot = {
                    id: existingSnapshot.id ?? dbSnapshot?.id ?? dto.productId,
                    name: existingSnapshot.name || dbSnapshot?.name || this.extractProductNameFromSubject(subject),
                    slug: existingSnapshot.slug || dbSnapshot?.slug || null,
                    sku: existingSnapshot.sku || dbSnapshot?.sku || null,
                    isContactPrice: existingSnapshot.isContactPrice ?? dbSnapshot?.isContactPrice ?? true,
                    category: existingSnapshot.category || null,
                    variantCount: existingSnapshot.variantCount ?? null,
                    primaryImage: dbSnapshot?.primaryImage || existingPrimaryImage || null,
                };
            }
        }

        return Object.keys(currentMetadata).length > 0 ? currentMetadata : undefined;
    }

    private extractProductNameFromSubject(subject: string): string | null {
        const prefix = 'Inquiry for ';
        if (!subject.startsWith(prefix)) {
            return null;
        }
        const name = subject.slice(prefix.length).trim();
        return name || null;
    }

    private async getProductSnapshotFromDb(productId: string): Promise<{
        id: string;
        name: string | null;
        slug: string | null;
        sku: string | null;
        isContactPrice: boolean;
        primaryImage: string | null;
    } | null> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            select: ['id', 'name', 'slug', 'sku', 'images', 'isContactPrice'],
        });

        if (!product) {
            return null;
        }

        let primaryImage: string | null = null;
        const primaryMedia = await this.productMediaRepository.findOne({
            where: { productId, type: MediaType.IMAGE, isPrimary: true },
            order: { sortOrder: 'ASC' },
        });

        if (primaryMedia?.url) {
            primaryImage = primaryMedia.url;
        } else {
            const firstMediaImage = await this.productMediaRepository.findOne({
                where: { productId, type: MediaType.IMAGE },
                order: { sortOrder: 'ASC' },
            });
            if (firstMediaImage?.url) {
                primaryImage = firstMediaImage.url;
            }
        }

        if (!primaryImage) {
            primaryImage = this.extractFirstImage(product.images);
        }

        let sku = product.sku || null;
        if (!sku) {
            const firstVariantWithSku = await this.productVariantRepository.findOne({
                where: { productId },
                select: ['sku'],
                order: { sortOrder: 'ASC' },
            });
            sku = firstVariantWithSku?.sku || null;
        }

        return {
            id: product.id,
            name: product.name || null,
            slug: product.slug || null,
            sku,
            isContactPrice: Boolean(product.isContactPrice),
            primaryImage,
        };
    }

    private extractFirstImage(images?: string): string | null {
        if (!images) {
            return null;
        }

        try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const first = parsed[0];
                if (typeof first === 'string' && first.trim()) {
                    return first.trim();
                }
                if (first && typeof first === 'object' && typeof first.url === 'string' && first.url.trim()) {
                    return first.url.trim();
                }
            }
        } catch {
            // Ignore invalid JSON and fallback to comma-separated parsing.
        }

        const firstCsvImage = images
            .split(',')
            .map((value) => value.trim())
            .find((value) => value.length > 0);

        return firstCsvImage || null;
    }

    private async enrichInquiryWithProductSnapshot(inquiry: Inquiry): Promise<Inquiry> {
        if (!inquiry.productId) {
            return inquiry;
        }

        const dbSnapshot = await this.getProductSnapshotFromDb(inquiry.productId);
        if (!dbSnapshot) {
            return inquiry;
        }

        const metadata = inquiry.metadata && typeof inquiry.metadata === 'object' ? { ...inquiry.metadata } : {};
        const currentSnapshot =
            metadata.productSnapshot && typeof metadata.productSnapshot === 'object'
                ? metadata.productSnapshot as Record<string, any>
                : {};
        const currentPrimaryImage = this.normalizeSnapshotImage(currentSnapshot.primaryImage);

        metadata.productSnapshot = {
            id: currentSnapshot.id ?? dbSnapshot.id ?? inquiry.productId,
            name: currentSnapshot.name || dbSnapshot.name || this.extractProductNameFromSubject(inquiry.subject || ''),
            slug: currentSnapshot.slug || dbSnapshot.slug || null,
            sku: currentSnapshot.sku || dbSnapshot.sku || null,
            isContactPrice: currentSnapshot.isContactPrice ?? dbSnapshot.isContactPrice ?? true,
            category: currentSnapshot.category || null,
            variantCount: currentSnapshot.variantCount ?? null,
            primaryImage: dbSnapshot.primaryImage || currentPrimaryImage || null,
        };

        if (
            !metadata.inquiryType
            && !metadata.source
            && (inquiry.subject || '').startsWith('Inquiry for ')
        ) {
            metadata.inquiryType = 'CONTACT_PRICE';
            metadata.source = 'CONTACT_PRICE';
        }

        inquiry.metadata = metadata;
        return inquiry;
    }

    private normalizeSnapshotImage(image?: string): string | null {
        if (!image || typeof image !== 'string') {
            return null;
        }
        const trimmed = image.trim();
        if (!trimmed || trimmed === '/placeholder-product.png') {
            return null;
        }
        return trimmed;
    }
}
