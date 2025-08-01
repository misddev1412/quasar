import { Inject, Injectable } from '@nestjs/common';
import { Router, Mutation, Query, Input, UseMiddlewares, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { AuthService } from '../../../auth/auth.service';
import { UserRepository } from '../../../modules/user/repositories/user.repository';
import { ResponseService } from '../../../modules/shared/services/response.service';
import { ActivityTrackingService } from '../../../modules/user/services/activity-tracking.service';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { UserRole } from '@shared';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { AuthenticatedContext } from '../../context';
import { ActivityType } from '../../../modules/user/entities/user-activity.entity';

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
    @Inject(ActivityTrackingService)
    private readonly activityTrackingService: ActivityTrackingService,
  ) {}

  @Mutation({
    input: loginSchema,
    output: apiResponseSchema
  })
  async login(
    @Input() input: z.infer<typeof loginSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    const startTime = Date.now();
    const activityContext = this.extractActivityContext(ctx, startTime);

    try {
      // Validate user credentials
      const user = await this.authService.validateUser(input.email, input.password);

      if (!user) {
        // Track failed login attempt
        await this.trackFailedLogin(activityContext, input.email, 'Invalid credentials');

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
        // Track failed admin access attempt
        await this.trackFailedLogin(activityContext, input.email, 'No admin access');

        throw this.responseHandler.createTRPCError(
          20, // ModuleCode.AUTH
          1,  // OperationCode.LOGIN
          ErrorLevelCode.FORBIDDEN,
          'You do not have admin access'
        );
      }

      // Generate tokens with session data
      const sessionData = {
        ipAddress: activityContext.ipAddress,
        userAgent: activityContext.userAgent,
        isRememberMe: false, // Could be extended to support remember me
      };

      const tokens = await this.authService.login(user, sessionData);

      // Track successful admin login
      await this.trackSuccessfulLogin(activityContext, user);

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
      // Track failed login if not already tracked
      if (!error.code) {
        await this.trackFailedLogin(activityContext, input.email, error.message || 'Server error');
      }

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

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: apiResponseSchema
  })
  async me(
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // Get user from database to ensure they still exist and are active
      const user = await this.userRepository.findById(ctx.user.id);
      if (!user || !user.isActive) {
        throw this.responseHandler.createTRPCError(
          20, // ModuleCode.AUTH
          3,  // OperationCode.VERIFY
          ErrorLevelCode.AUTHORIZATION,
          'User not found or inactive'
        );
      }

      // Check if the user still has admin role
      const userWithRoles = await this.userRepository.findWithRoles(user.id);
      const hasAdminRole = userWithRoles?.userRoles?.some(ur =>
        ur.isActive && [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(ur.role?.code as UserRole)
      );

      if (!hasAdminRole) {
        throw this.responseHandler.createTRPCError(
          20, // ModuleCode.AUTH
          3,  // OperationCode.VERIFY
          ErrorLevelCode.FORBIDDEN,
          'Admin access revoked'
        );
      }

      // Return basic user info
      return this.responseHandler.createTrpcResponse(
        200,
        'User authenticated',
        {
          id: user.id,
          email: user.email,
          username: user.username,
          role: ctx.user.role,
          isActive: user.isActive
        }
      );
    } catch (error) {
      if (error.code) {
        throw error; // If it's already a TRPC error
      }

      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.AUTH
        3,  // OperationCode.VERIFY
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Authentication verification failed'
      );
    }
  }

  /**
   * Extract activity context from TRPC context
   */
  private extractActivityContext(ctx: AuthenticatedContext, startTime: number) {
    return {
      userId: 'unknown', // Will be set after authentication
      sessionId: undefined,
      ipAddress: this.extractIpAddress(ctx.req),
      userAgent: ctx.req.headers['user-agent'] || 'unknown',
      startTime,
      endTime: 0, // Will be set when activity is tracked
      request: {
        path: '/admin/auth/login',
        method: 'POST',
      },
      response: undefined,
    };
  }

  /**
   * Extract IP address from request
   */
  private extractIpAddress(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.headers['x-client-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  /**
   * Track successful admin login
   */
  private async trackSuccessfulLogin(context: any, user: any): Promise<void> {
    try {
      const endTime = Date.now();
      const activityContext = {
        ...context,
        userId: user.id,
        endTime,
        response: { statusCode: 200 },
      };

      await this.activityTrackingService.trackAdminLogin(activityContext);
    } catch (error) {
      // Don't fail login if activity tracking fails
      console.error('Failed to track admin login:', error);
    }
  }

  /**
   * Track failed login attempt
   */
  private async trackFailedLogin(context: any, email: string, reason: string): Promise<void> {
    try {
      const endTime = Date.now();
      const activityContext = {
        ...context,
        userId: 'unknown',
        endTime,
        response: { statusCode: 401 },
        metadata: {
          attemptedEmail: email,
          failureReason: reason,
        },
      };

      await this.activityTrackingService.trackActivity(
        ActivityType.LOGIN,
        activityContext,
        `Failed admin login attempt: ${reason}`,
        {
          action: 'admin_login_failed',
          resource: 'admin_auth',
        }
      );
    } catch (error) {
      // Don't fail the main operation if activity tracking fails
      console.error('Failed to track failed login:', error);
    }
  }
}