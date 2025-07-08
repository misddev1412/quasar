import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ClientUserService } from '../../modules/client/user/services/client-user.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';

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
  ) {}

  @Mutation({
    input: clientRegisterSchema,
    output: clientAuthResponseSchema,
  })
  async register(
    @Input() registerDto: z.infer<typeof clientRegisterSchema>
  ): Promise<z.infer<typeof clientAuthResponseSchema>> {
    // Ensure required fields are present for ClientRegisterDto
    const clientRegisterDto = {
      email: registerDto.email,
      username: registerDto.username,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: registerDto.password,
      phoneNumber: registerDto.phoneNumber,
    };
    return await this.clientUserService.register(clientRegisterDto);
  }

  @Mutation({
    input: clientLoginSchema,
    output: clientAuthResponseSchema,
  })
  async login(
    @Input() loginDto: z.infer<typeof clientLoginSchema>
  ): Promise<z.infer<typeof clientAuthResponseSchema>> {
    // Ensure required fields are present for ClientLoginDto
    const clientLoginDto = {
      email: loginDto.email,
      password: loginDto.password,
    };
    return await this.clientUserService.login(clientLoginDto);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: clientUserResponseSchema,
  })
  async getProfile(
    // Context would be injected here in a real nestjs-trpc setup
    // For now, we'll need to get the user ID from the request context
  ): Promise<z.infer<typeof clientUserResponseSchema>> {
    // This would typically get the user ID from the authenticated context
    // For now, we'll throw an error indicating this needs proper context implementation
    throw new Error('Profile endpoint requires authenticated context implementation');
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: clientUpdateProfileSchema,
    output: clientUserResponseSchema,
  })
  async updateProfile(
    @Input() updateProfileDto: z.infer<typeof clientUpdateProfileSchema>
  ): Promise<z.infer<typeof clientUserResponseSchema>> {
    // This would typically get the user ID from the authenticated context
    // For now, we'll throw an error indicating this needs proper context implementation
    throw new Error('Update profile endpoint requires authenticated context implementation');
  }

  @Mutation({
    input: refreshTokenSchema,
    output: clientAuthResponseSchema,
  })
  async refreshToken(
    @Input() input: z.infer<typeof refreshTokenSchema>
  ): Promise<z.infer<typeof clientAuthResponseSchema>> {
    return await this.clientUserService.refreshToken(input.refreshToken);
  }
} 