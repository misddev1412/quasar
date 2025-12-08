import { Injectable } from '@nestjs/common';
import { SEORepository } from '../repositories/seo.repository';
import { CreateSeoDto, UpdateSeoDto } from '../dto/seo.dto';
import { SEOEntity } from '../entities/seo.entity';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { ErrorLevelCode,  ModuleCode, OperationCode} from '@shared/enums/error-codes.enums';

@Injectable()
export class SEOService {
  constructor(
    private readonly seoRepository: SEORepository,
    private readonly responseService: ResponseService,
  ) {}

  /**
   * Create new SEO data
   */
  async create(createSeoDto: CreateSeoDto): Promise<SEOEntity> {
    // Check if SEO data for this path already exists
    const exists = await this.seoRepository.existsByPath(createSeoDto.path);
    if (exists) {
      throw this.responseService.createTRPCError(
        ModuleCode.SEO,
        OperationCode.CREATE,
        ErrorLevelCode.VALIDATION,
        'SEO data for this path already exists'
      );
    }

    const seoEntity = this.seoRepository.create(createSeoDto);
    return this.seoRepository.save(seoEntity);
  }

  /**
   * Get all SEO data
   */
  async findAll(): Promise<SEOEntity[]> {
    return this.seoRepository.findAll();
  }

  /**
   * Get SEO data by ID
   */
  async findById(id: string): Promise<SEOEntity> {
    const seo = await this.seoRepository.findById(id);
    if (!seo) {
      throw this.responseService.createTRPCError(
        ModuleCode.SEO,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        'SEO data not found'
      );
    }
    return seo;
  }

  /**
   * Get SEO data by path
   */
  async findByPath(path: string): Promise<SEOEntity> {
    const seo = await this.seoRepository.findByPath(path);
    if (!seo) {
      throw this.responseService.createTRPCError(
        ModuleCode.SEO,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        'SEO data not found for this path'
      );
    }
    return seo;
  }

  /**
   * Update SEO data
   */
  async update(id: string, updateSeoDto: UpdateSeoDto): Promise<SEOEntity> {
    const seo = await this.seoRepository.findById(id);
    if (!seo) {
      throw this.responseService.createTRPCError(
        ModuleCode.SEO,
        OperationCode.UPDATE,
        ErrorLevelCode.NOT_FOUND,
        'SEO data not found'
      );
    }

    // If path is being changed, check if new path already exists
    if (updateSeoDto.path && updateSeoDto.path !== seo.path) {
      const exists = await this.seoRepository.existsByPath(updateSeoDto.path);
      if (exists) {
        throw this.responseService.createTRPCError(
          ModuleCode.SEO,
          OperationCode.UPDATE,
          ErrorLevelCode.VALIDATION,
          'SEO data for this path already exists'
        );
      }
    }

    return this.seoRepository.update(id, updateSeoDto);
  }

  /**
   * Delete SEO data
   */
  async delete(id: string): Promise<boolean> {
    const seo = await this.seoRepository.findById(id);
    if (!seo) {
      throw this.responseService.createTRPCError(
        ModuleCode.SEO,
        OperationCode.DELETE,
        ErrorLevelCode.NOT_FOUND,
        'SEO data not found'
      );
    }

    return this.seoRepository.softDelete(id);
  }
} 