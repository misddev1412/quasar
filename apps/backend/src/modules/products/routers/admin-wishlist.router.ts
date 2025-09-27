import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { WishlistRepository } from '../repositories/wishlist.repository';
import { CustomerRepository } from '../repositories/customer.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { UserInjectionMiddleware } from '../../../trpc/middlewares/user-injection.middleware';
import { UserRole } from '@shared';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';

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

const adminWishlistResponseSchema = apiResponseSchema;
const adminPaginatedWishlistResponseSchema = apiResponseSchema;

@Router({ alias: 'adminWishlist' })
@Injectable()
export class AdminWishlistRouter {
  constructor(
    @Inject(WishlistRepository)
    private readonly wishlistRepository: WishlistRepository,
    @Inject(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @Inject(ProductRepository)
    private readonly productRepository: ProductRepository,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  @Query({
    input: adminWishlistFiltersSchema,
    output: adminPaginatedWishlistResponseSchema,
  })
  async list(
    @Input() input: z.infer<typeof adminWishlistFiltersSchema>
  ): Promise<z.infer<typeof adminPaginatedWishlistResponseSchema>> {
    try {
      const result = await this.wishlistRepository.findAllWithFilters(input);

      return this.responseService.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseService.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve wishlists'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  @Query({
    input: z.object({ id: z.string() }),
    output: adminWishlistResponseSchema,
  })
  async detail(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof adminWishlistResponseSchema>> {
    try {
      const wishlist = await this.wishlistRepository.findById(input.id);
      if (!wishlist) {
        throw this.responseService.createTRPCError(
          15, // ModuleCode.PRODUCT
          2,  // OperationCode.READ
          4,  // ErrorLevelCode.NOT_FOUND
          'Wishlist not found'
        );
      }

      return this.responseService.createTrpcSuccess(wishlist);
    } catch (error) {
      throw this.responseService.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve wishlist'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  @Mutation({
    input: adminCreateWishlistSchema,
    output: adminWishlistResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof adminCreateWishlistSchema>
  ): Promise<z.infer<typeof adminWishlistResponseSchema>> {
    try {
      // Verify customer exists
      const customer = await this.customerRepository.findById(input.customerId);
      if (!customer) {
        throw this.responseService.createTRPCError(
          15, // ModuleCode.PRODUCT
          1,  // OperationCode.CREATE
          4,  // ErrorLevelCode.NOT_FOUND
          'Customer not found'
        );
      }

      // Verify product exists
      const product = await this.productRepository.findById(input.productId);
      if (!product) {
        throw this.responseService.createTRPCError(
          15, // ModuleCode.PRODUCT
          1,  // OperationCode.CREATE
          4,  // ErrorLevelCode.NOT_FOUND
          'Product not found'
        );
      }

      // Check if already in wishlist
      const existing = await this.wishlistRepository.findByCustomerAndProduct(
        input.customerId,
        input.productId
      );
      if (existing) {
        throw this.responseService.createTRPCError(
          15, // ModuleCode.PRODUCT
          1,  // OperationCode.CREATE
          30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
          'Product already in wishlist for this customer'
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

      return this.responseService.createTrpcSuccess(wishlistItem);
    } catch (error) {
      throw this.responseService.createTRPCError(
        15, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create wishlist'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  @Mutation({
    input: z.object({ id: z.string(), data: adminUpdateWishlistSchema }),
    output: adminWishlistResponseSchema,
  })
  async update(
    @Input() input: { id: string; data: z.infer<typeof adminUpdateWishlistSchema> }
  ): Promise<z.infer<typeof adminWishlistResponseSchema>> {
    try {
      const existing = await this.wishlistRepository.findById(input.id);
      if (!existing) {
        throw this.responseService.createTRPCError(
          15, // ModuleCode.PRODUCT
          3,  // OperationCode.UPDATE
          4,  // ErrorLevelCode.NOT_FOUND
          'Wishlist not found'
        );
      }

      const updated = await this.wishlistRepository.update(input.id, input.data);
      if (!updated) {
        throw this.responseService.createTRPCError(
          15, // ModuleCode.PRODUCT
          3,  // OperationCode.UPDATE
          30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
          'Failed to update wishlist'
        );
      }

      return this.responseService.createTrpcSuccess(updated);
    } catch (error) {
      throw this.responseService.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update wishlist'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const success = await this.wishlistRepository.delete(input.id);
      if (!success) {
        throw this.responseService.createTRPCError(
          15, // ModuleCode.PRODUCT
          4,  // OperationCode.DELETE
          4,  // ErrorLevelCode.NOT_FOUND
          'Wishlist not found'
        );
      }

      return this.responseService.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseService.createTRPCError(
        15, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete wishlist'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  @Mutation({
    input: z.object({ id: z.string(), priority: z.number().min(0).max(10) }),
    output: adminWishlistResponseSchema,
  })
  async updatePriority(
    @Input() input: { id: string; priority: number }
  ): Promise<z.infer<typeof adminWishlistResponseSchema>> {
    try {
      const updated = await this.wishlistRepository.updatePriority(input.id, input.priority);
      if (!updated) {
        throw this.responseService.createTRPCError(
          15, // ModuleCode.PRODUCT
          3,  // OperationCode.UPDATE
          4,  // ErrorLevelCode.NOT_FOUND
          'Wishlist not found'
        );
      }

      return this.responseService.createTrpcSuccess(updated);
    } catch (error) {
      throw this.responseService.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update wishlist priority'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async stats(): Promise<z.infer<typeof apiResponseSchema>> {
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

      return this.responseService.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseService.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve wishlist statistics'
      );
    }
  }
}