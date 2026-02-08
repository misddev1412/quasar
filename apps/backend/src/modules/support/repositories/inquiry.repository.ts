import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry } from '../entities/inquiry.entity';
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
}
