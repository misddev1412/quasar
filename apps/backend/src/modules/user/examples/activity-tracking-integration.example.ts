/**
 * Complete Integration Example for Real-Time User Activity Tracking
 * 
 * This file demonstrates how to integrate the activity tracking system
 * into your existing application components.
 */

import {
  Module,
  Controller,
  Injectable,
  UseGuards,
  UseInterceptors,
  Get,
  Post,
  Body,
  Param,
  Query,
  NestModule,
  MiddlewareConsumer
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Import activity tracking components
import { ActivityTrackingService } from '../services/activity-tracking.service';
import { ActivityTrackingMiddleware } from '../middleware/activity-tracking.middleware';
import { AdminActivityInterceptor } from '../interceptors/admin-activity.interceptor';
import { AdminActivityTrackingGuard } from '../guards/activity-tracking.guard';
import {
  TrackUserManagementAction,
  TrackCreate,
  TrackUpdate,
  TrackDelete,
  TrackView,
  CurrentUser,
  ActivityContext,
} from '../decorators/track-activity.decorator';
import activityTrackingConfig from '../config/activity-tracking.config';

// ============================================================================
// 1. ADMIN CONTROLLER EXAMPLE
// ============================================================================

@Controller('admin/users')
@UseGuards(AdminActivityTrackingGuard)
@UseInterceptors(AdminActivityInterceptor)
export class AdminUserControllerExample {
  constructor(
    private readonly userService: any, // Replace with actual UserService
    private readonly activityTrackingService: ActivityTrackingService,
  ) {}

  /**
   * Example: List users with automatic activity tracking
   */
  @Get()
  @TrackView('user', 'Admin viewed user list')
  async getUsers(
    @Query() query: any,
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
  ) {
    const result = await this.userService.findAll(query);

    // Optional: Track additional search activity
    if (query.search) {
      await this.activityTrackingService.trackActivity(
        'search' as any,
        context,
        `Admin searched users: "${query.search}"`,
        {
          action: 'search_users',
          resource: 'user',
          changes: { 
            searchTerm: query.search, 
            resultsCount: result.total,
            filters: query 
          },
        }
      );
    }

    return result;
  }

  /**
   * Example: Create user with detailed activity tracking
   */
  @Post()
  @TrackUserManagementAction('create', 'Admin created new user')
  async createUser(
    @Body() createUserDto: any,
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
  ) {
    const newUser = await this.userService.create(createUserDto);

    // Track additional user creation details
    await this.activityTrackingService.trackUserManagement(
      context,
      'create',
      newUser.id,
      {
        email: createUserDto.email,
        username: createUserDto.username,
        role: createUserDto.role,
        createdBy: currentUser.id,
        initialPermissions: createUserDto.permissions || [],
      }
    );

    return newUser;
  }

  /**
   * Example: Bulk user operations with activity tracking
   */
  @Post('bulk/:action')
  @TrackUserManagementAction('bulk_operation', 'Admin performed bulk operation')
  async bulkOperation(
    @Param('action') action: string,
    @Body() bulkDto: { userIds: string[]; data?: any },
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
  ) {
    const result = await this.userService.bulkOperation(action, bulkDto.userIds, bulkDto.data);

    // Track bulk operation details
    await this.activityTrackingService.trackUserManagement(
      context,
      `bulk_${action}`,
      'multiple',
      {
        action,
        targetUserIds: bulkDto.userIds,
        affectedCount: bulkDto.userIds.length,
        operationData: bulkDto.data,
        performedBy: currentUser.id,
        results: {
          successful: result.successful?.length || 0,
          failed: result.failed?.length || 0,
        },
      }
    );

    return result;
  }
}

// ============================================================================
// 2. SERVICE INTEGRATION EXAMPLE
// ============================================================================

@Injectable()
export class UserManagementServiceExample {
  constructor(
    private readonly activityTrackingService: ActivityTrackingService,
  ) {}

  /**
   * Example: Manual activity tracking in service methods
   */
  async performSensitiveOperation(
    userId: string,
    operationData: any,
    currentUser: any,
  ) {
    const context = {
      userId: currentUser.id,
      startTime: Date.now(),
      request: {
        path: '/admin/sensitive-operation',
        method: 'POST',
      } as any,
    };

    try {
      // Perform the operation
      const result = await this.doSensitiveOperation(operationData);

      // Track successful operation
      await this.activityTrackingService.trackActivity(
        'admin_action' as any,
        {
          ...context,
          endTime: Date.now(),
          request: context.request || {} as any,
          startTime: context.startTime || Date.now(),
          response: { statusCode: 200 } as any,
          metadata: {
            targetUserId: userId,
            operationType: operationData.type,
            securityLevel: 'high',
            approvedBy: currentUser.id,
          }
        }
      );

      return result;
    } catch (error) {
      // Track failed operation
      await this.activityTrackingService.trackActivity(
        'admin_action' as any,
        {
          ...context,
          endTime: Date.now(),
          request: context.request || {} as any,
          startTime: context.startTime || Date.now(),
          response: { statusCode: 500 } as any,
          metadata: {
            targetUserId: userId,
            operationType: operationData.type,
            error: error.message,
            attemptedBy: currentUser.id,
          }
        }
      );

      throw error;
    }
  }

  private async doSensitiveOperation(data: any) {
    // Implementation here
    return { success: true };
  }
}

// ============================================================================
// 3. TRPC ROUTER INTEGRATION EXAMPLE
// ============================================================================

// import { router, adminProcedure } from '../../trpc/trpc';
// import { z } from 'zod';

/* export const adminUserRouterExample = router({
  create: adminProcedure
    .input(z.object({
      email: z.string().email(),
      username: z.string(),
      role: z.string(),
    }))
    .use(async ({ ctx, next, input }) => {
      const startTime = Date.now();
      
      try {
        const result = await next();
        
        // Track successful tRPC operation
        await ctx.activityTrackingService.trackUserManagement(
          {
            userId: ctx.user.id,
            startTime,
            endTime: Date.now(),
            request: ctx.req,
            response: { statusCode: 200 } as any,
          },
          'create',
          result.id,
          {
            input,
            trpcProcedure: 'admin.users.create',
            createdBy: ctx.user.id,
          }
        );
        
        return result;
      } catch (error) {
        // Track failed tRPC operation
        await ctx.activityTrackingService.trackUserManagement(
          {
            userId: ctx.user.id,
            startTime,
            endTime: Date.now(),
            request: ctx.req,
            response: { statusCode: 500 } as any,
          },
          'create_failed',
          undefined,
          {
            input,
            trpcProcedure: 'admin.users.create',
            error: error.message,
            attemptedBy: ctx.user.id,
          }
        );
        
        throw error;
      }
    })
    .mutation(async ({ ctx, input }) => {
      return await ctx.userService.create(input);
    }),

  list: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      search: z.string().optional(),
    }))
    .use(async ({ ctx, next, input }) => {
      const startTime = Date.now();
      
      const result = await next();
      
      // Track list operation
      await ctx.activityTrackingService.trackActivity(
        'view' as any,
        {
          userId: ctx.user.id,
          startTime,
          endTime: Date.now(),
          request: ctx.req,
          response: { statusCode: 200 } as any,
        },
        'Admin viewed user list via tRPC',
        {
          action: 'list_users',
          resource: 'user',
          trpcProcedure: 'admin.users.list',
          filters: input,
          resultsCount: result.total,
        }
      );
      
      return result;
    })
    .query(async ({ ctx, input }) => {
      return await ctx.userService.findAll(input);
    }),
}); */

// ============================================================================
// 4. AUTHENTICATION INTEGRATION EXAMPLE
// ============================================================================

@Injectable()
export class AuthServiceExample {
  constructor(
    private readonly activityTrackingService: ActivityTrackingService,
  ) {}

  /**
   * Example: Login with activity tracking
   */
  async login(loginDto: any, request: any) {
    const context = this.activityTrackingService.extractUserContext(request);
    
    try {
      // Perform authentication
      const authResult = await this.authenticateUser(loginDto);
      
      // Check if admin login
      const isAdminLogin = this.isAdminUser(authResult.user);
      
      if (isAdminLogin) {
        // Track admin login
        await this.activityTrackingService.trackAdminLogin({
          ...context,
          userId: authResult.user.id,
          endTime: Date.now(),
          request: context.request || {} as any,
          startTime: context.startTime || Date.now(),
          response: { statusCode: 200 } as any,
          metadata: {
            loginMethod: 'email',
            adminPanel: true,
            userRole: authResult.user.role,
          },
        });
      } else {
        // Track regular user login
        await this.activityTrackingService.trackActivity(
          'login' as any,
          {
            ...context,
            userId: authResult.user.id,
            endTime: Date.now(),
            request: context.request || {} as any,
            startTime: context.startTime || Date.now(),
            response: { statusCode: 200 } as any,
          },
          'User logged in',
          {
            action: 'login',
            resource: 'auth',
          }
        );
      }

      return authResult;
    } catch (error) {
      // Track failed login attempt
      await this.activityTrackingService.trackActivity(
        'login' as any,
        {
          ...context,
          userId: 'unknown',
          endTime: Date.now(),
          request: context.request || {} as any,
          startTime: context.startTime || Date.now(),
          response: { statusCode: 401 } as any,
          metadata: {
            error: error.message,
            attemptedEmail: loginDto.email,
            failureReason: 'invalid_credentials',
          },
        },
        'Failed login attempt',
        {
          action: 'login_failed',
          resource: 'auth',
        }
      );

      throw error;
    }
  }

  private async authenticateUser(loginDto: any) {
    // Implementation here
    return { user: { id: '123', email: loginDto.email, role: 'user' } };
  }

  private isAdminUser(user: any): boolean {
    return ['admin', 'super_admin'].includes(user.role);
  }
}

// ============================================================================
// 5. MODULE CONFIGURATION EXAMPLE
// ============================================================================

@Module({
  imports: [
    ConfigModule.forFeature(activityTrackingConfig),
    // ... other imports
  ],
  controllers: [AdminUserControllerExample],
  providers: [
    UserManagementServiceExample,
    AuthServiceExample,
    ActivityTrackingService,
    
    // Global interceptor for admin activity tracking
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminActivityInterceptor,
    },
    
    // Global guard for activity tracking (optional)
    {
      provide: APP_GUARD,
      useClass: AdminActivityTrackingGuard,
    },
  ],
})
export class ActivityTrackingIntegrationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply activity tracking middleware to specific routes
    consumer
      .apply(ActivityTrackingMiddleware)
      .forRoutes(
        'admin/*',
        'api/admin/*',
        'trpc/admin/*',
        'auth/*'
      );
  }
}

// ============================================================================
// 6. ENVIRONMENT CONFIGURATION EXAMPLE
// ============================================================================

/*
Add these to your .env file:

# Activity Tracking Configuration
ACTIVITY_TRACKING_ENABLED=true
TRACK_ANONYMOUS_USERS=false
TRACK_FAILED_REQUESTS=true
MAX_METADATA_SIZE=10240
SESSION_TIMEOUT=1800
ACTIVITY_RETENTION_DAYS=90

# Admin Tracking
ADMIN_TRACKING_ENABLED=true
ADMIN_TRACK_PAGE_VIEWS=true
ADMIN_TRACK_API_CALLS=true
ADMIN_TRACK_CRUD=true
ADMIN_TRACK_USER_MGMT=true
ADMIN_TRACK_ROLE_MGMT=true
ADMIN_TRACK_SETTINGS=true
ADMIN_TRACK_EXPORTS=true

# Performance Tracking
TRACK_RESPONSE_TIMES=true
SLOW_REQUEST_THRESHOLD=1000
TRACK_MEMORY_USAGE=false
TRACK_DB_QUERIES=false

# Security Monitoring
TRACK_FAILED_LOGINS=true
FAILED_LOGINS_THRESHOLD=5
TRACK_PERMISSION_DENIALS=true
PERMISSION_DENIALS_THRESHOLD=10
TRACK_SUSPICIOUS_ACTIVITY=true
SUSPICIOUS_ACTIONS_THRESHOLD=50

# Storage Options
ACTIVITY_COMPRESSION=true
ACTIVITY_ENCRYPTION=false
ACTIVITY_ARCHIVE=true
ACTIVITY_ARCHIVE_DAYS=30

# Exclude/Include Paths
ACTIVITY_EXCLUDE_PATHS=/health,/metrics,/favicon.ico
ACTIVITY_INCLUDE_PATHS=/admin/*,/api/admin/*,/trpc/admin/*

# Sensitive Fields
ACTIVITY_SENSITIVE_FIELDS=password,token,secret,apiKey
*/

// ============================================================================
// 7. USAGE SUMMARY
// ============================================================================

/*
To integrate activity tracking into your application:

1. Import the UserModule with activity tracking enabled
2. Apply the ActivityTrackingMiddleware to desired routes
3. Use decorators on controller methods for automatic tracking
4. Use guards to ensure proper authentication and session management
5. Configure environment variables for your specific needs
6. Monitor activity data through the UserActivity entity

The system will automatically:
- Track all admin panel activities
- Log user sessions and authentication events
- Capture API calls and CRUD operations
- Monitor page views and navigation
- Record system configuration changes
- Track data exports and imports
- Monitor failed attempts and security events

All activities are stored in the user_activities table with rich metadata
for comprehensive audit trails and analytics.
*/
