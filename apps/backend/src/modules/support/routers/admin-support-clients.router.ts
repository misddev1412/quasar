import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Input, Mutation } from 'nestjs-trpc';
import { z } from 'zod';
import { SupportClientService } from '../services/support-client.service';
import { SupportClientType, WidgetPosition, WidgetTheme } from '../entities/support-client.entity';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';

// Zod schemas for validation
const createSupportClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: z.nativeEnum(SupportClientType),
  description: z.string().optional(),
  configuration: z.record(z.any()),
  widgetSettings: z.record(z.any()),
  iconUrl: z.string().url().optional().or(z.literal('')),
  targetAudience: z.record(z.any()).optional(),
  scheduleEnabled: z.boolean().default(false),
  scheduleStart: z.date().optional(),
  scheduleEnd: z.date().optional(),
});

const updateSupportClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  configuration: z.record(z.any()).optional(),
  widgetSettings: z.record(z.any()).optional(),
  iconUrl: z.string().url().optional().or(z.literal('')),
  targetAudience: z.record(z.any()).optional(),
  scheduleEnabled: z.boolean().optional(),
  scheduleStart: z.date().optional(),
  scheduleEnd: z.date().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const sortOrderUpdateSchema = z.array(z.object({
  id: z.string().uuid(),
  sortOrder: z.number().int().min(0),
}));

const getAllQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.nativeEnum(SupportClientType).optional(),
  isActive: z.boolean().optional(),
});

@Router({ alias: 'adminSupportClients' })
@Injectable()
export class AdminSupportClientsRouter {
  constructor(
    @Inject(SupportClientService)
    private readonly supportClientService: SupportClientService,
  ) {}

  @Query({
    input: getAllQuerySchema,
    output: paginatedResponseSchema,
  })
  async getAll(
    @Input() input: z.infer<typeof getAllQuerySchema>
  ) {
    try {
      const { page, limit, search, type, isActive } = input;
      const skip = (page - 1) * limit;

      let query: any = {
        deletedAt: null,
      };

      if (search) {
        query.name = { $like: `%${search}%` };
      }

      if (type) {
        query.type = type;
      }

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const [clients, total] = await Promise.all([
        this.supportClientService.findAll({
          where: query,
          order: {
            sortOrder: 'ASC',
            isDefault: 'DESC',
            createdAt: 'DESC',
          },
          skip,
          take: limit,
        }),
        this.supportClientService.count({ where: query }),
      ]);

      return {
        success: true,
        data: {
          clients,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Error getting support clients:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getById(
    @Input() input: { id: string }
  ) {
    try {
      const client = await this.supportClientService.findOne(input.id);
      return { success: true, data: client };
    } catch (error) {
      console.error('Error getting support client:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getDefault() {
    try {
      const client = await this.supportClientService.findDefault();
      return { success: true, data: client };
    } catch (error) {
      console.error('Error getting default support client:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Mutation({
    input: createSupportClientSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createSupportClientSchema>
  ) {
    try {
      // Validate configuration
      const validation = await this.supportClientService.validateConfiguration(input.type, input.configuration);
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      // Ensure required fields are present
      const createInput = {
        name: input.name,
        type: input.type,
        description: input.description,
        configuration: input.configuration,
        widgetSettings: input.widgetSettings,
        iconUrl: input.iconUrl,
        targetAudience: input.targetAudience,
        scheduleEnabled: input.scheduleEnabled,
        scheduleStart: input.scheduleStart,
        scheduleEnd: input.scheduleEnd,
      };

      const client = await this.supportClientService.create(createInput);
      return { success: true, data: client };
    } catch (error) {
      console.error('Error creating support client:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Mutation({
    input: z.object({
      id: z.string().uuid(),
      data: updateSupportClientSchema,
    }),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string; data: any }
  ) {
    try {
      // Validate configuration if provided
      if (input.data.configuration && input.data.type) {
        const validation = await this.supportClientService.validateConfiguration(input.data.type as SupportClientType, input.data.configuration);
        if (!validation.isValid) {
          throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
        }
      }

      const client = await this.supportClientService.update(input.id, input.data);
      return { success: true, data: client };
    } catch (error) {
      console.error('Error updating support client:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string }
  ) {
    try {
      await this.supportClientService.remove(input.id);
      return { success: true, data: { success: true } };
    } catch (error) {
      console.error('Error deleting support client:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async setAsDefault(
    @Input() input: { id: string }
  ) {
    try {
      const client = await this.supportClientService.setAsDefault(input.id);
      return { success: true, data: client };
    } catch (error) {
      console.error('Error setting default support client:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Mutation({
    input: sortOrderUpdateSchema,
    output: apiResponseSchema,
  })
  async updateSortOrder(
    @Input() input: Array<{ id: string; sortOrder: number }>
  ) {
    try {
      await this.supportClientService.updateSortOrder(input);
      return { success: true, data: { success: true } };
    } catch (error) {
      console.error('Error updating sort order:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Mutation({
    input: z.object({
      id: z.string().uuid(),
      newName: z.string().optional(),
    }),
    output: apiResponseSchema,
  })
  async duplicate(
    @Input() input: { id: string; newName?: string }
  ) {
    try {
      const client = await this.supportClientService.duplicate(input.id, input.newName);
      return { success: true, data: client };
    } catch (error) {
      console.error('Error duplicating support client:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Query({
    input: z.object({
      context: z.object({
        country: z.string().optional(),
        language: z.string().optional(),
        deviceType: z.string().optional(),
        currentPage: z.string().optional(),
      }).optional(),
    }).optional(),
    output: apiResponseSchema,
  })
  async getWidgetScripts(
    @Input() input: { context?: any }
  ) {
    try {
      const scripts = await this.supportClientService.getWidgetScripts(input?.context);
      return { success: true, data: scripts };
    } catch (error) {
      console.error('Error getting widget scripts:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  @Query({
    input: z.object({
      context: z.object({
        country: z.string().optional(),
        language: z.string().optional(),
        deviceType: z.string().optional(),
        currentPage: z.string().optional(),
      }).optional(),
    }).optional(),
    output: apiResponseSchema,
  })
  async getAvailableClients(
    @Input() input: { context?: any }
  ) {
    try {
      const clients = await this.supportClientService.getAvailableClients(input?.context);
      return { success: true, data: clients };
    } catch (error) {
      console.error('Error getting available clients:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getStats() {
    try {
      const stats = await this.supportClientService.getStats();
      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Mutation({
    input: z.object({
      type: z.nativeEnum(SupportClientType),
      configuration: z.record(z.any()),
    }),
    output: apiResponseSchema,
  })
  async validateConfiguration(
    @Input() input: { type: SupportClientType; configuration: Record<string, any> }
  ) {
    try {
      const validation = await this.supportClientService.validateConfiguration(input.type, input.configuration);
      return { success: true, data: validation };
    } catch (error) {
      console.error('Error validating configuration:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Query({
    input: z.object({
      type: z.nativeEnum(SupportClientType),
    }),
    output: apiResponseSchema,
  })
  async getRecommendedSettings(
    @Input() input: { type: SupportClientType }
  ) {
    try {
      const settings = await this.supportClientService.getRecommendedSettings(input.type);
      return { success: true, data: settings };
    } catch (error) {
      console.error('Error getting recommended settings:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getTypes() {
    try {
      const types = Object.values(SupportClientType).map(type => ({
        value: type,
        label: type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' '),
      }));
      return { success: true, data: types };
    } catch (error) {
      console.error('Error getting support client types:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getWidgetPositions() {
    try {
      const positions = Object.values(WidgetPosition).map(position => ({
        value: position,
        label: position.charAt(0) + position.slice(1).toLowerCase().replace(/_/g, ' '),
      }));
      return { success: true, data: positions };
    } catch (error) {
      console.error('Error getting widget positions:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getWidgetThemes() {
    try {
      const themes = Object.values(WidgetTheme).map(theme => ({
        value: theme,
        label: theme.charAt(0) + theme.slice(1).toLowerCase(),
      }));
      return { success: true, data: themes };
    } catch (error) {
      console.error('Error getting widget themes:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  @Query({
    input: z.object({
      id: z.string().uuid(),
      context: z.object({
        country: z.string().optional(),
        language: z.string().optional(),
        deviceType: z.string().optional(),
        currentPage: z.string().optional(),
      }).optional(),
    }),
    output: apiResponseSchema,
  })
  async testAvailability(
    @Input() input: { id: string; context?: any }
  ) {
    try {
      const client = await this.supportClientService.findOne(input.id);

      const isAvailable = client.isAvailableNow();
      const isTargeted = client.isTargeted(input.context);

      return {
        success: true,
        data: {
          isAvailable: isAvailable && isTargeted,
          isAvailableNow: isAvailable,
          isTargeted,
          scheduleEnabled: client.scheduleEnabled,
          scheduleStart: client.scheduleStart,
          scheduleEnd: client.scheduleEnd,
          workingHours: client.widgetSettings.workingHours,
        },
      };
    } catch (error) {
      console.error('Error testing availability:', error);
      return { success: false, data: null, error: error.message };
    }
  }
}