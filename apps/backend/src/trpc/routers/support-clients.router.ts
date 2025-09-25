import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { SupportClientService } from '../../modules/support/services/support-client.service';
import { SupportClientType } from '../../modules/support/entities/support-client.entity';
import { apiResponseSchema } from '../schemas/response.schemas';

const getContextSchema = z.object({
  country: z.string().optional(),
  language: z.string().optional(),
  deviceType: z.string().optional(),
  currentPage: z.string().optional(),
}).optional();

@Router({ alias: 'publicSupportClients' })
@Injectable()
export class PublicSupportClientsRouter {
  constructor(
    @Inject(SupportClientService)
    private readonly supportClientService: SupportClientService,
  ) {}

  @Query({
    input: z.object({ context: getContextSchema }),
    output: apiResponseSchema,
  })
  async getAvailable(
    @Input() input: { context?: any }
  ) {
    try {
      const clients = await this.supportClientService.getAvailableClients(input?.context);
      return { success: true, data: clients };
    } catch (error) {
      console.error('Error getting available support clients:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  @Query({
    input: z.object({ context: getContextSchema }),
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
    input: z.object({ type: z.nativeEnum(SupportClientType) }),
    output: apiResponseSchema,
  })
  async getByType(
    @Input() input: { type: SupportClientType }
  ) {
    try {
      const clients = await this.supportClientService['supportClientRepository'].findClientsByType(input.type);
      return { success: true, data: clients };
    } catch (error) {
      console.error('Error getting support clients by type:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  @Query({
    input: z.object({
      id: z.string().uuid(),
      context: getContextSchema,
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
          client: {
            id: client.id,
            name: client.name,
            type: client.type,
            iconUrl: client.iconUrl,
            widgetSettings: client.widgetSettings,
          },
        },
      };
    } catch (error) {
      console.error('Error testing support client availability:', error);
      return { success: false, data: null, error: error.message };
    }
  }
}