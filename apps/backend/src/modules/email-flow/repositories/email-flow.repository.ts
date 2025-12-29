import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EmailFlow } from '../entities/email-flow.entity';
import { BaseRepository } from '@shared';

export interface IEmailFlowRepository {
  findPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    mailProviderId?: string;
    mailTemplateId?: string;
  }): Promise<{
    items: EmailFlow[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>;

  findById(id: string): Promise<EmailFlow | null>;
  findByIdWithProvider(id: string): Promise<EmailFlow | null>;
  findByName(name: string): Promise<EmailFlow | null>;
  findActiveFlows(): Promise<EmailFlow[]>;
  findByMailProvider(mailProviderId: string): Promise<EmailFlow[]>;
  findActiveFlowsByProvider(mailProviderId: string): Promise<EmailFlow[]>;
  createEmailFlow(data: Partial<EmailFlow>): Promise<EmailFlow>;
  update(id: string, data: Partial<EmailFlow>): Promise<EmailFlow | null>;
  deleteEmailFlow(id: string): Promise<void>;
  validateUniqueConstraints(name: string, id?: string): Promise<{ isValid: boolean; errors: string[] }>;
}

@Injectable()
export class EmailFlowRepository extends BaseRepository<EmailFlow> implements IEmailFlowRepository {
  constructor(
    @InjectRepository(EmailFlow)
    private emailFlowRepository: Repository<EmailFlow>,
  ) {
    super(emailFlowRepository);
  }

  async findPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    mailProviderId?: string;
    mailTemplateId?: string;
  }): Promise<{
    items: EmailFlow[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const { page, limit, search, isActive, mailProviderId, mailTemplateId } = params;

    const queryBuilder = this.emailFlowRepository
      .createQueryBuilder('emailFlow')
      .leftJoinAndSelect('emailFlow.mailProvider', 'mailProvider')
      .leftJoinAndSelect('emailFlow.mailTemplate', 'mailTemplate')
      .orderBy('emailFlow.priority', 'ASC')
      .addOrderBy('emailFlow.name', 'ASC');

    this.applyFilters(queryBuilder, { search, isActive, mailProviderId, mailTemplateId });

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string): Promise<EmailFlow | null> {
    return await this.emailFlowRepository.findOne({ where: { id } });
  }

  async findByIdWithProvider(id: string): Promise<EmailFlow | null> {
    return await this.emailFlowRepository.findOne({
      where: { id },
      relations: ['mailProvider', 'mailTemplate'],
    });
  }

  async findByName(name: string): Promise<EmailFlow | null> {
    return await this.emailFlowRepository.findOne({ where: { name } });
  }

  async findActiveFlows(): Promise<EmailFlow[]> {
    return await this.emailFlowRepository.find({
      where: { isActive: true },
      relations: ['mailProvider', 'mailTemplate'],
      order: { priority: 'ASC', name: 'ASC' },
    });
  }

  async findByMailProvider(mailProviderId: string): Promise<EmailFlow[]> {
    return await this.emailFlowRepository.find({
      where: { mailProviderId },
      relations: ['mailProvider', 'mailTemplate'],
      order: { priority: 'ASC', name: 'ASC' },
    });
  }

  async findActiveFlowsByProvider(mailProviderId: string): Promise<EmailFlow[]> {
    return await this.emailFlowRepository.find({
      where: { mailProviderId, isActive: true },
      relations: ['mailProvider', 'mailTemplate'],
      order: { priority: 'ASC', name: 'ASC' },
    });
  }

  async createEmailFlow(data: Partial<EmailFlow>): Promise<EmailFlow> {
    const emailFlow = this.emailFlowRepository.create(data);
    return await this.emailFlowRepository.save(emailFlow);
  }

  async update(id: string, data: Partial<EmailFlow>): Promise<EmailFlow | null> {
    await this.emailFlowRepository.update(id, data);
    return await this.findByIdWithProvider(id);
  }

  async deleteEmailFlow(id: string): Promise<void> {
    await this.emailFlowRepository.delete(id);
  }

  async validateUniqueConstraints(name: string, id?: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check name uniqueness
    const queryBuilder = this.emailFlowRepository
      .createQueryBuilder('emailFlow')
      .where('emailFlow.name = :name', { name });

    if (id) {
      queryBuilder.andWhere('emailFlow.id != :id', { id });
    }

    const existingFlow = await queryBuilder.getOne();
    if (existingFlow) {
      errors.push('Mail channel priority name must be unique');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<EmailFlow>,
    filters: {
      search?: string;
      isActive?: boolean;
      mailProviderId?: string;
      mailTemplateId?: string | null;
    },
  ): void {
    const { search, isActive, mailProviderId, mailTemplateId } = filters;

    if (search) {
      queryBuilder.andWhere(
        '(emailFlow.name LIKE :search OR emailFlow.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('emailFlow.isActive = :isActive', { isActive });
    }

    if (mailProviderId) {
      queryBuilder.andWhere('emailFlow.mailProviderId = :mailProviderId', { mailProviderId });
    }

    if (mailTemplateId) {
      queryBuilder.andWhere('emailFlow.mailTemplateId = :mailTemplateId', { mailTemplateId });
    }
  }
}






