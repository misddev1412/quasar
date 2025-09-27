import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from '../entities/wishlist.entity';
import { Customer } from '../entities/customer.entity';
import { Product } from '../entities/product.entity';

export interface WishlistFilters {
  customerId?: string;
  productId?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedWishlists {
  items: Wishlist[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateWishlistDto {
  customerId: string;
  productId: string;
  name: string;
  description?: string;
  priority?: number;
  notes?: string;
  isPublic?: boolean;
}

export interface UpdateWishlistDto {
  name?: string;
  description?: string;
  priority?: number;
  notes?: string;
  isPublic?: boolean;
}

@Injectable()
export class WishlistRepository {
  constructor(
    @InjectRepository(Wishlist)
    private readonly repository: Repository<Wishlist>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    const wishlist = this.repository.create(createWishlistDto);
    return this.repository.save(wishlist);
  }

  async findById(id: string): Promise<Wishlist | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['customer', 'product'],
    });
  }

  async findByCustomerAndProduct(customerId: string, productId: string): Promise<Wishlist | null> {
    return this.repository.findOne({
      where: { customerId, productId },
      relations: ['customer', 'product'],
    });
  }

  async findByCustomer(customerId: string, filters?: Omit<WishlistFilters, 'customerId'>): Promise<Wishlist[]> {
    const queryBuilder = this.repository.createQueryBuilder('wishlist')
      .leftJoinAndSelect('wishlist.product', 'product')
      .leftJoinAndSelect('product.media', 'media')
      .where('wishlist.customerId = :customerId', { customerId });

    if (filters?.isPublic !== undefined) {
      queryBuilder.andWhere('wishlist.isPublic = :isPublic', { isPublic: filters.isPublic });
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(wishlist.name) LIKE :search OR LOWER(wishlist.description) LIKE :search OR LOWER(product.name) LIKE :search)',
        { search: searchTerm }
      );
    }

    queryBuilder.orderBy('wishlist.priority', 'DESC')
      .addOrderBy('wishlist.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findByProduct(productId: string): Promise<Wishlist[]> {
    return this.repository.find({
      where: { productId },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllWithFilters(filters: WishlistFilters): Promise<PaginatedWishlists> {
    const queryBuilder = this.repository.createQueryBuilder('wishlist')
      .leftJoinAndSelect('wishlist.customer', 'customer')
      .leftJoinAndSelect('wishlist.product', 'product');

    // Apply filters
    if (filters.customerId) {
      queryBuilder.andWhere('wishlist.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters.productId) {
      queryBuilder.andWhere('wishlist.productId = :productId', { productId: filters.productId });
    }

    if (filters.isPublic !== undefined) {
      queryBuilder.andWhere('wishlist.isPublic = :isPublic', { isPublic: filters.isPublic });
    }

    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(wishlist.name) LIKE :search OR LOWER(wishlist.description) LIKE :search OR LOWER(product.name) LIKE :search OR LOWER(customer.firstName) LIKE :search OR LOWER(customer.lastName) LIKE :search)',
        { search: searchTerm }
      );
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('wishlist.priority', 'DESC')
      .addOrderBy('wishlist.createdAt', 'DESC');

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Get paginated results
    const items = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(id: string, updateWishlistDto: UpdateWishlistDto): Promise<Wishlist | null> {
    await this.repository.update(id, updateWishlistDto);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  async deleteByCustomerAndProduct(customerId: string, productId: string): Promise<boolean> {
    const result = await this.repository.delete({ customerId, productId });
    return result.affected !== undefined && result.affected > 0;
  }

  async countByCustomer(customerId: string): Promise<number> {
    return this.repository.count({
      where: { customerId },
    });
  }

  async countByProduct(productId: string): Promise<number> {
    return this.repository.count({
      where: { productId },
    });
  }

  async findPublicWishlists(filters?: Omit<WishlistFilters, 'isPublic'>): Promise<PaginatedWishlists> {
    return this.findAllWithFilters({
      ...filters,
      isPublic: true,
    });
  }

  async updatePriority(id: string, priority: number): Promise<Wishlist | null> {
    await this.repository.update(id, { priority });
    return this.findById(id);
  }

  async exists(customerId: string, productId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { customerId, productId },
    });
    return count > 0;
  }
}