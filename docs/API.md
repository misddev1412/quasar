# tRPC API Documentation

This document provides detailed information about all available tRPC procedures, their inputs, outputs, and usage examples.

## Table of Contents

- [Authentication](#authentication)
- [Client Router (`/trpc/client.*`)](#client-router)
- [Admin Router (`/trpc/admin.*`)](#admin-router)
- [Error Handling](#error-handling)
- [Type Definitions](#type-definitions)

## Authentication

All protected procedures require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Structure

```typescript
interface JwtPayload {
  sub: string;        // User ID
  email: string;      // User email
  username: string;   // Username
  role: UserRole;     // User role
  isActive: boolean;  // Account status
}
```

## Client Router

Base path: `/trpc/client`

### Public Procedures

#### `client.register`

**Description**: Register a new user account

**Type**: `Mutation`

**Input Schema**:
```typescript
{
  email: string;          // Valid email address
  username: string;       // Minimum 3 characters
  firstName: string;      // Minimum 2 characters  
  lastName: string;       // Minimum 2 characters
  password: string;       // Minimum 8 characters
  phoneNumber?: string;   // Optional phone number
}
```

**Output Schema**:
```typescript
{
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
    profile?: {
      id: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      dateOfBirth?: Date;
      avatar?: string;
      bio?: string;
      address?: string;
      city?: string;
      country?: string;
      postalCode?: string;
    };
  };
  accessToken: string;
  refreshToken?: string;
}
```

**Usage Example**:
```typescript
const registerMutation = trpc.client.register.useMutation();

const result = await registerMutation.mutateAsync({
  email: "john@example.com",
  username: "johnsmith",
  firstName: "John",
  lastName: "Smith", 
  password: "securepassword123",
  phoneNumber: "+1234567890"
});
```

---

#### `client.login`

**Description**: Authenticate user and get access tokens

**Type**: `Mutation`

**Input Schema**:
```typescript
{
  email: string;      // User's email
  password: string;   // User's password
}
```

**Output Schema**:
```typescript
{
  user: ClientUserResponse;  // Same as register response
  accessToken: string;
  refreshToken?: string;
}
```

**Usage Example**:
```typescript
const loginMutation = trpc.client.login.useMutation();

const result = await loginMutation.mutateAsync({
  email: "john@example.com",
  password: "securepassword123"
});

// Store tokens
setAuthToken(result.accessToken);
setRefreshToken(result.refreshToken);
```

---

#### `client.refreshToken`

**Description**: Refresh access token using refresh token

**Type**: `Mutation`

**Input Schema**:
```typescript
{
  refreshToken: string;  // Valid refresh token
}
```

**Output Schema**:
```typescript
{
  user: ClientUserResponse;
  accessToken: string;
  refreshToken?: string;
}
```

**Usage Example**:
```typescript
const refreshMutation = trpc.client.refreshToken.useMutation();

const result = await refreshMutation.mutateAsync({
  refreshToken: getRefreshToken()
});

setAuthToken(result.accessToken);
```

### Protected Procedures

#### `client.getProfile`

**Description**: Get current user's profile information

**Type**: `Query`

**Authentication**: Required

**Input**: None

**Output Schema**:
```typescript
{
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}
```

**Usage Example**:
```typescript
const profileQuery = trpc.client.getProfile.useQuery();

if (profileQuery.data) {
  console.log('User profile:', profileQuery.data);
}
```

---

#### `client.updateProfile`

**Description**: Update current user's profile information

**Type**: `Mutation`

**Authentication**: Required

**Input Schema**:
```typescript
{
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;    // ISO date string
  avatar?: string;         // URL or base64
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}
```

**Output Schema**:
```typescript
ClientUserResponse  // Updated user object
```

**Usage Example**:
```typescript
const updateProfileMutation = trpc.client.updateProfile.useMutation();

const result = await updateProfileMutation.mutateAsync({
  firstName: "John",
  lastName: "Doe",
  bio: "Software developer",
  city: "New York"
});
```

## Admin Router

Base path: `/trpc/admin`

All admin procedures require `ADMIN` or `SUPER_ADMIN` role.

### User Management

#### `admin.createUser`

**Description**: Create a new user (admin only)

**Type**: `Mutation`

**Authentication**: Required (Admin)

**Input Schema**:
```typescript
{
  email: string;          // Valid email
  username: string;       // Minimum 3 chars
  firstName: string;      // Minimum 2 chars
  lastName: string;       // Minimum 2 chars
  password: string;       // Minimum 8 chars
  phoneNumber?: string;   // Optional phone
  isActive?: boolean;     // Default: true
  role?: UserRole;        // Default: USER
}
```

**Output Schema**:
```typescript
{
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}
```

**Usage Example**:
```typescript
const createUserMutation = trpc.admin.createUser.useMutation();

const newUser = await createUserMutation.mutateAsync({
  email: "newuser@example.com",
  username: "newuser",
  firstName: "New",
  lastName: "User",
  password: "temporarypass123",
  role: "USER",
  isActive: true
});
```

---

#### `admin.getAllUsers`

**Description**: Get paginated list of all users with filtering

**Type**: `Query`

**Authentication**: Required (Admin)

**Input Schema**:
```typescript
{
  page?: number;         // Default: 1, minimum: 1
  limit?: number;        // Default: 10, min: 1, max: 100
  search?: string;       // Search in email/username
  role?: UserRole;       // Filter by role
  isActive?: boolean;    // Filter by active status
}
```

**Output Schema**:
```typescript
{
  users: AdminUserResponse[];
  total: number;         // Total count
  page: number;          // Current page
  limit: number;         // Items per page
}
```

**Usage Example**:
```typescript
const usersQuery = trpc.admin.getAllUsers.useQuery({
  page: 1,
  limit: 20,
  search: "john",
  role: "USER",
  isActive: true
});

console.log(`Found ${usersQuery.data?.total} users`);
usersQuery.data?.users.forEach(user => {
  console.log(`${user.username} (${user.email})`);
});
```

---

#### `admin.getUserById`

**Description**: Get detailed user information by ID

**Type**: `Query`

**Authentication**: Required (Admin)

**Input Schema**:
```typescript
{
  id: string;  // User UUID
}
```

**Output Schema**:
```typescript
AdminUserResponse  // Detailed user object
```

**Usage Example**:
```typescript
const userQuery = trpc.admin.getUserById.useQuery({
  id: "user-uuid-here"
});

if (userQuery.data) {
  console.log('User details:', userQuery.data);
}
```

---

#### `admin.updateUser`

**Description**: Update user information

**Type**: `Mutation`

**Authentication**: Required (Admin)

**Input Schema**:
```typescript
{
  id: string;              // User ID to update
  email?: string;          // New email
  username?: string;       // New username
  isActive?: boolean;      // Account status
  role?: UserRole;         // User role
}
```

**Output Schema**:
```typescript
AdminUserResponse  // Updated user object
```

**Usage Example**:
```typescript
const updateUserMutation = trpc.admin.updateUser.useMutation();

const updatedUser = await updateUserMutation.mutateAsync({
  id: "user-uuid",
  email: "newemail@example.com",
  role: "ADMIN",
  isActive: true
});
```

---

#### `admin.deleteUser`

**Description**: Permanently delete a user

**Type**: `Mutation`

**Authentication**: Required (Admin)

**Input Schema**:
```typescript
{
  id: string;  // User UUID to delete
}
```

**Output**: `void`

**Usage Example**:
```typescript
const deleteUserMutation = trpc.admin.deleteUser.useMutation();

await deleteUserMutation.mutateAsync({
  id: "user-uuid-to-delete"
});

console.log('User deleted successfully');
```

---

#### `admin.updateUserStatus`

**Description**: Activate or deactivate a user account

**Type**: `Mutation`

**Authentication**: Required (Admin)

**Input Schema**:
```typescript
{
  id: string;         // User UUID
  isActive: boolean;  // New status
}
```

**Output Schema**:
```typescript
AdminUserResponse  // Updated user object
```

**Usage Example**:
```typescript
const updateStatusMutation = trpc.admin.updateUserStatus.useMutation();

// Deactivate user
const result = await updateStatusMutation.mutateAsync({
  id: "user-uuid",
  isActive: false
});

console.log(`User ${result.username} is now ${result.isActive ? 'active' : 'inactive'}`);
```

## Error Handling

### Error Types

tRPC procedures can throw the following error codes:

- `BAD_REQUEST` (400): Invalid input data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions  
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `INTERNAL_SERVER_ERROR` (500): Server error

### Error Response Format

```typescript
{
  code: string;           // tRPC error code
  message: string;        // Human-readable message
  data: {
    code: string;         // Same as above
    httpStatus?: number;  // HTTP status code
    path: string;         // Procedure path
    stack?: string;       // Stack trace (development)
  };
}
```

### Handling Errors

```typescript
// Using mutations
const mutation = trpc.client.register.useMutation({
  onError: (error) => {
    if (error.data?.code === 'CONFLICT') {
      console.error('User already exists');
    } else if (error.data?.code === 'BAD_REQUEST') {
      console.error('Invalid input:', error.message);
    }
  },
  onSuccess: (data) => {
    console.log('Registration successful');
  }
});

// Using queries with error boundaries
const query = trpc.admin.getAllUsers.useQuery(
  { page: 1, limit: 10 },
  {
    onError: (error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        // Redirect to login
        router.push('/login');
      }
    }
  }
);

// Try-catch with async/await
try {
  const result = await trpc.client.login.mutate({
    email: "user@example.com",
    password: "password"
  });
} catch (error) {
  if (error.data?.code === 'UNAUTHORIZED') {
    console.error('Invalid credentials');
  }
}
```

## Type Definitions

### Core Types

```typescript
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN', 
  SUPER_ADMIN = 'SUPER_ADMIN'
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  avatar?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

interface ClientUserResponse {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

interface AdminUserResponse {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

interface AuthResponse {
  user: ClientUserResponse;
  accessToken: string;
  refreshToken?: string;
}
```

### Usage with TypeScript

```typescript
// Import the AppRouter type
import type { AppRouter } from '../../../backend/src/types/app-router';

// Create typed tRPC client
const trpc = createTRPCNext<AppRouter>({...});

// All procedures are now fully typed
const users = await trpc.admin.getAllUsers.query({
  page: 1,
  limit: 10
});
// users is typed as GetUsersResponse

const newUser = await trpc.admin.createUser.mutate({
  email: "test@example.com",
  username: "testuser",
  firstName: "Test",
  lastName: "User",
  password: "password123"
});
// newUser is typed as AdminUserResponse
```

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider adding:

- Request rate limiting per IP
- Authentication attempt limiting
- API key-based rate limiting for different tiers

## Caching

tRPC supports various caching strategies:

- **Query caching**: Automatic with React Query
- **Server-side caching**: Can be implemented per procedure
- **CDN caching**: For static responses

Example with custom cache:

```typescript
const usersQuery = trpc.admin.getAllUsers.useQuery(
  { page: 1, limit: 10 },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);
``` 