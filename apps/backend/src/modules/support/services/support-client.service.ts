import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SupportClientRepository } from '../repositories/support-client.repository';
import { SupportClient, SupportClientType, WidgetPosition, WidgetTheme, WidgetSettings } from '../entities/support-client.entity';

@Injectable()
export class SupportClientService {
  constructor(private readonly supportClientRepository: SupportClientRepository) {}

  async create(createSupportClientDto: {
    name: string;
    type: SupportClientType;
    description?: string;
    configuration: Record<string, any>;
    widgetSettings: Record<string, any>;
    iconUrl?: string;
    targetAudience?: Record<string, any>;
    scheduleEnabled?: boolean;
    scheduleStart?: Date;
    scheduleEnd?: Date;
  }): Promise<SupportClient> {
    const supportClient = new SupportClient();
    supportClient.name = createSupportClientDto.name;
    supportClient.type = createSupportClientDto.type;
    supportClient.description = createSupportClientDto.description;
    supportClient.configuration = createSupportClientDto.configuration;
    supportClient.widgetSettings = createSupportClientDto.widgetSettings as WidgetSettings;
    supportClient.iconUrl = createSupportClientDto.iconUrl;
    supportClient.targetAudience = createSupportClientDto.targetAudience;
    supportClient.scheduleEnabled = createSupportClientDto.scheduleEnabled || false;
    supportClient.scheduleStart = createSupportClientDto.scheduleStart;
    supportClient.scheduleEnd = createSupportClientDto.scheduleEnd;

    // Set as default if it's the first client
    const existingClients = await this.supportClientRepository.findActiveClients();
    if (existingClients.length === 0) {
      supportClient.isDefault = true;
    }

    return this.supportClientRepository.save(supportClient);
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    where?: any;
    order?: any;
  }): Promise<SupportClient[]> {
    return this.supportClientRepository.findAll(options);
  }

  async count(options?: { where?: any }): Promise<number> {
    return this.supportClientRepository.count(options);
  }

  async findActive(): Promise<SupportClient[]> {
    return this.supportClientRepository.findActiveClients();
  }

  async findOne(id: string): Promise<SupportClient> {
    const client = await this.supportClientRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`Support client with ID ${id} not found`);
    }
    return client;
  }

  async findDefault(): Promise<SupportClient | null> {
    return this.supportClientRepository.findDefaultClient();
  }

  async update(
    id: string,
    updateSupportClientDto: {
      name?: string;
      description?: string;
      isActive?: boolean;
      configuration?: Record<string, any>;
      widgetSettings?: Record<string, any>;
      iconUrl?: string;
      targetAudience?: Record<string, any>;
      scheduleEnabled?: boolean;
      scheduleStart?: Date;
      scheduleEnd?: Date;
      sortOrder?: number;
    },
  ): Promise<SupportClient> {
    const client = await this.findOne(id);

    Object.assign(client, updateSupportClientDto);

    return this.supportClientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);

    // If this was the default client, set another active client as default
    if (client.isDefault) {
      const activeClients = await this.supportClientRepository.findActiveClients();
      const otherClients = activeClients.filter(c => c.id !== id);

      if (otherClients.length > 0) {
        // Set the first active client as default
        await this.supportClientRepository.setAsDefault(otherClients[0].id);
      }
    }

    await this.supportClientRepository.softDelete(id);
  }

  async setAsDefault(id: string): Promise<SupportClient> {
    const client = await this.findOne(id);

    if (!client.isActive) {
      throw new ConflictException('Cannot set inactive client as default');
    }

    await this.supportClientRepository.setAsDefault(id);
    return this.findOne(id);
  }

  async getWidgetScripts(context?: {
    country?: string;
    language?: string;
    deviceType?: string;
    currentPage?: string;
  }): Promise<string[]> {
    const clients = context
      ? await this.supportClientRepository.findClientsForContext(context)
      : await this.supportClientRepository.findActiveClients();

    return clients
      .filter(client => client.isActive && client.isAvailableNow())
      .map(client => client.getWidgetScript());
  }

  async getAvailableClients(context?: {
    country?: string;
    language?: string;
    deviceType?: string;
    currentPage?: string;
  }): Promise<SupportClient[]> {
    return context
      ? await this.supportClientRepository.findClientsForContext(context)
      : await this.supportClientRepository.findActiveClients();
  }

  async updateSortOrder(updates: Array<{ id: string; sortOrder: number }>): Promise<void> {
    await this.supportClientRepository.updateSortOrder(updates);
  }

  async duplicate(id: string, newName?: string): Promise<SupportClient> {
    const originalClient = await this.findOne(id);

    const duplicatedClient = new SupportClient();
    duplicatedClient.name = newName || `${originalClient.name} (Copy)`;
    duplicatedClient.type = originalClient.type;
    duplicatedClient.description = originalClient.description;
    duplicatedClient.configuration = { ...originalClient.configuration };
    duplicatedClient.widgetSettings = { ...originalClient.widgetSettings };
    duplicatedClient.iconUrl = originalClient.iconUrl;
    duplicatedClient.targetAudience = originalClient.targetAudience ? { ...originalClient.targetAudience } : undefined;
    duplicatedClient.scheduleEnabled = originalClient.scheduleEnabled;
    duplicatedClient.scheduleStart = originalClient.scheduleStart;
    duplicatedClient.scheduleEnd = originalClient.scheduleEnd;
    duplicatedClient.isActive = false; // Start as inactive
    duplicatedClient.isDefault = false; // Cannot be default
    duplicatedClient.sortOrder = originalClient.sortOrder + 1;

    return this.supportClientRepository.save(duplicatedClient);
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    byType: Record<string, number>;
    defaultCount: number;
  }> {
    return this.supportClientRepository.getClientStats();
  }

  async validateConfiguration(type: SupportClientType, configuration: Record<string, any>): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    switch (type) {
      case SupportClientType.MESSENGER:
        if (!configuration.appId) {
          errors.push('Facebook App ID is required');
        }
        if (!configuration.pageId) {
          errors.push('Facebook Page ID is required');
        }
        break;

      case SupportClientType.ZALO:
        if (!configuration.appId) {
          errors.push('Zalo App ID is required');
        }
        if (!configuration.apiKey) {
          errors.push('Zalo API Key is required');
        }
        break;

      case SupportClientType.WHATSAPP:
        if (!configuration.phoneNumber) {
          errors.push('WhatsApp phone number is required');
        }
        // Basic phone number validation
        if (configuration.phoneNumber && !/^\+?[0-9]{10,15}$/.test(configuration.phoneNumber.replace(/\s/g, ''))) {
          errors.push('Invalid WhatsApp phone number format');
        }
        break;

      case SupportClientType.EMAIL:
        if (!configuration.email) {
          errors.push('Email address is required');
        }
        if (configuration.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuration.email)) {
          errors.push('Invalid email address format');
        }
        break;

      case SupportClientType.PHONE:
        if (!configuration.phoneNumber) {
          errors.push('Phone number is required');
        }
        break;

      case SupportClientType.TELEGRAM:
        if (!configuration.botUsername) {
          errors.push('Telegram bot username is required');
        }
        break;

      case SupportClientType.CUSTOM:
        if (!configuration.customScript) {
          errors.push('Custom script is required');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getRecommendedSettings(type: SupportClientType): Promise<{
    configuration: Record<string, any>;
    widgetSettings: Record<string, any>;
  }> {
    const client = new SupportClient();
    client.type = type;
    client.name = type;

    return {
      configuration: client.getDefaultConfiguration(),
      widgetSettings: client.getDefaultWidgetSettings(),
    };
  }
}