# Quasar - Full-Stack TypeScript Application with tRPC

A modern full-stack application built with NestJS backend, Next.js frontend applications, and end-to-end type safety using tRPC.

## 🏗️ Architecture Overview

This monorepo contains three main applications:

- **Backend** (`apps/backend`): NestJS API server with tRPC integration
- **Client App** (`apps/client`): Next.js client-facing application  
- **Admin App** (`apps/admin`): Next.js admin dashboard

### Technology Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, tRPC, JWT Authentication
- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Monorepo**: Nx workspace
- **Package Manager**: Yarn
- **Type Safety**: End-to-end with tRPC

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn package manager
- PostgreSQL database

### Installation

```bash
# Install dependencies
yarn install

# Setup environment variables
cp apps/backend/.env.example apps/backend/.env
# Configure your database connection and JWT secrets

# Run database migrations
yarn nx run backend:migration:run

# Start development servers
yarn nx serve backend  # Backend on http://localhost:3001
yarn nx serve client   # Client app on http://localhost:4200
yarn nx serve admin    # Admin app on http://localhost:4201
```

## 📡 tRPC API Architecture

### Backend Implementation

The backend uses tRPC for type-safe API procedures instead of traditional REST controllers.

#### Core tRPC Setup

```typescript
// apps/backend/src/trpc/trpc.ts
import { initTRPC } from '@trpc/server';
import { AuthenticatedContext } from './context';

const t = initTRPC.context<AuthenticatedContext>().create({
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
        httpStatus: (error.cause as any)?.httpStatus || (error as any)?.httpStatus,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const mergeRouters = t.mergeRouters;
```

#### Authentication Context

```typescript
// apps/backend/src/trpc/context.ts
export interface AuthenticatedContext {
  user?: AuthUser;
  req: any;
  res: any;
}

@Injectable()
export class AppContext implements TRPCContext {
  constructor(private readonly jwtService: JwtService) {}

  async create(opts: ContextOptions): Promise<AuthenticatedContext> {
    // Extract JWT from Authorization header
    // Verify token and populate user context
  }
}
```

### Available Routers

#### 1. Client User Router (`/trpc/client.*`)

**Public Procedures:**
- `client.register` - User registration
- `client.login` - User authentication  
- `client.refreshToken` - Token refresh

**Protected Procedures:**
- `client.getProfile` - Get user profile
- `client.updateProfile` - Update user profile

#### 2. Admin User Router (`/trpc/admin.*`)

**Admin-only Procedures:**
- `admin.createUser` - Create new user
- `admin.getAllUsers` - List all users with filtering
- `admin.getUserById` - Get user by ID
- `admin.updateUser` - Update user details
- `admin.deleteUser` - Delete user
- `admin.updateUserStatus` - Activate/deactivate user

### Middleware System

#### Authentication Middleware

```typescript
@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }
}
```

#### Admin Role Middleware

```typescript
@Injectable() 
export class AdminRoleMiddleware implements TRPCMiddleware {
  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    if (ctx.user.role !== UserRole.ADMIN && ctx.user.role !== UserRole.SUPER_ADMIN) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required',
      });
    }
    return next({ ctx });
  }
}
```

## 🎯 Frontend Integration

### Client Application Setup

```typescript
// apps/client/src/utils/trpc.ts
import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/types/app-router';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/trpc`,
          async headers() {
            const token = getAuthToken();
            return {
              authorization: token ? `Bearer ${token}` : '',
            };
          },
        }),
      ],
    };
  },
  ssr: false,
});
```

### Usage Examples

#### User Registration

```typescript
// In a React component
import { trpc } from '../utils/trpc';

export function RegisterForm() {
  const registerMutation = trpc.client.register.useMutation();

  const handleSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerMutation.mutateAsync({
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      });
      
      // Store tokens and redirect
      setAuthToken(result.accessToken);
      router.push('/dashboard');
    } catch (error) {
      // Handle validation errors with full type safety
      console.error(error.message);
    }
  };
}
```

#### Admin User Management

```typescript
// In admin components
export function UsersList() {
  const usersQuery = trpc.admin.getAllUsers.useQuery({
    page: 1,
    limit: 10,
    role: 'USER',
    isActive: true,
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
    },
  });

  if (usersQuery.isLoading) return <Loading />;
  if (usersQuery.error) return <Error error={usersQuery.error} />;

  return (
    <div>
      {usersQuery.data?.users.map(user => (
        <UserCard 
          key={user.id}
          user={user}
          onDelete={() => deleteUserMutation.mutate({ id: user.id })}
        />
      ))}
    </div>
  );
}
```

## 🔒 Authentication & Authorization

### JWT Token Flow

1. **Login**: Client sends credentials to `client.login`
2. **Token Response**: Backend returns `accessToken` and `refreshToken`
3. **Token Storage**: Frontend stores tokens in localStorage
4. **Request Authentication**: Tokens sent in Authorization header
5. **Token Refresh**: Use `client.refreshToken` before expiration

### Role-Based Access Control

- **USER**: Basic client application access
- **ADMIN**: Admin dashboard access + user management
- **SUPER_ADMIN**: Full system access

### Middleware Chain

```
Request → Auth Context → Auth Middleware → Role Middleware → Procedure
```

## 🏗️ Database Schema

### Core Entities

#### User Entity
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
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => UserProfile, profile => profile.user, { cascade: true })
  profile: UserProfile;
}
```

#### UserProfile Entity
```typescript
@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn()
  user: User;
}
```

## 🛠️ Development Workflow

### Project Structure

```
apps/
├── backend/           # NestJS API server
│   ├── src/
│   │   ├── trpc/      # tRPC routers, context, middlewares
│   │   ├── modules/   # Feature modules (user, admin, client)
│   │   ├── auth/      # Authentication system
│   │   └── types/     # Shared type definitions
├── client/            # Next.js client app
│   └── src/
│       ├── utils/     # tRPC client setup
│       └── pages/     # Application pages
└── admin/             # Next.js admin app
    └── src/
        ├── utils/     # tRPC client setup
        └── pages/     # Admin dashboard pages
```

### Available Commands

```bash
# Development
yarn nx serve backend          # Start backend server
yarn nx serve client           # Start client app
yarn nx serve admin            # Start admin app

# Building
yarn nx build backend          # Build backend
yarn nx build client           # Build client
yarn nx build admin            # Build admin

# Testing
yarn nx test backend           # Run backend tests
yarn nx test client            # Run client tests
yarn nx e2e client-e2e         # Run e2e tests

# Database
yarn nx run backend:migration:generate  # Generate migration
yarn nx run backend:migration:run       # Run migrations
yarn nx run backend:migration:revert    # Revert migration

# Linting & Formatting
yarn nx lint backend           # Lint backend
yarn nx format:check           # Check formatting
yarn nx format:write           # Format code
```

### Adding New Procedures

1. **Define Zod Schema**:
```typescript
const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  published: z.boolean().default(false),
});
```

2. **Create Procedure**:
```typescript
@UseMiddlewares(AuthMiddleware)
@Mutation({
  input: createPostSchema,
  output: postResponseSchema,
})
async createPost(
  @Input() input: z.infer<typeof createPostSchema>
): Promise<z.infer<typeof postResponseSchema>> {
  return await this.postService.create(input);
}
```

3. **Add to Router**:
```typescript
@Router({ path: 'posts' })
export class PostRouter {
  // procedures here
}
```

4. **Update AppRouter Type**:
```typescript
export type AppRouter = typeof appRouter;
```

## 🎯 Type Safety Benefits

### End-to-End Type Safety

- **Backend**: Zod schemas validate input/output
- **Frontend**: Full TypeScript inference from backend types
- **Runtime**: Input validation with detailed error messages
- **Development**: IntelliSense and compile-time error checking

### Example Type Flow

```typescript
// Backend procedure definition
const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
});

// Frontend usage - fully typed!
const createUser = trpc.admin.createUser.useMutation();
//    ^? (parameter) data: { email: string; username: string; }

// TypeScript will catch errors at compile time
createUser.mutate({
  email: "user@example.com",
  username: "us", // ❌ Error: Too short!
});
```

## 🚀 Deployment

### Environment Variables

**Backend** (`.env`):
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=quasar_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3001
NODE_ENV=production
```

**Frontend Apps**:
```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Production Deployment

1. **Build all applications**:
```bash
yarn nx build backend
yarn nx build client  
yarn nx build admin
```

2. **Database setup**:
```bash
yarn nx run backend:migration:run
```

3. **Start production servers**:
```bash
# Backend
cd dist/apps/backend && node main.js

# Frontend apps (use your preferred hosting)
# Static exports or serverless deployment
```

## 📚 Additional Resources

- [tRPC Documentation](https://trpc.io)
- [NestJS Documentation](https://nestjs.com) 
- [Next.js Documentation](https://nextjs.org)
- [Nx Monorepo Documentation](https://nx.dev)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
