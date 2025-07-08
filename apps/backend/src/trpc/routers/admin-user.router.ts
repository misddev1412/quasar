import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminUserService } from '../../modules/admin/user/services/admin-user.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../middlewares/admin-role.middleware';
import { UserRole } from '../../modules/user/entities/user.entity';

// Zod schemas for validation
const userRoleSchema = z.enum([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

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
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: adminCreateUserSchema,
    output: adminUserResponseSchema,
  })
  async createUser(
    @Input() createUserDto: z.infer<typeof adminCreateUserSchema>
  ): Promise<z.infer<typeof adminUserResponseSchema>> {
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
    return await this.adminUserService.createUser(adminCreateDto);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getAllUsersQuerySchema,
    output: getUsersResponseSchema,
  })
  async getAllUsers(
    @Input() query: z.infer<typeof getAllUsersQuerySchema>
  ): Promise<z.infer<typeof getUsersResponseSchema>> {
    // Ensure required fields are present for AdminUserFilters
    const filters = {
      page: query.page || 1,
      limit: query.limit || 10,
      search: query.search,
      role: query.role,
      isActive: query.isActive,
    };
    return await this.adminUserService.getAllUsers(filters);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string() }),
    output: adminUserResponseSchema,
  })
  async getUserById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof adminUserResponseSchema>> {
    return await this.adminUserService.getUserById(input.id);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(adminUpdateUserSchema),
    output: adminUserResponseSchema,
  })
  async updateUser(
    @Input() input: { id: string } & z.infer<typeof adminUpdateUserSchema>
  ): Promise<z.infer<typeof adminUserResponseSchema>> {
    const { id, ...updateDto } = input;
    return await this.adminUserService.updateUser(id, updateDto);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: z.void(),
  })
  async deleteUser(
    @Input() input: { id: string }
  ): Promise<void> {
    await this.adminUserService.deleteUser(input.id);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ 
      id: z.string(),
      isActive: z.boolean(),
    }),
    output: adminUserResponseSchema,
  })
  async updateUserStatus(
    @Input() input: { id: string; isActive: boolean }
  ): Promise<z.infer<typeof adminUserResponseSchema>> {
    return await this.adminUserService.updateUserStatus(input.id, input.isActive);
  }
} 