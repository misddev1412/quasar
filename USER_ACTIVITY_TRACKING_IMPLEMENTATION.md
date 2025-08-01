# User Activity Tracking Implementation

## Overview

This implementation replaces the mock data in the active user chart with a comprehensive user activity tracking system that provides accurate, real-time data about user engagement and activity patterns.

## Problem Solved

The original `AdminChartDataService.getActiveUsersData()` method was generating mock data with random variations instead of tracking actual user activity. This led to inaccurate charts that didn't reflect real user behavior.

## Solution Architecture

### 1. Database Schema

#### User Activities Table (`user_activities`)
Tracks individual user actions and interactions:

- **Primary Fields**: `user_id`, `session_id`, `activity_type`, `created_at`
- **Activity Types**: Login, logout, page views, API calls, profile updates, etc.
- **Request Tracking**: IP address, user agent, request path, method, response status
- **Performance**: Duration tracking in milliseconds
- **Metadata**: JSON field for additional activity-specific data
- **Error Tracking**: Success/failure status and error messages

#### User Sessions Table (`user_sessions`)
Tracks user login sessions and device information:

- **Session Management**: Session tokens, refresh tokens, expiration
- **Device Tracking**: Device type, browser, operating system
- **Location**: IP-based location tracking
- **Status**: Active, expired, terminated, logged out
- **Duration**: Login time, last activity, logout time

### 2. Core Components

#### Entities
- `UserActivity` - Individual activity records
- `UserSession` - User session management

#### Repositories
- `UserActivityRepository` - Activity data access with analytics methods
- `UserSessionRepository` - Session management and statistics

#### Services
- `UserActivityTrackingService` - Central service for activity and session tracking

### 3. Key Features

#### Real-time Activity Tracking
- Automatic tracking of all user interactions
- Session-based activity correlation
- Device and browser fingerprinting
- Performance monitoring

#### Analytics & Reporting
- Active users count by date range
- Activity statistics by type, hour, and day
- Session analytics (duration, device breakdown)
- User activity summaries

#### Data Management
- Automatic cleanup of old activities (configurable retention)
- Bulk activity logging for performance
- Error handling that doesn't break main functionality

## Implementation Details

### 1. Database Migration

**File**: `apps/backend/src/database/migrations/1752300000000-CreateUserActivityTables.ts`

Creates two new tables with proper indexes and foreign key constraints:
- Optimized indexes for common query patterns
- PostgreSQL-specific features (JSONB, enums)
- Cascade deletion for data integrity

### 2. Updated Chart Service

**File**: `apps/backend/src/modules/chart/services/admin-chart-data.service.ts`

**Before**: Mock data with random variations
```typescript
// Mock active users data (in real implementation, you'd track user activity)
const baseCount = await this.userRepository.count({ where: { isActive: true } });
const variation = Math.floor(Math.random() * 20) - 10; // ±10 variation
```

**After**: Real activity-based data
```typescript
// Count unique active users for this day based on activities
const activeUsersCount = await this.userActivityRepository.getActiveUsersCount(date, nextDate);
```

### 3. Activity Tracking Middleware

**File**: `apps/backend/src/trpc/middlewares/activity-tracking.middleware.ts`

Automatically tracks all tRPC requests:
- Maps tRPC paths to activity types
- Tracks request duration and success/failure
- Sanitizes sensitive data before logging
- Non-blocking error handling

### 4. Session Management

Enhanced authentication service to create and manage user sessions:
- Session creation on login
- Device information parsing
- Session termination on logout
- Automatic session cleanup

## Usage Examples

### Getting Active Users Count
```typescript
// Last 24 hours
const activeUsers = await activityTrackingService.getActiveUsersCount();

// Custom date range
const activeUsers = await activityTrackingService.getActiveUsersCount({
  start: new Date('2024-01-01'),
  end: new Date('2024-01-31')
});
```

### Manual Activity Tracking
```typescript
await activityTrackingService.trackActivity({
  userId: 'user-id',
  activityType: ActivityType.PROFILE_UPDATE,
  activityDescription: 'User updated profile picture',
  resourceType: 'user',
  resourceId: 'user-id',
  metadata: { field: 'avatar' }
});
```

### Session Analytics
```typescript
const sessionStats = await userSessionRepository.getSessionStats(startDate, endDate);
// Returns: total sessions, active sessions, average duration, device breakdown
```

## Configuration

### Data Retention
```typescript
// Cleanup old data (configurable)
await activityTrackingService.cleanupOldData(
  90, // Keep activities for 90 days
  30  // Keep sessions for 30 days
);
```

### Activity Types
Comprehensive set of predefined activity types:
- Authentication: LOGIN, LOGOUT
- Content: CREATE, UPDATE, DELETE, VIEW
- Files: FILE_UPLOAD, FILE_DOWNLOAD
- System: ADMIN_ACTION, SETTINGS_UPDATE
- User: PROFILE_UPDATE, PASSWORD_CHANGE

## Performance Considerations

### Database Optimization
- Strategic indexes on frequently queried columns
- Bulk insert operations for high-volume tracking
- Automatic cleanup to prevent table bloat

### Non-blocking Design
- Activity tracking failures don't break main functionality
- Asynchronous processing where possible
- Graceful error handling and logging

### Query Optimization
- Efficient date range queries
- Aggregation queries for analytics
- Proper use of database-specific features (PostgreSQL JSONB)

## Migration Instructions

1. **Run the migration**:
   ```bash
   yarn migration:run
   ```

2. **Update module imports**: All necessary modules have been updated to include the new entities and services.

3. **Deploy and monitor**: The system will start tracking activities immediately after deployment.

## Benefits

1. **Accurate Data**: Real user activity instead of mock data
2. **Rich Analytics**: Detailed insights into user behavior patterns
3. **Performance Monitoring**: Track request durations and error rates
4. **Security**: Session management and device tracking
5. **Scalable**: Designed to handle high-volume activity tracking
6. **Maintainable**: Clean separation of concerns and comprehensive error handling

## Future Enhancements

- Real-time activity dashboards
- User behavior analytics and insights
- Anomaly detection for security
- Activity-based user segmentation
- Performance optimization recommendations
