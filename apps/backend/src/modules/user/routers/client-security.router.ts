import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ClientSecurityService } from '../services/client-security.service';
import { ResponseService } from '../../shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { CustomerRepository } from '../../products/repositories/customer.repository';
import { ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';

// Zod schemas for validation
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const setup2FASchema = z.object({
  method: z.enum(['email', 'authenticator', 'sms']),
});

const verify2FASchema = z.object({
  method: z.enum(['email', 'authenticator', 'sms']),
  token: z.string().min(1),
});

const disable2FASchema = z.object({
  password: z.string().min(1),
});

const revokeSessionSchema = z.object({
  sessionId: z.string(),
});

const securityStatusResponseSchema = z.object({
  hasPassword: z.boolean(),
  hasTwoFactor: z.boolean(),
  twoFactorMethod: z.enum(['email', 'authenticator', 'sms']).nullable(),
  lastPasswordChange: z.date().nullable(),
  loginProviders: z.array(z.object({
    provider: z.string(),
    email: z.string(),
    lastLogin: z.date().nullable(),
  })),
});

const setup2FAResponseSchema = z.object({
  method: z.enum(['email', 'authenticator', 'sms']),
  qrCode: z.string().optional(),
  secret: z.string().optional(),
  backupCodes: z.array(z.string()),
  instructions: z.string(),
});

@Router({ alias: 'clientSecurity' })
@Injectable()
export class ClientSecurityRouter {
  constructor(
    @Inject(ClientSecurityService)
    private readonly securityService: ClientSecurityService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
  ) {}

  private async getCustomerId(userId: string): Promise<string> {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new Error('Customer profile not found');
    }
    return customer.id;
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: securityStatusResponseSchema,
  })
  async getSecurityStatus(
    @Ctx() { user }: AuthenticatedContext
  ): Promise<any> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const customerId = await this.getCustomerId(user.id);
      const securityStatus = await this.securityService.getSecurityStatus(user.id, customerId);

      return securityStatus;
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.USER,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        error.message || 'Failed to retrieve security status'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: changePasswordSchema,
    output: apiResponseSchema,
  })
  async changePassword(
    @Input() input: any,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<any> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const customerId = await this.getCustomerId(user.id);
      await this.securityService.changePassword(user.id, customerId, input);

      return this.responseHandler.createTrpcSuccess({
        message: 'Password changed successfully'
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.USER,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to change password'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: setup2FASchema,
    output: setup2FAResponseSchema,
  })
  async setup2FA(
    @Input() input: any,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<any> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const customerId = await this.getCustomerId(user.id);
      const setupData = await this.securityService.setup2FA(user.id, customerId, input.method);

      return setupData;
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.USER,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to setup 2FA'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: verify2FASchema,
    output: apiResponseSchema,
  })
  async verify2FA(
    @Input() input: any,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<any> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const customerId = await this.getCustomerId(user.id);
      await this.securityService.verify2FA(user.id, customerId, input.method, input.token);

      return this.responseHandler.createTrpcSuccess({
        message: '2FA verification successful'
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.USER,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to verify 2FA'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: disable2FASchema,
    output: apiResponseSchema,
  })
  async disable2FA(
    @Input() input: any,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<any> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const customerId = await this.getCustomerId(user.id);
      await this.securityService.disable2FA(user.id, customerId, input.password);

      return this.responseHandler.createTrpcSuccess({
        message: '2FA disabled successfully'
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.USER,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to disable 2FA'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.array(z.object({
      id: z.string(),
      browser: z.string(),
      device: z.string(),
      location: z.string(),
      lastActive: z.date(),
      isCurrent: z.boolean(),
    })),
  })
  async getActiveSessions(
    @Ctx() { user }: AuthenticatedContext
  ): Promise<any[]> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const customerId = await this.getCustomerId(user.id);
      const sessions = await this.securityService.getActiveSessions(user.id, customerId);

      return sessions;
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.USER,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        error.message || 'Failed to retrieve active sessions'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: revokeSessionSchema,
    output: apiResponseSchema,
  })
  async revokeSession(
    @Input() input: any,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<any> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const customerId = await this.getCustomerId(user.id);
      await this.securityService.revokeSession(user.id, customerId, input.sessionId);

      return this.responseHandler.createTrpcSuccess({
        message: 'Session revoked successfully'
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.USER,
        OperationCode.DELETE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to revoke session'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    output: apiResponseSchema,
  })
  async revokeAllSessions(
    @Ctx() { user }: AuthenticatedContext
  ): Promise<any> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const customerId = await this.getCustomerId(user.id);
      await this.securityService.revokeAllSessions(user.id, customerId);

      return this.responseHandler.createTrpcSuccess({
        message: 'All sessions revoked successfully'
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.USER,
        OperationCode.DELETE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to revoke all sessions'
      );
    }
  }
}