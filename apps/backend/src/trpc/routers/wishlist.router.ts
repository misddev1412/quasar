import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { WishlistRepository } from '../../modules/products/repositories/wishlist.repository';
import { CustomerRepository } from '../../modules/products/repositories/customer.repository';
import { ProductRepository } from '../../modules/products/repositories/product.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UserInjectionMiddleware } from '../middlewares/user-injection.middleware';
import { UserRole } from '@shared';
import { apiResponseSchema } from '../schemas/response.schemas';
import { AuthenticatedContext } from '../context';

// Zod schemas for validation
const adminWishlistFiltersSchema = z.object({
  customerId: z.string().optional(),
  productId: z.string().optional(),
  isPublic: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

const adminCreateWishlistSchema = z.object({
  customerId: z.string(),
  productId: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  priority: z.number().min(0).max(10).default(0),
  notes: z.string().optional(),
  isPublic: z.boolean().default(false),
});

const adminUpdateWishlistSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
});

const wishlistItemSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  productId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  priority: z.number(),
  notes: z.string().nullable(),
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  customer: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string().nullable(),
  }),
  product: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.number(),
    sku: z.string().nullable(),
    images: z.array(z.string()).optional(),
  }),
});

const paginatedWishlistSchema = z.object({
  items: z.array(wishlistItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

const adminWishlistResponseSchema = apiResponseSchema(wishlistItemSchema);
const adminPaginatedWishlistResponseSchema = apiResponseSchema(paginatedWishlistSchema);

@Injectable()
@Router('admin.wishlist')
export class WishlistAdminRouter {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly productRepository: ProductRepository,
    private readonly responseService: ResponseService,
  ) {}

  @Query('list')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async getWishlistList(@Input() input: adminWishlistFiltersSchema) {
    try {
      const result = await this.wishlistRepository.findAllWithFilters(input);

      return this.responseService.createSuccessResponse(
        'Wishlists retrieved successfully',
        result
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to retrieve wishlists',
        'RETRIEVE_FAILED',
        error
      );
    }
  }

  @Query('findById')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async getWishlistById(@Input() input: z.object({ id: z.string() })) {
    try {
      const wishlist = await this.wishlistRepository.findById(input.id);
      if (!wishlist) {
        return this.responseService.createErrorResponse(
          'Wishlist not found',
          'NOT_FOUND'
        );
      }

      return this.responseService.createSuccessResponse(
        'Wishlist retrieved successfully',
        wishlist
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to retrieve wishlist',
        'RETRIEVE_FAILED',
        error
      );
    }
  }

  @Mutation('create')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async createWishlist(@Input() input: adminCreateWishlistSchema) {
    try {
      // Verify customer exists
      const customer = await this.customerRepository.findById(input.customerId);
      if (!customer) {
        return this.responseService.createErrorResponse(
          'Customer not found',
          'CUSTOMER_NOT_FOUND'
        );
      }

      // Verify product exists
      const product = await this.productRepository.findById(input.productId);
      if (!product) {
        return this.responseService.createErrorResponse(
          'Product not found',
          'PRODUCT_NOT_FOUND'
        );
      }

      // Check if already in wishlist
      const existing = await this.wishlistRepository.findByCustomerAndProduct(
        input.customerId,
        input.productId
      );
      if (existing) {
        return this.responseService.createErrorResponse(
          'Product already in wishlist for this customer',
          'ALREADY_IN_WISHLIST'
        );
      }

      // Create wishlist item
      const wishlistItem = await this.wishlistRepository.create({
        customerId: input.customerId,
        productId: input.productId,
        name: input.name,
        description: input.description,
        priority: input.priority,
        notes: input.notes,
        isPublic: input.isPublic,
      });

      return this.responseService.createSuccessResponse(
        'Wishlist created successfully',
        wishlistItem
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to create wishlist',
        'CREATE_FAILED',
        error
      );
    }
  }

  @Mutation('update')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async updateWishlist(
    @Input() input: z.object({ id: z.string(), data: adminUpdateWishlistSchema })
  ) {
    try {
      const existing = await this.wishlistRepository.findById(input.id);
      if (!existing) {
        return this.responseService.createErrorResponse(
          'Wishlist not found',
          'NOT_FOUND'
        );
      }

      const updated = await this.wishlistRepository.update(input.id, input.data);
      if (!updated) {
        return this.responseService.createErrorResponse(
          'Failed to update wishlist',
          'UPDATE_FAILED'
        );
      }

      return this.responseService.createSuccessResponse(
        'Wishlist updated successfully',
        updated
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to update wishlist',
        'UPDATE_FAILED',
        error
      );
    }
  }

  @Mutation('delete')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async deleteWishlist(@Input() input: z.object({ id: z.string() })) {
    try {
      const success = await this.wishlistRepository.delete(input.id);
      if (!success) {
        return this.responseService.createErrorResponse(
          'Wishlist not found',
          'NOT_FOUND'
        );
      }

      return this.responseService.createSuccessResponse(
        'Wishlist deleted successfully'
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to delete wishlist',
        'DELETE_FAILED',
        error
      );
    }
  }

  @Mutation('updatePriority')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async updateWishlistPriority(
    @Input() input: z.object({ id: z.string(), priority: z.number().min(0).max(10) })
  ) {
    try {
      const updated = await this.wishlistRepository.updatePriority(input.id, input.priority);
      if (!updated) {
        return this.responseService.createErrorResponse(
          'Wishlist not found',
          'NOT_FOUND'
        );
      }

      return this.responseService.createSuccessResponse(
        'Wishlist priority updated successfully',
        updated
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to update wishlist priority',
        'UPDATE_PRIORITY_FAILED',
        error
      );
    }
  }

  @Query('stats')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async getWishlistStats() {
    try {
      // Get total wishlist count
      const totalWishlists = await this.wishlistRepository.findAllWithFilters({
        limit: 1,
      });

      // Get public wishlist count
      const publicWishlists = await this.wishlistRepository.findPublicWishlists({
        limit: 1,
      });

      // Get popular products (most wished)
      const popularProducts = await this.wishlistRepository.findAllWithFilters({
        limit: 10,
      });

      // Calculate stats
      const stats = {
        totalWishlists: totalWishlists.total,
        publicWishlists: publicWishlists.total,
        privateWishlists: totalWishlists.total - publicWishlists.total,
        popularProducts: popularProducts.items.slice(0, 5).map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          wishCount: popularProducts.items.filter(wi => wi.product.id === item.product.id).length,
        })),
      };

      return this.responseService.createSuccessResponse(
        'Wishlist statistics retrieved successfully',
        stats
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to retrieve wishlist statistics',
        'STATS_FAILED',
        error
      );
    }
  }
}