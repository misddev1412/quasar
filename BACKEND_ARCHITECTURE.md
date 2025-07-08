# Backend Architecture - Separated Logic for Admin & Client

This document outlines the backend architecture that separates logic for admin and client applications, implementing different API endpoints, authentication, and authorization patterns with separated database tables.

## 🏗️ Architecture Overview

```
apps/backend/src/
├── auth/                     # Authentication module
│   ├── auth.service.ts       # JWT & password management
│   ├── auth.module.ts        # Auth module configuration
│   ├── guards/               # Authentication & authorization guards
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── modules/
│   ├── admin/                # Admin-specific logic
│   │   ├── admin.module.ts
│   │   └── user/
│   │       ├── dto/
│   │       ├── controllers/
│   │       └── services/
│   ├── client/               # Client-specific logic
│   │   ├── client.module.ts
│   │   └── user/
│   │       ├── dto/
│   │       ├── controllers/
│   │       └── services/
│   └── user/                 # Shared user entities & repository
│       ├── entities/
│       │   ├── user.entity.ts         # Authentication data
│       │   └── user-profile.entity.ts # Profile data
│       ├── repositories/
│       └── interfaces/
└── config/
    └── database.config.ts
```

## 🗄️ Database Schema (Separated Tables)

### Users Table (Authentication Data)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role ENUM('super_admin', 'admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Profiles Table (Profile Data)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  phone_number VARCHAR,
  date_of_birth DATE,
  avatar VARCHAR,
  bio TEXT,
  address VARCHAR,
  city VARCHAR,
  country VARCHAR,
  postal_code VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Authentication & Authorization

### User Roles
- **SUPER_ADMIN**: Full system access
- **ADMIN**: Admin panel access
- **USER**: Regular client access

### JWT Strategy
- **Access Token**: 1 hour expiry
- **Refresh Token**: 7 days expiry
- **Role-based claims**: Embedded in JWT payload

### Guards
- **JwtAuthGuard**: Validates JWT tokens
- **RolesGuard**: Enforces role-based access control

## 🛡️ API Separation

### Admin API Routes (Protected)
```
Base URL: /api/admin/*
Required Roles: ADMIN, SUPER_ADMIN

POST   /api/admin/users           # Create user (with profile)
GET    /api/admin/users           # List users (with filters & profiles)
GET    /api/admin/users/:id       # Get user by ID (with profile)
PUT    /api/admin/users/:id       # Update user authentication data
PUT    /api/admin/users/:id/profile # Update user profile data
DELETE /api/admin/users/:id       # Delete user (cascades to profile)
PUT    /api/admin/users/:id/activate    # Activate user
PUT    /api/admin/users/:id/deactivate  # Deactivate user
```

### Client API Routes (Public/User-only)
```
Base URL: /api/auth/*
Required Roles: None (public) or USER (protected)

POST   /api/auth/register         # User registration (creates user + profile)
POST   /api/auth/login            # User login (email/username + password)
GET    /api/auth/profile          # Get user profile (protected)
PUT    /api/auth/profile          # Update user profile (protected)
POST   /api/auth/refresh          # Refresh tokens
```

## 📊 Data Transfer Objects (DTOs)

### Admin DTOs
- **AdminCreateUserDto**: User creation with authentication + profile data
- **AdminUpdateUserDto**: Authentication data updates (email, username, role, status)
- **AdminUpdateUserProfileDto**: Profile data updates (name, contact, address, etc.)
- **AdminUserResponseDto**: Includes role, status, and full profile data

### Client DTOs
- **ClientRegisterDto**: Registration with username, email, password, and basic profile
- **ClientLoginDto**: Login with email and password
- **ClientUpdateProfileDto**: Profile updates only (no authentication changes)
- **ClientUserResponseDto**: Filtered user data (no role/admin fields, includes profile)
- **ClientAuthResponseDto**: Includes tokens and user data with profile

## 🔄 Service Layer Separation

### AdminUserService
- **Full CRUD operations** on both users and profiles
- **User filtering & pagination** with profile data
- **Role management** and authentication updates
- **User activation/deactivation**
- **Separate profile management** methods

### ClientUserService
- **User registration** (creates user + profile)
- **Authentication** (login with email or username)
- **Profile management** (read/update profile only)
- **Token refresh**
- **No access to authentication data changes**

## 🔗 Entity Relationships

### User Entity (Authentication)
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToOne(() => UserProfile, profile => profile.user)
  profile: UserProfile;
}
```

### UserProfile Entity (Profile Data)
```typescript
@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  // Additional profile fields...

  @OneToOne(() => User, user => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

## 🚀 Usage Examples

### Admin Operations

```typescript
// Create user with profile
POST /api/admin/users
Authorization: Bearer <admin_token>
{
  "email": "admin@example.com",
  "username": "admin_user",
  "firstName": "Admin",
  "lastName": "User",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "role": "admin"
}

// Update user authentication data
PUT /api/admin/users/:id
{
  "email": "newemail@example.com",
  "role": "user",
  "isActive": false
}

// Update user profile data
PUT /api/admin/users/:id/profile
{
  "firstName": "Updated",
  "lastName": "Name",
  "bio": "Updated bio",
  "city": "New York"
}
```

### Client Operations

```typescript
// Register new user
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "phoneNumber": "+1234567890"
}

// Login with email or username
POST /api/auth/login
{
  "email": "user@example.com",  // or "username": "john_doe"
  "password": "password123"
}

// Update profile (clients can only update profile, not auth data)
PUT /api/auth/profile
Authorization: Bearer <user_token>
{
  "firstName": "Johnny",
  "bio": "Software developer",
  "city": "San Francisco",
  "country": "USA"
}
```

## 🔧 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=quasar_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Server
PORT=3000
NODE_ENV=development
```

## 📝 Key Features

✅ **Separated Authentication & Profile Data**
✅ **Snake_case Database Naming Convention**
✅ **Role-based Access Control (RBAC)**
✅ **Separate API endpoints for admin vs client**
✅ **JWT authentication with refresh tokens**
✅ **Input validation with class-validator**
✅ **Password hashing with bcrypt**
✅ **CORS configuration for frontend apps**
✅ **Global validation pipe**
✅ **Proper error handling**
✅ **Service and repository patterns**
✅ **One-to-One relationship between User and UserProfile**
✅ **Cascade delete for data integrity**

## 🔄 Migration Commands

```bash
# Run the migration to create both tables
yarn migration:run

# Revert migration
yarn migration:revert
```

## 🛠️ Development

```bash
# Start development server
nx serve backend

# Run tests
nx test backend

# Build
nx build backend
```

## 🔐 Permission System

### Architecture Overview

The backend implements a comprehensive role-based permission system with:
- **Fine-grained access control** using permissions
- **Resource-based permissions** (user, user-profile, permission, role-permission)  
- **Scope-based access** (OWN for user's resources, ANY for all resources)
- **Attribute-level filtering** (control which fields users can access)

### Permission Entities

```typescript
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column()
  action: string; // CREATE, READ, UPDATE, DELETE

  @Column()
  scope: string; // OWN, ANY

  @Column()
  resource: string; // user, user-profile, permission, role-permission

  @Column('text', { array: true })
  attributes: string[]; // ['*'] or specific fields ['id', 'username']
}

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column()
  permissionId: string;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;
}
```

### Permission Service

```typescript
// Check permissions with AccessControl-style API
const canCreateUser = await permissionService
  .can(UserRole.ADMIN)
  .createAny('user');

const canUpdateOwnProfile = await permissionService
  .can(UserRole.USER)
  .updateOwn('user-profile');

// Get filtered attributes for field-level access
const allowedFields = await permissionService
  .getFilteredAttributes(UserRole.USER, 'user', 'READ', 'OWN');
// Returns: ['id', 'username', 'email']
```

### tRPC Permission Middleware

```typescript
// Using convenience middleware classes
export const userRouter = router({
  getAllUsers: protectedProcedure
    .use(CanReadAny('user'))
    .query(({ ctx }) => userService.findAll()),

  updateProfile: protectedProcedure
    .use(CanUpdateOwn('user-profile'))
    .input(updateProfileSchema)
    .mutation(({ ctx, input }) => 
      userService.updateProfile(ctx.user.id, input)
    ),

  deleteUser: protectedProcedure
    .use(RequirePermission('user', 'DELETE', 'ANY'))
    .input(z.object({ userId: z.string() }))
    .mutation(({ input }) => userService.delete(input.userId)),
});
```

### Default Permission Structure

| Role | Resource | Permissions |
|------|----------|-------------|
| **USER** | user | READ/UPDATE OWN (restricted attributes) |
| **USER** | user-profile | READ/UPDATE OWN |
| **ADMIN** | user | Full CRUD ANY |
| **ADMIN** | user-profile | Full CRUD ANY |
| **ADMIN** | permission | READ ANY |
| **SUPER_ADMIN** | permission | Full CRUD ANY |
| **SUPER_ADMIN** | role-permission | Full CRUD ANY |

### Permission Seeding

```bash
# Seed default permissions (recommended)
yarn seed:permissions

# Force re-seed all permissions
yarn seed:permissions:reseed
```

### Admin Permission Management

```typescript
// Admin can manage permissions via tRPC
await trpc.admin.permission.assignToRole.mutate({
  role: 'ADMIN',
  resource: 'user',
  action: 'CREATE', 
  scope: 'ANY',
  attributes: ['*']
});

await trpc.admin.permission.removeFromRole.mutate({
  role: 'USER',
  resource: 'user',
  action: 'DELETE',
  scope: 'ANY'
});
```

## 🎯 Architecture Benefits

1. **Separation of Concerns**: Authentication data separate from profile data
2. **Performance**: Can query authentication data without loading profile data
3. **Security**: Profile updates don't affect authentication data
4. **Scalability**: Can implement different caching strategies for auth vs profile data
5. **Compliance**: Easier to implement data privacy requirements (GDPR, etc.)
6. **Database Normalization**: Proper relational structure with foreign key constraints
7. **Fine-grained Authorization**: Comprehensive permission system with role-based access control
8. **Flexible Permissions**: Support for resource-level, scope-level, and attribute-level access control

This architecture provides clear separation of concerns, proper authentication/authorization, scalable patterns for both admin and client applications, and comprehensive permission management with optimal database design. 