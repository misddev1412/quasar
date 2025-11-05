import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingProvider } from '../entities/shipping-provider.entity';
import { CreateShippingProviderDto } from '../dto/create-shipping-provider.dto';
import { UpdateShippingProviderDto } from '../dto/update-shipping-provider.dto';

@Injectable()
export class AdminShippingProviderService {
  constructor(
    @InjectRepository(ShippingProvider)
    private readonly shippingProviderRepository: Repository<ShippingProvider>,
  ) {}

  async create(createShippingProviderDto: CreateShippingProviderDto): Promise<ShippingProvider> {
    const { name, code, trackingUrl, description, isActive, apiKey, apiSecret } = createShippingProviderDto;

    // Check if code already exists
    const existingProvider = await this.shippingProviderRepository.findOne({
      where: { code },
    });

    if (existingProvider) {
      throw new Error('Shipping provider with this code already exists');
    }

    const shippingProvider = this.shippingProviderRepository.create({
      name,
      code,
      trackingUrl,
      description,
      apiKey,
      apiSecret,
      isActive: isActive ?? true, // Default to true if not specified
    });

    return this.shippingProviderRepository.save(shippingProvider);
  }

  async findAll(): Promise<ShippingProvider[]> {
    return this.shippingProviderRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<ShippingProvider> {
    const shippingProvider = await this.shippingProviderRepository.findOne({
      where: { id },
    });

    if (!shippingProvider) {
      throw new Error('Shipping provider not found');
    }

    return shippingProvider;
  }

  async update(id: string, updateShippingProviderDto: UpdateShippingProviderDto): Promise<ShippingProvider> {
    const shippingProvider = await this.findOne(id);

    const { name, code, trackingUrl, description, isActive, apiKey, apiSecret } = updateShippingProviderDto;

    // Check if code is being changed and if new code already exists
    if (code && code !== shippingProvider.code) {
      const existingProvider = await this.shippingProviderRepository.findOne({
        where: { code },
      });

      if (existingProvider) {
        throw new Error('Shipping provider with this code already exists');
      }
    }

    // Update fields
    if (name !== undefined) shippingProvider.name = name;
    if (code !== undefined) shippingProvider.code = code;
    if (trackingUrl !== undefined) shippingProvider.trackingUrl = trackingUrl;
    if (description !== undefined) shippingProvider.description = description;
    if (isActive !== undefined) shippingProvider.isActive = isActive;
    if (apiKey !== undefined) shippingProvider.apiKey = apiKey;
    if (apiSecret !== undefined) shippingProvider.apiSecret = apiSecret;

    return this.shippingProviderRepository.save(shippingProvider);
  }

  async remove(id: string): Promise<void> {
    const shippingProvider = await this.findOne(id);
    await this.shippingProviderRepository.remove(shippingProvider);
  }

  async toggleActive(id: string): Promise<ShippingProvider> {
    const shippingProvider = await this.findOne(id);
    shippingProvider.isActive = !shippingProvider.isActive;
    return this.shippingProviderRepository.save(shippingProvider);
  }
}
