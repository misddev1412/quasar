import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { MailTemplateRepository } from '../repositories/mail-template.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { MailTemplate } from '../entities/mail-template.entity';
import { ApiStatusCodes } from '@shared';
import { 
  CreateMailTemplateDto, 
  UpdateMailTemplateDto, 
  MailTemplateResponseDto,
  MailTemplateListItemDto,
  MailTemplateFilters,
  ProcessTemplateDto,
  ProcessedTemplateResponseDto
} from '../dto/mail-template.dto';
import { PaginatedResult } from '@shared/types/common.types';

@Injectable()
export class MailTemplateService {
  constructor(
    private readonly mailTemplateRepository: MailTemplateRepository,
    private readonly responseHandler: ResponseService,
  ) {}

  /**
   * Create a new mail template
   */
  async createTemplate(createDto: CreateMailTemplateDto, createdBy?: string): Promise<MailTemplateResponseDto> {
    // Check if template name already exists
    const existingTemplate = await this.mailTemplateRepository.findByName(createDto.name);
    if (existingTemplate) {
      throw this.responseHandler.createError(
        ApiStatusCodes.CONFLICT,
        'A template with this name already exists',
        'CONFLICT'
      );
    }

    // Create the template
    const template = this.mailTemplateRepository.create({
      ...createDto,
      createdBy,
      variables: createDto.variables || []
    });

    // Validate template content
    const validation = template.validateTemplate();
    if (!validation.isValid) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        `Template validation failed: ${validation.errors.join(', ')}`,
        'VALIDATION_ERROR'
      );
    }

    // Auto-detect variables if not provided
    if (!createDto.variables || createDto.variables.length === 0) {
      template.variables = template.getVariablesFromContent();
    }

    const savedTemplate = await this.mailTemplateRepository.save(template);
    return this.toResponseDto(savedTemplate);
  }

  /**
   * Get all templates with pagination and filtering
   */
  async getTemplates(filters: MailTemplateFilters): Promise<PaginatedResult<MailTemplateListItemDto>> {
    const result = await this.mailTemplateRepository.findWithFilters(filters);
    
    return {
      data: result.data.map(template => this.toListItemDto(template)),
      meta: result.meta
    };
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id: string): Promise<MailTemplateResponseDto> {
    const template = await this.mailTemplateRepository.findById(id);
    if (!template) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Mail template not found',
        'NOT_FOUND'
      );
    }

    return this.toResponseDto(template);
  }

  /**
   * Get template by name
   */
  async getTemplateByName(name: string): Promise<MailTemplateResponseDto> {
    const template = await this.mailTemplateRepository.findByName(name);
    if (!template) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Mail template not found',
        'NOT_FOUND'
      );
    }

    return this.toResponseDto(template);
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, updateDto: UpdateMailTemplateDto, updatedBy?: string): Promise<MailTemplateResponseDto> {
    const template = await this.mailTemplateRepository.findById(id);
    if (!template) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Mail template not found',
        'NOT_FOUND'
      );
    }

    // Check if new name conflicts with existing template
    if (updateDto.name && updateDto.name !== template.name) {
      const isNameTaken = await this.mailTemplateRepository.isNameTaken(updateDto.name, id);
      if (isNameTaken) {
        throw this.responseHandler.createError(
          ApiStatusCodes.CONFLICT,
          'A template with this name already exists',
          'CONFLICT'
        );
      }
    }

    // Update template properties
    Object.assign(template, updateDto, { updatedBy });

    // Validate updated template
    const validation = template.validateTemplate();
    if (!validation.isValid) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        `Template validation failed: ${validation.errors.join(', ')}`,
        'VALIDATION_ERROR'
      );
    }

    // Auto-update variables if content changed
    if (updateDto.subject || updateDto.body) {
      template.variables = template.getVariablesFromContent();
    }

    const updatedTemplate = await this.mailTemplateRepository.save(template);
    return this.toResponseDto(updatedTemplate);
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    const template = await this.mailTemplateRepository.findById(id);
    if (!template) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Mail template not found',
        'NOT_FOUND'
      );
    }

    await this.mailTemplateRepository.delete(id);
  }

  /**
   * Process template with variables
   */
  async processTemplate(processDto: ProcessTemplateDto): Promise<ProcessedTemplateResponseDto> {
    const template = await this.mailTemplateRepository.findById(processDto.templateId);
    if (!template) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Mail template not found',
        'NOT_FOUND'
      );
    }

    if (!template.isActive) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'Cannot process inactive template',
        'TEMPLATE_INACTIVE'
      );
    }

    const variables = processDto.variables || {};
    const processed = template.processTemplate(variables);
    const availableVariables = template.getVariablesFromContent();
    const missingVariables = availableVariables.filter(variable => 
      !(variable in variables) || variables[variable] === undefined || variables[variable] === null
    );

    return {
      subject: processed.subject,
      body: processed.body,
      originalTemplate: {
        id: template.id,
        name: template.name,
        type: template.type
      },
      processedVariables: variables,
      missingVariables
    };
  }

  /**
   * Clone template
   */
  async cloneTemplate(templateId: string, newName: string, createdBy?: string): Promise<MailTemplateResponseDto> {
    const originalTemplate = await this.mailTemplateRepository.findById(templateId);
    if (!originalTemplate) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'Original template not found',
        'NOT_FOUND'
      );
    }

    // Check if new name already exists
    const existingTemplate = await this.mailTemplateRepository.findByName(newName);
    if (existingTemplate) {
      throw this.responseHandler.createError(
        ApiStatusCodes.CONFLICT,
        'A template with this name already exists',
        'CONFLICT'
      );
    }

    const clonedData = originalTemplate.clone(newName);
    const clonedTemplate = this.mailTemplateRepository.create({
      ...clonedData,
      createdBy
    });

    const savedTemplate = await this.mailTemplateRepository.save(clonedTemplate);
    return this.toResponseDto(savedTemplate);
  }

  /**
   * Get template statistics
   */
  async getStatistics() {
    return this.mailTemplateRepository.getStatistics();
  }

  /**
   * Get all template types
   */
  async getTemplateTypes(): Promise<string[]> {
    return this.mailTemplateRepository.getTemplateTypes();
  }

  /**
   * Bulk update template status
   */
  async bulkUpdateStatus(ids: string[], isActive: boolean): Promise<number> {
    if (ids.length === 0) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'No template IDs provided',
        'INVALID_INPUT'
      );
    }

    return this.mailTemplateRepository.bulkUpdateStatus(ids, isActive);
  }

  /**
   * Search templates
   */
  async searchTemplates(searchTerm: string): Promise<MailTemplateListItemDto[]> {
    const templates = await this.mailTemplateRepository.searchByContent(searchTerm);
    return templates.map(template => this.toListItemDto(template));
  }

  // Helper methods
  private toResponseDto(template: MailTemplate): MailTemplateResponseDto {
    return {
      id: template.id,
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
      isActive: template.isActive,
      description: template.description,
      variables: template.variables,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      createdBy: template.createdBy,
      updatedBy: template.updatedBy,
      version: template.version,
    };
  }

  private toListItemDto(template: MailTemplate): MailTemplateListItemDto {
    return {
      id: template.id,
      name: template.name,
      subject: template.subject,
      type: template.type,
      isActive: template.isActive,
      description: template.description,
      variableCount: template.variables?.length || 0,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
