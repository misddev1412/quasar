import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductWarehouseQuantity } from '../entities/product-warehouse-quantity.entity';

export interface CreateProductWarehouseQuantityDto {
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity?: number;
}

export interface UpdateProductWarehouseQuantityDto {
  quantity?: number;
  reservedQuantity?: number;
}

@Injectable()
export class ProductWarehouseQuantityRepository {
  constructor(
    @InjectRepository(ProductWarehouseQuantity)
    private readonly repository: Repository<ProductWarehouseQuantity>,
  ) {}

  async create(data: CreateProductWarehouseQuantityDto): Promise<ProductWarehouseQuantity> {
    const warehouseQuantity = this.repository.create({
      productId: data.productId,
      warehouseId: data.warehouseId,
      quantity: data.quantity,
      reservedQuantity: data.reservedQuantity || 0,
    });
    return this.repository.save(warehouseQuantity);
  }

  async findByProductId(productId: string): Promise<ProductWarehouseQuantity[]> {
    return this.repository.find({
      where: { productId },
      relations: ['warehouse'],
    });
  }

  async findByProductAndWarehouse(
    productId: string,
    warehouseId: string,
  ): Promise<ProductWarehouseQuantity | null> {
    return this.repository.findOne({
      where: { productId, warehouseId },
      relations: ['warehouse'],
    });
  }

  async update(
    id: string,
    data: UpdateProductWarehouseQuantityDto,
  ): Promise<ProductWarehouseQuantity | null> {
    await this.repository.update(id, data);
    return this.repository.findOne({ where: { id } });
  }

  async deleteByProductId(productId: string): Promise<void> {
    await this.repository.delete({ productId });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async upsertWarehouseQuantities(
    productId: string,
    warehouseQuantities: Array<{ warehouseId: string; quantity: number }>,
  ): Promise<ProductWarehouseQuantity[]> {
    // Delete existing warehouse quantities for this product
    await this.deleteByProductId(productId);

    // Create new warehouse quantities
    const results: ProductWarehouseQuantity[] = [];
    for (const wq of warehouseQuantities) {
      if (wq.warehouseId && wq.warehouseId.trim() !== '') {
        const created = await this.create({
          productId,
          warehouseId: wq.warehouseId,
          quantity: wq.quantity || 0,
        });
        results.push(created);
      }
    }

    return results;
  }
}
