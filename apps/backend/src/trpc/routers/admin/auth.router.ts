import { Inject, Injectable } from '@nestjs/common';
import { Router, Mutation, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { AuthService } from '../../../auth/auth.service';
import { UserRepository } from '../../../modules/user/repositories/user.repository';
import { ResponseService } from '../../../modules/shared/services/response.service';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { UserRole } from '@shared';

// Zod schemas for validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

@Router({ alias: 'adminAuth' })
@Injectable()
export class AdminAuthRouter {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @Mutation({
    input: loginSchema,
    output: apiResponseSchema
  })
  async login(
    @Input() input: z.infer<typeof loginSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // Validate user credentials
      const user = await this.authService.validateUser(input.email, input.password);
      
      if (!user) {
        throw this.responseHandler.createTRPCError(
          20, // ModuleCode.AUTH
          1,  // OperationCode.LOGIN
          ErrorLevelCode.AUTHORIZATION,
          'Invalid email or password'
        );
      }

      // Check if the user has admin role
      const userWithRoles = await this.userRepository.findWithRoles(user.id);
      const hasAdminRole = userWithRoles?.userRoles?.some(ur => 
        ur.isActive && [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(ur.role?.code as UserRole)
      );

      if (!hasAdminRole) {
        throw this.responseHandler.createTRPCError(
          20, // ModuleCode.AUTH
          1,  // OperationCode.LOGIN
          ErrorLevelCode.FORBIDDEN,
          'You do not have admin access'
        );
      }

      // Generate tokens
      const tokens = await this.authService.login(user);
      
      return this.responseHandler.createTrpcResponse(
        200,
        'Login successful',
        {
          user: {
            id: user.id,
            email: user.email,
            username: user.username
          },
          ...tokens
        }
      );
    } catch (error) {
      if (error.code) {
        throw error; // If it's already a TRPC error
      }
      
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.AUTH
        1,  // OperationCode.LOGIN
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Login failed'
      );
    }
  }

  @Mutation({
    input: z.object({ refreshToken: z.string() }),
    output: apiResponseSchema
  })
  async refresh(
    @Input() input: { refreshToken: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const tokens = await this.authService.refreshToken(input.refreshToken);
      
      return this.responseHandler.createTrpcResponse(
        200,
        'Token refreshed successfully',
        tokens
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.AUTH
        5,  // OperationCode.REFRESH
        ErrorLevelCode.AUTHORIZATION,
        error.message || 'Failed to refresh token'
      );
    }
  }
} 