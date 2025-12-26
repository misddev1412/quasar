import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserImpersonationRepository } from '../repositories/user-impersonation.repository';
import { UserActivityTrackingService } from './user-activity-tracking.service';
import { AuthService } from '../../../auth/auth.service';
import { UserRole } from '@shared';
import { ActivityType } from '../entities/user-activity.entity';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { SessionStatus } from '../entities/user-session.entity';
import { ImpersonationStatus } from '../entities/user-impersonation-log.entity';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}

export interface ImpersonationStartResult {
  accessToken: string;
  refreshToken: string;
  impersonatedUser: {
    id: string;
    email: string;
    username: string;
  };
  impersonationLogId: string;
}

@Injectable()
export class UserImpersonationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly impersonationRepository: UserImpersonationRepository,
    private readonly activityTrackingService: UserActivityTrackingService,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly authService: AuthService,
  ) {}

  async startImpersonation(
    adminUser: AuthUser,
    targetUserId: string,
    sessionData: {
      ipAddress?: string;
      userAgent?: string;
      reason?: string;
    }
  ): Promise<ImpersonationStartResult> {
    // 1. Validate admin is SUPER_ADMIN
    if (adminUser.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedException('Only super admins can impersonate users');
    }

    // 2. Fetch target user
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // 3. Prevent impersonating other super admins
    const targetUserWithRoles = await this.userRepository.findWithRoles(targetUserId);
    const targetRole = targetUserWithRoles?.userRoles?.find(ur => ur.isActive)?.role?.code;

    if (targetRole === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot impersonate other super admins');
    }

    // 4. Prevent impersonating self
    if (targetUserId === adminUser.id) {
      throw new BadRequestException('Cannot impersonate yourself');
    }

    // 5. Check for active impersonation session by this admin
    const existingImpersonation = await this.impersonationRepository.findActiveByAdminId(adminUser.id);
    if (existingImpersonation) {
      throw new BadRequestException(
        'You are already impersonating another user. Exit current session first.'
      );
    }

    // 6. Generate tokens for impersonated user
    const tokens = await this.authService.login(targetUser, {
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      isRememberMe: false,
    });

    // 7. Create impersonation log
    const impersonationLog = await this.impersonationRepository.createImpersonationLog({
      adminUserId: adminUser.id,
      impersonatedUserId: targetUserId,
      sessionToken: tokens.accessToken,
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      reason: sessionData.reason,
    });

    // 8. Update session with impersonation metadata
    try {
      const session = await this.userSessionRepository.findBySessionToken(tokens.accessToken);
      if (session) {
        session.sessionData = {
          ...(session.sessionData || {}),
          isImpersonating: true,
          originalAdminId: adminUser.id,
          impersonationLogId: impersonationLog.id,
        };
        await this.userSessionRepository.save(session);
      }
    } catch (error) {
      // Don't fail if session metadata update fails
      console.error('Failed to update session metadata:', error);
    }

    // 9. Track impersonation start activity
    await this.activityTrackingService.trackActivity({
      userId: targetUserId,
      sessionId: tokens.accessToken,
      activityType: ActivityType.IMPERSONATION_START,
      activityDescription: `Admin ${adminUser.email} started impersonating user`,
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      metadata: {
        performedByAdminId: adminUser.id,
        performedByAdminEmail: adminUser.email,
        reason: sessionData.reason,
        impersonationLogId: impersonationLog.id,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      impersonatedUser: {
        id: targetUser.id,
        email: targetUser.email,
        username: targetUser.username,
      },
      impersonationLogId: impersonationLog.id,
    };
  }

  async endImpersonation(
    currentSessionToken: string,
    originalAdminData: {
      id: string;
      accessToken: string;
      refreshToken: string;
    }
  ): Promise<void> {
    // 1. Find active impersonation log
    const impersonationLog = await this.impersonationRepository.findActiveBySessionToken(
      currentSessionToken
    );

    if (!impersonationLog) {
      // Check if it's a non-active impersonation log
      const anyLog = await this.impersonationRepository.findBySessionToken(currentSessionToken);
      if (anyLog) {
        // Impersonation already ended, silently succeed
        return;
      }
      throw new NotFoundException('Active impersonation session not found');
    }

    // 2. End impersonation log
    await this.impersonationRepository.endImpersonation(currentSessionToken);

    // 3. Terminate impersonated session
    try {
      await this.userSessionRepository.terminateSession(
        currentSessionToken,
        SessionStatus.LOGGED_OUT
      );
    } catch (error) {
      console.error('Failed to terminate impersonated session:', error);
    }

    // 4. Track impersonation end activity
    try {
      const duration = impersonationLog.getDurationInMinutes();
      await this.activityTrackingService.trackActivity({
        userId: impersonationLog.impersonatedUserId,
        sessionId: currentSessionToken,
        activityType: ActivityType.IMPERSONATION_END,
        activityDescription: `Admin ended impersonation session`,
        metadata: {
          performedByAdminId: impersonationLog.adminUserId,
          impersonationLogId: impersonationLog.id,
          durationMinutes: duration,
        },
      });
    } catch (error) {
      console.error('Failed to track impersonation end activity:', error);
    }
  }

  async getImpersonationHistory(filters: {
    adminUserId?: string;
    impersonatedUserId?: string;
    status?: ImpersonationStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    return this.impersonationRepository.getImpersonationHistory(filters);
  }

  async getCurrentImpersonationStatus(sessionToken: string): Promise<{
    isImpersonating: boolean;
    impersonationLog: Awaited<ReturnType<typeof this.impersonationRepository.findBySessionToken>> | null;
  }> {
    const impersonationLog = await this.impersonationRepository.findActiveBySessionToken(
      sessionToken
    );

    return {
      isImpersonating: !!impersonationLog,
      impersonationLog: impersonationLog || null,
    };
  }

  async cleanupExpiredImpersonations(): Promise<number> {
    return this.impersonationRepository.cleanupExpiredImpersonations(24); // 24 hours
  }
}
