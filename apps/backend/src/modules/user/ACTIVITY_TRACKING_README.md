# Real-Time User Activity Tracking System

This document explains how to use the comprehensive real-time user activity tracking system that automatically captures and logs actual user activities from the admin panel and other parts of the application.

## Overview

The activity tracking system provides:
- **Automatic Activity Capture** - No manual logging required
- **Admin Panel Integration** - Specialized tracking for admin operations
- **Real-time Logging** - Activities logged as they happen
- **Session Management** - Links activities to user sessions
- **Comprehensive Metadata** - Rich contextual information
- **Security Monitoring** - Failed attempts and suspicious activity tracking
- **Performance Tracking** - Response times and system metrics

## Architecture Components

### 1. Core Services

#### `ActivityTrackingService`
Central service for all activity tracking operations.

```typescript
// Inject and use in any service
constructor(private activityTrackingService: ActivityTrackingService) {}

// Track custom activity
await this.activityTrackingService.trackActivity(
  ActivityType.ADMIN_ACTION,
  context,
  'Custom admin action',
  { action: 'custom_action', resource: 'admin' }
);
```

#### `UserActivityTrackingService`
Specialized service for user-specific activity tracking.

### 2. Middleware

#### `ActivityTrackingMiddleware`
Automatically captures HTTP requests and responses for admin routes.

- Applied to: `/admin/*`, `/api/admin/*`, `/trpc/admin/*`
- Captures: Request/response data, timing, IP addresses, user agents
- Filters: Excludes static assets and health checks

### 3. Interceptors

#### `AdminActivityInterceptor`
Provides detailed tracking for admin panel operations.

```typescript
@UseInterceptors(AdminActivityInterceptor)
@TrackUserManagement('create', 'Admin created new user')
async createUser(@Body() createUserDto: any) {
  // Method implementation
  // Activity tracking happens automatically
}
```

### 4. Guards

#### `ActivityTrackingGuard`
Ensures proper authentication and session validation.

#### `AdminActivityTrackingGuard`
Specialized guard for admin routes with role validation.

```typescript
@UseGuards(AdminActivityTrackingGuard)
@Controller('admin/users')
export class AdminUserController {
  // All methods automatically tracked
}
```

### 5. Decorators

#### Activity Tracking Decorators

```typescript
// Basic activity tracking
@TrackActivity({ type: ActivityType.CREATE, resource: 'user' })

// Specific operation decorators
@TrackCreate('user', 'User creation')
@TrackUpdate('user', 'User modification')
@TrackDelete('user', 'User deletion')
@TrackView('user', 'User view')
@TrackSearch('user', 'User search')
@TrackExport('user', 'User data export')

// Admin-specific decorators
@TrackUserManagement('create')
@TrackRoleManagement('assign')
@TrackSystemSettings('update')
```

#### Parameter Decorators

```typescript
async someMethod(
  @CurrentUser() user: any,
  @ActivityContext() context: any,
  @CurrentSession() session: any
) {
  // Access current user, activity context, and session
}
```

## Usage Examples

### 1. Basic Controller Setup

```typescript
@Controller('admin/users')
@UseGuards(AdminActivityTrackingGuard)
@UseInterceptors(AdminActivityInterceptor)
export class AdminUserController {
  
  @Get()
  @TrackView('user', 'Admin viewed user list')
  async getUsers(@Query() query: any) {
    // Activity automatically tracked
    return await this.userService.findAll(query);
  }

  @Post()
  @TrackUserManagement('create')
  async createUser(
    @Body() createUserDto: any,
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any
  ) {
    const newUser = await this.userService.create(createUserDto);
    
    // Additional custom tracking if needed
    await this.activityTrackingService.trackUserManagement(
      context,
      'create',
      newUser.id,
      { createdBy: currentUser.id, email: createUserDto.email }
    );
    
    return newUser;
  }
}
```

### 2. Manual Activity Tracking

```typescript
@Injectable()
export class CustomService {
  constructor(
    private activityTrackingService: ActivityTrackingService
  ) {}

  async performCustomAction(userId: string, actionData: any) {
    const context = {
      userId,
      startTime: Date.now(),
      // ... other context data
    };

    try {
      const result = await this.doSomething(actionData);
      
      // Track successful action
      await this.activityTrackingService.trackActivity(
        ActivityType.ADMIN_ACTION,
        { ...context, endTime: Date.now() },
        'Custom action performed',
        {
          action: 'custom_action',
          resource: 'custom_resource',
          changes: actionData
        }
      );
      
      return result;
    } catch (error) {
      // Track failed action
      await this.activityTrackingService.trackActivity(
        ActivityType.ADMIN_ACTION,
        { 
          ...context, 
          endTime: Date.now(),
          response: { statusCode: 500 }
        },
        'Custom action failed',
        {
          action: 'custom_action_failed',
          resource: 'custom_resource',
          changes: { error: error.message }
        }
      );
      
      throw error;
    }
  }
}
```

### 3. TRPC Integration

```typescript
export const adminUserRouter = router({
  create: adminProcedure
    .input(createUserSchema)
    .use(async ({ ctx, next, input }) => {
      // Pre-execution tracking setup
      const startTime = Date.now();
      
      try {
        const result = await next();
        
        // Track successful operation
        await ctx.activityTrackingService.trackUserManagement(
          {
            userId: ctx.user.id,
            startTime,
            endTime: Date.now(),
            request: ctx.req,
          },
          'create',
          result.id,
          { input }
        );
        
        return result;
      } catch (error) {
        // Track failed operation
        await ctx.activityTrackingService.trackUserManagement(
          {
            userId: ctx.user.id,
            startTime,
            endTime: Date.now(),
            request: ctx.req,
            response: { statusCode: 500 }
          },
          'create_failed',
          undefined,
          { input, error: error.message }
        );
        
        throw error;
      }
    })
    .mutation(async ({ ctx, input }) => {
      return await ctx.userService.create(input);
    }),
});
```

## Configuration

### Environment Variables

```bash
# General settings
ACTIVITY_TRACKING_ENABLED=true
TRACK_ANONYMOUS_USERS=false
TRACK_FAILED_REQUESTS=true
MAX_METADATA_SIZE=10240
SESSION_TIMEOUT=1800
ACTIVITY_RETENTION_DAYS=90

# Admin tracking
ADMIN_TRACKING_ENABLED=true
ADMIN_TRACK_PAGE_VIEWS=true
ADMIN_TRACK_API_CALLS=true
ADMIN_TRACK_CRUD=true
ADMIN_TRACK_USER_MGMT=true

# Performance
TRACK_RESPONSE_TIMES=true
SLOW_REQUEST_THRESHOLD=1000

# Security
TRACK_FAILED_LOGINS=true
FAILED_LOGINS_THRESHOLD=5
TRACK_PERMISSION_DENIALS=true

# Storage
ACTIVITY_COMPRESSION=true
ACTIVITY_ARCHIVE=true
ACTIVITY_ARCHIVE_DAYS=30
```

### Configuration File

The system uses `activity-tracking.config.ts` for detailed configuration:

```typescript
import activityTrackingConfig from './config/activity-tracking.config';

@Module({
  imports: [
    ConfigModule.forFeature(activityTrackingConfig),
  ],
})
export class AppModule {}
```

## Tracked Activities

### Admin Panel Activities

1. **Authentication**
   - Admin login/logout
   - Session management
   - Failed login attempts

2. **User Management**
   - User creation, updates, deletion
   - Role assignments/removals
   - Permission changes
   - Status changes (activate/deactivate)
   - Bulk operations

3. **System Administration**
   - Settings updates
   - System configuration changes
   - Data exports/imports
   - Analytics access

4. **Navigation**
   - Page views
   - Dashboard access
   - Report generation

### API Activities

1. **CRUD Operations**
   - Create, Read, Update, Delete operations
   - Bulk operations
   - Search and filtering

2. **File Operations**
   - File uploads/downloads
   - Document management

3. **Data Operations**
   - Export operations
   - Import operations
   - Backup/restore

## Data Structure

### UserActivity Entity

```typescript
{
  id: string;
  userId: string;
  sessionId: string;
  activityType: ActivityType;
  activityDescription: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  requestPath: string;
  requestMethod: string;
  responseStatus: number;
  durationMs: number;
  metadata: Record<string, any>;
  isSuccessful: boolean;
  createdAt: Date;
}
```

### Metadata Examples

```typescript
// Admin user creation
{
  adminPanel: true,
  adminAction: {
    action: 'user_create',
    resource: 'user',
    targetUserId: 'new-user-id',
    changes: {
      email: 'newuser@example.com',
      role: 'user'
    }
  },
  requestBody: { /* sanitized request data */ },
  actionResult: { /* sanitized result data */ }
}

// Page view
{
  adminPanel: true,
  pageTitle: 'User Management',
  timeOnPage: 45000,
  referrer: '/admin/dashboard'
}

// Failed operation
{
  adminPanel: true,
  error: {
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    statusCode: 400
  }
}
```

## Querying Activity Data

### Basic Queries

```typescript
// Get user activities
const activities = await userActivityRepository.findUserActivities(userId, {
  limit: 50,
  offset: 0,
  activityType: ActivityType.ADMIN_ACTION
});

// Get admin activities
const adminActivities = await userActivityRepository.findAdminActivities({
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
  action: 'user_create'
});

// Get session activities
const sessionActivities = await userActivityRepository.findSessionActivities(sessionId);
```

### Analytics Queries

```typescript
// Activity statistics
const stats = await userActivityRepository.getActivityStatistics({
  groupBy: 'activityType',
  timeRange: 'last_30_days'
});

// Admin action summary
const adminStats = await userActivityRepository.getAdminActionSummary({
  userId: 'admin-user-id',
  dateRange: { start: startDate, end: endDate }
});
```

## Security Considerations

1. **Data Sanitization**
   - Sensitive fields automatically excluded
   - Request/response data sanitized
   - File uploads tracked without content

2. **Access Control**
   - Activity data access restricted to authorized users
   - Admin activities require admin privileges
   - Audit trail for activity data access

3. **Data Retention**
   - Configurable retention periods
   - Automatic archiving of old data
   - Secure deletion of expired data

4. **Privacy Compliance**
   - GDPR-compliant data handling
   - User consent tracking
   - Data anonymization options

## Monitoring and Alerts

### Real-time Monitoring

The system can trigger alerts for:
- Failed login attempts
- Permission denials
- Suspicious activity patterns
- High-privilege operations
- Bulk operations
- System configuration changes

### Performance Monitoring

- Response time tracking
- Slow request identification
- Resource usage monitoring
- Database query performance

## Troubleshooting

### Common Issues

1. **Activities Not Being Tracked**
   - Check if middleware is properly configured
   - Verify user authentication
   - Check activity tracking configuration

2. **Missing Session Information**
   - Ensure session middleware is configured
   - Check session token extraction
   - Verify session validation

3. **Performance Issues**
   - Adjust batch size and flush interval
   - Enable compression for large metadata
   - Consider archiving old data

### Debug Mode

Enable debug logging:

```bash
DEBUG=activity-tracking:* npm start
```

This will provide detailed logs of all activity tracking operations.

## Best Practices

1. **Use Decorators** - Prefer decorators over manual tracking
2. **Sanitize Data** - Always sanitize sensitive information
3. **Batch Operations** - Use batch tracking for bulk operations
4. **Monitor Performance** - Track the impact of activity logging
5. **Regular Cleanup** - Archive or delete old activity data
6. **Security First** - Ensure activity data is properly secured
7. **Test Thoroughly** - Test activity tracking in all scenarios
