import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, ILike } from 'typeorm';
import { MailTemplate } from '../entities/mail-template.entity';
import { MailTemplateFilters } from '../dto/mail-template.dto';
import { PaginatedResult } from '@shared/types/common.types';

@Injectable()
export class MailTemplateRepository {
  constructor(
    @InjectRepository(MailTemplate)
    private readonly mailTemplateRepository: Repository<MailTemplate>,
  ) {}

  /**
   * Create a new mail template
   */
  create(templateData: Partial<MailTemplate>): MailTemplate {
    return this.mailTemplateRepository.create(templateData);
  }

  /**
   * Save mail template
   */
  async save(template: MailTemplate): Promise<MailTemplate> {
    return this.mailTemplateRepository.save(template);
  }

  /**
   * Find mail template by ID
   */
  async findById(id: string): Promise<MailTemplate | null> {
    return this.mailTemplateRepository.findOne({ where: { id } });
  }

  /**
   * Delete mail template by ID
   */
  async delete(id: string): Promise<void> {
    await this.mailTemplateRepository.delete(id);
  }

  /**
   * Find mail template by name
   */
  async findByName(name: string): Promise<MailTemplate | null> {
    return this.mailTemplateRepository.findOne({
      where: { name }
    });
  }

  /**
   * Find active mail templates by type
   */
  async findActiveByType(type: string): Promise<MailTemplate[]> {
    return this.mailTemplateRepository.find({
      where: { 
        type,
        isActive: true 
      },
      order: { name: 'ASC' }
    });
  }

  /**
   * Find all templates by type
   */
  async findByType(type: string): Promise<MailTemplate[]> {
    return this.mailTemplateRepository.find({
      where: { type },
      order: { name: 'ASC' }
    });
  }

  /**
   * Get all unique template types
   */
  async getTemplateTypes(): Promise<string[]> {
    const result = await this.mailTemplateRepository
      .createQueryBuilder('template')
      .select('DISTINCT template.type', 'type')
      .orderBy('template.type', 'ASC')
      .getRawMany();
    
    return result.map(row => row.type);
  }

  /**
   * Find templates with pagination and filtering
   */
  async findWithFilters(filters: MailTemplateFilters): Promise<PaginatedResult<MailTemplate>> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = filters;

    const queryBuilder = this.mailTemplateRepository.createQueryBuilder('template');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(template.name ILIKE :search OR template.subject ILIKE :search OR template.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply type filter
    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
    }

    // Apply active status filter
    if (typeof isActive === 'boolean') {
      queryBuilder.andWhere('template.isActive = :isActive', { isActive });
    }

    // Apply sorting
    const validSortFields = ['name', 'type', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`template.${sortField}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Search templates by content (subject and body)
   */
  async searchByContent(searchTerm: string): Promise<MailTemplate[]> {
    return this.mailTemplateRepository.find({
      where: [
        { subject: ILike(`%${searchTerm}%`) },
        { body: ILike(`%${searchTerm}%`) },
        { name: ILike(`%${searchTerm}%`) },
        { description: ILike(`%${searchTerm}%`) }
      ],
      order: { name: 'ASC' }
    });
  }

  /**
   * Find templates that contain specific variables
   */
  async findByVariable(variableName: string): Promise<MailTemplate[]> {
    return this.mailTemplateRepository
      .createQueryBuilder('template')
      .where('template.subject LIKE :variable OR template.body LIKE :variable', {
        variable: `%{{${variableName}}}%`
      })
      .orderBy('template.name', 'ASC')
      .getMany();
  }

  /**
   * Get template statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
  }> {
    const [total, active, typeStats] = await Promise.all([
      this.mailTemplateRepository.count(),
      this.mailTemplateRepository.count({ where: { isActive: true } }),
      this.mailTemplateRepository
        .createQueryBuilder('template')
        .select('template.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('template.type')
        .orderBy('template.type', 'ASC')
        .getRawMany()
    ]);

    const byType: Record<string, number> = {};
    typeStats.forEach(stat => {
      byType[stat.type] = parseInt(stat.count, 10);
    });

    return {
      total,
      active,
      inactive: total - active,
      byType
    };
  }

  /**
   * Bulk update template status
   */
  async bulkUpdateStatus(ids: string[], isActive: boolean): Promise<number> {
    const result = await this.mailTemplateRepository
      .createQueryBuilder()
      .update(MailTemplate)
      .set({ isActive, updatedAt: new Date() })
      .where('id IN (:...ids)', { ids })
      .execute();

    return result.affected || 0;
  }

  /**
   * Check if template name exists (excluding specific ID)
   */
  async isNameTaken(name: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.mailTemplateRepository
      .createQueryBuilder('template')
      .where('template.name = :name', { name });

    if (excludeId) {
      queryBuilder.andWhere('template.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * Find recently updated templates
   */
  async findRecentlyUpdated(limit: number = 10): Promise<MailTemplate[]> {
    return this.mailTemplateRepository.find({
      order: { updatedAt: 'DESC' },
      take: limit
    });
  }

  /**
   * Find templates created by specific user
   */
  async findByCreator(createdBy: string): Promise<MailTemplate[]> {
    return this.mailTemplateRepository.find({
      where: { createdBy },
      order: { createdAt: 'DESC' }
    });
  }
}
