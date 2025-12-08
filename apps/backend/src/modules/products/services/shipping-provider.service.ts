import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ShippingProviderRepository, ShippingProviderFilters, PaginatedShippingProviders } from '../repositories/shipping-provider.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { ApiStatusCodes } from '@shared';
import { ShippingProvider, ShippingProviderStatus } from '../entities/shipping-provider.entity';

export interface CreateShippingProviderDto {
  name: string;
  code: string;
  website?: string;
  trackingUrl?: string;
  apiKey?: string | null;
  apiSecret?: string | null;
  deliveryTimeEstimate?: number;
  description?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
    supportHours?: string;
  };
  services?: {
    domestic?: boolean;
    international?: boolean;
    express?: boolean;
    standard?: boolean;
    economy?: boolean;
    tracking?: boolean;
    insurance?: boolean;
    signature?: boolean;
  };
}

export interface UpdateShippingProviderDto {
  name?: string;
  website?: string;
  trackingUrl?: string;
  apiKey?: string | null;
  apiSecret?: string | null;
  deliveryTimeEstimate?: number;
  description?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
    supportHours?: string;
  };
  services?: {
    domestic?: boolean;
    international?: boolean;
    express?: boolean;
    standard?: boolean;
    economy?: boolean;
    tracking?: boolean;
    insurance?: boolean;
    signature?: boolean;
  };
}

export interface ShippingProviderStatsResponse {
  totalProviders: number;
  activeProviders: number;
  providersWithTracking: number;
  domesticProviders: number;
  internationalProviders: number;
  expressProviders: number;
  topProviders: ShippingProvider[];
  recentProviders: ShippingProvider[];
}

@Injectable()
export class ShippingProviderService {
  constructor(
    private readonly shippingProviderRepository: ShippingProviderRepository,
    private readonly responseHandler: ResponseService,
  ) {}

  async getAllProviders(
    filters: ShippingProviderFilters = {}
  ): Promise<PaginatedShippingProviders> {
    try {
      return await this.shippingProviderRepository.findAll({
        page: filters.page,
        limit: filters.limit,
        relations: [],
        filters,
      });
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve shipping providers: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getProviderById(id: string): Promise<ShippingProvider | null> {
    try {
      return await this.shippingProviderRepository.findById(id);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve shipping provider: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getProviderByCode(code: string): Promise<ShippingProvider | null> {
    try {
      return await this.shippingProviderRepository.findByCode(code);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve shipping provider: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getActiveProviders(): Promise<ShippingProvider[]> {
    try {
      return await this.shippingProviderRepository.findActiveProviders();
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve active shipping providers: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getProvidersWithTracking(): Promise<ShippingProvider[]> {
    try {
      return await this.shippingProviderRepository.findProvidersWithTracking();
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve shipping providers with tracking: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getProvidersForService(serviceType: string): Promise<ShippingProvider[]> {
    try {
      return await this.shippingProviderRepository.findProvidersForService(serviceType);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve shipping providers for service: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async createProvider(providerData: CreateShippingProviderDto): Promise<ShippingProvider> {
    try {
      // Check if provider code already exists
      const existingProvider = await this.shippingProviderRepository.findByCode(providerData.code);
      if (existingProvider) {
        throw new ConflictException(`Shipping provider with code '${providerData.code}' already exists`);
      }

      // Validate tracking URL format
      if (providerData.trackingUrl && !providerData.trackingUrl.includes('{tracking_number}')) {
        throw new BadRequestException('Tracking URL must contain {tracking_number} placeholder');
      }

      // Create provider with default services
      const provider = await this.shippingProviderRepository.create({
        name: providerData.name,
        code: providerData.code.toUpperCase(),
        website: providerData.website,
        trackingUrl: providerData.trackingUrl,
        apiKey: providerData.apiKey,
        apiSecret: providerData.apiSecret,
        deliveryTimeEstimate: providerData.deliveryTimeEstimate,
        description: providerData.description,
        contactInfo: providerData.contactInfo,
        services: {
          domestic: providerData.services?.domestic ?? true,
          international: providerData.services?.international ?? false,
          express: providerData.services?.express ?? false,
          standard: providerData.services?.standard ?? true,
          economy: providerData.services?.economy ?? false,
          tracking: providerData.services?.tracking ?? true,
          insurance: providerData.services?.insurance ?? false,
          signature: providerData.services?.signature ?? false,
        },
        isActive: true,
      });

      return provider;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to create shipping provider',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateProvider(id: string, updateData: UpdateShippingProviderDto): Promise<ShippingProvider | null> {
    try {
      const existingProvider = await this.shippingProviderRepository.findById(id);
      if (!existingProvider) {
        throw new NotFoundException('Shipping provider not found');
      }

      // Validate tracking URL format
      if (updateData.trackingUrl && !updateData.trackingUrl.includes('{tracking_number}')) {
        throw new BadRequestException('Tracking URL must contain {tracking_number} placeholder');
      }

      // Update provider
      const dataToUpdate: Partial<ShippingProvider> = {};

      if (updateData.name !== undefined) {
        dataToUpdate.name = updateData.name;
      }

      if (updateData.website !== undefined) {
        dataToUpdate.website = updateData.website;
      }

      if (updateData.trackingUrl !== undefined) {
        dataToUpdate.trackingUrl = updateData.trackingUrl;
      }

      if (updateData.apiKey !== undefined) {
        dataToUpdate.apiKey = updateData.apiKey;
      }

      if (updateData.apiSecret !== undefined) {
        dataToUpdate.apiSecret = updateData.apiSecret;
      }

      if (updateData.deliveryTimeEstimate !== undefined) {
        dataToUpdate.deliveryTimeEstimate = updateData.deliveryTimeEstimate;
      }

      if (updateData.description !== undefined) {
        dataToUpdate.description = updateData.description;
      }

      // Handle services update - merge with existing services if partial update
      if (updateData.services) {
        const currentServices: ShippingProvider['services'] = existingProvider.services ?? {
          domestic: true,
          international: false,
          express: false,
          standard: true,
          economy: false,
          tracking: true,
          insurance: false,
          signature: false,
        };

        dataToUpdate.services = {
          ...currentServices,
          ...updateData.services,
        } as ShippingProvider['services'];
      }

      // Handle contact info update
      if (updateData.contactInfo) {
        dataToUpdate.contactInfo = {
          ...(existingProvider.contactInfo ?? {}),
          ...updateData.contactInfo,
        };
      }

      const updatedProvider = await this.shippingProviderRepository.update(id, dataToUpdate);
      return updatedProvider;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to update shipping provider',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async activateProvider(id: string): Promise<boolean> {
    try {
      const provider = await this.shippingProviderRepository.findById(id);
      if (!provider) {
        throw new NotFoundException('Shipping provider not found');
      }

      return await this.shippingProviderRepository.activate(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to activate shipping provider',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async deactivateProvider(id: string): Promise<boolean> {
    try {
      const provider = await this.shippingProviderRepository.findById(id);
      if (!provider) {
        throw new NotFoundException('Shipping provider not found');
      }

      return await this.shippingProviderRepository.deactivate(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to deactivate shipping provider',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async deleteProvider(id: string): Promise<boolean> {
    try {
      const provider = await this.shippingProviderRepository.findById(id);
      if (!provider) {
        throw new NotFoundException('Shipping provider not found');
      }

      // TODO: Check if provider is being used by any fulfillments
      // If it is, we should either prevent deletion or allow with warning

      return await this.shippingProviderRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to delete shipping provider',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async validateTrackingNumber(providerId: string, trackingNumber: string): Promise<boolean> {
    try {
      const provider = await this.shippingProviderRepository.findById(providerId);
      if (!provider) {
        throw new NotFoundException('Shipping provider not found');
      }

      return await this.shippingProviderRepository.validateTrackingNumber(providerId, trackingNumber);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to validate tracking number',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async generateTrackingUrl(providerId: string, trackingNumber: string): Promise<string | null> {
    try {
      const provider = await this.shippingProviderRepository.findById(providerId);
      if (!provider) {
        throw new NotFoundException('Shipping provider not found');
      }

      if (!provider.trackingUrl) {
        return null;
      }

      return provider.getTrackingUrl(trackingNumber);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to generate tracking URL',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getStats(): Promise<ShippingProviderStatsResponse> {
    try {
      const stats = await this.shippingProviderRepository.getStats();

      // Get top providers (most used)
      const topProviders = await this.getTopProvidersByUsage();

      // Get recent providers
      const recentProviders = await this.getRecentProviders();

      return {
        ...stats,
        topProviders,
        recentProviders,
      };
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve shipping provider statistics',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async searchProviders(query: string): Promise<ShippingProvider[]> {
    try {
      return await this.shippingProviderRepository.searchByNameOrCode(query);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to search shipping providers: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getProvidersByDeliveryTime(minDays: number, maxDays: number): Promise<ShippingProvider[]> {
    try {
      return await this.shippingProviderRepository.findByDeliveryTimeEstimate(minDays, maxDays);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve shipping providers by delivery time: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateProviderServices(providerId: string, services: any): Promise<boolean> {
    try {
      const provider = await this.shippingProviderRepository.findById(providerId);
      if (!provider) {
        throw new NotFoundException('Shipping provider not found');
      }

      return await this.shippingProviderRepository.updateProviderServices(providerId, services);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to update provider services',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  // Private helper methods
  private async getTopProvidersByUsage(limit: number = 10): Promise<ShippingProvider[]> {
    // TODO: Implement provider usage statistics
    // For now, return active providers sorted by name
    const activeProviders = await this.shippingProviderRepository.findActiveProviders();
    return activeProviders.slice(0, limit);
  }

  private async getRecentProviders(limit: number = 5): Promise<ShippingProvider[]> {
    // TODO: Implement recent providers logic
    // For now, return active providers sorted by creation date
    const allProviders = await this.shippingProviderRepository.findAll({
      page: 1,
      limit,
      filters: { isActive: true },
    });
    return allProviders.items;
  }

  // Utility methods for provider validation
  validateProviderCode(code: string): boolean {
    // Provider code should be alphanumeric and uppercase
    const codeRegex = /^[A-Z0-9]{2,10}$/;
    return codeRegex.test(code);
  }

  validateTrackingUrl(url: string): boolean {
    // Basic URL validation with placeholder check
    const urlRegex = /^https?:\/\/.+\{tracking_number\}.*/;
    return urlRegex.test(url);
  }

  validateProviderServices(services: any): boolean {
    const requiredFields = ['domestic', 'international', 'express', 'standard', 'economy', 'tracking', 'insurance', 'signature'];

    for (const field of requiredFields) {
      if (typeof services[field] !== 'boolean') {
        return false;
      }
    }

    // At least one service type should be true
    const hasAnyService = Object.values(services).some(value => value === true);
    return hasAnyService;
  }

  sanitizeProviderCode(code: string): string {
    return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  calculateEstimatedDeliveryDate(providerId: string, shippingDate: Date = new Date()): Date | null {
    // This would typically use the provider's delivery time estimate
    // For now, return a placeholder implementation
    const estimatedDate = new Date(shippingDate);
    estimatedDate.setDate(estimatedDate.getDate() + 7); // Default 7 days
    return estimatedDate;
  }

  getProviderDisplayName(provider: ShippingProvider): string {
    return `${provider.name} (${provider.code})`;
  }

  isProviderConfigured(provider: ShippingProvider): boolean {
    return !!(provider.apiKey && provider.apiSecret && provider.trackingUrl);
  }

  getProviderStatus(provider: ShippingProvider): ShippingProviderStatus {
    if (!provider.isActive) return ShippingProviderStatus.INACTIVE;
    if (!this.isProviderConfigured(provider)) return ShippingProviderStatus.MAINTENANCE;
    return ShippingProviderStatus.ACTIVE;
  }
}
