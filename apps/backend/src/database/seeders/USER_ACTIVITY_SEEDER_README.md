# User Activity Seeder Documentation

This document explains how to use the User Activity Seeder to populate your database with realistic sample data for user activity tracking.

## Overview

The User Activity Seeder creates:
- **Sample Users**: 4 additional users with different roles (2 regular users, 2 admin users)
- **User Sessions**: Multiple sessions per user with realistic timing and device information
- **User Activities**: Diverse activities including admin panel actions, page views, API calls, file operations, and more

## Files Created

1. **`user-activity.seeder.ts`** - Main seeder class
2. **`user-activity-sample-data.sql`** - Alternative SQL script for direct database insertion
3. **Updated seeder configuration files** to include the new seeder

## Usage Methods

### Method 1: Using the NestJS Seeder (Recommended)

Run the complete seeder suite including user activities:

```bash
# Navigate to backend directory
cd apps/backend

# Run all seeders (includes user activity seeder)
npm run seed

# Or run TypeScript directly
npx ts-node src/database/seeders/main.seeder.ts
```

### Method 2: Run Only User Activity Seeder

If you want to run just the user activity seeder:

```bash
# Create a custom script or modify main.seeder.ts to run only UserActivitySeeder
```

### Method 3: Using SQL Script

If you prefer direct SQL insertion:

```bash
# Connect to your PostgreSQL database
psql -h localhost -U your_username -d your_database

# Run the SQL script
\i apps/backend/src/database/seeders/user-activity-sample-data.sql
```

**Note**: When using the SQL script, you must first update the user IDs in the script to match actual user IDs from your database.

## Sample Data Generated

### Users Created
- **John Doe** (`johndoe`) - Regular user from San Francisco
- **Jane Smith** (`janesmith`) - Admin user from New York  
- **Mike Wilson** (`mikewilson`) - Regular user from Austin
- **Admin User** (`adminuser`) - Admin user from Seattle

### Activity Types Covered
- **Login/Logout** - Authentication activities
- **Admin Actions** - Admin panel specific activities
- **Page Views** - Navigation and page access
- **API Calls** - Backend API interactions
- **Profile Updates** - User profile modifications
- **File Operations** - Upload/download activities
- **Search** - Search functionality usage
- **Settings Updates** - Configuration changes

### Admin Panel Activities
The seeder specifically includes admin panel activities such as:
- Admin dashboard access (`/admin/dashboard`)
- User management (`/admin/users`)
- Analytics viewing (`/admin/analytics`)
- System configuration (`/admin/settings`)
- User creation and management
- Data export operations

### Realistic Data Features
- **Temporal Distribution**: Activities spread across the last 7 days
- **Session Management**: Proper session start/end times
- **Device Variety**: Desktop, mobile, and tablet sessions
- **Browser Diversity**: Chrome, Firefox, Safari, Edge
- **IP Addresses**: Realistic internal and external IP ranges
- **User Agents**: Authentic browser user agent strings
- **Response Times**: Realistic API response durations
- **Success Rates**: 95% success rate with some failures
- **Metadata**: Rich contextual information for each activity

## Database Schema Requirements

Ensure these tables exist before running the seeder:
- `users`
- `user_profiles` 
- `roles`
- `user_roles`
- `user_activities`
- `user_sessions`

Run the user activity migration first:
```bash
npm run migration:run
```

## Verification

After running the seeder, verify the data:

```sql
-- Check user activities count
SELECT COUNT(*) FROM user_activities;

-- Check activity types distribution
SELECT activity_type, COUNT(*) 
FROM user_activities 
GROUP BY activity_type 
ORDER BY COUNT(*) DESC;

-- Check admin panel activities
SELECT * FROM user_activities 
WHERE metadata->>'adminPanel' = 'true'
ORDER BY created_at DESC;

-- Check user sessions
SELECT COUNT(*) FROM user_sessions;
```

## Customization

### Adding More Users
Edit the `createSampleUsers()` method in `user-activity.seeder.ts` to add more users.

### Modifying Activity Types
Update the `generateRandomActivity()` method to include additional activity types or modify existing ones.

### Changing Time Ranges
Adjust the date calculations in `createUserSessions()` and `generateSessionActivities()` methods.

### Admin Panel Paths
Modify the `getRandomAdminPath()` method to match your admin panel routes.

## Troubleshooting

### Common Issues

1. **Foreign Key Constraints**
   - Ensure roles and permissions are seeded first
   - Run seeders in the correct order: permissions → admin → user activities

2. **Duplicate Data**
   - The seeder checks for existing data and skips if found
   - To re-seed, clear the tables first

3. **User ID Mismatches** (SQL Script)
   - Update the UUID values in the SQL script to match your actual user IDs
   - Query your users table first: `SELECT id, username FROM users;`

### Clearing Data

To clear seeded data:

```sql
-- Clear user activities and sessions
DELETE FROM user_activities;
DELETE FROM user_sessions;

-- Clear sample users (optional)
DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM users WHERE username IN ('johndoe', 'janesmith', 'mikewilson', 'adminuser')
);
DELETE FROM user_profiles WHERE user_id IN (
  SELECT id FROM users WHERE username IN ('johndoe', 'janesmith', 'mikewilson', 'adminuser')
);
DELETE FROM users WHERE username IN ('johndoe', 'janesmith', 'mikewilson', 'adminuser');
```

## Integration with Analytics

This sample data is designed to work with:
- User activity tracking services
- Admin dashboard analytics
- Session management systems
- User behavior analysis
- Performance monitoring

The generated data provides realistic patterns for testing and development of these features.

## Security Notes

- Sample users have weak passwords (`password123`) - suitable only for development
- IP addresses are from private/test ranges
- Session tokens are simple strings - not production-grade JWTs
- Use this data only in development/testing environments
