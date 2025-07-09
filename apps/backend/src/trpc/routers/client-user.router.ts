import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ClientUserService } from '../../modules/user/services/client/client-user.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UserInjectionMiddleware } from '../middlewares/user-injection.middleware';
import { UserRole } from '@shared';
import { apiResponseSchema } from '../schemas/response.schemas';
import { AuthenticatedContext } from '../context';

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



@Router({ alias: 'clientUser' })
@Injectable()
export class ClientUserRouter {
  constructor(
    @Inject(ClientUserService)
    private readonly clientUserService: ClientUserService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
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
    @Input() userId: string
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.clientUserService.updateProfile(
        userId,
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

  @Mutation({
    input: refreshTokenSchema,
    output: apiResponseSchema,
  })
  async refreshToken(
    @Input() input: z.infer<typeof refreshTokenSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.clientUserService.refreshToken(input.refreshToken);
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
} 