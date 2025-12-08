import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminCustomerService } from '../services/admin-customer.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { Customer, CustomerStatus, CustomerType } from '../entities/customer.entity';

export const customerStatusSchema = z.nativeEnum(CustomerStatus);
export const customerTypeSchema = z.nativeEnum(CustomerType);

export const getCustomersQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: customerStatusSchema.optional(),
  type: customerTypeSchema.optional(),
  hasOrders: z.boolean().optional(),
  isVip: z.boolean().optional(),
});

const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export const createCustomerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  type: customerTypeSchema.optional(),
  status: customerStatusSchema.optional(),
  defaultBillingAddress: addressSchema.optional(),
  defaultShippingAddress: addressSchema.optional(),
  marketingConsent: z.boolean().optional(),
  newsletterSubscribed: z.boolean().optional(),
  customerTags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  referralSource: z.string().optional(),
  taxExempt: z.boolean().optional(),
  taxId: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  type: customerTypeSchema.optional(),
  status: customerStatusSchema.optional(),
  defaultBillingAddress: addressSchema.optional(),
  defaultShippingAddress: addressSchema.optional(),
  marketingConsent: z.boolean().optional(),
  newsletterSubscribed: z.boolean().optional(),
  customerTags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  referralSource: z.string().optional(),
  taxExempt: z.boolean().optional(),
  taxId: z.string().optional(),
});

@Router({ alias: 'adminCustomers' })
@Injectable()
export class AdminCustomersRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminCustomerService)
    private readonly customerService: AdminCustomerService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getCustomersQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getCustomersQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const filters = {
        page: query.page,
        limit: query.limit,
        search: query.search,
        status: query.status,
        type: query.type,
        hasOrders: query.hasOrders,
        isVip: query.isVip,
      };

      const result = await this.customerService.getAllCustomers(filters);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve customers'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async detail(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const customer = await this.customerService.getCustomerById(input.id);
      return this.responseHandler.createTrpcSuccess(customer);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Customer not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createCustomerSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createCustomerSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const customerData = {
        ...input,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      } as Partial<Customer>;
      const customer = await this.customerService.createCustomer(customerData);
      return this.responseHandler.createTrpcSuccess(customer);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create customer'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updateCustomerSchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateCustomerSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateDto } = input;
      const customerData = {
        ...updateDto,
        dateOfBirth: updateDto.dateOfBirth ? new Date(updateDto.dateOfBirth) : undefined,
      } as Partial<Customer>;
      const customer = await this.customerService.updateCustomer(id, customerData);
      return this.responseHandler.createTrpcSuccess(customer);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update customer'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.customerService.deleteCustomer(input.id);
      return this.responseHandler.createTrpcResponse(
        200,
        'OK',
        { deleted: true }
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete customer'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async stats(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.customerService.getCustomerStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve customer statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      id: z.string(),
      status: customerStatusSchema,
    }),
    output: apiResponseSchema,
  })
  async updateStatus(
    @Input() input: { id: string; status: CustomerStatus }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const customer = await this.customerService.updateCustomerStatus(input.id, input.status);
      return this.responseHandler.createTrpcSuccess(customer);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update customer status'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      search: z.string().min(1),
      limit: z.number().min(1).max(50).default(20),
    }),
    output: apiResponseSchema,
  })
  async search(
    @Input() input: { search: string; limit?: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const customers = await this.customerService.searchCustomers(input.search, input.limit);
      return this.responseHandler.createTrpcSuccess(customers);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to search customers'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      limit: z.number().min(1).max(50).default(10),
    }),
    output: apiResponseSchema,
  })
  async topCustomers(
    @Input() input: { limit?: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const customers = await this.customerService.getTopCustomers(input.limit);
      return this.responseHandler.createTrpcSuccess(customers);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve top customers'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      limit: z.number().min(1).max(50).default(10),
    }),
    output: apiResponseSchema,
  })
  async recentCustomers(
    @Input() input: { limit?: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const customers = await this.customerService.getRecentCustomers(input.limit);
      return this.responseHandler.createTrpcSuccess(customers);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve recent customers'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      daysSinceLastOrder: z.number().min(1).default(90),
    }),
    output: apiResponseSchema,
  })
  async inactiveCustomers(
    @Input() input: { daysSinceLastOrder?: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const customers = await this.customerService.getInactiveCustomers(input.daysSinceLastOrder);
      return this.responseHandler.createTrpcSuccess(customers);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve inactive customers'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      tag: z.string().min(1),
    }),
    output: apiResponseSchema,
  })
  async customersByTag(
    @Input() input: { tag: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const customers = await this.customerService.getCustomersByTag(input.tag);
      return this.responseHandler.createTrpcSuccess(customers);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve customers by tag'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      customerId: z.string(),
      points: z.number().min(1),
    }),
    output: apiResponseSchema,
  })
  async addLoyaltyPoints(
    @Input() input: { customerId: string; points: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.customerService.addLoyaltyPoints(input.customerId, input.points);
      return this.responseHandler.createTrpcSuccess({ message: 'Loyalty points added successfully' });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to add loyalty points'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      customerId: z.string(),
      points: z.number().min(1),
    }),
    output: apiResponseSchema,
  })
  async redeemLoyaltyPoints(
    @Input() input: { customerId: string; points: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const success = await this.customerService.redeemLoyaltyPoints(input.customerId, input.points);
      if (success) {
        return this.responseHandler.createTrpcSuccess({ message: 'Loyalty points redeemed successfully' });
      } else {
        throw this.responseHandler.createTRPCError(
          10, // ModuleCode.USER (using USER for customer management)
          3,  // OperationCode.UPDATE
          30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
          'Insufficient loyalty points'
        );
      }
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to redeem loyalty points'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      customerIds: z.array(z.string()).min(1),
      status: customerStatusSchema,
    }),
    output: apiResponseSchema,
  })
  async bulkUpdateStatus(
    @Input() input: { customerIds: string[]; status: CustomerStatus }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.customerService.bulkUpdateStatus(input.customerIds, input.status);
      return this.responseHandler.createTrpcSuccess({
        message: `Successfully updated ${input.customerIds.length} customers`
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER (using USER for customer management)
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to bulk update customer status'
      );
    }
  }
}