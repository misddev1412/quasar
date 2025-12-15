import { Injectable } from '@nestjs/common';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { ResponseService } from '../../shared/services/response.service';
import { ComponentConfigRepository } from '../repositories/component-config.repository';
import type {
  CreateComponentConfigDto,
  UpdateComponentConfigDto,
  ListComponentConfigDto,
} from '../dto/component-config.dto';
import { ComponentConfigEntity } from '../entities/component-config.entity';

@Injectable()
export class ComponentConfigsService {
  constructor(
    private readonly componentConfigRepository: ComponentConfigRepository,
    private readonly responseService: ResponseService,
  ) {}

  async list(filter: ListComponentConfigDto): Promise<ComponentConfigEntity[]> {
    try {
      const qb = this.componentConfigRepository
        .createQueryBuilder('component')
        .leftJoinAndSelect('component.parent', 'parent')
        .where('component.deletedAt IS NULL')
        .orderBy('component.position', 'ASC')
        .addOrderBy('component.createdAt', 'ASC');

      if (filter.includeChildren) {
        qb.leftJoinAndSelect('component.children', 'children');
      }

      if (filter.parentId === null) {
        qb.andWhere('component.parentId IS NULL');
      } else if (filter.parentId) {
        qb.andWhere('component.parentId = :parentId', { parentId: filter.parentId });
      }

      if (filter.category) {
        qb.andWhere('component.category = :category', { category: filter.category });
      }

      if (filter.componentType) {
        qb.andWhere('component.componentType = :componentType', {
          componentType: filter.componentType,
        });
      }

      if (filter.onlyEnabled === true) {
        qb.andWhere('component.isEnabled = :isEnabled', { isEnabled: true });
      }

      return await qb.getMany();
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to load component configurations',
        error,
      );
    }
  }

  async getById(id: string): Promise<ComponentConfigEntity> {
    try {
      const component = await this.componentConfigRepository.findOne({
        where: { id },
        relations: ['parent', 'children'],
      });

      if (!component || component.deletedAt) {
        throw this.responseService.createTRPCError(
          ModuleCode.COMPONENT,
          OperationCode.READ,
          ErrorLevelCode.NOT_FOUND,
          'Component configuration not found',
        );
      }

      return component;
    } catch (error) {
      if (error?.code) {
        throw error;
      }

      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to load component configuration',
        error,
      );
    }
  }

  async getByKey(componentKey: string): Promise<ComponentConfigEntity> {
    try {
      const component = await this.componentConfigRepository.findOne({
        where: { componentKey },
        relations: ['parent', 'children'],
      });

      if (!component || component.deletedAt) {
        throw this.responseService.createTRPCError(
          ModuleCode.COMPONENT,
          OperationCode.READ,
          ErrorLevelCode.NOT_FOUND,
          'Component configuration not found',
        );
      }

      return component;
    } catch (error) {
      if (error?.code) {
        throw error;
      }

      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to load component configuration',
        error,
      );
    }
  }

  async create(dto: CreateComponentConfigDto, userId?: string): Promise<ComponentConfigEntity> {
    try {
      if (dto.parentId) {
        const parentExists = await this.componentConfigRepository.exists(dto.parentId);
        if (!parentExists) {
          throw this.responseService.createTRPCError(
            ModuleCode.COMPONENT,
            OperationCode.CREATE,
            ErrorLevelCode.NOT_FOUND,
            'Parent component not found',
          );
        }
      }

      const position =
        dto.position ??
        (await this.componentConfigRepository.findMaxPosition(dto.parentId ?? null)) + 1;

      const component = this.componentConfigRepository.create({
        componentKey: dto.componentKey,
        displayName: dto.displayName,
        description: dto.description ?? null,
        componentType: dto.componentType,
        category: dto.category,
        position,
        isEnabled: dto.isEnabled ?? true,
        defaultConfig: dto.defaultConfig ?? {},
        configSchema: dto.configSchema ?? {},
        metadata: dto.metadata ?? {},
        allowedChildKeys: dto.allowedChildKeys ?? [],
        previewMediaUrl: dto.previewMediaUrl ?? null,
        parentId: dto.parentId ?? null,
        slotKey: dto.slotKey ?? null,
        createdBy: userId,
        updatedBy: userId,
      });

      return await this.componentConfigRepository.save(component);
    } catch (error) {
      if (error?.code) {
        throw error;
      }

      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.CREATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to create component configuration',
        error,
      );
    }
  }

  async update(id: string, dto: UpdateComponentConfigDto, userId?: string): Promise<ComponentConfigEntity> {
    try {
      const existing = await this.componentConfigRepository.findById(id);
      if (!existing || existing.deletedAt) {
        throw this.responseService.createTRPCError(
          ModuleCode.COMPONENT,
          OperationCode.UPDATE,
          ErrorLevelCode.NOT_FOUND,
          'Component configuration not found',
        );
      }

      if (dto.parentId !== undefined) {
        if (dto.parentId === id) {
          throw this.responseService.createTRPCError(
            ModuleCode.COMPONENT,
            OperationCode.UPDATE,
            ErrorLevelCode.VALIDATION,
            'A component cannot reference itself as parent',
          );
        }

        if (dto.parentId) {
          const parentExists = await this.componentConfigRepository.exists(dto.parentId);
          if (!parentExists) {
            throw this.responseService.createTRPCError(
              ModuleCode.COMPONENT,
              OperationCode.UPDATE,
              ErrorLevelCode.NOT_FOUND,
              'Parent component not found',
            );
          }
        }
      }

      const updatePayload: Partial<ComponentConfigEntity> = {
        updatedBy: userId,
      };

      if (dto.componentKey !== undefined) {
        updatePayload.componentKey = dto.componentKey;
      }

      if (dto.displayName !== undefined) {
        updatePayload.displayName = dto.displayName;
      }

      if (dto.description !== undefined) {
        updatePayload.description = dto.description ?? null;
      }

      if (dto.componentType !== undefined) {
        updatePayload.componentType = dto.componentType;
      }

      if (dto.category !== undefined) {
        updatePayload.category = dto.category;
      }

      if (dto.isEnabled !== undefined) {
        updatePayload.isEnabled = dto.isEnabled;
      }

      if (dto.defaultConfig !== undefined) {
        updatePayload.defaultConfig = dto.defaultConfig ?? {};
      }

      if (dto.configSchema !== undefined) {
        updatePayload.configSchema = dto.configSchema ?? {};
      }

      if (dto.metadata !== undefined) {
        updatePayload.metadata = dto.metadata ?? {};
      }

      if (dto.allowedChildKeys !== undefined) {
        updatePayload.allowedChildKeys = dto.allowedChildKeys ?? [];
      }

      if (dto.previewMediaUrl !== undefined) {
        updatePayload.previewMediaUrl = dto.previewMediaUrl ?? null;
      }

      if (dto.slotKey !== undefined) {
        updatePayload.slotKey = dto.slotKey ?? null;
      }

      if (dto.parentId !== undefined) {
        updatePayload.parentId = dto.parentId ?? null;
      }

      if (dto.position !== undefined) {
        updatePayload.position = dto.position;
      } else if (dto.parentId !== undefined && dto.parentId !== existing.parentId) {
        updatePayload.position =
          (await this.componentConfigRepository.findMaxPosition(dto.parentId ?? null)) + 1;
      }

      const merged = this.componentConfigRepository.create({
        ...existing,
        ...updatePayload,
      });

      return await this.componentConfigRepository.save(merged);
    } catch (error) {
      if (error?.code) {
        throw error;
      }

      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to update component configuration',
        error,
      );
    }
  }

  async delete(id: string, userId?: string): Promise<void> {
    try {
      const existing = await this.componentConfigRepository.findById(id);
      if (!existing || existing.deletedAt) {
        throw this.responseService.createTRPCError(
          ModuleCode.COMPONENT,
          OperationCode.DELETE,
          ErrorLevelCode.NOT_FOUND,
          'Component configuration not found',
        );
      }

      await this.componentConfigRepository.update(id, {
        deletedBy: userId,
        updatedBy: userId,
      });

      await this.componentConfigRepository.softDelete(id);
    } catch (error) {
      if (error?.code) {
        throw error;
      }

      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.DELETE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to delete component configuration',
        error,
      );
    }
  }
}
