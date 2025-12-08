import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ClientUserService } from '../../../modules/user/services/client/client-user.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { UserInjectionMiddleware } from '../../middlewares/user-injection.middleware';
import { UserRole } from '@shared';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { AuthenticatedContext } from '../../context';
import { CustomerRepository } from '../../../modules/products/repositories/customer.repository';

// Zod schemas for validation
const clientRegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
});

const clientLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const clientUpdateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const updateAvatarSchema = z.object({
  avatar: z.string().url().nullable(),
});

const clientUserProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const clientUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  profile: clientUserProfileSchema.optional(),
});

const clientAuthResponseSchema = z.object({
  user: clientUserResponseSchema,
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

// Loyalty system schemas
const loyaltyBalanceSchema = z.object({
  currentPoints: z.number(),
  lifetimePoints: z.number(),
  tier: z.string().optional(),
  nextTier: z.string().optional(),
  pointsToNextTier: z.number().optional(),
});

const loyaltyTransactionSchema = z.object({
  id: z.string(),
  points: z.number(),
  type: z.enum(['earned', 'redeemed', 'expired', 'adjusted']),
  description: z.string(),
  orderId: z.string().optional(),
  createdAt: z.date(),
  expiresAt: z.date().optional(),
});

const loyaltyRedeemSchema = z.object({
  points: z.number().positive(),
  description: z.string().min(1),
});



@Router({ alias: 'clientUser' })
@Injectable()
export class ClientUserRouter {
  constructor(
    @Inject(ClientUserService)
    private readonly clientUserService: ClientUserService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
  ) {}

  @Mutation({
    input: clientRegisterSchema,
    output: apiResponseSchema,
  })
  async register(
    @Input() registerDto: z.infer<typeof clientRegisterSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // Ensure required fields are present for ClientRegisterDto
      const clientRegisterDto = {
        email: registerDto.email,
        username: registerDto.username,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        password: registerDto.password,
        phoneNumber: registerDto.phoneNumber,
      };
      
      const result = await this.clientUserService.register(clientRegisterDto);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        6,  // OperationCode.REGISTER
        1,  // ErrorLevelCode.VALIDATION
        error.message || 'Failed to register user'
      );
    }
  }

  @Mutation({
    input: clientLoginSchema,
    output: apiResponseSchema,
  })
  async login(
    @Input() loginDto: z.infer<typeof clientLoginSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // Ensure required fields are present for ClientLoginDto
      const clientLoginDto = {
        email: loginDto.email,
        password: loginDto.password,
      };
      
      const result = await this.clientUserService.login(clientLoginDto);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      // Use proper error codes for consistent formatting
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        5,  // OperationCode.LOGIN
        41, // ErrorLevelCode.AUTHENTICATION_ERROR
        error.message || 'Login failed'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getProfile(
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const profile = await this.clientUserService.getProfile(user.id);
      return this.responseHandler.createTrpcSuccess(profile);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve profile'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  @Mutation({
    input: clientUpdateProfileSchema,
    output: apiResponseSchema,
  })
  async updateProfile(
    @Input() updateProfileDto: z.infer<typeof clientUpdateProfileSchema>,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const result = await this.clientUserService.updateProfile(
        user.id,
        updateProfileDto
      );
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update profile'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  @Mutation({
    input: updateAvatarSchema,
    output: apiResponseSchema,
  })
  async updateAvatar(
    @Input() avatarData: z.infer<typeof updateAvatarSchema>,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const result = await this.clientUserService.updateProfile(
        user.id,
        avatarData
      );
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update avatar'
      );
    }
  }

  @Mutation({
    input: refreshTokenSchema,
    output: apiResponseSchema,
  })
  async refreshToken(
    @Input() input: z.infer<typeof refreshTokenSchema>,
    @Ctx() ctx: any
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const sessionData = {
        ipAddress: ctx.req?.ip || ctx.req?.socket?.remoteAddress || 'unknown',
        userAgent: ctx.req?.headers['user-agent'] || 'unknown',
      };
      const result = await this.clientUserService.refreshToken(input.refreshToken, sessionData);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        11, // ModuleCode.AUTH
        7,  // OperationCode.REFRESH
        42, // ErrorLevelCode.TOKEN_ERROR
        error.message || 'Token refresh failed'
      );
    }
  }

  // Loyalty system endpoints
  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getLoyaltyBalance(
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const customer = await this.customerRepository.findByUserId(user.id);
      if (!customer) {
        throw new Error('Customer profile not found');
      }

      const loyaltyData = {
        currentPoints: customer.loyaltyPoints || 0,
        lifetimePoints: customer.totalSpent || 0, // Using totalSpent as lifetime points for now
        tier: this.getCustomerTier(customer.loyaltyPoints || 0),
        nextTier: this.getNextTier(customer.loyaltyPoints || 0),
        pointsToNextTier: this.getPointsToNextTier(customer.loyaltyPoints || 0),
      };

      return this.responseHandler.createTrpcSuccess(loyaltyData);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve loyalty balance'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getLoyaltyHistory(
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const customer = await this.customerRepository.findByUserId(user.id);
      if (!customer) {
        throw new Error('Customer profile not found');
      }

      // For now, return empty array until we implement loyalty transactions table
      const transactions = [];

      return this.responseHandler.createTrpcSuccess(transactions);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve loyalty history'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: loyaltyRedeemSchema,
    output: apiResponseSchema,
  })
  async redeemLoyaltyPoints(
    @Input() redeemData: z.infer<typeof loyaltyRedeemSchema>,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const customer = await this.customerRepository.findByUserId(user.id);
      if (!customer) {
        throw new Error('Customer profile not found');
      }

      const success = await this.customerRepository.redeemLoyaltyPoints(
        customer.id,
        redeemData.points
      );

      if (!success) {
        throw new Error('Insufficient loyalty points');
      }

      return this.responseHandler.createTrpcSuccess({
        message: `Successfully redeemed ${redeemData.points} points`,
        pointsRedeemed: redeemData.points,
        remainingPoints: (customer.loyaltyPoints || 0) - redeemData.points,
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to redeem loyalty points'
      );
    }
  }

  private getCustomerTier(points: number): string {
    if (points >= 1000) return 'Platinum';
    if (points >= 500) return 'Gold';
    if (points >= 200) return 'Silver';
    return 'Bronze';
  }

  private getNextTier(points: number): string | null {
    if (points < 200) return 'Silver';
    if (points < 500) return 'Gold';
    if (points < 1000) return 'Platinum';
    return null;
  }

  private getPointsToNextTier(points: number): number | null {
    if (points < 200) return 200 - points;
    if (points < 500) return 500 - points;
    if (points < 1000) return 1000 - points;
    return null;
  }
} 