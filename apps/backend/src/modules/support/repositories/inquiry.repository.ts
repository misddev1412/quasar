import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryStatus } from '@backend/modules/support/entities/inquiry.entity';
import { BaseRepository } from '@shared/repositories/base-repository.abstract';

@Injectable()
export class InquiryRepository extends BaseRepository<Inquiry> {
    constructor(
        @InjectRepository(Inquiry)
        private readonly inquiryRepository: Repository<Inquiry>,
    ) {
        super(inquiryRepository);
    }

    async findInquiriesByEmail(email: string): Promise<Inquiry[]> {
        return this.findAll({
            where: { email, deletedAt: null },
            order: { createdAt: 'DESC' },
        });
    }

    async findInquiriesByPhone(phone: string): Promise<Inquiry[]> {
        return this.findAll({
            where: { phone, deletedAt: null },
            order: { createdAt: 'DESC' },
        });
    }

    async findPendingInquiries(): Promise<Inquiry[]> {
        return this.findAll({
            where: { status: 'PENDING' as any, deletedAt: null },
            order: { createdAt: 'DESC' },
        });
    }

    async findPaginated(params: {
        page: number;
        limit: number;
        search?: string;
        status?: InquiryStatus;
    }): Promise<{ items: Inquiry[]; total: number; page: number; limit: number; totalPages: number }> {
        const { page, limit, search, status } = params;
        const skip = (page - 1) * limit;

        const qb = this.inquiryRepository
            .createQueryBuilder('inquiry')
            .where('inquiry.deleted_at IS NULL')
            .andWhere(
                `NOT (
                    inquiry.metadata->>'inquiryType' = :contactPrice
                    OR inquiry.metadata->>'source' = :contactPrice
                    OR inquiry.subject ILIKE :legacyContactSubject
                )`,
                {
                    contactPrice: 'CONTACT_PRICE',
                    legacyContactSubject: 'Inquiry for %',
                },
            );

        if (search) {
            qb.andWhere(
                '(inquiry.name ILIKE :search OR inquiry.email ILIKE :search OR inquiry.phone ILIKE :search OR inquiry.subject ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        if (status) {
            qb.andWhere('inquiry.status = :status', { status });
        }

        const [items, total] = await qb
            .orderBy('inquiry.created_at', 'DESC')
            .offset(skip)
            .limit(limit)
            .getManyAndCount();

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }

    async findContactPricePaginated(params: {
        page: number;
        limit: number;
        search?: string;
        status?: InquiryStatus;
    }): Promise<{ items: Inquiry[]; total: number; page: number; limit: number; totalPages: number }> {
        const { page, limit, search, status } = params;
        const skip = (page - 1) * limit;

        const qb = this.inquiryRepository
            .createQueryBuilder('inquiry')
            .where('inquiry.deleted_at IS NULL')
            .andWhere(
                `(
                    inquiry.metadata->>'inquiryType' = :contactPrice
                    OR inquiry.metadata->>'source' = :contactPrice
                    OR inquiry.subject ILIKE :legacyContactSubject
                )`,
                {
                    contactPrice: 'CONTACT_PRICE',
                    legacyContactSubject: 'Inquiry for %',
                },
            );

        if (search) {
            qb.andWhere(
                `(inquiry.name ILIKE :search
                OR inquiry.email ILIKE :search
                OR inquiry.phone ILIKE :search
                OR inquiry.subject ILIKE :search
                OR inquiry.metadata->'productSnapshot'->>'name' ILIKE :search
                OR inquiry.metadata->'productSnapshot'->>'sku' ILIKE :search)`,
                { search: `%${search}%` },
            );
        }

        if (status) {
            qb.andWhere('inquiry.status = :status', { status });
        }

        const [items, total] = await qb
            .orderBy('inquiry.created_at', 'DESC')
            .offset(skip)
            .limit(limit)
            .getManyAndCount();

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
}
