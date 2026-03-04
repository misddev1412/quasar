import { Injectable } from '@nestjs/common';
import { InquiryRepository } from '@backend/modules/support/repositories/inquiry.repository';
import { Inquiry, InquiryStatus } from '@backend/modules/support/entities/inquiry.entity';

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
    constructor(private readonly inquiryRepository: InquiryRepository) { }

    async createInquiry(dto: CreateInquiryDto): Promise<Inquiry> {
        const inquiry = this.inquiryRepository.create({
            ...dto,
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
}
