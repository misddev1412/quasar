# Permission System Documentation

This document explains the role-based permission system implemented in the Quasar backend application.

## Overview

The permission system provides fine-grained access control using:
- **Role-based permissions** (USER, ADMIN, SUPER_ADMIN)
- **Resource-based access control** (user, user-profile, permission, role-permission)
- **Scope-based permissions** (OWN for user's own resources, ANY for all resources)
- **Attribute-based filtering** (specific fields users can access)

## Architecture

### Core Components

1. **Permission Entity** (`src/modules/user/entities/permission.entity.ts`)
2. **RolePermission Entity** (`src/modules/user/entities/role-permission.entity.ts`) 
3. **Permission Repository** (`src/modules/user/repositories/permission.repository.ts`)
4. **Permission Service** (`src/modules/user/services/permission.service.ts`)
5. **Permission Middleware** (`src/trpc/middlewares/auth.middleware.ts`)
6. **Admin Permission Router** (`src/trpc/routers/admin-permission.router.ts`)

### Permission Model

```typescript
interface Permission {
  id: string;
  role: UserRole;           // USER | ADMIN | SUPER_ADMIN
  action: string;           // CREATE | READ | UPDATE | DELETE
  scope: string;            // OWN | ANY
  resource: string;         // user | user-profile | permission | role-permission
  attributes: string[];     // ['*'] or specific fields like ['id', 'username']
}
```

## Default Permission Structure

### USER Role
- Can **read/update own** user data with restricted attributes
- Can **read/update own** user profile data
- **Cannot** create/delete users or manage permissions

### ADMIN Role  
- Can **manage all** users and profiles (full CRUD)
- Can **read** permissions but cannot modify them
- **Cannot** manage permission assignments

### SUPER_ADMIN Role
- **Full access** to everything including permission management
- Can create/update/delete permissions
- Can manage role-permission assignments

## Usage Examples

### 1. Using Permission Service

```typescript
import { PermissionService } from '../modules/user/services/permission.service';

@Injectable()
export class ExampleService {
  constructor(private permissionService: PermissionService) {}

  async checkUserPermissions() {
    // Check if a role can perform an action
    const canCreateUser = await this.permissionService
      .can(UserRole.ADMIN)
      .createAny('user');

    const canReadOwnProfile = await this.permissionService
      .can(UserRole.USER)
      .readOwn('user-profile');

    // Get filtered attributes for a permission
    const allowedFields = await this.permissionService
      .getFilteredAttributes(UserRole.USER, 'user', 'READ', 'OWN');
    // Returns: ['id', 'username', 'email']

    // Check specific permission
    const hasPermission = await this.permissionService
      .hasPermission(UserRole.ADMIN, 'user', 'DELETE', 'ANY');
  }
}
```

### 2. Using tRPC Permission Middleware

```typescript
import { CanReadAny, CanUpdateOwn, RequirePermission } from '../middlewares/auth.middleware';

// Using convenience classes
export const userRouter = router({
  getAllUsers: protectedProcedure
    .use(CanReadAny('user'))  // Requires READ permission on ANY user
    .query(async ({ ctx }) => {
      return await userService.findAll();
    }),

  updateMyProfile: protectedProcedure
    .use(CanUpdateOwn('user-profile'))  // Requires UPDATE permission on OWN profile
    .input(z.object({ firstName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await userService.updateProfile(ctx.user.id, input);
    }),

  // Using generic permission decorator
  deleteUser: protectedProcedure
    .use(RequirePermission('user', 'DELETE', 'ANY'))
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await userService.delete(input.userId);
    }),
});
```

### 3. Admin Permission Management

```typescript
// Get all permissions
const permissions = await trpc.admin.permission.getAll.query();

// Assign permission to role
await trpc.admin.permission.assignToRole.mutate({
  role: 'ADMIN',
  resource: 'user',
  action: 'CREATE',
  scope: 'ANY',
  attributes: ['*']
});

// Remove permission from role
await trpc.admin.permission.removeFromRole.mutate({
  role: 'USER',
  resource: 'user',
  action: 'DELETE',
  scope: 'ANY'
});

// Update permission attributes
await trpc.admin.permission.updateAttributes.mutate({
  permissionId: 'permission-uuid',
  attributes: ['id', 'username', 'email']
});
```

### 4. Context Integration

The permission system automatically loads user permissions into the tRPC context:

```typescript
// In your tRPC procedures, permissions are available via context
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  // ctx.user.permissions contains all user permissions
  const userPermissions = ctx.user.permissions;
  
  // You can also access the permission service
  const canEdit = await ctx.permissionService
    .can(ctx.user.role)
    .updateAny('user');

  return next({ ctx: { ...ctx, user: ctx.user } });
});
```

## Database Seeding

### Running Permission Seeders

```bash
# Seed permissions if none exist (recommended)
yarn seed:permissions

# Force seed all permissions (may create duplicates)
yarn seed:permissions:force  

# Re-seed all permissions (clears existing first)
yarn seed:permissions:reseed
```

### Seeder Details

The permission seeder (`src/database/seeders/permission.seeder.ts`) provides:

- **Smart seeding**: Only creates permissions if none exist
- **Comprehensive defaults**: Covers all three roles with appropriate permissions
- **Logging**: Detailed output showing what permissions are created
- **Error handling**: Graceful handling of database errors

## Permission Middleware Classes

### Convenience Classes

```typescript
// Pre-built permission checkers
CanCreateOwn('resource')    // Can create own resources
CanCreateAny('resource')    // Can create any resources
CanReadOwn('resource')      // Can read own resources
CanReadAny('resource')      // Can read any resources
CanUpdateOwn('resource')    // Can update own resources
CanUpdateAny('resource')    // Can update any resources
CanDeleteOwn('resource')    // Can delete own resources
CanDeleteAny('resource')    // Can delete any resources

// Generic permission checker
RequirePermission(resource, action, scope)
```

### Custom Permission Checks

```typescript
// Create custom permission middleware
export const CanManagePermissions = () => {
  return async ({ ctx, next }: { ctx: AuthenticatedContext; next: any }) => {
    const canManage = await ctx.permissionService
      .can(ctx.user.role)
      .createAny('permission');

    if (!canManage) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions to manage permissions',
      });
    }

    return next();
  };
};
```

## Best Practices

### 1. Resource Naming
- Use kebab-case for resource names: `user-profile`, `role-permission`
- Be specific: `user` vs `user-profile` vs `user-settings`

### 2. Attribute Filtering
- Use `['*']` for full access
- Specify exact fields for restricted access: `['id', 'username', 'email']`
- Consider sensitive fields like `password`, `secret_key`

### 3. Scope Usage
- Use `OWN` for user's own resources
- Use `ANY` for administrator access to all resources
- Consider context: users should typically only access their `OWN` data

### 4. Error Handling
```typescript
try {
  const hasPermission = await permissionService.hasPermission(
    user.role, 
    'user', 
    'DELETE', 
    'ANY'
  );
  
  if (!hasPermission) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Insufficient permissions'
    });
  }
} catch (error) {
  // Handle permission check errors
}
```

### 5. Testing Permissions
```typescript
// In your tests, mock the permission service
const mockPermissionService = {
  can: jest.fn().mockReturnValue({
    createAny: jest.fn().mockResolvedValue(true),
    readOwn: jest.fn().mockResolvedValue(true),
  }),
  hasPermission: jest.fn().mockResolvedValue(true),
};
```

## Migration and Updates

### Adding New Resources
1. Define new resource name
2. Create permissions in seeder
3. Update permission middleware
4. Add to admin permission router

### Modifying Existing Permissions
1. Update seeder with new permissions
2. Run `yarn seed:permissions:reseed`
3. Update documentation

### Role Changes
1. Update `UserRole` enum if needed
2. Update all related entities and services
3. Update seeder with new role permissions
4. Test thoroughly

## Troubleshooting

### Common Issues

1. **Permission not found**
   - Check if permissions are seeded: `yarn seed:permissions`
   - Verify resource name spelling
   - Check role assignment

2. **403 Forbidden errors**
   - Verify user has correct role
   - Check permission scope (OWN vs ANY)
   - Verify middleware is applied correctly

3. **Database connection errors in seeder**
   - Check environment variables
   - Ensure PostgreSQL is running
   - Verify database exists

### Debug Mode
Enable detailed permission logging:

```typescript
// In permission service
console.log('Checking permission:', {
  role: user.role,
  resource,
  action,
  scope,
  userPermissions
});
```

## API Reference

### PermissionService Methods

- `getPermissionsForRole(role: UserRole): Promise<Permission[]>`
- `can(role: UserRole): AccessControl`
- `hasPermission(role: UserRole, resource: string, action: string, scope: string): Promise<boolean>`
- `getFilteredAttributes(role: UserRole, resource: string, action: string, scope: string): Promise<string[]>`

### AccessControl Methods

- `createOwn(resource: string): Promise<boolean>`
- `createAny(resource: string): Promise<boolean>`
- `readOwn(resource: string): Promise<boolean>`
- `readAny(resource: string): Promise<boolean>`
- `updateOwn(resource: string): Promise<boolean>`
- `updateAny(resource: string): Promise<boolean>`
- `deleteOwn(resource: string): Promise<boolean>`
- `deleteAny(resource: string): Promise<boolean>`

### Admin Router Endpoints

- `admin.permission.getAll()` - Get all permissions
- `admin.permission.getByRole(role)` - Get permissions by role
- `admin.permission.assignToRole(data)` - Assign permission to role
- `admin.permission.removeFromRole(data)` - Remove permission from role
- `admin.permission.updateAttributes(data)` - Update permission attributes 