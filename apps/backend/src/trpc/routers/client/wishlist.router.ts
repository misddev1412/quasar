import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { WishlistRepository } from '../../../modules/products/repositories/wishlist.repository';
import { CustomerRepository } from '../../../modules/products/repositories/customer.repository';
import { ProductRepository } from '../../../modules/products/repositories/product.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { UserInjectionMiddleware } from '../../middlewares/user-injection.middleware';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { AuthenticatedContext } from '../../context';

// Zod schemas for validation
const createWishlistSchema = z.object({
  productId: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  priority: z.number().min(0).max(10).default(0),
  notes: z.string().optional(),
  isPublic: z.boolean().default(false),
});

const updateWishlistSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
});

const wishlistFiltersSchema = z.object({
  isPublic: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
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
  }).optional(),
  product: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.number(),
    sku: z.string().nullable(),
    images: z.array(z.string()).optional(),
  }).optional(),
});

const paginatedWishlistSchema = z.object({
  items: z.array(wishlistItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

const wishlistResponseSchema = apiResponseSchema(wishlistItemSchema);
const paginatedWishlistResponseSchema = apiResponseSchema(paginatedWishlistSchema);

@Injectable()
@Router('client.wishlist')
export class WishlistClientRouter {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly productRepository: ProductRepository,
    private readonly responseService: ResponseService,
  ) {}

  @Mutation('add')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async addToWishlist(
    @Input() input: typeof createWishlistSchema,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const user = ctx.user;
      if (!user) {
        return this.responseService.createErrorResponse(
          'User not authenticated',
          'UNAUTHORIZED'
        );
      }

      // Find customer by user ID
      const customer = await this.customerRepository.findByUserId(user.id);
      if (!customer) {
        return this.responseService.createErrorResponse(
          'Customer profile not found',
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
        customer.id,
        input.productId
      );
      if (existing) {
        return this.responseService.createErrorResponse(
          'Product already in wishlist',
          'ALREADY_IN_WISHLIST'
        );
      }

      // Create wishlist item
      const wishlistItem = await this.wishlistRepository.create({
        customerId: customer.id,
        productId: input.productId,
        name: input.name,
        description: input.description,
        priority: input.priority,
        notes: input.notes,
        isPublic: input.isPublic,
      });

      return this.responseService.createSuccessResponse(
        'Product added to wishlist successfully',
        wishlistItem
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to add product to wishlist',
        'ADD_FAILED',
        error
      );
    }
  }

  @Mutation('remove')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async removeFromWishlist(
    @Input() input: z.object({ productId: z.string() }),
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const user = ctx.user;
      if (!user) {
        return this.responseService.createErrorResponse(
          'User not authenticated',
          'UNAUTHORIZED'
        );
      }

      // Find customer by user ID
      const customer = await this.customerRepository.findByUserId(user.id);
      if (!customer) {
        return this.responseService.createErrorResponse(
          'Customer profile not found',
          'CUSTOMER_NOT_FOUND'
        );
      }

      // Remove from wishlist
      const success = await this.wishlistRepository.deleteByCustomerAndProduct(
        customer.id,
        input.productId
      );

      if (!success) {
        return this.responseService.createErrorResponse(
          'Product not found in wishlist',
          'NOT_FOUND'
        );
      }

      return this.responseService.createSuccessResponse(
        'Product removed from wishlist successfully'
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to remove product from wishlist',
        'REMOVE_FAILED',
        error
      );
    }
  }

  @Mutation('update')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async updateWishlistItem(
    @Input() input: z.object({ id: z.string(), data: updateWishlistSchema }),
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const user = ctx.user;
      if (!user) {
        return this.responseService.createErrorResponse(
          'User not authenticated',
          'UNAUTHORIZED'
        );
      }

      // Find customer by user ID
      const customer = await this.customerRepository.findByUserId(user.id);
      if (!customer) {
        return this.responseService.createErrorResponse(
          'Customer profile not found',
          'CUSTOMER_NOT_FOUND'
        );
      }

      // Verify ownership
      const wishlistItem = await this.wishlistRepository.findById(input.id);
      if (!wishlistItem || wishlistItem.customerId !== customer.id) {
        return this.responseService.createErrorResponse(
          'Wishlist item not found or access denied',
          'NOT_FOUND'
        );
      }

      // Update wishlist item
      const updated = await this.wishlistRepository.update(input.id, input.data);
      if (!updated) {
        return this.responseService.createErrorResponse(
          'Failed to update wishlist item',
          'UPDATE_FAILED'
        );
      }

      return this.responseService.createSuccessResponse(
        'Wishlist item updated successfully',
        updated
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to update wishlist item',
        'UPDATE_FAILED',
        error
      );
    }
  }

  @Query('my')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async getMyWishlist(
    @Input() input: wishlistFiltersSchema,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const user = ctx.user;
      if (!user) {
        return this.responseService.createErrorResponse(
          'User not authenticated',
          'UNAUTHORIZED'
        );
      }

      // Find customer by user ID
      const customer = await this.customerRepository.findByUserId(user.id);
      if (!customer) {
        return this.responseService.createErrorResponse(
          'Customer profile not found',
          'CUSTOMER_NOT_FOUND'
        );
      }

      // Get wishlist items
      const result = await this.wishlistRepository.findByCustomer(customer.id, {
        isPublic: input.isPublic,
        search: input.search,
      });

      return this.responseService.createSuccessResponse(
        'Wishlist retrieved successfully',
        result
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to retrieve wishlist',
        'RETRIEVE_FAILED',
        error
      );
    }
  }

  @Query('public')
  async getPublicWishlists(@Input() input: wishlistFiltersSchema) {
    try {
      const result = await this.wishlistRepository.findPublicWishlists({
        search: input.search,
        page: input.page,
        limit: input.limit,
      });

      return this.responseService.createSuccessResponse(
        'Public wishlists retrieved successfully',
        result
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to retrieve public wishlists',
        'RETRIEVE_FAILED',
        error
      );
    }
  }

  @Query('exists')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async checkWishlistExists(
    @Input() input: z.object({ productId: z.string() }),
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const user = ctx.user;
      if (!user) {
        return this.responseService.createErrorResponse(
          'User not authenticated',
          'UNAUTHORIZED'
        );
      }

      // Find customer by user ID
      const customer = await this.customerRepository.findByUserId(user.id);
      if (!customer) {
        return this.responseService.createErrorResponse(
          'Customer profile not found',
          'CUSTOMER_NOT_FOUND'
        );
      }

      const exists = await this.wishlistRepository.exists(
        customer.id,
        input.productId
      );

      return this.responseService.createSuccessResponse(
        'Wishlist existence checked successfully',
        { exists }
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to check wishlist existence',
        'CHECK_FAILED',
        error
      );
    }
  }

  @Query('count')
  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  async getWishlistCount(@Ctx() ctx: AuthenticatedContext) {
    try {
      const user = ctx.user;
      if (!user) {
        return this.responseService.createErrorResponse(
          'User not authenticated',
          'UNAUTHORIZED'
        );
      }

      // Find customer by user ID
      const customer = await this.customerRepository.findByUserId(user.id);
      if (!customer) {
        return this.responseService.createErrorResponse(
          'Customer profile not found',
          'CUSTOMER_NOT_FOUND'
        );
      }

      const count = await this.wishlistRepository.countByCustomer(customer.id);

      return this.responseService.createSuccessResponse(
        'Wishlist count retrieved successfully',
        { count }
      );
    } catch (error) {
      return this.responseService.createErrorResponse(
        'Failed to retrieve wishlist count',
        'COUNT_FAILED',
        error
      );
    }
  }
}