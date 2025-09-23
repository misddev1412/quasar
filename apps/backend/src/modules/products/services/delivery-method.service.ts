import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DeliveryMethodRepository, CreateDeliveryMethodDto, UpdateDeliveryMethodDto, DeliveryMethodFilters } from '../repositories/delivery-method.repository';
import { DeliveryMethod, DeliveryMethodType, CostCalculationType } from '../entities/delivery-method.entity';

export interface DeliveryMethodListResponse {
  items: DeliveryMethod[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DeliveryCalculation {
  subtotal: number;
  deliveryCost: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  estimatedDeliveryTime: string;
}

export interface DeliveryQuote {
  deliveryMethod: DeliveryMethod;
  cost: number;
  estimatedDeliveryTime: string;
  isAvailable: boolean;
  unavailableReason?: string;
}

@Injectable()
export class DeliveryMethodService {
  constructor(
    private readonly deliveryMethodRepository: DeliveryMethodRepository,
  ) {}

  async create(data: CreateDeliveryMethodDto): Promise<DeliveryMethod> {
    // Validate data
    this.validateCreateData(data);

    // If no sort order provided, set to next available
    if (data.sortOrder === undefined) {
      const count = await this.deliveryMethodRepository.count();
      data.sortOrder = count + 1;
    }

    return await this.deliveryMethodRepository.create(data);
  }

  async findAll(
    filters?: DeliveryMethodFilters,
    page = 1,
    pageSize = 50
  ): Promise<DeliveryMethodListResponse> {
    const allItems = await this.deliveryMethodRepository.findAll(filters);
    const total = allItems.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const items = allItems.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      limit: pageSize,
      totalPages,
    };
  }

  async findById(id: string): Promise<DeliveryMethod> {
    const deliveryMethod = await this.deliveryMethodRepository.findById(id);
    if (!deliveryMethod) {
      throw new NotFoundException(`Delivery method with ID ${id} not found`);
    }
    return deliveryMethod;
  }

  async findByType(type: DeliveryMethodType): Promise<DeliveryMethod[]> {
    return await this.deliveryMethodRepository.findByType(type);
  }

  async findActive(): Promise<DeliveryMethod[]> {
    return await this.deliveryMethodRepository.findActive();
  }

  async findDefault(): Promise<DeliveryMethod | null> {
    return await this.deliveryMethodRepository.findDefault();
  }

  async findForOrderValue(orderAmount: number): Promise<DeliveryMethod[]> {
    if (orderAmount < 0) {
      throw new BadRequestException('Order amount must be non-negative');
    }

    return await this.deliveryMethodRepository.findForOrderValue(orderAmount);
  }

  async findByCoverageArea(area: string): Promise<DeliveryMethod[]> {
    if (!area || area.trim().length === 0) {
      throw new BadRequestException('Coverage area is required');
    }

    return await this.deliveryMethodRepository.findByCoverageArea(area.trim());
  }

  async update(id: string, data: UpdateDeliveryMethodDto): Promise<DeliveryMethod> {
    const existingDeliveryMethod = await this.findById(id);

    // Validate update data
    this.validateUpdateData(data);

    const updatedDeliveryMethod = await this.deliveryMethodRepository.update(id, data);
    if (!updatedDeliveryMethod) {
      throw new NotFoundException(`Delivery method with ID ${id} not found`);
    }

    return updatedDeliveryMethod;
  }

  async delete(id: string): Promise<void> {
    const deliveryMethod = await this.findById(id);

    // Don't allow deletion of default delivery method
    if (deliveryMethod.isDefault) {
      throw new BadRequestException('Cannot delete the default delivery method. Please set another delivery method as default first.');
    }

    const deleted = await this.deliveryMethodRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Delivery method with ID ${id} not found`);
    }
  }

  async setDefault(id: string): Promise<DeliveryMethod> {
    const deliveryMethod = await this.findById(id);

    if (!deliveryMethod.isActive) {
      throw new BadRequestException('Cannot set inactive delivery method as default');
    }

    const updatedDeliveryMethod = await this.deliveryMethodRepository.setDefault(id);
    if (!updatedDeliveryMethod) {
      throw new NotFoundException(`Delivery method with ID ${id} not found`);
    }

    return updatedDeliveryMethod;
  }

  async toggleActive(id: string): Promise<DeliveryMethod> {
    const deliveryMethod = await this.findById(id);

    // Don't allow deactivating default delivery method
    if (deliveryMethod.isDefault && deliveryMethod.isActive) {
      throw new BadRequestException('Cannot deactivate the default delivery method. Please set another delivery method as default first.');
    }

    const updatedDeliveryMethod = await this.deliveryMethodRepository.toggleActive(id);
    if (!updatedDeliveryMethod) {
      throw new NotFoundException(`Delivery method with ID ${id} not found`);
    }

    return updatedDeliveryMethod;
  }

  async reorder(items: Array<{ id: string; sortOrder: number }>): Promise<void> {
    // Validate all delivery methods exist
    for (const item of items) {
      await this.findById(item.id);
    }

    await this.deliveryMethodRepository.reorder(items);
  }

  async calculateDelivery(
    deliveryMethodId: string,
    orderAmount: number,
    options?: {
      weight?: number;
      distance?: number;
      coverageArea?: string;
      paymentMethodId?: string;
    }
  ): Promise<DeliveryCalculation> {
    const deliveryMethod = await this.findById(deliveryMethodId);

    if (!deliveryMethod.isActive) {
      throw new BadRequestException('Delivery method is not active');
    }

    // Check weight constraints
    if (options?.weight && !deliveryMethod.isWeightSupported(options.weight)) {
      throw new BadRequestException(`Order weight (${options.weight}kg) exceeds the limit for this delivery method (${deliveryMethod.weightLimitKg}kg)`);
    }

    // Check coverage area
    if (options?.coverageArea && !deliveryMethod.isCoverageAreaSupported(options.coverageArea)) {
      throw new BadRequestException(`Delivery method does not serve the area: ${options.coverageArea}`);
    }

    // Check payment method compatibility
    if (options?.paymentMethodId && !deliveryMethod.isPaymentMethodSupported(options.paymentMethodId)) {
      throw new BadRequestException('Payment method is not supported by this delivery method');
    }

    const deliveryCost = deliveryMethod.calculateDeliveryCost(orderAmount, options?.weight, options?.distance);
    const total = orderAmount + deliveryCost;
    const estimatedDeliveryTime = deliveryMethod.getEstimatedDeliveryTime();

    return {
      subtotal: orderAmount,
      deliveryCost,
      total,
      deliveryMethod,
      estimatedDeliveryTime,
    };
  }

  async getDeliveryQuotes(
    orderAmount: number,
    options?: {
      weight?: number;
      distance?: number;
      coverageArea?: string;
      paymentMethodId?: string;
    }
  ): Promise<DeliveryQuote[]> {
    const availableMethods = await this.findActive();
    const quotes: DeliveryQuote[] = [];

    for (const method of availableMethods) {
      const quote: DeliveryQuote = {
        deliveryMethod: method,
        cost: 0,
        estimatedDeliveryTime: method.getEstimatedDeliveryTime(),
        isAvailable: true,
      };

      try {
        // Check weight constraints
        if (options?.weight && !method.isWeightSupported(options.weight)) {
          quote.isAvailable = false;
          quote.unavailableReason = `Weight limit exceeded (max: ${method.weightLimitKg}kg)`;
        }

        // Check coverage area
        if (options?.coverageArea && !method.isCoverageAreaSupported(options.coverageArea)) {
          quote.isAvailable = false;
          quote.unavailableReason = 'Not available in your area';
        }

        // Check payment method compatibility
        if (options?.paymentMethodId && !method.isPaymentMethodSupported(options.paymentMethodId)) {
          quote.isAvailable = false;
          quote.unavailableReason = 'Not compatible with selected payment method';
        }

        if (quote.isAvailable) {
          quote.cost = method.calculateDeliveryCost(orderAmount, options?.weight, options?.distance);
        }

        quotes.push(quote);
      } catch (error) {
        quote.isAvailable = false;
        quote.unavailableReason = error.message || 'Method not available';
        quotes.push(quote);
      }
    }

    // Sort by cost (free first, then by ascending cost)
    return quotes.sort((a, b) => {
      if (!a.isAvailable && b.isAvailable) return 1;
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && !b.isAvailable) return 0;
      return a.cost - b.cost;
    });
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<DeliveryMethodType, number>;
    byCostType: Record<CostCalculationType, number>;
    withTracking: number;
    withInsurance: number;
  }> {
    const [total, active] = await Promise.all([
      this.deliveryMethodRepository.count(),
      this.deliveryMethodRepository.count({ isActive: true }),
    ]);

    const inactive = total - active;

    // Get counts by type
    const byType: Record<DeliveryMethodType, number> = {} as Record<DeliveryMethodType, number>;
    for (const type of Object.values(DeliveryMethodType)) {
      byType[type] = await this.deliveryMethodRepository.count({ type });
    }

    // Get counts by cost calculation type
    const byCostType: Record<CostCalculationType, number> = {} as Record<CostCalculationType, number>;
    for (const costType of Object.values(CostCalculationType)) {
      byCostType[costType] = await this.deliveryMethodRepository.count({ costCalculationType: costType });
    }

    const [withTracking, withInsurance] = await Promise.all([
      this.deliveryMethodRepository.count({ trackingEnabled: true }),
      this.deliveryMethodRepository.count({ insuranceEnabled: true }),
    ]);

    return {
      total,
      active,
      inactive,
      byType,
      byCostType,
      withTracking,
      withInsurance,
    };
  }

  private validateCreateData(data: CreateDeliveryMethodDto): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestException('Delivery method name is required');
    }

    if (data.name.length > 255) {
      throw new BadRequestException('Delivery method name cannot exceed 255 characters');
    }

    if (!Object.values(DeliveryMethodType).includes(data.type)) {
      throw new BadRequestException('Invalid delivery method type');
    }

    if (data.deliveryCost !== undefined && data.deliveryCost < 0) {
      throw new BadRequestException('Delivery cost cannot be negative');
    }

    if (data.freeDeliveryThreshold !== undefined && data.freeDeliveryThreshold < 0) {
      throw new BadRequestException('Free delivery threshold cannot be negative');
    }

    if (data.minDeliveryTimeHours !== undefined && data.minDeliveryTimeHours < 0) {
      throw new BadRequestException('Minimum delivery time cannot be negative');
    }

    if (data.maxDeliveryTimeHours !== undefined && data.maxDeliveryTimeHours < 0) {
      throw new BadRequestException('Maximum delivery time cannot be negative');
    }

    if (data.minDeliveryTimeHours !== undefined && data.maxDeliveryTimeHours !== undefined && data.minDeliveryTimeHours > data.maxDeliveryTimeHours) {
      throw new BadRequestException('Minimum delivery time cannot be greater than maximum delivery time');
    }

    if (data.weightLimitKg !== undefined && data.weightLimitKg < 0) {
      throw new BadRequestException('Weight limit cannot be negative');
    }

    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      throw new BadRequestException('Sort order cannot be negative');
    }
  }

  private validateUpdateData(data: UpdateDeliveryMethodDto): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new BadRequestException('Delivery method name is required');
      }

      if (data.name.length > 255) {
        throw new BadRequestException('Delivery method name cannot exceed 255 characters');
      }
    }

    if (data.type !== undefined && !Object.values(DeliveryMethodType).includes(data.type)) {
      throw new BadRequestException('Invalid delivery method type');
    }

    if (data.deliveryCost !== undefined && data.deliveryCost < 0) {
      throw new BadRequestException('Delivery cost cannot be negative');
    }

    if (data.freeDeliveryThreshold !== undefined && data.freeDeliveryThreshold < 0) {
      throw new BadRequestException('Free delivery threshold cannot be negative');
    }

    if (data.minDeliveryTimeHours !== undefined && data.minDeliveryTimeHours < 0) {
      throw new BadRequestException('Minimum delivery time cannot be negative');
    }

    if (data.maxDeliveryTimeHours !== undefined && data.maxDeliveryTimeHours < 0) {
      throw new BadRequestException('Maximum delivery time cannot be negative');
    }

    if (data.minDeliveryTimeHours !== undefined && data.maxDeliveryTimeHours !== undefined && data.minDeliveryTimeHours > data.maxDeliveryTimeHours) {
      throw new BadRequestException('Minimum delivery time cannot be greater than maximum delivery time');
    }

    if (data.weightLimitKg !== undefined && data.weightLimitKg < 0) {
      throw new BadRequestException('Weight limit cannot be negative');
    }

    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      throw new BadRequestException('Sort order cannot be negative');
    }
  }
}