import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSpecification } from '../entities/product-specification.entity';

export interface CreateProductSpecificationDto {
  productId: string;
  name: string;
  value: string;
  sortOrder?: number;
}

export interface UpdateProductSpecificationDto {
  name?: string;
  value?: string;
  sortOrder?: number;
}

@Injectable()
export class ProductSpecificationRepository {
  constructor(
    @InjectRepository(ProductSpecification)
    private readonly repository: Repository<ProductSpecification>,
  ) {}

  async findByProductId(productId: string): Promise<ProductSpecification[]> {
    return this.repository.find({
      where: { productId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async createMany(specifications: CreateProductSpecificationDto[]): Promise<ProductSpecification[]> {
    if (specifications.length === 0) {
      return [];
    }

    const entities = specifications.map((spec) =>
      this.repository.create({
        productId: spec.productId,
        name: spec.name,
        value: spec.value,
        sortOrder: spec.sortOrder ?? 0,
      }),
    );

    return this.repository.save(entities);
  }

  async deleteByProductId(productId: string): Promise<void> {
    await this.repository.delete({ productId });
  }

  async replaceForProduct(
    productId: string,
    specifications: CreateProductSpecificationDto[],
  ): Promise<ProductSpecification[]> {
    await this.deleteByProductId(productId);
    return this.createMany(specifications);
  }
}
