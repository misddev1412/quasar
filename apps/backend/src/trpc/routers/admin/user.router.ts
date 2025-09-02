import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminUserService } from '../../../modules/user/services/admin/admin-user.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../middlewares/admin-role.middleware';
import { UserRole } from '@shared';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { apiResponseSchema, paginatedResponseSchema } from '../../schemas/response.schemas';
import { AuthenticatedContext } from '../../context';
import {
  AdminUpdatePasswordDto,
} from '@backend/modules/user/dto/admin/admin-user.dto';

// Zod schemas for validation
const userRoleSchema = z.enum([
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.USER,
  UserRole.GUEST
]);

const adminCreateUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
  isActive: z.boolean().optional(),
  role: userRoleSchema.optional(),
});

const adminUpdateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().optional(),
  isActive: z.boolean().optional(),
  role: userRoleSchema.optional(),
});

const adminUpdateUserProfileSchema = z.object({
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

const adminUpdatePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
});

const userProfileSchema = z.object({
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

const adminUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  isActive: z.boolean(),
  role: userRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  profile: userProfileSchema.optional(),
});

const getAllUsersQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

const getUsersResponseSchema = z.object({
  users: z.array(adminUserResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

@Router({ alias: 'adminUser' })
@Injectable()
export class AdminUserRouter {
  constructor(
    @Inject(AdminUserService)
    private readonly adminUserService: AdminUserService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: adminCreateUserSchema,
    output: apiResponseSchema,
  })
  async createUser(
    @Input() createUserDto: z.infer<typeof adminCreateUserSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // Ensure required fields are present for AdminCreateUserDto
      const adminCreateDto = {
        email: createUserDto.email,
        username: createUserDto.username,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        password: createUserDto.password,
        phoneNumber: createUserDto.phoneNumber,
        isActive: createUserDto.isActive,
        role: createUserDto.role,
      };

      const user = await this.adminUserService.createUser(adminCreateDto);
      return this.responseHandler.createTrpcSuccess(user);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create user'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getAllUsersQuerySchema,
    output: paginatedResponseSchema,
  })
  async getAllUsers(
    @Input() query: z.infer<typeof getAllUsersQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      // Ensure required fields are present for AdminUserFilters
      const filters = {
        page: query.page || 1,
        limit: query.limit || 10,
        search: query.search,
        role: query.role,
        isActive: query.isActive,
      };

      const result = await this.adminUserService.getAllUsers(filters);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve users'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async getUserById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const user = await this.adminUserService.getUserById(input.id);
      return this.responseHandler.createTrpcSuccess(user);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'User not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(adminUpdateUserSchema),
    output: apiResponseSchema,
  })
  async updateUser(
    @Input() input: { id: string } & z.infer<typeof adminUpdateUserSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateDto } = input;
      const user = await this.adminUserService.updateUser(id, updateDto);
      return this.responseHandler.createTrpcSuccess(user);
    } catch (error: any) {
      const message = error?.message || error?.error?.message || 'Failed to update user';
      const level = error?.error?.code === 409 ? ErrorLevelCode.CONFLICT : ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        3,  // OperationCode.UPDATE
        level,
        message
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async deleteUser(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.adminUserService.deleteUser(input.id);
      return this.responseHandler.createTrpcResponse(
        200,
        'OK',
        { deleted: true }
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete user'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      id: z.string(),
      isActive: z.boolean(),
    }),
    output: apiResponseSchema,
  })
  async updateUserStatus(
    @Input() input: { id: string; isActive: boolean }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const user = await this.adminUserService.updateUserStatus(input.id, input.isActive);
      return this.responseHandler.createTrpcSuccess(user);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update user status'
      );
    }
  }

  // Admin-only: update any user's profile by ID
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(adminUpdateUserProfileSchema),
    output: apiResponseSchema,
  })
  async updateUserProfileById(
    @Input() input: { id: string } & z.infer<typeof adminUpdateUserProfileSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateDto } = input;
      const updatedUser = await this.adminUserService.updateUserProfile(id, updateDto);
      return this.responseHandler.createTrpcSuccess(updatedUser);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        (error as any)?.message || 'Failed to update user profile'
      );
    }
  }


  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getProfile(
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const userProfile = await this.adminUserService.getUserById(ctx.user.id);
      return this.responseHandler.createTrpcSuccess(userProfile);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND,
        error.message || 'User profile not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: adminUpdateUserProfileSchema,
    output: apiResponseSchema,
  })
  async updateProfile(
    @Ctx() ctx: AuthenticatedContext,
    @Input() updateDto: z.infer<typeof adminUpdateUserProfileSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const updatedUser = await this.adminUserService.updateUserProfile(ctx.user.id, updateDto);
      return this.responseHandler.createTrpcSuccess(updatedUser);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to update user profile'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: adminUpdatePasswordSchema,
    output: apiResponseSchema,
  })
  async updatePassword(
    @Ctx() ctx: AuthenticatedContext,
    @Input() updateDto: AdminUpdatePasswordDto
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.adminUserService.updateUserPassword(
        ctx.user.id,
        updateDto.oldPassword,
        updateDto.newPassword,
      );
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10,
        3,
        30,
        error.message || 'Failed to update password'
      );
    }
  }
}