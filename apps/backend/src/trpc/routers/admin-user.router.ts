import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminUserService } from '../../modules/user/services/admin/admin-user.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../middlewares/admin-role.middleware';
import { UserRole } from '@shared';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { apiResponseSchema, paginatedResponseSchema } from '../schemas/response.schemas';

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
      return this.responseHandler.createCreatedResponse(null, 'user', user);
    } catch (error) {
      throw this.responseHandler.createTRPCErrorWithCodes(
        null,
        null, 
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
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
      return this.responseHandler.createReadResponse(null, 'users', result);
    } catch (error) {
      throw this.responseHandler.createTRPCErrorWithCodes(
        null,
        null,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
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
      return this.responseHandler.createReadResponse(null, 'user', user);
    } catch (error) {
      throw this.responseHandler.createTRPCErrorWithCodes(
        null,
        null,
        ErrorLevelCode.NOT_FOUND,
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
      return this.responseHandler.createUpdatedResponse(null, 'user', user);
    } catch (error) {
      throw this.responseHandler.createTRPCErrorWithCodes(
        null,
        null,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to update user'
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
      return this.responseHandler.createDeletedResponse(null, 'user');
    } catch (error) {
      throw this.responseHandler.createTRPCErrorWithCodes(
        null,
        null,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
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
      return this.responseHandler.createUpdatedResponse(null, 'user status', user);
    } catch (error) {
      throw this.responseHandler.createTRPCErrorWithCodes(
        null,
        null,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to update user status'
      );
    }
  }
} 