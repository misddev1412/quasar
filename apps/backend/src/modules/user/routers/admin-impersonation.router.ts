import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { UserImpersonationService } from '../services/user-impersonation.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { SuperAdminMiddleware } from '../../../trpc/middlewares/super-admin.middleware';
import { ImpersonationStatus } from '../entities/user-impersonation-log.entity';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';

// Zod schemas for validation
const startImpersonationSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().optional(),
});

const endImpersonationSchema = z.object({
  originalAdminAccessToken: z.string(),
  originalAdminRefreshToken: z.string(),
});

const getImpersonationHistorySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  adminUserId: z.string().uuid().optional(),
  impersonatedUserId: z.string().uuid().optional(),
  status: z.enum([
    ImpersonationStatus.ACTIVE,
    ImpersonationStatus.ENDED,
    ImpersonationStatus.EXPIRED
  ]).optional(),
});

// Helper function to extract IP address from request
function extractIpAddress(req: AuthenticatedContext['req']): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress;
}

@Router({ alias: 'adminImpersonation' })
@Injectable()
export class AdminImpersonationRouter {
  constructor(
    @Inject(UserImpersonationService)
    private readonly impersonationService: UserImpersonationService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware,
    SuperAdminMiddleware
  )
  @Mutation({
    input: startImpersonationSchema,
    output: apiResponseSchema,
  })
  async startImpersonation(
    @Input() input: z.infer<typeof startImpersonationSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const sessionData = {
        ipAddress: extractIpAddress(ctx.req),
        userAgent: ctx.req.headers['user-agent'],
        reason: input.reason,
      };

      const result = await this.impersonationService.startImpersonation(
        ctx.user,
        input.userId,
        sessionData
      );

      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to start impersonation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: endImpersonationSchema,
    output: apiResponseSchema,
  })
  async endImpersonation(
    @Input() input: z.infer<typeof endImpersonationSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // Extract current session token from Authorization header
      const authHeader = ctx.req.headers.authorization;
      const currentSessionToken = authHeader?.replace('Bearer ', '') || '';

      if (!currentSessionToken) {
        throw new Error('No active session token found');
      }

      await this.impersonationService.endImpersonation(
        currentSessionToken,
        {
          id: ctx.user.id,
          accessToken: input.originalAdminAccessToken,
          refreshToken: input.originalAdminRefreshToken,
        }
      );

      return this.responseHandler.createTrpcSuccess({ ended: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to end impersonation'
      );
    }
  }

  @UseMiddlewares(
    AuthMiddleware,
    AdminRoleMiddleware
  )
  @Query({
    input: getImpersonationHistorySchema,
    output: paginatedResponseSchema,
  })
  async getImpersonationHistory(
    @Input() input: z.infer<typeof getImpersonationHistorySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.impersonationService.getImpersonationHistory(input);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to retrieve impersonation history'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getCurrentImpersonationStatus(
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // Extract current session token from Authorization header
      const authHeader = ctx.req.headers.authorization;
      const sessionToken = authHeader?.replace('Bearer ', '') || '';

      if (!sessionToken) {
        return this.responseHandler.createTrpcSuccess({
          isImpersonating: false,
          impersonationLog: null,
        });
      }

      const result = await this.impersonationService.getCurrentImpersonationStatus(
        sessionToken
      );

      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to get impersonation status'
      );
    }
  }
}
