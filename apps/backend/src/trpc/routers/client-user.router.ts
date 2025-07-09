import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ClientUserService } from '../../modules/user/services/client/client-user.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UserInjectionMiddleware } from '../middlewares/user-injection.middleware';
import { UserRole } from '@shared';
import { apiResponseSchema } from '../schemas/response.schemas';

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
      return this.responseHandler.createSuccessResponse(
        null,
        null,
        null,
        'User registered successfully',
        result
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        null,
        null,
        null,
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
      return this.responseHandler.createSuccessResponse(
        null,
        null,
        null,
        'User logged in successfully',
        result
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        null,
        null,
        null,
        error.message || 'Login failed'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, UserInjectionMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getProfile(
    @Input() userId: string
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.clientUserService.getProfile(userId);
      return this.responseHandler.createSuccessResponse(
        null,
        null,
        null,
        'Profile retrieved successfully',
        result
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        null,
        null,
        null,
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
      return this.responseHandler.createSuccessResponse(
        null,
        null,
        null,
        'Profile updated successfully',
        result
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        null,
        null,
        null,
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
      return this.responseHandler.createSuccessResponse(
        null,
        null,
        null,
        'Token refreshed successfully',
        result
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        null,
        null,
        null,
        error.message || 'Token refresh failed'
      );
    }
  }
} 