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
yarn nx serve admin    # Admin app on http://localhost:4200 (default)

# Or with custom port
PORT=3000 yarn nx serve admin  # Admin app on http://localhost:3000
```


## 🧩 Section Manager

The Section Manager provides a multi-language content layout system that lets administrators compose the home page from reusable sections. It ships with:

- Drag-and-drop ordering and enable/disable controls in `apps/admin` → `/sections/[page]`.
- Structured JSON configs per section type with per-locale overrides.
- Public `sections.list(page, locale)` tRPC endpoint consumed by the Next.js frontend.
- Seed data that provisions a production-ready home page layout.

### Section Config Shapes

Each section entry contains a `config` object with type-specific settings. Example payloads:

- `hero_slider`
  ```json
  {
    "autoplay": true,
    "interval": 6000,
    "slides": [
      {
        "id": "hero-default-1",
        "title": "Build immersive storefronts",
        "subtitle": "Composable experiences tailored to every launch",
        "imageUrl": "https://...",
        "ctaLabel": "Explore sections",
        "ctaUrl": "#sections"
      }
    ]
  }
  ```
- `featured_products`
  ```json
  {
    "productIds": ["SKU-1001", "SKU-1002"],
    "displayStyle": "grid",
    "itemsPerRow": 4
  }
  ```
- `products_by_category`
  ```json
  {
    "displayStyle": "grid",
    "rows": [
      {
        "id": "homepage-row-1",
        "strategy": "latest",
        "productIds": [],
        "limit": 6
      },
      {
        "id": "homepage-row-2",
        "strategy": "featured",
        "productIds": [],
        "limit": 6
      },
      {
        "id": "homepage-row-3",
        "strategy": "custom",
        "productIds": [],
        "limit": 6
      }
    ]
  }
  ```

  Strategies:
  - `latest`: auto-load the newest products from the selected category.
  - `featured`: auto-load featured products from the selected category.
  - `bestsellers`: placeholder for upcoming sales statistics (currently disabled).
  - `custom`: manually pick specific product IDs (tooling surface provides category-aware picker).
- `news`
  ```json
  {
    "limit": 3,
    "categories": ["press", "product"]
  }
  ```
- `custom_html`
  ```json
  {
    "html": "<div class="rounded-3xl...">Campaign content</div>"
  }
  ```

Translations can optionally provide a `configOverride` JSON blob to tweak config per locale (for example, localized CTA labels).

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


---

## Consolidated Documentation

### Admin Access Error Enhancement  \n<small>Source: `ADMIN_ACCESS_ERROR_ENHANCEMENT.md`</small>

## Overview
Enhanced the "You do not have admin access" error message display in the login form to make it more prominent and user-friendly.

## Changes Made

### 1. Enhanced LoginForm Error Display
**File**: `apps/admin/src/components/auth/LoginForm.tsx`

**Before** (Small, less noticeable):
```jsx
<div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-600 text-red-800 shadow-lg animate-pulse-slow transition-all duration-300">
  <div className="flex items-center">
    <div className="flex-shrink-0">
      <AlertIcon className="h-6 w-6 text-red-600" />
    </div>
    <div className="ml-3 flex-1">
      <p className="text-base font-bold">{error}</p>
      <p className="text-sm mt-1">{t('auth.check_credentials')}</p>
    </div>
  </div>
</div>
```

**After** (Large, prominent alert box):
```jsx
<AlertBox
  type="error"
  size="lg"
  title={t('auth.access_denied')}
  message={error}
  description={
    error.includes('admin access') 
      ? t('auth.admin_access_required') 
      : t('auth.check_credentials')
  }
  footer={t('auth.contact_support')}
  className="shadow-2xl border-red-300 dark:border-red-700 ring-4 ring-red-100 dark:ring-red-900/50"
/>
```

### 2. Created Reusable AlertBox Component
**File**: `apps/admin/src/components/common/AlertBox.tsx`

Features:
- **4 Types**: error, warning, success, info
- **3 Sizes**: sm, md, lg  
- **Enhanced Styling**: Custom shadows, animations, ring effects
- **Accessibility**: Proper ARIA roles and labels
- **Dark Mode Support**: Complete dark theme compatibility
- **Responsive**: Works on all screen sizes

### 3. Added Translation Keys
**Files**: 
- `apps/admin/src/i18n/locales/en.json`
- `apps/admin/src/i18n/locales/vi.json`

New translation keys added:
```json
{
  "auth": {
    "access_denied": "Access Denied",
    "admin_access_required": "This system requires administrator privileges. Please contact your system administrator if you believe you should have access.",
    "contact_support": "If you need assistance, please contact technical support for help."
  }
}
```

### 4. Visual Improvements

#### Enhanced Error Alert Features:
- **Larger Size**: Uses `lg` size with increased padding (32px)
- **Prominent Icon**: 32px × 32px alert icon with background circle
- **Better Typography**: 
  - Large bold title "Access Denied"
  - Semibold error message
  - Descriptive help text
  - Footer with support information
- **Enhanced Styling**:
  - Rounded corners (xl)
  - Shadow effects (shadow-2xl)
  - Red ring effect for emphasis
  - Hover animations
  - Pulse animation for errors
  - Dark mode support
- **Better UX**:
  - Contextual messages (different text for admin access vs general errors)
  - Clear call-to-action (contact support)
  - More professional appearance

#### Before vs After Comparison:

**Before**: Small red bar with basic text
- Height: ~60px
- Basic left border
- Small icon (24px)
- Minimal text

**After**: Large prominent alert box
- Height: ~150px
- Full border with ring effect
- Large icon (32px) with background
- Rich content with title, message, description, and footer
- Professional appearance
- Better accessibility

### 5. Demo Component
**File**: `apps/admin/src/components/demo/AlertDemo.tsx`

Created a demo component showcasing:
- Enhanced admin access error
- Comparison with old small error
- Other alert types (warning, success, info)

## Usage

The enhanced error will automatically appear when:
1. User tries to login without admin privileges
2. Backend returns "You do not have admin access" error
3. Any other authentication error occurs

The AlertBox component can be reused throughout the application for consistent error/success/warning messaging.

## Technical Details

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: CSS transitions and animations
- **Accessibility**: ARIA roles and proper semantic HTML
- **Internationalization**: Full i18n support (English/Vietnamese)
- **Responsive**: Mobile and desktop compatible
- **Dark Mode**: Complete dark theme support

## Testing

- ✅ TypeScript compilation successful
- ✅ Build process successful
- ✅ No console errors
- ✅ Translation keys properly added
- ✅ Component exports working correctly
- ✅ Dark mode styling verified



### Task Master AI - Agent Integration Guide  \n<small>Source: `AGENTS.md`</small>

## Essential Commands

### Core Workflow Commands

```bash
# Project Setup
task-master init                                    # Initialize Task Master in current project
task-master parse-prd .taskmaster/docs/prd.txt      # Generate tasks from PRD document
task-master models --setup                        # Configure AI models interactively

# Daily Development Workflow
task-master list                                   # Show all tasks with status
task-master next                                   # Get next available task to work on
task-master show <id>                             # View detailed task information (e.g., task-master show 1.2)
task-master set-status --id=<id> --status=done    # Mark task complete

# Task Management
task-master add-task --prompt="description" --research        # Add new task with AI assistance
task-master expand --id=<id> --research --force              # Break task into subtasks
task-master update-task --id=<id> --prompt="changes"         # Update specific task
task-master update --from=<id> --prompt="changes"            # Update multiple tasks from ID onwards
task-master update-subtask --id=<id> --prompt="notes"        # Add implementation notes to subtask

# Analysis & Planning
task-master analyze-complexity --research          # Analyze task complexity
task-master complexity-report                      # View complexity analysis
task-master expand --all --research               # Expand all eligible tasks

# Dependencies & Organization
task-master add-dependency --id=<id> --depends-on=<id>       # Add task dependency
task-master move --from=<id> --to=<id>                       # Reorganize task hierarchy
task-master validate-dependencies                            # Check for dependency issues
task-master generate                                         # Update task markdown files (usually auto-called)
```

## Key Files & Project Structure

### Core Files

- `.taskmaster/tasks/tasks.json` - Main task data file (auto-managed)
- `.taskmaster/config.json` - AI model configuration (use `task-master models` to modify)
- `.taskmaster/docs/prd.txt` - Product Requirements Document for parsing
- `.taskmaster/tasks/*.txt` - Individual task files (auto-generated from tasks.json)
- `.env` - API keys for CLI usage

### Claude Code Integration Files

- `CLAUDE.md` - Auto-loaded context for Claude Code (this file)
- `.claude/settings.json` - Claude Code tool allowlist and preferences
- `.claude/commands/` - Custom slash commands for repeated workflows
- `.mcp.json` - MCP server configuration (project-specific)

### Directory Structure

```
project/
├── .taskmaster/
│   ├── tasks/              # Task files directory
│   │   ├── tasks.json      # Main task database
│   │   ├── task-1.md      # Individual task files
│   │   └── task-2.md
│   ├── docs/              # Documentation directory
│   │   ├── prd.txt        # Product requirements
│   ├── reports/           # Analysis reports directory
│   │   └── task-complexity-report.json
│   ├── templates/         # Template files
│   │   └── example_prd.txt  # Example PRD template
│   └── config.json        # AI models & settings
├── .claude/
│   ├── settings.json      # Claude Code configuration
│   └── commands/         # Custom slash commands
├── .env                  # API keys
├── .mcp.json            # MCP configuration
└── CLAUDE.md            # This file - auto-loaded by Claude Code
```

## MCP Integration

Task Master provides an MCP server that Claude Code can connect to. Configure in `.mcp.json`:

```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "your_key_here",
        "PERPLEXITY_API_KEY": "your_key_here",
        "OPENAI_API_KEY": "OPENAI_API_KEY_HERE",
        "GOOGLE_API_KEY": "GOOGLE_API_KEY_HERE",
        "XAI_API_KEY": "XAI_API_KEY_HERE",
        "OPENROUTER_API_KEY": "OPENROUTER_API_KEY_HERE",
        "MISTRAL_API_KEY": "MISTRAL_API_KEY_HERE",
        "AZURE_OPENAI_API_KEY": "AZURE_OPENAI_API_KEY_HERE",
        "OLLAMA_API_KEY": "OLLAMA_API_KEY_HERE"
      }
    }
  }
}
```

### Essential MCP Tools

```javascript
help; // = shows available taskmaster commands
// Project setup
initialize_project; // = task-master init
parse_prd; // = task-master parse-prd

// Daily workflow
get_tasks; // = task-master list
next_task; // = task-master next
get_task; // = task-master show <id>
set_task_status; // = task-master set-status

// Task management
add_task; // = task-master add-task
expand_task; // = task-master expand
update_task; // = task-master update-task
update_subtask; // = task-master update-subtask
update; // = task-master update

// Analysis
analyze_project_complexity; // = task-master analyze-complexity
complexity_report; // = task-master complexity-report
```

## Claude Code Workflow Integration

### Standard Development Workflow

#### 1. Project Initialization

```bash
# Initialize Task Master
task-master init

# Create or obtain PRD, then parse it
task-master parse-prd .taskmaster/docs/prd.txt

# Analyze complexity and expand tasks
task-master analyze-complexity --research
task-master expand --all --research
```

If tasks already exist, another PRD can be parsed (with new information only!) using parse-prd with --append flag. This will add the generated tasks to the existing list of tasks..

#### 2. Daily Development Loop

```bash
# Start each session
task-master next                           # Find next available task
task-master show <id>                     # Review task details

# During implementation, check in code context into the tasks and subtasks
task-master update-subtask --id=<id> --prompt="implementation notes..."

# Complete tasks
task-master set-status --id=<id> --status=done
```

#### 3. Multi-Claude Workflows

For complex projects, use multiple Claude Code sessions:

```bash
# Terminal 1: Main implementation
cd project && claude

# Terminal 2: Testing and validation
cd project-test-worktree && claude

# Terminal 3: Documentation updates
cd project-docs-worktree && claude
```

### Custom Slash Commands

Create `.claude/commands/taskmaster-next.md`:

```markdown
Find the next available Task Master task and show its details.

Steps:

1. Run `task-master next` to get the next task
2. If a task is available, run `task-master show <id>` for full details
3. Provide a summary of what needs to be implemented
4. Suggest the first implementation step
```

Create `.claude/commands/taskmaster-complete.md`:

```markdown
Complete a Task Master task: $ARGUMENTS

Steps:

1. Review the current task with `task-master show $ARGUMENTS`
2. Verify all implementation is complete
3. Run any tests related to this task
4. Mark as complete: `task-master set-status --id=$ARGUMENTS --status=done`
5. Show the next available task with `task-master next`
```

## Tool Allowlist Recommendations

Add to `.claude/settings.json`:

```json
{
  "allowedTools": [
    "Edit",
    "Bash(task-master *)",
    "Bash(git commit:*)",
    "Bash(git add:*)",
    "Bash(npm run *)",
    "mcp__task_master_ai__*"
  ]
}
```

## Configuration & Setup

### API Keys Required

At least **one** of these API keys must be configured:

- `ANTHROPIC_API_KEY` (Claude models) - **Recommended**
- `PERPLEXITY_API_KEY` (Research features) - **Highly recommended**
- `OPENAI_API_KEY` (GPT models)
- `GOOGLE_API_KEY` (Gemini models)
- `MISTRAL_API_KEY` (Mistral models)
- `OPENROUTER_API_KEY` (Multiple models)
- `XAI_API_KEY` (Grok models)

An API key is required for any provider used across any of the 3 roles defined in the `models` command.

### Model Configuration

```bash
# Interactive setup (recommended)
task-master models --setup

# Set specific models
task-master models --set-main claude-3-5-sonnet-20241022
task-master models --set-research perplexity-llama-3.1-sonar-large-128k-online
task-master models --set-fallback gpt-4o-mini
```

## Task Structure & IDs

### Task ID Format

- Main tasks: `1`, `2`, `3`, etc.
- Subtasks: `1.1`, `1.2`, `2.1`, etc.
- Sub-subtasks: `1.1.1`, `1.1.2`, etc.

### Task Status Values

- `pending` - Ready to work on
- `in-progress` - Currently being worked on
- `done` - Completed and verified
- `deferred` - Postponed
- `cancelled` - No longer needed
- `blocked` - Waiting on external factors

### Task Fields

```json
{
  "id": "1.2",
  "title": "Implement user authentication",
  "description": "Set up JWT-based auth system",
  "status": "pending",
  "priority": "high",
  "dependencies": ["1.1"],
  "details": "Use bcrypt for hashing, JWT for tokens...",
  "testStrategy": "Unit tests for auth functions, integration tests for login flow",
  "subtasks": []
}
```

## Claude Code Best Practices with Task Master

### Context Management

- Use `/clear` between different tasks to maintain focus
- This CLAUDE.md file is automatically loaded for context
- Use `task-master show <id>` to pull specific task context when needed

### Iterative Implementation

1. `task-master show <subtask-id>` - Understand requirements
2. Explore codebase and plan implementation
3. `task-master update-subtask --id=<id> --prompt="detailed plan"` - Log plan
4. `task-master set-status --id=<id> --status=in-progress` - Start work
5. Implement code following logged plan
6. `task-master update-subtask --id=<id> --prompt="what worked/didn't work"` - Log progress
7. `task-master set-status --id=<id> --status=done` - Complete task

### Complex Workflows with Checklists

For large migrations or multi-step processes:

1. Create a markdown PRD file describing the new changes: `touch task-migration-checklist.md` (prds can be .txt or .md)
2. Use Taskmaster to parse the new prd with `task-master parse-prd --append` (also available in MCP)
3. Use Taskmaster to expand the newly generated tasks into subtasks. Consdier using `analyze-complexity` with the correct --to and --from IDs (the new ids) to identify the ideal subtask amounts for each task. Then expand them.
4. Work through items systematically, checking them off as completed
5. Use `task-master update-subtask` to log progress on each task/subtask and/or updating/researching them before/during implementation if getting stuck

### Git Integration

Task Master works well with `gh` CLI:

```bash
# Create PR for completed task
gh pr create --title "Complete task 1.2: User authentication" --body "Implements JWT auth system as specified in task 1.2"

# Reference task in commits
git commit -m "feat: implement JWT auth (task 1.2)"
```

### Parallel Development with Git Worktrees

```bash
# Create worktrees for parallel task development
git worktree add ../project-auth feature/auth-system
git worktree add ../project-api feature/api-refactor

# Run Claude Code in each worktree
cd ../project-auth && claude    # Terminal 1: Auth work
cd ../project-api && claude     # Terminal 2: API work
```

## Troubleshooting

### AI Commands Failing

```bash
# Check API keys are configured
cat .env                           # For CLI usage

# Verify model configuration
task-master models

# Test with different model
task-master models --set-fallback gpt-4o-mini
```

### MCP Connection Issues

- Check `.mcp.json` configuration
- Verify Node.js installation
- Use `--mcp-debug` flag when starting Claude Code
- Use CLI as fallback if MCP unavailable

### Task File Sync Issues

```bash
# Regenerate task files from tasks.json
task-master generate

# Fix dependency issues
task-master fix-dependencies
```

DO NOT RE-INITIALIZE. That will not do anything beyond re-adding the same Taskmaster core files.

## Important Notes

### AI-Powered Operations

These commands make AI calls and may take up to a minute:

- `parse_prd` / `task-master parse-prd`
- `analyze_project_complexity` / `task-master analyze-complexity`
- `expand_task` / `task-master expand`
- `expand_all` / `task-master expand --all`
- `add_task` / `task-master add-task`
- `update` / `task-master update`
- `update_task` / `task-master update-task`
- `update_subtask` / `task-master update-subtask`

### File Management

- Never manually edit `tasks.json` - use commands instead
- Never manually edit `.taskmaster/config.json` - use `task-master models`
- Task markdown files in `tasks/` are auto-generated
- Run `task-master generate` after manual changes to tasks.json

### Claude Code Session Management

- Use `/clear` frequently to maintain focused context
- Create custom slash commands for repeated Task Master workflows
- Configure tool allowlist to streamline permissions
- Use headless mode for automation: `claude -p "task-master next"`

### Multi-Task Updates

- Use `update --from=<id>` to update multiple future tasks
- Use `update-task --id=<id>` for single task updates
- Use `update-subtask --id=<id>` for implementation logging

### Research Mode

- Add `--research` flag for research-based AI enhancement
- Requires a research model API key like Perplexity (`PERPLEXITY_API_KEY`) in environment
- Provides more informed task creation and updates
- Recommended for complex technical tasks

---

_This guide ensures Claude Code has immediate access to Task Master's essential functionality for agentic development workflows._



### Backend Architecture - Separated Logic for Admin & Client  \n<small>Source: `BACKEND_ARCHITECTURE.md`</small>

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



### Task Master AI Instructions  \n<small>Source: `CLAUDE.md`</small>

- don't run migration, let me run manually, just annoucement me when you need run
- don't use any type, it's not best practice
- run build by nx nx run {apps}:build
- don't use type any

**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md



### Vietnamese DateTime Formatting  \n<small>Source: `DATETIME_FORMATTING.md`</small>

## Overview
The Table component now supports Vietnamese (vi) datetime formatting that automatically adapts based on the current user language setting.

## Features

### Multi-language Support
- **English (en)**: Standard English relative time formatting
- **Vietnamese (vi)**: Vietnamese relative time formatting with proper Vietnamese date formats

### Relative Time Display

When displaying datetime columns with `type: 'datetime'`, the system shows:

#### English Format:
- `Just now` - for items created within the last minute
- `1 minute ago`, `5 minutes ago` - for recent minutes
- `1 hour ago`, `3 hours ago` - for recent hours  
- `Yesterday` - for yesterday
- `2 days ago`, `5 days ago` - for recent days
- `Jan 15, 2024` - for dates older than a week

#### Vietnamese Format:
- `Vừa xong` - for items created within the last minute
- `1 phút trước`, `5 phút trước` - for recent minutes
- `1 giờ trước`, `3 giờ trước` - for recent hours
- `Hôm qua` - for yesterday
- `2 ngày trước`, `5 ngày trước` - for recent days
- `15 tháng 1, 2024` - for dates older than a week (full Vietnamese date format)

### Raw Data Display
Both formats display the raw ISO timestamp on a second line for precision:
```
Vừa xong
2024-01-15T10:30:00.000Z
```

## Implementation

### How It Works
1. The `DateTimeDisplay` component automatically detects the current language using `useTranslationWithBackend()`
2. The `formatDateTime` function formats dates based on the detected locale
3. Vietnamese users see Vietnamese relative time, English users see English relative time

### Usage in Tables
Simply add `type: 'datetime'` to any column definition:

```tsx
const columns: Column<MyType>[] = [
  {
    id: 'createdAt',
    header: 'Created At',
    accessor: 'createdAt', 
    type: 'datetime', // This enables Vietnamese/English formatting
    isSortable: true,
    hideable: true,
  },
  // ... other columns
];
```

### Language Detection
The system automatically detects the current language from:
- `i18n.resolvedLanguage` from the translation hook
- Falls back to 'en' if language detection fails

## Examples

### Vietnamese (vi locale):
- Recent: `Vừa xong`, `5 phút trước`, `2 giờ trước`
- Yesterday: `Hôm qua`
- Past week: `3 ngày trước`
- Older: `15 tháng 1, 2024`

### English (en locale):
- Recent: `Just now`, `5 minutes ago`, `2 hours ago`  
- Yesterday: `Yesterday`
- Past week: `3 days ago`
- Older: `Jan 15, 2024`

## Pages Updated
All admin pages now support Vietnamese datetime formatting:
- ✅ Permissions page (`createdAt`)
- ✅ Users page (`createdAt`) 
- ✅ Roles page (`createdAt`)
- ✅ Mail Templates page (`updatedAt`)
- ✅ Posts page (`createdAt`, `publishedAt`)
- ✅ Languages page (`createdAt`)

## Technical Details

### Components
- `formatDateTime(value, locale, t)`: Core formatting function
- `DateTimeDisplay`: React component that renders formatted datetime
- Automatically detects locale and formats accordingly

### Supported Locales
- `en`: English
- `vi`: Vietnamese

Future locales can be easily added by extending the `formatDateTime` function.



### User Filter Expansion Implementation  \n<small>Source: `FILTER_EXPANSION_SUMMARY.md`</small>

## Overview

The user management page at `/apps/admin/src/pages/users/index.tsx` has been expanded to support additional URL filter parameters beyond the basic `dateFrom`, `dateTo`, `page`, and `sort` parameters.

## Expanded Filter Parameters

### Original Filters
- `role` - UserRole enum (super_admin, admin, manager, user, guest)
- `isActive` - boolean (true/false)
- `dateFrom` - string (YYYY-MM-DD format)
- `dateTo` - string (YYYY-MM-DD format)
- `page` - number (pagination, excluded from filter expansion)
- `sortBy` - string (sorting field, excluded from filter expansion)
- `sortOrder` - string (asc/desc, excluded from filter expansion)

### New Expanded Filters
- `isVerified` - boolean (true/false) - User verification status
- `email` - string - Email domain or pattern filter (e.g., "@company.com")
- `username` - string - Username pattern filter
- `hasProfile` - boolean (true/false) - Users with/without complete profile
- `country` - string - Filter by country from user profile
- `city` - string - Filter by city from user profile
- `lastLoginFrom` - string (YYYY-MM-DD) - Last login date range start
- `lastLoginTo` - string (YYYY-MM-DD) - Last login date range end
- `createdFrom` - string (YYYY-MM-DD) - Alternative to dateFrom
- `createdTo` - string (YYYY-MM-DD) - Alternative to dateTo

## Implementation Details

### Files Modified

1. **`apps/admin/src/types/user.ts`**
   - Expanded `UserFiltersType` interface with new filter fields

2. **`apps/admin/src/pages/users/index.tsx`**
   - Added validation functions for new parameter types
   - Updated filter state initialization from URL parameters
   - Modified all URL update functions to include new filters
   - Enhanced query parameters sent to API

3. **`apps/admin/src/components/features/UserFilters.tsx`**
   - Added new filter UI components (Select, Input, DateInput)
   - Expanded filter summary display with color-coded filter tags
   - Updated date change handler to support new date fields

### URL Parameter Examples

#### Basic Usage (Original)
```
/users?dateFrom=2025-08-11&dateTo=2025-08-12&page=1&role=admin&isActive=true
```

#### Expanded Usage (New)
```
/users?dateFrom=2025-08-01&dateTo=2025-08-31&email=@company.com&username=admin&hasProfile=true&isVerified=false&country=United States&city=New York&lastLoginFrom=2025-08-10&lastLoginTo=2025-08-12&page=2&sortBy=email
```

#### Alternative Date Parameters
```
/users?createdFrom=2025-07-01&createdTo=2025-07-31&role=user&page=1
```

### Validation and Error Handling

- **Date Validation**: Uses regex pattern `/^\d{4}-\d{2}-\d{2}$/` for YYYY-MM-DD format
- **Boolean Validation**: Only accepts 'true' or 'false' strings
- **Role Validation**: Validates against UserRole enum values
- **String Validation**: Trims whitespace and filters empty strings
- **Fallback Logic**: `dateFrom`/`dateTo` take precedence over `createdFrom`/`createdTo`

### UI Components

#### Filter Grid Layout
- **Row 1**: Status, Role, Date From, Date To
- **Row 2**: Verification Status, Profile Status, Email Domain, Username Pattern
- **Row 3**: Country, City, Last Login From, Last Login To

#### Filter Summary Tags
Each active filter displays as a colored tag with:
- Filter name and value
- Remove button (X) to clear individual filters
- Color coding by filter type:
  - Green: Status (isActive)
  - Violet: Role
  - Amber: Registration dates
  - Blue: Verification status
  - Indigo: Profile status
  - Pink: Email filter
  - Cyan: Username filter
  - Teal: Country filter
  - Orange: City filter
  - Purple: Last login dates

### Backend Compatibility

The expanded filters are prepared for backend support but currently:
- Basic filters (`role`, `isActive`, `dateFrom`, `dateTo`) are sent to API
- Additional filters are included in query parameters for future backend implementation
- No breaking changes to existing API calls

### Testing

A test utility file has been created at `apps/admin/src/utils/filterExpansion.test.ts` that demonstrates:
- URL parameter parsing with various combinations
- Validation of different parameter types
- Handling of invalid parameters
- Priority handling for overlapping parameters

## Usage Examples

### Detecting URL Filters
The system automatically detects and applies URL parameters when the page loads:

```typescript
// URL: /users?dateFrom=2025-08-11&dateTo=2025-08-12&email=@company.com&hasProfile=true
// Results in filters:
{
  dateFrom: "2025-08-11",
  dateTo: "2025-08-12",
  email: "@company.com",
  hasProfile: true
}
```

### Filter State Management
All filters are synchronized with URL parameters:
- Changing filters updates the URL
- Browser back/forward navigation works correctly
- Direct URL access applies filters immediately
- Page refresh maintains filter state

## Future Enhancements

1. **Backend Integration**: Implement server-side filtering for new parameters
2. **Advanced Filters**: Add date range presets, multi-select options
3. **Filter Persistence**: Save user filter preferences
4. **Export Functionality**: Export filtered results
5. **Filter Analytics**: Track commonly used filter combinations

## Notes

- Page and sort parameters are excluded from filter expansion as requested
- All new filters are optional and backward compatible
- The implementation maintains existing functionality while adding new capabilities
- UI is responsive and works on mobile devices
- Accessibility features are maintained for all new components



### Firebase Backend Authentication Implementation  \n<small>Source: `FIREBASE_BACKEND_IMPLEMENTATION.md`</small>

## ✅ **What We've Implemented**

### 1. Database Schema Changes
- **Migration**: `1759000000000-AddFirebaseAuthenticationSupport.ts`
- **New Table**: `user_login_providers` - tracks multiple auth methods per user
- **User Table Updates**: Added Firebase fields (`firebase_uid`, `provider`, `provider_id`, `avatar_url`, `email_verified`, `last_login_at`, `login_count`)

### 2. Entity Updates
- **UserLoginProvider Entity**: New entity for managing multiple auth providers
- **User Entity**: Enhanced with Firebase authentication fields and AuthProvider enum
- **AuthProvider Enum**: Support for EMAIL, GOOGLE, FACEBOOK, TWITTER, GITHUB, FIREBASE

### 3. Backend Services
- **FirebaseAuthService**: Complete Firebase authentication service with:
  - Firebase ID token verification
  - User creation from Firebase data
  - User linking for existing accounts  
  - Login provider tracking
  - JWT token generation
  - Social provider mapping

- **UserService**: Basic user management service for role assignment

### 4. API Integration
- **AdminAuthRouter**: Updated `loginWithFirebase` mutation to use new FirebaseAuthService
- **Module Registration**: Added all entities and services to UserModule
- **AppModule**: Registered new entities in TypeORM configuration

## 🔧 **Next Steps to Complete Setup**

### 1. Run Migration
```bash
npm run migration:run
```

### 2. Initialize Firebase Admin SDK
You need to add Firebase Admin SDK initialization. Create a service:

```typescript
// apps/backend/src/modules/firebase/services/firebase-admin.service.ts
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }
}
```

### 3. Environment Variables
Add to your `.env` file:
```env
FIREBASE_PROJECT_ID=quasar-5673a
FIREBASE_CLIENT_EMAIL=your-service-account@quasar-5673a.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Enable Firebase Authentication Providers
In Firebase Console (https://console.firebase.google.com/project/quasar-5673a/authentication/providers):
- ✅ Enable Google Sign-In
- ✅ Enable Facebook Sign-In  
- ✅ Enable Twitter Sign-In
- ✅ Enable GitHub Sign-In

### 5. Frontend Integration Test
Once backend is running, test the social login buttons on your login page.

## 🎯 **How Firebase Authentication Works**

### User Registration Flow:
1. **New User**: Creates user with Firebase UID, assigns default role, creates login provider record
2. **Existing User**: Links Firebase UID to existing account, updates avatar/verification status  
3. **Returning User**: Updates login tracking, generates fresh JWT tokens

### Data Structure:
- **users table**: Core user data + Firebase fields
- **user_login_providers table**: Tracks each social provider used by user
- **JWT tokens**: Generated with user role and permissions for authorization

### Security Features:
- Firebase ID token verification via Admin SDK
- Admin role requirement for admin panel access
- Activity tracking for all login attempts
- Secure provider data storage in JSONB format

## 📋 **Key Features Implemented**

- ✅ **Multi-Provider Support**: Google, Facebook, Twitter, GitHub
- ✅ **User Account Linking**: Links social accounts to existing email accounts
- ✅ **Role-Based Access**: Automatic default role assignment + admin verification
- ✅ **Activity Tracking**: Login tracking with IP, user agent, timestamps
- ✅ **Avatar Integration**: Automatic avatar import from social profiles
- ✅ **Email Verification**: Sync verification status from social providers
- ✅ **Token Management**: JWT generation with proper expiration
- ✅ **Provider Data Storage**: Secure storage of provider-specific data

The implementation is now **complete** and ready for testing! 🚀



### Firebase Configuration Fix  \n<small>Source: `FIREBASE_CONFIG_FIX.md`</small>

## Problem
Your Firebase config is missing the `messagingSenderId` which causes the `CONFIGURATION_NOT_FOUND` error.

## Current Config (Missing messagingSenderId)
```json
{
  "apiKey": "AIzaSyB0y_zOg1gqnyvnIpl0LFPkCLwkPxHoIvc",
  "authDomain": "quasar-5673a.firebaseapp.com",
  "projectId": "quasar-5673a",
  "appId": "1:402836024277:web:cd23841e70450441c72b5c",
  "storageBucket": "quasar-5673a.firebasestorage.app",
  "measurementId": "G-JQKKHTWL9J"
  // ❌ Missing messagingSenderId
}
```

## Solution Steps

### 1. Get Complete Firebase Config
1. Visit: https://console.firebase.google.com/project/quasar-5673a/settings/general/
2. Scroll down to "Your apps" section
3. Click on your web app (🌐 icon)
4. Copy the complete `firebaseConfig` object

### 2. Expected Complete Config
```json
{
  "apiKey": "AIzaSyB0y_zOg1gqnyvnIpl0LFPkCLwkPxHoIvc",
  "authDomain": "quasar-5673a.firebaseapp.com",
  "projectId": "quasar-5673a",
  "storageBucket": "quasar-5673a.firebasestorage.app",
  "messagingSenderId": "402836024277",  // ✅ This is missing!
  "appId": "1:402836024277:web:cd23841e70450441c72b5c",
  "measurementId": "G-JQKKHTWL9J"
}
```

### 3. Update Your Database
1. Login to your admin panel
2. Go to Firebase Configs
3. Edit your current config
4. Add the missing `messagingSenderId`: **402836024277**
5. Save the configuration

### 4. Enable Authentication Providers
In Firebase Console → Authentication → Sign-in method:
- ✅ Enable Google
- ✅ Enable Facebook  
- ✅ Enable Twitter
- ✅ Enable GitHub

## Quick Fix
The `messagingSenderId` for your project should be: **402836024277**
(You can see this in your appId: `1:402836024277:web:...`)



### Firebase Authentication Setup  \n<small>Source: `FIREBASE_SETUP.md`</small>

This project now supports Firebase authentication alongside the existing local authentication system.

## Features Implemented

### Backend
- ✅ Firebase Admin SDK integration
- ✅ Firebase configuration management via database
- ✅ Firebase authentication service
- ✅ Firebase auth strategy for Passport.js
- ✅ API endpoints for Firebase login
- ✅ User creation from Firebase auth data
- ✅ Database migration for Firebase config storage

### Frontend  
- ✅ Firebase Web SDK integration
- ✅ Firebase service with email/password and Google sign-in
- ✅ Firebase auth context and hooks
- ✅ Updated login form with Firebase options
- ✅ Automatic token exchange with backend

## Setup Instructions

### 1. Database Setup

**No manual setup required!** The Firebase table will be created automatically when first needed.

The project uses a common `TableInitializationService` that automatically:
- Creates new tables with all required columns
- **Fixes existing tables** by adding missing columns 
- Handles both new installations and upgrades seamlessly

This makes Firebase completely plug-and-play whether you're starting fresh or adding it to an existing setup.

### 2. Firebase Project Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication and configure sign-in methods:
   - Email/Password
   - Google (optional)

### 3. Get Firebase Configuration

From your Firebase project settings, get:
- Web app config (for frontend)
- Service account key (for backend admin operations)

### 4. Add Firebase Configuration to Database

You can add Firebase configuration through:

1. **Direct database insert:**
```sql
INSERT INTO firebase_configs (
  name, api_key, auth_domain, project_id, app_id, 
  service_account_key, is_active, description
) VALUES (
  'default',
  'your-api-key',
  'your-project.firebaseapp.com',
  'your-project-id',
  'your-app-id',
  '{"type":"service_account","project_id":"..."}',
  true,
  'Default Firebase configuration'
);
```

2. **Admin panel** (if you create the UI)

3. **Seeder script** (to be implemented)

### 5. Testing

**Note:** The tRPC types need to be updated to recognize the new Firebase endpoints. The UI has been prepared but the backend integration is temporarily mocked.

1. Start the backend development server
2. Start the frontend: `npm run admin:dev`  
3. Go to login page - you should see Firebase options (currently disabled until backend is fully connected)
4. Test with Firebase-enabled email/password or Google sign-in

**Current Status:** 
- ✅ All Firebase code is implemented  
- ✅ Database table auto-creation implemented
- ✅ Graceful fallback when Firebase not configured
- ⚠️ tRPC types need regeneration for full functionality
- 🔄 Ready for testing once backend types are updated

## API Endpoints

- `GET /trpc/adminAuth.getFirebaseConfig` - Get Firebase web config
- `POST /trpc/adminAuth.loginWithFirebase` - Login with Firebase ID token

## Security Features

- Firebase ID tokens are verified on the backend
- Users are created automatically from Firebase auth data
- Admin role validation is maintained
- Session tracking continues to work
- All existing security measures are preserved

## File Structure

```
apps/backend/src/
├── modules/
│   ├── shared/services/
│   │   └── table-initialization.service.ts  ← Common table creation service
│   └── firebase/
│       ├── entities/firebase-config.entity.ts
│       ├── repositories/firebase-config.repository.ts
│       ├── services/
│       │   ├── firebase-config.service.ts
│       │   └── firebase-auth.service.ts
│       └── firebase.module.ts
├── auth/
│   ├── strategies/firebase-auth.strategy.ts
│   └── guards/firebase-auth.guard.ts
└── database/seeders/
    ├── firebase-seeder.ts                   ← Firebase table seeder
    └── example-feature.seeder.ts            ← Template for future features

apps/admin/src/
├── services/firebase.service.ts
├── hooks/useFirebaseAuth.tsx
└── components/auth/LoginForm.tsx (updated)
```

## Environment Variables

No additional environment variables are needed as Firebase configuration is managed through the database.

## Reusable Architecture Pattern

This Firebase implementation introduces a reusable pattern for optional features:

### **TableInitializationService**
- Common service for auto-creating feature tables
- Prevents app crashes when optional features aren't configured
- Tracks initialization status to avoid redundant operations
- Supports both silent failure and error throwing modes

### **TableSeeder Interface**
- Standardized interface for table creation logic
- Handles both new table creation AND upgrading existing tables
- Easy to implement for any new optional feature
- Consistent pattern across all feature modules

### **Usage Example for New Features:**
```typescript
// 1. Create your seeder
export class YourFeatureSeeder implements TableSeeder {
  async run(dataSource: DataSource): Promise<void> {
    // Table creation logic
  }
}

// 2. Use in your service
@Injectable()
export class YourFeatureService {
  constructor(
    private readonly tableInitializationService: TableInitializationService
  ) {}

  private async ensureTableExists(): Promise<boolean> {
    return this.tableInitializationService.ensureTableExists(
      'your_feature_table',
      new YourFeatureSeeder(),
      true // fail silently
    );
  }
}
```

## Notes

- Firebase configuration is stored securely in the database
- Service account keys are stored as encrypted text
- Multiple Firebase configurations can be stored (only one active)
- Existing local authentication continues to work
- Users created via Firebase have empty passwords
- Firebase users must have admin roles to access admin panel
- **Reusable pattern** ready for future optional features



### Icon Input Spacing System Implementation  \n<small>Source: `ICON_INPUT_SPACING_IMPLEMENTATION.md`</small>

## Overview

This implementation provides a comprehensive, reusable system for input fields with icons that ensures consistent spacing throughout the application. The system addresses the original issue in `QuickAddPermissionModal.tsx` and creates a scalable solution for all input components.

## What Was Implemented

### 1. CSS Utility Classes (`apps/admin/src/styles.scss`)

Added reusable CSS classes for consistent icon spacing:

```css
/* Standard spacing - 56px total */
.input-with-left-icon {
  padding-left: 3.5rem !important;
}

/* Compact spacing - 44px total */
.input-with-left-icon-compact {
  padding-left: 2.75rem !important;
}

/* Large spacing - 64px total */
.input-with-left-icon-large {
  padding-left: 4rem !important;
}

/* Icon positioning */
.input-icon-left {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: theme('colors.gray.400');
}
```

### 2. InputWithIcon Component (`apps/admin/src/components/common/InputWithIcon.tsx`)

A new reusable component specifically designed for inputs with icons:

```tsx
<InputWithIcon
  leftIcon={<FiSearch className="h-5 w-5" />}
  placeholder="Search..."
  iconSpacing="standard"
  value={searchValue}
  onChange={(e) => setSearchValue(e.target.value)}
/>
```

**Features:**
- Three spacing options: `compact`, `standard`, `large`
- Support for left and right icons
- Dark mode compatibility
- Full accessibility support
- Customizable styling

### 3. Enhanced FormInput Component (`apps/admin/src/components/common/FormInput.tsx`)

Updated the existing FormInput component to support both the old bordered icon style and the new icon spacing system:

```tsx
// New icon spacing system
<FormInput
  icon={<FiSearch className="h-5 w-5" />}
  useIconSpacing={true}
  iconSpacing="standard"
  // ... other props
/>

// Old bordered style (backward compatible)
<FormInput
  icon={<FiSearch className="h-5 w-5" />}
  useIconSpacing={false}
  // ... other props
/>
```

### 4. Updated QuickAddPermissionModal

Applied the new system to the original component:

**Before:**
```tsx
<input className="... pl-14 ..." />
```

**After:**
```tsx
<div className="relative">
  <div className="input-icon-left">
    <FiSearch className="h-5 w-5" />
  </div>
  <input className="... input-with-left-icon ..." />
</div>
```

### 5. Documentation and Examples

- **`INPUT_ICON_SPACING_GUIDE.md`**: Comprehensive usage guide
- **`IconInputExamples.tsx`**: Live examples demonstrating all approaches
- **Migration guidelines** for updating existing components

## Spacing System Details

### Visual Spacing Breakdown

| Spacing | Total Width | Icon Position | Gap After Icon | Use Case |
|---------|-------------|---------------|----------------|----------|
| Compact | 44px | 12px from left | 16px | Small forms, tight layouts |
| Standard | 56px | 12px from left | 24px | Most common use case |
| Large | 64px | 12px from left | 28px | Prominent search fields |

### Icon Size Recommendations

- **16px icons (h-4 w-4)**: Use `compact` spacing
- **20px icons (h-5 w-5)**: Use `standard` spacing  
- **24px icons (h-6 w-6)**: Use `large` spacing

## Benefits

1. **Consistency**: All input fields with icons now have uniform spacing
2. **Reusability**: Three different approaches for different use cases
3. **Maintainability**: Centralized spacing values in CSS utilities
4. **Accessibility**: Proper icon positioning and color contrast
5. **Backward Compatibility**: Existing FormInput components continue to work
6. **Dark Mode**: Full support for light and dark themes

## Usage Recommendations

### For New Components
Use the `InputWithIcon` component:
```tsx
<InputWithIcon
  leftIcon={<FiSearch className="h-5 w-5" />}
  iconSpacing="standard"
  placeholder="Search..."
/>
```

### For Form Contexts
Use `FormInput` with the new spacing system:
```tsx
<FormInput
  label="Search"
  icon={<FiSearch className="h-5 w-5" />}
  useIconSpacing={true}
  iconSpacing="standard"
/>
```

### For Custom Implementations
Use the CSS utility classes directly:
```tsx
<div className="relative">
  <div className="input-icon-left">
    <FiSearch className="h-5 w-5" />
  </div>
  <input className="input-with-left-icon ..." />
</div>
```

## Migration Path

1. **Immediate**: New components should use the new system
2. **Gradual**: Existing components can be updated when modified
3. **Optional**: Old FormInput bordered style remains available

## Files Modified/Created

### Modified
- `apps/admin/src/styles.scss` - Added utility classes
- `apps/admin/src/components/role/QuickAddPermissionModal.tsx` - Applied new system
- `apps/admin/src/components/common/FormInput.tsx` - Added new spacing support

### Created
- `apps/admin/src/components/common/InputWithIcon.tsx` - New component
- `apps/admin/src/components/common/INPUT_ICON_SPACING_GUIDE.md` - Usage guide
- `apps/admin/src/components/examples/IconInputExamples.tsx` - Examples
- `ICON_INPUT_SPACING_IMPLEMENTATION.md` - This summary

## Testing

To test the implementation:

1. View the `QuickAddPermissionModal` to see the improved spacing
2. Import and use the `IconInputExamples` component to see all variations
3. Try different icon sizes with different spacing options
4. Test in both light and dark modes
5. Verify accessibility with screen readers

The system provides a solid foundation for consistent icon input spacing across the entire application while maintaining flexibility for different use cases.



### Input Component Import Fix  \n<small>Source: `INPUT_COMPONENT_FIX.md`</small>

## Issue
The UserFilters component had a TypeScript compilation error due to a missing Input component import:

```
ERROR in ./apps/admin/src/components/features/UserFilters.tsx:8:23
TS2307: Cannot find module '../common/Input' or its corresponding type declarations.
```

## Root Cause
The import statement was trying to import a non-existent `Input` component:
```typescript
import { Input } from '../common/Input';
```

However, there is no `Input.tsx` file in the `apps/admin/src/components/common/` directory.

## Investigation Results
After examining the common components directory, the available input-related components are:
- `FormInput.tsx` - A comprehensive form input component with label, validation, and styling
- `DateInput.tsx` - Specialized for date inputs
- `TextareaInput.tsx` - For multi-line text inputs
- `PhoneInputField.tsx` - For phone number inputs
- `Select.tsx` - For dropdown selections

## Solution
Replaced the non-existent `Input` component with the `FormInput` component, which provides all the required functionality:

### Before (Broken):
```typescript
import { Input } from '../common/Input';

// Usage
<Input
  id="email-filter"
  label="Email Domain"
  value={filters.email || ''}
  onChange={(e) => handleFilterChange('email', e.target.value)}
  placeholder="e.g., @company.com"
  size="md"
  className="flex-1"
/>
```

### After (Fixed):
```typescript
import { FormInput } from '../common/FormInput';

// Usage
<FormInput
  id="email-filter"
  type="text"
  label="Email Domain"
  value={filters.email || ''}
  onChange={(e) => handleFilterChange('email', e.target.value)}
  placeholder="e.g., @company.com"
  size="md"
  className="flex-1"
/>
```

## Changes Made

### 1. Updated Import Statement
```typescript
// apps/admin/src/components/features/UserFilters.tsx
- import { Input } from '../common/Input';
+ import { FormInput } from '../common/FormInput';
```

### 2. Updated Component Usage
Replaced all `<Input>` components with `<FormInput>` and added the required `type="text"` prop:

- Email Domain Filter
- Username Pattern Filter  
- Country Filter
- City Filter

### 3. FormInput Component Features
The `FormInput` component provides:
- `type` prop (required) - input type (text, email, password, etc.)
- `label` prop - form label
- `value` and `onChange` props - controlled input
- `placeholder` prop - placeholder text
- `size` prop - sm, md, lg sizing
- `className` prop - custom styling
- `error` prop - error message display
- `icon` and `rightIcon` props - icon support
- Consistent styling with other form components

## Verification
- ✅ TypeScript compilation passes without errors
- ✅ All input components now use the correct FormInput component
- ✅ Props are properly mapped and compatible
- ✅ Styling and functionality remain consistent

## Files Modified
- `apps/admin/src/components/features/UserFilters.tsx`
  - Updated import statement
  - Updated 4 input component usages
  - Added `type="text"` prop to all FormInput components

## Result
The TypeScript compilation error is resolved, and the expanded filter functionality now works correctly with proper input components that match the existing design system.



### Product Management System Setup  \n<small>Source: `PRODUCT_MANAGEMENT_SETUP.md`</small>

This document explains how to set up and run the product management system that has been implemented.

## Database Migration

To create the product management tables in your database, run the migration:

```bash
# Navigate to the backend directory
cd apps/backend

# Run the migration
npm run migration:run
# or if using yarn
yarn migration:run
```

The migration will create the following tables:
- `brands` - Product brands
- `categories` - Hierarchical product categories
- `attributes` - Product attributes (color, size, etc.)
- `attribute_values` - Predefined attribute values
- `product_tags` - Tags for products
- `warranties` - Warranty information
- `products` - Main products table
- `product_variants` - Product variations
- `product_attributes` - Product-specific attributes
- `suppliers` - Vendor information
- `purchase_orders` - Purchase orders
- `purchase_order_items` - Purchase order line items
- `inventory_transactions` - Stock movement tracking
- `product_product_tags` - Many-to-many junction table

## Sample Data (Optional)

To populate the database with sample data, you can run the seeder:

```bash
# Create sample data script (add this to your package.json scripts)
npm run seed:products
```

The seeder will create:
- Sample brands (Apple, Samsung, Sony, Nike, Adidas)
- Product categories with subcategories
- Common attributes (color, size, material, screen_size)
- Attribute values (colors, sizes)
- Sample product tags
- Warranty templates
- Sample suppliers

## API Endpoints

Once the system is running, the following tRPC endpoints will be available:

### Products
- `adminProduct.products.getAll` - List products with pagination
- `adminProduct.products.getById` - Get single product
- `adminProduct.products.create` - Create new product
- `adminProduct.products.update` - Update product
- `adminProduct.products.delete` - Delete product

### Brands
- `adminProduct.brands.getAll` - List brands
- `adminProduct.brands.getById` - Get single brand
- `adminProduct.brands.create` - Create new brand
- `adminProduct.brands.update` - Update brand
- `adminProduct.brands.delete` - Delete brand

### Categories
- `adminProduct.categories.getAll` - List categories
- `adminProduct.categories.getTree` - Get hierarchical category tree
- `adminProduct.categories.create` - Create new category
- `adminProduct.categories.update` - Update category
- `adminProduct.categories.delete` - Delete category

### Suppliers
- `adminProduct.suppliers.getAll` - List suppliers
- `adminProduct.suppliers.getById` - Get single supplier
- `adminProduct.suppliers.create` - Create new supplier
- `adminProduct.suppliers.update` - Update supplier
- `adminProduct.suppliers.delete` - Delete supplier

### Inventory
- `adminProduct.inventory.getTransactions` - List inventory transactions
- `adminProduct.inventory.adjustStock` - Adjust stock levels
- `adminProduct.inventory.getTransactionsByVariant` - Get transactions for specific variant

## Admin Interface

The admin interface includes the following pages:

- `/products` - Products list and management
- `/products/brands` - Brand management
- `/products/categories` - Category management (hierarchical tree view)
- `/products/suppliers` - Supplier management

## Features

### Products
- Full product CRUD operations
- SKU management
- Status tracking (Draft, Active, Inactive, Discontinued)
- Brand and category associations
- Image management
- SEO metadata

### Brands
- Brand information with logos
- Website links
- Product count tracking
- Active/inactive status

### Categories
- Hierarchical category structure
- Unlimited nesting levels
- Sort ordering
- Image support
- Product count tracking

### Inventory
- Stock level tracking
- Transaction history
- Multiple transaction types (Purchase, Sale, Adjustment, Return, Damage)
- Automatic stock updates

### Purchase Orders
- Complete procurement workflow
- Supplier management
- Approval process
- Receiving workflow
- Automatic inventory updates

## Database Schema Highlights

- **Relationships**: Proper foreign keys and constraints
- **Indexes**: Performance optimized with strategic indexes
- **Data Types**: Appropriate data types for each field
- **Constraints**: Check constraints for enums and data validation
- **Soft Deletes**: Where appropriate for audit trails

## Next Steps

1. Run the migration to create tables
2. Optionally run the seeder for sample data
3. Access the admin interface at `/products`
4. Start creating products, brands, and categories

## Customization

The system is designed to be extensible. You can:
- Add more product attributes
- Create custom product types
- Extend the inventory system
- Add more supplier information fields
- Customize the admin interface

## Troubleshooting

If you encounter issues:

1. **Migration fails**: Check database connection and permissions
2. **Entity not found**: Ensure all entities are imported in the TypeORM configuration
3. **TypeScript errors**: Check that all dependencies are installed
4. **UI not loading**: Verify that translations are loaded properly

The system follows the existing codebase patterns and integrates seamlessly with your authentication, theming, and internationalization systems.



### Quasar NX Monorepo Setup  \n<small>Source: `PROJECT_SETUP.md`</small>

This project is a complete NX monorepo setup with Next.js client, React admin, and NestJS backend applications.

## 🏗️ Project Structure

```
quasar/
├── apps/
│   ├── client/          # Next.js application with App Router
│   ├── admin/           # React application
│   └── backend/         # NestJS application
├── libs/
│   └── ui/              # Shared UI components library
└── ...
```

## 🚀 Applications

### Client App (Next.js)
- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS + SCSS
- **TypeScript**: Fully configured
- **Assets**: `apps/client/public/assets/`

### Admin App (React)
- **Framework**: React with Webpack
- **Styling**: Tailwind CSS + SCSS
- **TypeScript**: Fully configured
- **Assets**: `apps/admin/public/assets/`

### Backend App (NestJS)
- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Architecture**: Service + Repository Design Patterns
- **TypeScript**: Fully configured

## 🎨 Frontend Technologies

### Tailwind CSS
- Configured for both client and admin apps
- Custom configuration files in each app
- Global styles with `@tailwind` directives

### ShadCN Components
- Shared UI library in `libs/ui/`
- Class variance authority for component variants
- Utility functions for class merging
- Example Button component included

### SCSS Support
- Available in both frontend applications
- Global styles and component-specific styles

## 🗄️ Backend Technologies

### PostgreSQL + TypeORM
- Database configuration in `apps/backend/src/config/database.config.ts`
- Environment-based configuration
- Migration support with CLI commands

### Migration Commands
```bash
yarn migration:generate -- src/database/migrations/MigrationName
yarn migration:run
yarn migration:revert
yarn migration:create -- src/database/migrations/MigrationName
```

### Design Patterns

#### Service Pattern
- Business logic separated in service classes
- Example: `UserService` in `apps/backend/src/modules/user/services/`
- Dependency injection with constructor injection

#### Repository Pattern
- Data access layer abstraction
- Interface-based repository contracts
- Example: `UserRepository` implementing `IUserRepository`
- TypeORM integration with repository methods

## 📦 Package Management

- **Package Manager**: Yarn (configured in nx.json)
- **Workspace**: NX monorepo with shared dependencies
- **TypeScript**: Shared base configuration in `tsconfig.base.json`

## 🛠️ Development Setup

### Prerequisites
- Node.js (18+ recommended)
- Yarn package manager
- PostgreSQL database

### Environment Setup

#### Option 1: Automatic Setup (Recommended)
```bash
# Run the setup script to create .env with secure defaults
yarn env:setup
```

#### Option 2: Manual Setup
```bash
# Copy template to .env
yarn env:copy

# Edit .env file with your database credentials
```

The environment file should contain:
```env
NODE_ENV=development
PORT=3001
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=quasar_db

# JWT Configuration (use yarn env:setup to auto-generate secure secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:4200
CORS_CREDENTIALS=true
```

### Running Applications
```bash
# Client app
nx serve client

# Admin app  
nx serve admin

# Backend app
nx serve backend
```

### Building Applications
```bash
# Build all
nx run-many -t build

# Build specific app
nx build client
nx build admin
nx build backend
```

## 🧩 Shared Libraries

### UI Library (`libs/ui/`)
- Shared components for frontend apps
- ShadCN-style components with Tailwind CSS
- Utility functions for styling
- Rollup bundling for optimal distribution

## 📁 Directory Structure Details

### Backend Module Structure (Example: User Module)
```
apps/backend/src/modules/user/
├── entities/
│   └── user.entity.ts           # TypeORM entity
├── interfaces/
│   └── user-repository.interface.ts  # Repository contract
├── repositories/
│   └── user.repository.ts       # Repository implementation
├── services/
│   └── user.service.ts          # Business logic service
├── controllers/
│   └── user.controller.ts       # HTTP request handlers
└── user.module.ts               # NestJS module configuration
```

### Frontend Assets Structure
```
apps/client/public/assets/       # Client app static assets
apps/admin/public/assets/        # Admin app static assets
```

## 🎯 Key Features Implemented

✅ NX Workspace with TypeScript
✅ Next.js Client App with Tailwind CSS
✅ React Admin App with Tailwind CSS  
✅ NestJS Backend with PostgreSQL
✅ TypeORM with Migration Support
✅ Service Design Pattern
✅ Repository Design Pattern
✅ ShadCN UI Components Library
✅ SCSS Support
✅ Shared Asset Directories
✅ Environment Configuration
✅ Package Manager: Yarn

## 🔄 Quick Start

1. **Set up your PostgreSQL database**
   ```bash
   # Install PostgreSQL (if not already installed)
   # macOS: brew install postgresql
   # Ubuntu: sudo apt-get install postgresql
   
   # Start PostgreSQL service
   # macOS: brew services start postgresql
   # Ubuntu: sudo systemctl start postgresql
   
   # Create database
   createdb quasar_db
   ```

2. **Configure environment**
   ```bash
   # Automatic setup (recommended)
   yarn env:setup
   
   # OR manual setup
   yarn env:copy
   # Then edit apps/backend/.env with your credentials
   ```

3. **Run database migrations**
   ```bash
   yarn migration:run
   ```

4. **Seed default permissions** 
   ```bash
   yarn seed:permissions
   ```

5. **Start development servers**
   ```bash
   # Start all applications
   nx run-many -t serve
   
   # OR start individually
   nx serve backend    # http://localhost:3001
   nx serve client     # http://localhost:3000
   nx serve admin      # http://localhost:4200 (default)

   # Admin app with custom port
   PORT=3000 nx serve admin  # http://localhost:3000
   ```

## 📚 Additional Resources

- [NX Documentation](https://nx.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [ShadCN UI Documentation](https://ui.shadcn.com)



### S3/DigitalOcean Spaces CORS Configuration  \n<small>Source: `S3_CORS_SETUP.md`</small>

For presigned URL uploads to work properly, you need to configure CORS on your DigitalOcean Spaces bucket.

## Required CORS Configuration

Add this CORS configuration to your DigitalOcean Spaces bucket:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:4200", "https://yourdomain.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

## How to Configure CORS on DigitalOcean Spaces

### Option 1: Using DigitalOcean Control Panel
1. Go to your DigitalOcean Spaces bucket
2. Navigate to Settings > CORS
3. Add a new CORS configuration with the settings above

### Option 2: Using AWS CLI with DigitalOcean Spaces
```bash
# Install AWS CLI if not already installed
# Configure for DigitalOcean Spaces
aws configure --profile digitalocean
# AWS Access Key ID: Your DigitalOcean Spaces Access Key
# AWS Secret Access Key: Your DigitalOcean Spaces Secret Key  
# Default region name: sgp1 (or your region)
# Default output format: json

# Create cors.json file with the configuration above
# Apply CORS configuration
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json --endpoint-url https://sgp1.digitaloceanspaces.com --profile digitalocean
```

## Important Notes

- Replace `http://localhost:4200` with your frontend URL
- Replace `https://yourdomain.com` with your production domain
- The CORS configuration must allow PUT requests for presigned uploads
- Make sure to include all necessary headers like `Content-Type`

## Testing CORS Configuration

After configuring CORS, test the upload again. You can also check browser developer tools Network tab to see if there are any CORS errors.



### Auto Slug Implementation Demo  \n<small>Source: `SLUG_DEMO.md`</small>

## ✅ Features Implemented

### 1. Unicode-Safe Slug Generation using `slugify` package
- **English**: "Hello World" → "hello-world"
- **Chinese**: "你好世界" → "你好世界"
- **Vietnamese**: "Xin chào thế giới" → "xin-chao-the-gioi"
- **Vietnamese Names**: "Nguyễn Đặng Gia Thịnh" → "nguyen-dang-gia-thinh" ✨
- **Japanese**: "こんにちは世界" → "こんにちは世界"
- **Arabic**: "مرحبا بالعالم" → "mrhba-balaalm"
- **Russian**: "Привет мир" → "privet-mir"
- **Mixed**: "Hello 你好 World" → "hello-你好-world"
- **Accented**: "Café & Résumé" → "cafe-and-resume"

### 2. Smart Auto-Generation
- **Instant Generation**: Slug updates immediately as you type each character
- **Real-time Updates**: No delays - slug appears instantly with every keystroke  
- **Manual Edit Detection**: Stops auto-generation when user edits manually
- **Reset Option**: "Auto" button allows reverting to auto-generated slugs

### 3. Form Integration
- **Create Post Form**: Auto-generates slug from title
- **Edit Post Form**: Preserves existing slugs, allows manual regeneration
- **Translation Support**: Each translation has its own slug with auto-generation
- **Validation**: Real-time validation with Unicode pattern support

### 4. Technical Implementation
- **Custom SlugField Component**: Reusable component with auto-slug functionality
- **React Hook Form Integration**: Seamless integration with existing form system
- **TypeScript Support**: Full type safety and IntelliSense
- **Backend Validation**: Updated DTOs to accept Unicode slugs

## 🚀 How to Use

### For Create Post:
1. Start typing in the "Title" field
2. Watch the "Slug" field auto-generate (with 500ms delay)
3. If you manually edit the slug, an "Auto" button appears
4. Click "Auto" to regenerate slug from current title

### For Edit Post:
1. Existing posts preserve their original slugs
2. Change the title to see new slug suggestions
3. Use "Auto" button to regenerate from title at any time

### For Translations:
1. Add a new translation
2. Enter title in any language
3. Click the refresh icon next to slug to auto-generate
4. Supports all Unicode languages

## 🔧 Files Modified/Created

### New Files:
- `apps/admin/src/utils/slugUtils.ts` - Core slug generation utilities
- `apps/admin/src/components/posts/SlugField.tsx` - Auto slug field component

### Modified Files:
- `apps/admin/src/types/forms.ts` - Added 'slug' field type
- `apps/admin/src/hooks/useFormFieldRenderer.tsx` - Added slug field renderer
- `apps/admin/src/components/posts/CreatePostForm.tsx` - Updated to use slug field
- `apps/admin/src/components/posts/EditPostForm.tsx` - Updated to use slug field
- `apps/admin/src/components/posts/TranslationsSection.tsx` - Added slug auto-generation
- `apps/backend/src/modules/posts/dto/post.dto.ts` - Updated validation patterns

## 🌍 Internationalization Ready

The implementation supports all major writing systems:
- **Latin Scripts**: English, Spanish, French, German, etc.
- **Cyrillic**: Russian, Ukrainian, Bulgarian, etc.  
- **CJK**: Chinese, Japanese, Korean
- **Arabic Script**: Arabic, Persian, Urdu
- **And many more Unicode languages**

## ✨ Features in Action

```typescript
// Example slug generations with special character handling:
generateSlug("Hello World") // → "hello-world"
generateSlug("Hello, World!") // → "hello-world"
generateSlug("API: Setup & Configuration") // → "api-setup-and-configuration"
generateSlug("Test; Database Connection?") // → "test-database-connection"
generateSlug("Email@domain.com: Guide") // → "email-domain-com-guide"
generateSlug("Price: $100 & €50") // → "price-dollar100-and-euro50"
generateSlug("Tags: #javascript, #react") // → "tags-javascript-react"
generateSlug("Vietnamese: Xin chào, thế giới!") // → "vietnamese-xin-chao-the-gioi"
generateSlug("你好世界") // → "你好世界"
generateSlug("Multiple   Spaces    Here") // → "multiple-spaces-here"
```

## 🇻🇳 Vietnamese Character Handling
Proper transliteration of Vietnamese characters to ASCII equivalents:

- **đ/Đ**: "Nguyễn Đặng" → "nguyen-dang" (not "nguyen-djang" ✅)
- **ă/Ă**: "Quảng Ngãi" → "quang-ngai"
- **â/Â**: "Cần Thơ" → "can-tho"
- **ê/Ê**: "Việt Nam" → "viet-nam"
- **ô/Ô**: "Hồ Chí Minh" → "ho-chi-minh"
- **ơ/Ơ**: "Sài Gòn" → "sai-gon"
- **ư/Ư**: "Hướng dẫn" → "huong-dan"
- **ý/Ý**: "Tây Ninh" → "tay-ninh"

## 🔧 Special Character Handling
All punctuation and special characters are converted to hyphens for clean, readable URLs:

- **Commas**: `Hello, World` → `hello-world`
- **Colons**: `API: Setup Guide` → `api-setup-guide`  
- **Semicolons**: `Test; Database` → `test-database`
- **Question marks**: `How are you?` → `how-are-you`
- **Exclamation marks**: `Amazing!` → `amazing`
- **At symbols**: `user@email.com` → `user-email-com`
- **Hash symbols**: `#javascript` → `javascript`
- **Dollar signs**: `$100` → `dollar100`
- **Percent signs**: `50%` → `50percent`
- **Multiple punctuation**: `Hello,,,, World!!!` → `hello-world`

## 📦 Dependencies Added
- **slugify**: Industry-standard package for Unicode-safe slug generation
  - Supports all major languages and writing systems
  - Handles accented characters, special symbols, and spaces
  - Configurable options for different use cases

The implementation is production-ready, uses battle-tested libraries, and is fully integrated with the existing form system! 🎉



### tRPC Best Practices Guide  \n<small>Source: `TRPC_BEST_PRACTICES.md`</small>

## 🎯 Problem Solved
This setup eliminates the duplication between tRPC router implementations and type definitions, preventing the common issue where `@Router({ alias: 'xyz' })` decorators get out of sync with TypeScript types.

## 📁 New Architecture

```
src/trpc/
├── router-config.ts          # ✨ Single source of truth for all router aliases
├── routers/
│   └── admin/
│       ├── product-categories.router.ts  # Uses ALIASES.adminProductCategories
│       ├── product-brands.router.ts      # Uses ALIASES.adminProductBrands  
│       └── product-products.router.ts    # Uses ALIASES.adminProductProducts
└── types/
    └── app-router.ts         # ✨ Uses ROUTER_ALIASES for consistency
```

## 🚀 Implementation Steps

### Phase 1: Immediate Fix (Current)
✅ **Created central router config** (`router-config.ts`)
✅ **Updated type definitions** to use central config  
✅ **Fixed product categories router** to use `ALIASES.adminProductCategories`

### Phase 2: Migrate Remaining Routers (Next)
```typescript
// Before (error-prone):
@Router({ alias: 'adminProductBrands' })

// After (consistent):
import { ALIASES } from '../../router-config';
@Router({ alias: ALIASES.adminProductBrands })
```

### Phase 3: Add Code Generation (Future)
- Implement the generator script at `tools/generate-router-types.js`
- Add npm script: `"generate:router-types": "node tools/generate-router-types.js"`
- Integrate into build process

## 🔧 Usage Examples

### In Router Files:
```typescript
import { ALIASES } from '../../router-config';

@Router({ alias: ALIASES.adminProductCategories })
export class AdminProductCategoriesRouter {
  // Implementation...
}
```

### In Client Code:
```typescript
// This now works without type errors:
const { data } = trpc.adminProductCategories.getTree.useQuery({
  includeInactive: false
});
```

## ✅ Benefits

1. **Single Source of Truth**: All router names defined in one place
2. **Type Safety**: IDE autocomplete for router aliases
3. **Consistency**: Impossible to have mismatched aliases
4. **Maintainable**: Easy to rename or refactor routers
5. **Future-Proof**: Ready for code generation when needed

## 🔄 Migration Checklist

- [x] Create `router-config.ts` with all aliases
- [x] Update `app-router.ts` to use central config
- [x] Fix `AdminProductCategoriesRouter` implementation
- [ ] Update remaining router files to use `ALIASES.*`
- [ ] Test all tRPC endpoints work correctly
- [ ] Consider implementing code generation script

## 🚨 Important Notes

- Always use `ALIASES.routerName` instead of string literals
- Keep the router config organized by functional groups  
- Update both the config AND the router when adding new endpoints
- Test TypeScript compilation after changes

## 🎯 Next Steps

1. **Immediate**: Update remaining router files to use central config
2. **Short-term**: Add validation to ensure all routers use the config
3. **Long-term**: Implement code generation to eliminate manual type definitions

This approach gives you the benefits of both maintainable code and strong TypeScript support!



### URL Filter Expansion Fix  \n<small>Source: `URL_FILTER_EXPANSION_FIX.md`</small>

## Issue Description
The URL parameter detection and filter expansion functionality was not working as expected. When navigating to or refreshing the page with URL parameters like:
```
http://localhost:4200/users?dateFrom=2025-08-11&dateTo=2025-08-12&page=1
```

The expected behavior was:
1. Show the filters panel (expand it if collapsed)
2. Populate the "Date From" field with "2025-08-11"
3. Populate the "Date To" field with "2025-08-12"
4. Display these active filters in the filter summary tags

## Root Causes Identified

### 1. Filter Panel Not Auto-Expanding
**Problem**: The `showFilters` state was hardcoded to `false`, preventing the filter panel from automatically showing when there were active filters from URL parameters.

**Location**: `apps/admin/src/pages/users/index.tsx` line 64
```typescript
const [showFilters, setShowFilters] = useState(false); // Always false!
```

### 2. Missing Input Component
**Problem**: The UserFilters component was trying to import a non-existent `Input` component, causing TypeScript compilation errors.

**Location**: `apps/admin/src/components/features/UserFilters.tsx`
```typescript
import { Input } from '../common/Input'; // Component doesn't exist!
```

## Solutions Implemented

### 1. Fixed Filter Panel Auto-Expansion

#### A. Smart Initialization of showFilters State
```typescript
// Initialize showFilters based on whether there are active filters from URL
const [showFilters, setShowFilters] = useState(() => {
  const initialFilters = {
    role: validateUserRole(searchParams.get('role')),
    isActive: validateBoolean(searchParams.get('isActive')),
    dateFrom: validateDateString(searchParams.get('dateFrom')) || validateDateString(searchParams.get('createdFrom')),
    dateTo: validateDateString(searchParams.get('dateTo')) || validateDateString(searchParams.get('createdTo')),
    isVerified: validateBoolean(searchParams.get('isVerified')),
    email: validateString(searchParams.get('email')),
    username: validateString(searchParams.get('username')),
    hasProfile: validateBoolean(searchParams.get('hasProfile')),
    country: validateString(searchParams.get('country')),
    city: validateString(searchParams.get('city')),
    lastLoginFrom: validateDateString(searchParams.get('lastLoginFrom')),
    lastLoginTo: validateDateString(searchParams.get('lastLoginTo')),
    createdFrom: validateDateString(searchParams.get('createdFrom')),
    createdTo: validateDateString(searchParams.get('createdTo')),
  };
  
  // Show filters if there are any active filters from URL parameters
  const hasActiveFilters = Object.values(initialFilters).some(value =>
    value !== undefined && value !== null && value !== ''
  );
  
  return hasActiveFilters;
});
```

#### B. Added useEffect for Dynamic Filter Panel Showing
```typescript
// Automatically show filter panel when there are active filters
useEffect(() => {
  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== null && value !== ''
  );
  
  // Only auto-show filters if there are active filters and panel is currently hidden
  if (hasActiveFilters && !showFilters) {
    setShowFilters(true);
  }
}, [filters, showFilters]);
```

### 2. Fixed Input Component Import Issue

#### A. Corrected Import Statement
```typescript
// Before (Broken)
import { Input } from '../common/Input';

// After (Fixed)
import { FormInput } from '../common/FormInput';
```

#### B. Updated Component Usage
```typescript
// Before (Broken)
<Input
  id="email-filter"
  label="Email Domain"
  value={filters.email || ''}
  onChange={(e) => handleFilterChange('email', e.target.value)}
  placeholder="e.g., @company.com"
  size="md"
  className="flex-1"
/>

// After (Fixed)
<FormInput
  id="email-filter"
  type="text"
  label="Email Domain"
  value={filters.email || ''}
  onChange={(e) => handleFilterChange('email', e.target.value)}
  placeholder="e.g., @company.com"
  size="md"
  className="flex-1"
/>
```

## Validation Functions Enhanced

The URL parameter validation functions ensure proper data types:

```typescript
const validateDateString = (date: string | null): string | undefined => {
  if (!date) return undefined;
  // Basic date format validation (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date) ? date : undefined;
};

const validateString = (value: string | null): string | undefined => {
  return value && value.trim() ? value.trim() : undefined;
};
```

## Expected Behavior After Fix

### URL Parameter Detection
When navigating to: `http://localhost:4200/users?dateFrom=2025-08-11&dateTo=2025-08-12&page=1`

1. ✅ **Filter Panel Auto-Expands**: The filter panel will automatically be visible
2. ✅ **Date Fields Populated**: 
   - "Date From" field shows "2025-08-11"
   - "Date To" field shows "2025-08-12"
3. ✅ **Filter Summary Tags**: Active filter tags appear showing the date range
4. ✅ **URL Synchronization**: Browser back/forward navigation works correctly
5. ✅ **Page Refresh**: Filter state persists after page refresh

### Additional URL Parameters Supported
The system now supports all these URL parameters:
- `dateFrom`, `dateTo` - Registration date range
- `createdFrom`, `createdTo` - Alternative date range parameters
- `role` - User role filter
- `isActive` - Active/inactive status
- `isVerified` - Verification status
- `email` - Email domain filter
- `username` - Username pattern filter
- `hasProfile` - Profile completion status
- `country`, `city` - Location filters
- `lastLoginFrom`, `lastLoginTo` - Last login date range

### Example URLs That Now Work
```
# Basic date filter
/users?dateFrom=2025-08-11&dateTo=2025-08-12

# Multiple filters
/users?dateFrom=2025-08-01&dateTo=2025-08-31&role=admin&isActive=true&email=@company.com

# Alternative date parameters
/users?createdFrom=2025-07-01&createdTo=2025-07-31&hasProfile=true

# Location and verification filters
/users?country=United States&city=New York&isVerified=false&lastLoginFrom=2025-08-10
```

## Files Modified

1. **`apps/admin/src/pages/users/index.tsx`**
   - Fixed `showFilters` state initialization
   - Added useEffect for dynamic filter panel showing
   - Enhanced filter state initialization from URL parameters

2. **`apps/admin/src/components/features/UserFilters.tsx`**
   - Fixed import statement (Input → FormInput)
   - Updated all input component usages
   - Added `type="text"` prop to FormInput components

## Testing Verification

- ✅ TypeScript compilation passes without errors
- ✅ All URL parameter validation functions work correctly
- ✅ Filter panel automatically shows when URL contains filter parameters
- ✅ Filter form fields are properly populated from URL parameters
- ✅ Filter summary tags display active filters correctly
- ✅ URL synchronization works in both directions

## Result

The URL parameter detection and filter expansion functionality now works as expected. Users can:
- Navigate directly to URLs with filter parameters
- Refresh the page without losing filter state
- Use browser back/forward navigation
- See the filter panel automatically expand when filters are active
- View active filter summary tags
- Use all expanded filter parameters beyond just the basic ones



### User Activity Tracking Implementation  \n<small>Source: `USER_ACTIVITY_TRACKING_IMPLEMENTATION.md`</small>

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



### Analytics Integration Guide  \n<small>Source: `apps/admin/ANALYTICS_INTEGRATION.md`</small>

This guide explains how to use the Google Analytics and Mixpanel integration implemented in the Quasar Admin Panel.

## Overview

The analytics system provides comprehensive tracking for admin panel user interactions, including:
- Page view tracking
- User action tracking
- Form submission tracking
- Entity CRUD operations
- Performance metrics
- Error tracking

## Configuration

### 1. Admin Panel Configuration

Access the analytics configuration at `/analytics` in the admin panel:

**Google Analytics Settings:**
- Enable/Disable Google Analytics
- Measurement ID (G-XXXXXXXXXX)

**Mixpanel Settings:**
- Enable/Disable Mixpanel
- Project Token (32-character hex string)
- API Host (default: api.mixpanel.com)

**Advanced Settings:**
- Track admin actions
- Anonymize IP addresses

### 2. Database Settings

The following settings are stored in the database:
- `analytics.google_analytics_enabled`
- `analytics.google_analytics_id`
- `analytics.mixpanel_enabled`
- `analytics.mixpanel_token`
- `analytics.mixpanel_api_host`
- `analytics.track_admin_actions`
- `analytics.anonymize_ip`

## Usage

### 1. Basic Analytics Tracking

The analytics system is automatically initialized when the app loads. Basic tracking includes:
- Page views
- User sessions
- Login/logout events
- Error tracking

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

function MyComponent() {
  const analytics = useAnalytics();

  const handleButtonClick = () => {
    // Track custom event
    analytics.trackEvent('Button Clicked', {
      button_name: 'save',
      context: 'user_profile',
    });
  };

  return <button onClick={handleButtonClick}>Save</button>;
}
```

### 2. Form Analytics

Track form interactions using the `useFormAnalytics` hook:

```typescript
import { useFormAnalytics } from '../components/common/AnalyticsWrapper';

function UserForm() {
  const { trackFormStart, trackFormSubmit, trackFieldChange } = useFormAnalytics('user_form');

  const handleSubmit = (data) => {
    trackFormSubmit(true, data);
    // ... submit logic
  };

  const handleFieldChange = (field, value) => {
    trackFieldChange(field, value);
    // ... field change logic
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### 3. Entity Tracking

Track CRUD operations for entities:

```typescript
import { useEntityTracker } from '../hooks/useAnalytics';

function UserManagement() {
  const { trackCreate, trackUpdate, trackDelete } = useEntityTracker();

  const createUser = async (userData) => {
    const newUser = await userService.create(userData);
    trackCreate('user', newUser.id, { role: userData.role });
    return newUser;
  };

  const updateUser = async (userId, changes) => {
    await userService.update(userId, changes);
    trackUpdate('user', userId, changes);
  };

  const deleteUser = async (userId) => {
    await userService.delete(userId);
    trackDelete('user', userId);
  };
}
```

### 4. Navigation Analytics

Track user navigation patterns:

```typescript
import { useNavigationAnalytics } from '../components/common/AnalyticsWrapper';

function Navigation() {
  const { trackNavigationClick, trackTabSwitch } = useNavigationAnalytics();

  const handleMenuClick = (item) => {
    trackNavigationClick(item, 'menu');
    // ... navigation logic
  };

  const handleTabChange = (tabName) => {
    trackTabSwitch(tabName, 'user_profile');
    // ... tab change logic
  };
}
```

### 5. Component Analytics

Track component lifecycle and interactions:

```typescript
import { withAnalytics, useModalAnalytics } from '../components/common/AnalyticsWrapper';

// Using HOC for component tracking
const UserProfile = withAnalytics(UserProfileComponent, {
  trackMount: true,
  eventName: 'User Profile Viewed',
  properties: { section: 'user_management' }
});

// Using hooks for modal tracking
function UserProfileModal() {
  const { trackModalOpen, trackModalClose } = useModalAnalytics('user_profile_modal');

  const openModal = () => {
    trackModalOpen('profile_button');
    // ... open modal logic
  };

  const closeModal = () => {
    trackModalClose('save_button', 5000); // 5 seconds duration
    // ... close modal logic
  };
}
```

### 6. Analytics Wrapper Components

Use wrapper components for automatic tracking:

```typescript
import { AnalyticsWrapper } from '../components/common/AnalyticsWrapper';

function MyComponent() {
  return (
    <AnalyticsWrapper eventName="CTA Clicked" properties={{ button_type: 'primary' }}>
      <button onClick={handleClick}>Primary Action</button>
    </AnalyticsWrapper>
  );
}
```

## Available Hooks

### `useAnalytics()`
Main analytics hook for general tracking:
- `trackPageView(path, title)`
- `trackEvent(event, properties, userId)`
- `trackUserAction(action, properties)`
- `trackLogin(userId, method)`
- `trackLogout()`
- `identifyUser(userId, properties)`
- `resetUser()`

### `useEventTracker()`
Track specific events:
- `trackFormSubmit(formName, success, data)`
- `trackApiCall(endpoint, method, success, duration)`
- `trackNavigation(from, to)`
- `trackFeatureUsage(featureName, action, metadata)`
- `trackPerformance(metricName, value, metadata)`

### `useEntityTracker()`
Track entity operations:
- `trackCreate(entityType, entityId, metadata)`
- `trackUpdate(entityType, entityId, changes)`
- `trackDelete(entityType, entityId, metadata)`
- `trackBulkAction(entityType, action, count)`

### `useFormAnalytics(formName)`
Track form interactions:
- `trackFormStart()`
- `trackFormSubmit(success, data)`
- `trackFieldChange(fieldName, value)`
- `trackFormValidation(isValid, errors)`

### `useModalAnalytics(modalName)`
Track modal interactions:
- `trackModalOpen(trigger)`
- `trackModalClose(action, duration)`
- `trackModalInteraction(element, action)`

### `useNavigationAnalytics()`
Track navigation events:
- `trackNavigationClick(item, type)`
- `trackTabSwitch(tabName, context)`
- `trackSearch(query, resultsCount)`

## Event Tracking Best Practices

### 1. Naming Conventions
- Use past tense for events (e.g., "User Created" instead of "Create User")
- Be specific but concise
- Use consistent naming across the application

### 2. Event Properties
- Include relevant context but avoid sensitive data
- Use consistent property names
- Group related properties

### 3. User Privacy
- Avoid tracking sensitive information (passwords, tokens, personal data)
- Use the anonymize IP option when enabled
- Consider user consent requirements

### 4. Performance
- Batch related events when possible
- Avoid excessive tracking in high-frequency operations
- Use async tracking for non-critical events

## Example Implementations

### User Management Page

```typescript
function UserManagementPage() {
  const analytics = useAnalytics();
  const { trackCreate, trackUpdate, trackDelete } = useEntityTracker();
  const { trackFormSubmit } = useFormAnalytics('create_user_form');

  const createUser = async (userData) => {
    try {
      const newUser = await userService.create(userData);
      trackCreate('user', newUser.id, {
        role: userData.role,
        method: 'admin_panel'
      });
      analytics.trackEvent('User Created', {
        user_id: newUser.id,
        role: userData.role,
        created_by: 'admin'
      });
      return newUser;
    } catch (error) {
      analytics.trackError('User Creation Failed', error.message);
      throw error;
    }
  };

  return (
    <div>
      {/* User management UI */}
    </div>
  );
}
```

### Settings Page

```typescript
function SettingsPage() {
  const analytics = useAnalytics();
  const { trackFormSubmit } = useFormAnalytics('settings_form');

  const handleSettingsSave = async (settings) => {
    try {
      await settingsService.update(settings);
      trackFormSubmit(true, settings);
      analytics.trackEvent('Settings Updated', {
        changed_sections: Object.keys(settings),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      trackFormSubmit(false, error);
      analytics.trackError('Settings Update Failed', error.message);
    }
  };

  return (
    <AnalyticsWrapper eventName="Settings Page Viewed">
      {/* Settings form */}
    </AnalyticsWrapper>
  );
}
```

## Testing Analytics

### 1. Development Mode
- Analytics events are logged to console in development
- Test events appear in browser dev tools
- Mock services can be used for testing

### 2. Validation
- Use the test buttons in the analytics configuration page
- Check browser network tab for analytics requests
- Verify events in Google Analytics and Mixpanel dashboards

### 3. Privacy Compliance
- Ensure IP anonymization is working when enabled
- Verify no sensitive data is being tracked
- Test opt-out mechanisms if implemented

## Troubleshooting

### Common Issues

1. **Analytics not initializing**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Check browser console for errors

2. **Events not appearing in dashboards**
   - Verify Measurement ID / Project Token
   - Check data processing delays
   - Ensure tracking is enabled in settings

3. **Performance impact**
   - Monitor page load times
   - Check for excessive event tracking
   - Consider debouncing high-frequency events

### Debug Mode

Enable debug logging by setting the following in browser console:
```javascript
localStorage.setItem('analytics_debug', 'true');
```

This will enable verbose logging of all analytics events.

## Migration Guide

### From Previous Analytics Setup

1. **Remove old tracking code**
   ```typescript
   // Remove old Google Analytics code
   window.gtag('event', 'old_event');

   // Remove old Mixpanel code
   mixpanel.track('old_event');
   ```

2. **Replace with new hooks**
   ```typescript
   // Old way
   gtag('event', 'button_click', { button_name: 'save' });

   // New way
   const analytics = useAnalytics();
   analytics.trackEvent('Button Clicked', { button_name: 'save' });
   ```

3. **Update configuration**
   - Migrate settings to database
   - Use admin panel for configuration
   - Remove hardcoded credentials

## Security Considerations

1. **API Security**
   - Analytics settings are protected by admin authentication
   - API endpoints require proper authorization
   - Settings validation prevents injection attacks

2. **Data Privacy**
   - Sensitive data filtering
   - IP anonymization options
   - User consent management

3. **Performance**
   - Asynchronous event tracking
   - Debounced high-frequency events
   - Minimal impact on user experience

## Support

For issues or questions regarding the analytics integration:
1. Check browser console for error messages
2. Verify configuration in admin panel
3. Test with different user roles
4. Monitor network requests for analytics services

---

**Note**: This analytics system is designed for admin panel tracking only. For frontend application analytics, implement a separate tracking system with appropriate user consent mechanisms.



### Admin App Port Configuration  \n<small>Source: `apps/admin/PORT_CONFIGURATION.md`</small>

The admin application now supports customizable port configuration through environment variables.

## Default Configuration

- **Default Port**: 4200
- **Environment Variable**: `PORT`

## Usage Examples

### 1. Default Port (4200)
```bash
# Using nx directly
nx serve admin

# Using yarn script
yarn admin:dev

# Both will start the admin app on http://localhost:4200
```

### 2. Custom Port via Environment Variable
```bash
# Start on port 3000
PORT=3000 nx serve admin

# Start on port 5000
PORT=5000 nx serve admin

# Using predefined yarn scripts
yarn admin:dev:3000  # Starts on port 3000
yarn admin:dev:5000  # Starts on port 5000
```

### 3. Using .env File
Create a `.env` file in the `apps/admin` directory:
```bash
# apps/admin/.env
PORT=3000
```

Then run:
```bash
nx serve admin
```

## Configuration Files

The port configuration is implemented in the following files:

1. **webpack.config.js** - Main webpack dev server configuration
2. **project.json** - NX project configuration with default port
3. **environment.ts** - Development environment configuration
4. **environment.prod.ts** - Production environment configuration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port number for the development server | 4200 |

## Troubleshooting

### Port Already in Use
If you get an `EADDRINUSE` error, it means the port is already occupied:
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
1. Use a different port: `PORT=3001 nx serve admin`
2. Stop the process using the port
3. Use the default port: `nx serve admin` (uses port 4200)

### Finding Available Ports
To check which ports are in use:
```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

## Production Considerations

In production environments, the port configuration should be handled by your deployment platform or reverse proxy (nginx, Apache, etc.). The environment configuration is primarily for development purposes.



### Quasar Admin App  \n<small>Source: `apps/admin/README.md`</small>

This is the admin application for the Quasar project, built with React and TypeScript.

## Project Structure

The project follows a modern, scalable React application structure:

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
│   ├── common/      # Generic UI components (Button, Input)
│   ├── layout/      # Layout components (Header, Sidebar)
│   ├── SEO/         # SEO components
│   └── features/    # Feature-specific components
├── contexts/        # React Context providers
├── config/          # Configuration files
├── hooks/           # Custom React hooks
├── pages/           # Page components (route-based)
├── routes/          # Routing configuration
├── services/        # API and external service integration
├── styles/          # Global styles
├── utils/           # Utility functions
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Path Aliases

For cleaner imports, we use path aliases. For example:

```tsx
// Instead of this:
import Button from '../../../components/common/Button';

// Use this:
import Button from '@admin/components/common/Button';
```

## Best Practices

### Component Organization

1. **Atomic Design Principles**: Organize components using atomic design (atoms, molecules, organisms)
2. **Component Folder Structure**:
   ```
   Button/
   ├── Button.tsx
   ├── Button.module.scss
   └── index.ts
   ```

### State Management

1. Use React Context for global state
2. Keep component state local when possible
3. Use Redux only for complex global state

### Code Style

1. Use TypeScript for type safety
2. Use functional components with hooks
3. Follow ESLint and Prettier configurations

## Getting Started

```bash
# Install dependencies
yarn

# Start the development server
nx serve admin
```

## Contributing

Please follow the project structure and best practices when adding new features or making changes.



### Input Icon Spacing System  \n<small>Source: `apps/admin/src/components/common/INPUT_ICON_SPACING_GUIDE.md`</small>

This document outlines the reusable CSS classes and component patterns for input fields with icons, ensuring consistent spacing throughout the application.

## CSS Utility Classes

### Left Icon Spacing Classes

These classes provide consistent left padding for input fields with left-positioned icons:

```css
/* Standard spacing - recommended for most use cases */
.input-with-left-icon {
  padding-left: 3.5rem !important; /* 56px */
}

/* Compact spacing - for tighter layouts */
.input-with-left-icon-compact {
  padding-left: 2.75rem !important; /* 44px */
}

/* Large spacing - for bigger icons or generous layouts */
.input-with-left-icon-large {
  padding-left: 4rem !important; /* 64px */
}
```

### Icon Positioning Class

```css
.input-icon-left {
  position: absolute;
  left: 0.75rem; /* 12px from left edge */
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: theme('colors.gray.400');
}
```

## Component Usage

### 1. InputWithIcon Component (Recommended)

```tsx
import { InputWithIcon } from '../common/InputWithIcon';
import { FiSearch, FiUser } from 'react-icons/fi';

// Standard spacing (default)
<InputWithIcon
  leftIcon={<FiSearch className="h-5 w-5" />}
  placeholder="Search..."
  iconSpacing="standard"
/>

// Compact spacing
<InputWithIcon
  leftIcon={<FiUser className="h-4 w-4" />}
  placeholder="Username"
  iconSpacing="compact"
/>

// Large spacing
<InputWithIcon
  leftIcon={<FiSearch className="h-6 w-6" />}
  placeholder="Search with large icon"
  iconSpacing="large"
/>
```

### 2. Manual Implementation with CSS Classes

```tsx
<div className="relative">
  <div className="input-icon-left">
    <FiSearch className="h-5 w-5" />
  </div>
  <input
    type="text"
    className="block w-full input-with-left-icon pr-3 py-2 border border-gray-300 rounded-md"
    placeholder="Search..."
  />
</div>
```

## Spacing Guidelines

### Icon Sizes and Recommended Spacing

| Icon Size | Tailwind Class | Recommended Spacing | Use Case |
|-----------|----------------|-------------------|----------|
| 16px (4x4) | `h-4 w-4` | `compact` (44px) | Small forms, compact layouts |
| 20px (5x5) | `h-5 w-5` | `standard` (56px) | Most common use case |
| 24px (6x6) | `h-6 w-6` | `large` (64px) | Prominent search fields, headers |

### Visual Spacing Breakdown

```
Standard Spacing (56px total):
[12px margin] [20px icon] [24px gap] [text starts here...]
|-------------|-----------|---------|

Compact Spacing (44px total):
[12px margin] [16px icon] [16px gap] [text starts here...]
|-------------|-----------|---------|

Large Spacing (64px total):
[12px margin] [24px icon] [28px gap] [text starts here...]
|-------------|-----------|---------|
```

## Migration Guide

### From Inline Styles to Utility Classes

**Before:**
```tsx
<input
  className="pl-14 ..." // 56px inline
  style={{ paddingLeft: '56px' }}
/>
```

**After:**
```tsx
<input
  className="input-with-left-icon ..." // 56px via utility class
/>
```

### From FormInput Component

The existing `FormInput` component uses a different pattern with bordered icon containers. For consistency with the new system:

**Before (FormInput with icon):**
```tsx
<FormInput
  icon={<FiSearch />}
  placeholder="Search..."
/>
```

**After (InputWithIcon):**
```tsx
<InputWithIcon
  leftIcon={<FiSearch className="h-5 w-5" />}
  placeholder="Search..."
  iconSpacing="standard"
/>
```

## Best Practices

1. **Use the InputWithIcon component** for new implementations
2. **Choose appropriate spacing** based on icon size and layout context
3. **Maintain consistent icon sizes** within the same interface section
4. **Use semantic HTML** with proper labels and ARIA attributes
5. **Test in both light and dark modes** to ensure proper contrast

## Examples in Codebase

- `QuickAddPermissionModal.tsx` - Uses standard spacing with search icon
- `FormInput.tsx` - Legacy pattern with bordered icon container
- Table search inputs - Uses large spacing (60px) for backward compatibility

## Accessibility Notes

- Icons are automatically set to `pointer-events: none` to prevent interference with input focus
- Color contrast is maintained in both light and dark modes
- The InputWithIcon component supports all standard ARIA attributes



### useUrlTabs Hook - URL Tab State Persistence  \n<small>Source: `apps/admin/src/hooks/useUrlTabs.example.md`</small>

This hook allows you to persist tab state in the URL parameters, making tabs maintain their state across page reloads and browser navigation.

## Basic Usage

```typescript
import { useUrlTabs } from '../../hooks/useUrlTabs';

// In your component
const MyComponent = () => {
  // Basic usage with numeric indices
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0, // Optional: default to first tab
    tabParam: 'tab', // Optional: URL parameter name (defaults to 'tab')
  });

  // Pass to your EntityForm or Tabs component
  return (
    <EntityForm
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      // ... other props
    />
  );
};
```

## Advanced Usage with Custom Tab Keys

```typescript
const MyComponent = () => {
  // Use custom tab keys for cleaner URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'advanced', 'security'] // Maps to tab indices
  });

  // URLs will be:
  // - /page (default tab)
  // - /page?tab=general (index 0)
  // - /page?tab=advanced (index 1) 
  // - /page?tab=security (index 2)
};
```

## Features

- ✅ **URL Persistence**: Tab state persists across page reloads
- ✅ **Browser Navigation**: Back/forward buttons work with tabs
- ✅ **Clean URLs**: Default tab doesn't add URL parameter
- ✅ **Custom Keys**: Use semantic names instead of numbers
- ✅ **Auto Cleanup**: Invalid tab parameters are automatically removed
- ✅ **TypeScript Support**: Full type safety

## URL Examples

### With Numeric Indices
- `/storage` - Default tab (no parameter)
- `/storage?tab=1` - Second tab
- `/storage?tab=2` - Third tab

### With Custom Keys  
- `/storage` - Default tab (no parameter)
- `/storage?tab=local` - Local storage tab
- `/storage?tab=s3` - S3 configuration tab

## Integration with EntityForm

The `EntityForm` component now supports external tab control:

```typescript
<EntityForm<FormData>
  tabs={tabs}
  initialValues={initialValues}
  onSubmit={handleSubmit}
  // Add these props for URL persistence
  activeTab={activeTab}
  onTabChange={handleTabChange}
  // ... other props
/>
```

## Backward Compatibility

Existing forms without `activeTab` and `onTabChange` props will continue to work with internal tab state management.



### URL Parameter Examples for User Management  \n<small>Source: `apps/admin/src/pages/users/URL_PARAMS_EXAMPLES.md`</small>

This document demonstrates the URL parameter functionality implemented in the User Management page.

## URL Parameter Structure

The user management page now supports the following URL parameters:

### Search Parameters
- `search` - Search term for filtering users
- `role` - Filter by user role (super_admin, admin, manager, user, guest)
- `isActive` - Filter by active status (true/false)
- `dateFrom` - Filter by creation date from
- `dateTo` - Filter by creation date to
- `page` - Current page number
- `sortBy` - Sort field (defaults to createdAt)
- `sortOrder` - Sort order (asc/desc, defaults to desc)

## Example URLs

### Basic Search
```
/users?search=john
```
Searches for users with "john" in their name, email, or username.

### Filter by Role
```
/users?role=admin
```
Shows only users with admin role.

### Filter by Status
```
/users?isActive=true
```
Shows only active users.

### Combined Filters
```
/users?search=john&role=admin&isActive=true&page=2
```
Searches for "john" among admin users who are active, on page 2.

### Date Range Filter
```
/users?dateFrom=2024-01-01&dateTo=2024-12-31
```
Shows users created between January 1, 2024 and December 31, 2024.

### Complete Example
```
/users?search=admin&role=admin&isActive=true&page=1&sortBy=createdAt&sortOrder=desc
```
Searches for "admin" among admin users who are active, sorted by creation date descending.

## Features

### ✅ URL Persistence
- All search and filter states are saved to URL
- Page refreshes maintain the current view
- Browser back/forward buttons work correctly

### ✅ Shareable URLs
- Copy and share URLs to show specific filtered views
- URLs work across different browser sessions

### ✅ Parameter Validation
- Invalid role values are ignored
- Invalid boolean values default to undefined
- Invalid page numbers default to 1
- Invalid dates are ignored

### ✅ Debounced Updates
- Search input is debounced (400ms) to avoid excessive URL updates
- URL updates are debounced (100ms) to prevent rapid changes

### ✅ Clean URLs
- Default values are not included in URL (page=1, sortBy=createdAt, sortOrder=desc)
- Empty parameters are automatically removed
- URL is updated without page reloads

### ✅ Reset Functionality
- "Clear Filters" button removes all URL parameters
- Individual filter changes update URL appropriately
- Search changes reset pagination to page 1

## Implementation Details

### State Initialization
The component reads URL parameters on mount and initializes state accordingly:
- Search value from `search` parameter
- Filters from `role`, `isActive`, `dateFrom`, `dateTo` parameters
- Page number from `page` parameter (defaults to 1)
- Sort preferences from `sortBy` and `sortOrder` parameters

### URL Updates
URL parameters are updated when:
- User types in search box (debounced)
- User changes filters
- User navigates to different page
- User clears filters

### Backward Compatibility
The implementation maintains full backward compatibility:
- Existing functionality works exactly as before
- No breaking changes to component API
- All existing event handlers continue to work



### Database Seeders  \n<small>Source: `apps/backend/src/database/seeders/README.md`</small>

Tất cả các seeders cho hệ thống được quản lý tại đây với flag-based commands.

## 🚀 Quick Start

```bash
# Seed an toàn (chỉ khi database empty) - Default
yarn seed

# Xem tất cả options
yarn seed:help
```

## 🏷️ Available Flags

### Core Flags
```bash
yarn seed --permissions      # Seed permissions (safe)
yarn seed --roles           # Seed roles only  
yarn seed --all             # Run all seeders
```

### Action Flags
```bash
yarn seed --force           # Force seed (có thể tạo duplicates)
yarn seed --clear           # Clear all data và reseed (DESTRUCTIVE!)
yarn seed --reseed          # Reseed data (có thể tạo duplicates)
yarn seed --safe            # Safe seed - explicit (default behavior)
```

### Combined Examples
```bash
# Safe permission seeding (default)
yarn seed --permissions

# Force permission seeding
yarn seed --permissions --force

# Reseed permissions
yarn seed --permissions --reseed

# Destructive clear & reseed
yarn seed --clear

# Seed roles only
yarn seed --roles
```

## 🎯 Short Flags

```bash
yarn seed -p              # --permissions
yarn seed -r              # --roles
yarn seed -a              # --all
yarn seed -f              # --force
yarn seed -c              # --clear
yarn seed -s              # --safe
yarn seed -h              # --help
```

## 🏗️ Architecture

```
seeders/
├── main.seeder.ts       # 🚀 Main entry point với flag parsing
├── permission.seeder.ts # 📋 Permission & role seeding
├── seeder.module.ts     # 🔧 NestJS module
├── index.ts             # 📦 Exports
└── README.md           # 📚 Documentation
```

## 📝 How to Add New Seeders

1. Tạo seeder class trong thư mục này
2. Add vào `SeederModule` providers
3. Import seeder trong `main.seeder.ts`
4. Thêm flag parsing trong `parseFlags()`
5. Thêm logic trong `bootstrap()` function
6. Update help text trong `showHelp()`

## 🔧 Development & Advanced Usage

### Direct Commands
```bash
# Chạy direct với ts-node
npx ts-node --project tsconfig.scripts.json src/database/seeders/main.seeder.ts [flags]

# Examples:
npx ts-node --project tsconfig.scripts.json src/database/seeders/main.seeder.ts --permissions --force
npx ts-node --project tsconfig.scripts.json src/database/seeders/main.seeder.ts --clear
npx ts-node --project tsconfig.scripts.json src/database/seeders/main.seeder.ts --help
```

### Nx Commands (Alternative)
```bash
# Nx-based commands still available
nx run backend:seed
nx run backend:seed:all
nx run backend:seed:clear
```

## ⚠️ Important Notes

- **Default**: `yarn seed` chạy safe seeding (chỉ khi database empty)
- **`--clear`**: Destructive operation - xóa tất cả data trước khi seed
- **`--force` & `--reseed`**: Có thể tạo duplicates
- **Help**: Luôn có sẵn với `yarn seed:help` hoặc `yarn seed --help`
- **Flags có thể combine**: `yarn seed --permissions --force`

## 🎉 Flag Benefits

✅ **Flexible**: Combine multiple flags  
✅ **Intuitive**: Self-documenting commands  
✅ **Scalable**: Easy to add new entities  
✅ **Safe**: Default behavior is always safe  
✅ **Short options**: `-p`, `-r`, `-f`, etc.



### User Activity Seeder Documentation  \n<small>Source: `apps/backend/src/database/seeders/USER_ACTIVITY_SEEDER_README.md`</small>

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



### Real-Time User Activity Tracking System  \n<small>Source: `apps/backend/src/modules/user/ACTIVITY_TRACKING_README.md`</small>

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



### Error Handling System Test Documentation  \n<small>Source: `apps/backend/src/tests/error-handling.test.md`</small>

## Overview
This document describes the comprehensive testing of the structured error handling system implemented across all tRPC routers in the backend application.

## Error Code Structure
- Format: `XXYYZZ`
- XX = Module Code (e.g., 10 = User, 20 = Auth, 30 = Translation)
- YY = Operation Code (e.g., 01 = Create, 02 = Read, 03 = Update, 04 = Delete)
- ZZ = Error Level Code (e.g., 04 = Not Found, 06 = Conflict, 01 = Server Error)

## Test Scenarios

### 1. User Module Error Tests

#### 1.1 User Registration Conflict (Error Code: 110106)
**Scenario:** Attempting to register with an existing email
**Expected Error:**
```json
{
  "code": "CONFLICT",
  "message": "User with this email already exists",
  "data": {
    "errorCode": "110106",
    "httpStatus": 409,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 1.2 User Not Found (Error Code: 110204)
**Scenario:** Requesting user by invalid ID
**Expected Error:**
```json
{
  "code": "NOT_FOUND", 
  "message": "User not found",
  "data": {
    "errorCode": "110204",
    "httpStatus": 404,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 1.3 Profile Update Unauthorized (Error Code: 110302)
**Scenario:** Updating profile without authentication
**Expected Error:**
```json
{
  "code": "UNAUTHORIZED",
  "message": "User not authenticated", 
  "data": {
    "errorCode": "110302",
    "httpStatus": 401,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Authentication Module Error Tests

#### 2.1 Login Failed (Error Code: 200502)
**Scenario:** Login with invalid credentials
**Expected Error:**
```json
{
  "code": "UNAUTHORIZED",
  "message": "Invalid credentials",
  "data": {
    "errorCode": "200502", 
    "httpStatus": 401,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2.2 Token Refresh Error (Error Code: 200822)
**Scenario:** Refresh token with invalid token
**Expected Error:**
```json
{
  "code": "UNAUTHORIZED",
  "message": "Invalid refresh token",
  "data": {
    "errorCode": "200822",
    "httpStatus": 401,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Translation Module Error Tests

#### 3.1 Translation Not Found (Error Code: 400204)
**Scenario:** Requesting translation with invalid key
**Expected Error:**
```json
{
  "code": "NOT_FOUND",
  "message": "Translation not found",
  "data": {
    "errorCode": "400204",
    "httpStatus": 404,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 3.2 Translation Creation Unauthorized (Error Code: 400102)
**Scenario:** Creating translation without admin privileges
**Expected Error:**
```json
{
  "code": "UNAUTHORIZED", 
  "message": "Admin access required",
  "data": {
    "errorCode": "400102",
    "httpStatus": 401,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Permission Module Error Tests

#### 4.1 Permission Not Found (Error Code: 300204)
**Scenario:** Requesting permission with invalid ID
**Expected Error:**
```json
{
  "code": "NOT_FOUND",
  "message": "Permission not found", 
  "data": {
    "errorCode": "300204",
    "httpStatus": 404,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 4.2 Permission Deletion Forbidden (Error Code: 300411)
**Scenario:** Deleting system permission
**Expected Error:**
```json
{
  "code": "BAD_REQUEST",
  "message": "Permission cannot be deleted due to dependencies",
  "data": {
    "errorCode": "300411",
    "httpStatus": 400,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Success Response Structure

### Standard Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "messageCode": "110201", 
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Created Response
```json
{
  "success": true,
  "data": { /* created resource */ },
  "message": "User created successfully",
  "messageCode": "110101",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Updated Response
```json
{
  "success": true,
  "data": { /* updated resource */ },
  "message": "User updated successfully", 
  "messageCode": "110301",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Deleted Response
```json
{
  "success": true,
  "message": "User deleted successfully",
  "messageCode": "110401",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Registry Integration

### Error Documentation Generation
The ErrorRegistryService provides comprehensive documentation for all error codes:

```typescript
// Generate complete error documentation
const documentation = errorRegistryService.generateDocumentation();

// Get specific error details
const errorDetails = errorRegistryService.getError("110106");

// Search errors by criteria
const userErrors = errorRegistryService.searchErrors({
  moduleCode: ModuleCode.USER
});
```

### Error Registry Features
- ✅ Centralized error code management
- ✅ Automatic HTTP status mapping  
- ✅ tRPC error code mapping
- ✅ Error documentation generation
- ✅ Search and filtering capabilities
- ✅ Common causes and solutions
- ✅ Example scenarios

## Validation Tests

### Input Validation Errors
All routers implement comprehensive input validation using Zod schemas:

```typescript
// Registration validation
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters")
});
```

### Middleware Chain Validation
1. **AuthMiddleware** - Validates JWT token and user authentication
2. **AdminRoleMiddleware** - Validates admin privileges
3. **UserInjectionMiddleware** - Injects user context
4. **PermissionMiddleware** - Validates specific permissions

## Testing Methodology

### Manual Testing Checklist
- [ ] Test all user registration scenarios
- [ ] Test authentication and authorization flows
- [ ] Test profile management with proper context
- [ ] Test translation CRUD operations
- [ ] Test permission management
- [ ] Test admin-only endpoints
- [ ] Test error response consistency
- [ ] Test success response consistency

### Automated Testing Recommendations
1. **Unit Tests** - Test individual service methods
2. **Integration Tests** - Test tRPC router endpoints
3. **E2E Tests** - Test complete user flows
4. **Error Scenario Tests** - Test all error conditions

## Implementation Status

### ✅ Completed Features
- [x] Structured error code system (XXYYZZ format)
- [x] ResponseHandlerService with unified error/success handling
- [x] Error registry system with comprehensive documentation
- [x] Standardized tRPC response schemas
- [x] Authentication context implementation for profile endpoints
- [x] Translation router conversion to NestJS-tRPC format
- [x] All routers updated to use ResponseHandlerService
- [x] Comprehensive error mapping (HTTP status, tRPC codes)
- [x] Success response standardization

### 📝 Testing Results
All error scenarios have been implemented and are ready for testing. The system provides:

1. **Consistent Error Structure** - All errors follow the same format
2. **Proper HTTP Status Mapping** - Correct status codes for each error type
3. **Comprehensive Error Registry** - Centralized error documentation
4. **Type Safety** - Full TypeScript support with Zod validation
5. **Standardized Success Responses** - Consistent success response structure

## Conclusion

The error handling system has been successfully implemented across all tRPC routers with:
- ✅ Structured error codes for easy debugging
- ✅ Consistent response formats
- ✅ Comprehensive error registry
- ✅ Proper authentication context
- ✅ Standardized schemas for maintainability

The system is production-ready and provides excellent developer experience with clear error messages, proper status codes, and comprehensive documentation.



### tRPC API Documentation  \n<small>Source: `docs/API.md`</small>

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



### Chart Functionality Implementation  \n<small>Source: `docs/CHART_FUNCTIONALITY.md`</small>

This document describes the implementation of interactive chart functionality for the StatisticsCard component in the admin application.

## Overview

The chart functionality enhances the existing StatisticsCard component by adding:

- **Chart Icon**: A clickable chart icon that opens a modal with interactive charts
- **Chart Modal**: A responsive modal displaying various chart types
- **Multiple Chart Types**: Support for line, bar, pie, and area charts
- **Time Period Filtering**: Date range selection with presets and custom ranges
- **Backend Integration**: API endpoints for fetching chart data
- **Theme Support**: Compatible with light and dark themes

## Components

### Enhanced StatisticsCard

The StatisticsCard component now includes:

**New Props:**
- `enableChart?: boolean` - Enables the chart icon and functionality
- `statisticId?: string` - Unique identifier for the statistic (used for API calls)

**Features:**
- Chart icon appears in the top-right corner when enabled
- Hover effects and accessibility support
- Maintains existing functionality (trends, loading states, etc.)

### ChartModal

A comprehensive modal component for displaying charts.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Close handler
- `statisticId: string` - Statistic identifier
- `title: string` - Chart title
- `initialChartType?: ChartType` - Default chart type

**Features:**
- Responsive design (mobile-friendly)
- Chart type selector
- Date range picker with presets
- Loading states and error handling
- Retry functionality

### Chart Components

#### ChartContainer
Main wrapper component that renders the appropriate chart based on type.

#### Individual Chart Components
- **LineChart**: Time series data with trend lines
- **BarChart**: Comparative data visualization
- **PieChart**: Proportional data with percentages
- **AreaChart**: Cumulative trends with filled areas

**Common Features:**
- Responsive design using Recharts
- Custom tooltips with formatted data
- Theme-aware colors
- Accessibility support
- Interactive legends

### Chart Controls

#### ChartTypeSelector
Allows users to switch between different chart types.

**Features:**
- Visual icons for each chart type
- Descriptive tooltips
- Keyboard navigation support

#### DateRangePicker
Provides time period selection functionality.

**Presets:**
- 7 Days
- 30 Days
- 90 Days
- 1 Year
- Custom Range

**Features:**
- Date validation
- Custom date range inputs
- Responsive layout

## Backend Implementation

### AdminChartDataService

Service class that generates chart data from database queries.

**Methods:**
- `getChartData(request)`: Returns formatted chart data
- `getAvailableChartTypes(statisticId)`: Returns supported chart types

**Supported Statistics:**
- `total-users`: User growth over time
- `active-users`: Active user trends
- `new-users`: New user registrations
- `users-with-profiles`: Profile completion data

**Chart Type Support:**
- Line/Bar/Area charts: Time series data
- Pie charts: Categorical distributions

### AdminChartDataRouter

tRPC router exposing chart data endpoints.

**Endpoints:**
- `getChartData`: Fetch chart data with filtering
- `getAvailableChartTypes`: Get supported chart types

**Features:**
- Admin authentication required
- Input validation with Zod schemas
- Proper error handling
- Response formatting

## API Integration

### Custom Hook: useChartData

React hook for fetching chart data with caching and error handling.

**Features:**
- Automatic refetching on parameter changes
- Caching with stale-time management
- Retry logic with exponential backoff
- Loading and error states

**Usage:**
```tsx
const { data, isLoading, error, refetch } = useChartData({
  statisticId: 'total-users',
  chartType: 'line',
  period: '30d',
  enabled: true,
});
```

## Usage Examples

### Basic Implementation

```tsx
import { StatisticsGrid, StatisticData } from '@admin/components/common/StatisticsGrid';

const statistics: StatisticData[] = [
  {
    id: 'total-users',
    title: 'Total Users',
    value: 1234,
    icon: <FiUsers className="w-5 h-5" />,
    enableChart: true, // Enable chart functionality
  },
];

<StatisticsGrid statistics={statistics} />
```

### Individual Card with Chart

```tsx
import { StatisticsCard } from '@admin/components/common/StatisticsCard';

<StatisticsCard
  title="Total Users"
  value={1234}
  icon={<FiUsers className="w-5 h-5" />}
  enableChart={true}
  statisticId="total-users"
  trend={{
    value: 15,
    isPositive: true,
    label: 'vs last month'
  }}
/>
```

## Styling and Theming

The chart components follow the existing design system:

- **Colors**: Uses the application's color palette
- **Typography**: Consistent with existing components
- **Spacing**: Follows Tailwind CSS spacing scale
- **Dark Mode**: Automatic theme switching support

## Dependencies

### New Dependencies Added
- `recharts`: React charting library
- `date-fns`: Date manipulation utilities

### Existing Dependencies Used
- `@radix-ui/react-dialog`: Modal functionality
- `lucide-react`: Icons
- `tailwindcss`: Styling
- `@tanstack/react-query`: Data fetching

## Performance Considerations

- **Lazy Loading**: Charts only load when modal is opened
- **Data Caching**: Chart data is cached to reduce API calls
- **Responsive Rendering**: Charts adapt to container size
- **Memory Management**: Proper cleanup of chart instances

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Color Contrast**: Meets WCAG guidelines
- **Focus Management**: Proper focus handling in modals

## Future Enhancements

Potential improvements for future iterations:

1. **Export Functionality**: Export charts as images or PDF
2. **Real-time Updates**: WebSocket integration for live data
3. **Drill-down Capability**: Click charts to view detailed data
4. **Comparison Views**: Compare multiple time periods
5. **Custom Chart Types**: Additional visualization options
6. **Data Annotations**: Add notes and markers to charts

## Testing

The implementation includes:

- **Unit Tests**: Component testing with Jest and React Testing Library
- **Integration Tests**: API endpoint testing
- **Visual Tests**: Chart rendering verification
- **Accessibility Tests**: Screen reader and keyboard navigation

## Troubleshooting

### Common Issues

1. **Charts not loading**: Check API connectivity and authentication
2. **Date range errors**: Verify date format and range validity
3. **Performance issues**: Check data size and caching configuration
4. **Theme inconsistencies**: Verify CSS variable definitions

### Debug Mode

Enable debug logging by setting:
```typescript
// In development environment
const DEBUG_CHARTS = process.env.NODE_ENV === 'development';
```



### Deployment Guide  \n<small>Source: `docs/DEPLOYMENT.md`</small>

This guide covers deploying the tRPC application to various environments including development, staging, and production.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Security Considerations](#security-considerations)
- [Monitoring & Logging](#monitoring--logging)

## Environment Setup

### Prerequisites

- **Node.js**: 18.x or higher
- **Yarn**: 1.22.x or higher
- **PostgreSQL**: 13.x or higher
- **Docker**: 20.x or higher (optional)

### Development Dependencies

```bash
# Install global dependencies
npm install -g @nx/cli

# Install project dependencies
yarn install
```

## Local Development

### Database Setup

1. **Install PostgreSQL locally**:
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

2. **Create database and user**:
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE quasar_dev;

-- Create user
CREATE USER quasar_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE quasar_dev TO quasar_user;

-- Exit
\q
```

### Environment Configuration

Create environment files:

```bash
# Backend environment
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=quasar_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=quasar_dev

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Application
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:4200,http://localhost:4201
```

### Run Development Servers

```bash
# Terminal 1: Backend
yarn nx serve backend

# Terminal 2: Client App
yarn nx serve client

# Terminal 3: Admin App
yarn nx serve admin
```

### Database Migrations

```bash
# Run initial migrations
yarn nx run backend:migration:run

# Generate new migration
yarn nx run backend:migration:generate --name=AddNewFeature

# Revert last migration
yarn nx run backend:migration:revert
```

## Docker Deployment

### Dockerfile Configuration

**Backend Dockerfile** (`apps/backend/Dockerfile`):
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build backend
RUN yarn nx build backend --prod

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist/apps/backend ./
COPY --from=builder /app/node_modules ./node_modules

USER nestjs

EXPOSE 3001

ENV PORT 3001

CMD ["node", "main.js"]
```

**Frontend Dockerfile** (`apps/client/Dockerfile`):
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build client
RUN yarn nx build client --prod

# Production image
FROM nginx:alpine AS runner
COPY --from=builder /app/dist/apps/client /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

**development** (`docker-compose.dev.yml`):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: quasar_dev
      POSTGRES_USER: quasar_user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USERNAME: quasar_user
      DATABASE_PASSWORD: password
      DATABASE_NAME: quasar_dev
      JWT_SECRET: dev-secret-key
      JWT_REFRESH_SECRET: dev-refresh-secret
    depends_on:
      - postgres
    volumes:
      - ./apps/backend:/app
      - /app/node_modules

  client:
    build:
      context: .
      dockerfile: apps/client/Dockerfile
    ports:
      - "4200:80"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "4201:80"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001

volumes:
  postgres_data:
```

**Production** (`docker-compose.prod.yml`):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      DATABASE_NAME: ${DATABASE_NAME}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - client_build:/usr/share/nginx/html/client
      - admin_build:/usr/share/nginx/html/admin
    depends_on:
      - backend
    restart: unless-stopped

  client:
    build:
      context: .
      dockerfile: apps/client/Dockerfile
    volumes:
      - client_build:/app/build

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    volumes:
      - admin_build:/app/build

volumes:
  postgres_data:
  client_build:
  admin_build:
```

### Nginx Configuration

**Production Nginx** (`nginx/nginx.conf`):
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3001;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Client application
        location / {
            root /usr/share/nginx/html/client;
            try_files $uri $uri/ /index.html;
        }

        # Admin application
        location /admin {
            alias /usr/share/nginx/html/admin;
            try_files $uri $uri/ /admin/index.html;
        }

        # API endpoints
        location /api {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # tRPC endpoints
        location /trpc {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Auth endpoints (stricter rate limiting)
        location ~ ^/(auth|login|register) {
            limit_req zone=auth burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Production Deployment

### Cloud Providers

#### AWS Deployment with ECS

**Task Definition** (`aws-task-definition.json`):
```json
{
  "family": "quasar-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-registry/quasar-backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/quasar-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Heroku Deployment

**Procfile**:
```
web: cd dist/apps/backend && node main.js
release: cd dist/apps/backend && node -e "require('./src/migrations/run-migrations')"
```

**package.json scripts**:
```json
{
  "scripts": {
    "build": "nx build backend --prod",
    "heroku-postbuild": "yarn build"
  }
}
```

#### Vercel Deployment (Frontend)

**vercel.json**:
```json
{
  "builds": [
    {
      "src": "apps/client/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/admin/package.json", 
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/admin/(.*)",
      "dest": "/admin/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

### CI/CD Pipeline

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'
      
      - run: yarn install --frozen-lockfile
      - run: yarn nx test backend
      - run: yarn nx test client
      - run: yarn nx lint backend
      - run: yarn nx lint client

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'
      
      - run: yarn install --frozen-lockfile
      - run: yarn nx build backend --prod
      - run: yarn nx build client --prod
      - run: yarn nx build admin --prod
      
      - name: Build Docker images
        run: |
          docker build -t quasar-backend -f apps/backend/Dockerfile .
          docker build -t quasar-client -f apps/client/Dockerfile .
          docker build -t quasar-admin -f apps/admin/Dockerfile .

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Your deployment commands here
          echo "Deploying to production..."
```

## Database Setup

### Production Database Configuration

#### PostgreSQL Production Setup

```sql
-- Create production database
CREATE DATABASE quasar_prod;

-- Create dedicated user
CREATE USER quasar_app WITH PASSWORD 'secure_random_password';

-- Grant minimal required privileges
GRANT CONNECT ON DATABASE quasar_prod TO quasar_app;
GRANT USAGE ON SCHEMA public TO quasar_app;
GRANT CREATE ON SCHEMA public TO quasar_app;

-- For existing tables (after migration)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO quasar_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO quasar_app;

-- For future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO quasar_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO quasar_app;
```

#### Database Migration in Production

```bash
# Create migration script
cat > migrate.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting database migration..."

# Backup database before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
cd /app && node -e "
const { DataSource } = require('typeorm');
const config = require('./ormconfig.js');
const dataSource = new DataSource(config);
dataSource.initialize().then(() => {
  return dataSource.runMigrations();
}).then(() => {
  console.log('Migrations completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
"

echo "Migration completed successfully"
EOF

chmod +x migrate.sh
```

### Database Backup Strategy

```bash
# Daily backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
RETENTION_DAYS=7

# Create backup
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Remove old backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: backup_$DATE.sql.gz"
EOF

# Schedule with cron
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## Environment Variables

### Production Environment Variables

**Backend**:
```bash
# Database
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_USERNAME=quasar_app
DATABASE_PASSWORD=secure_random_password
DATABASE_NAME=quasar_prod
DATABASE_SSL=true

# JWT
JWT_SECRET=very-long-random-string-use-crypto.randomBytes(64).toString('hex')
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another-very-long-random-string
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3001

# CORS
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

**Frontend**:
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_ENV=production

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_MONITORING=true
```

### Secret Management

#### Using AWS Secrets Manager

```typescript
// apps/backend/src/config/secrets.service.ts
import { Injectable } from '@nestjs/common';
import { SecretsManager } from 'aws-sdk';

@Injectable()
export class SecretsService {
  private secretsManager = new SecretsManager();

  async getSecret(secretName: string): Promise<string> {
    try {
      const result = await this.secretsManager.getSecretValue({
        SecretId: secretName
      }).promise();
      
      return result.SecretString || '';
    } catch (error) {
      throw new Error(`Failed to retrieve secret ${secretName}: ${error.message}`);
    }
  }

  async getDatabaseCredentials(): Promise<DatabaseConfig> {
    const secret = await this.getSecret('prod/database/credentials');
    return JSON.parse(secret);
  }
}
```

## Security Considerations

### Security Headers

```typescript
// apps/backend/src/main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  
  // Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }));
  
  await app.listen(process.env.PORT || 3001);
}
```

### Environment Security

```bash
# Set restrictive file permissions
chmod 600 .env*

# Use environment-specific configs
# .env.production
NODE_ENV=production
DEBUG=false

# Never commit secrets to git
echo ".env*" >> .gitignore
echo "secrets/" >> .gitignore
```

## Monitoring & Logging

### Application Monitoring

```typescript
// apps/backend/src/monitoring/monitoring.module.ts
import { Module } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Module({})
export class MonitoringModule {
  constructor() {
    if (process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
      });
    }
  }
}
```

### Health Checks

```typescript
// apps/backend/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

### Logging Configuration

```typescript
// apps/backend/src/config/logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ]
      : []),
  ],
});
```

This deployment guide provides comprehensive instructions for deploying the tRPC application across different environments while maintaining security and performance best practices.



### Development Guide  \n<small>Source: `docs/DEVELOPMENT.md`</small>

This guide explains how to extend and work with the tRPC architecture in this project.

## Table of Contents

- [Project Structure](#project-structure)
- [Adding New Features](#adding-new-features)
- [Creating New Routers](#creating-new-routers)
- [Database Operations](#database-operations)
- [Authentication & Authorization](#authentication--authorization)
- [Testing](#testing)
- [Deployment](#deployment)
- [Best Practices](#best-practices)

## Project Structure

### Backend Architecture

```
apps/backend/src/
├── app/                    # Main application module
├── auth/                   # Authentication system
│   ├── guards/            # Auth guards
│   ├── strategies/        # Passport strategies
│   └── auth.service.ts    # Auth service
├── modules/               # Feature modules
│   ├── admin/            # Admin-specific features
│   ├── client/           # Client-specific features
│   └── user/             # Core user functionality
│       ├── entities/     # TypeORM entities
│       ├── repositories/ # Data access layer
│       └── services/     # Business logic
├── trpc/                 # tRPC implementation
│   ├── routers/         # tRPC routers
│   ├── middlewares/     # tRPC middlewares
│   ├── context.ts       # tRPC context setup
│   └── trpc.ts          # tRPC configuration
└── types/               # Shared type definitions
```

### Frontend Architecture

```
apps/client/src/          # Client application
├── utils/
│   ├── trpc.ts          # tRPC client setup
│   └── auth.ts          # Auth utilities
├── pages/               # Next.js pages
├── components/          # React components
└── styles/              # CSS/SCSS styles

apps/admin/src/           # Admin application
├── utils/
│   └── trpc.ts          # tRPC client setup
├── pages/               # Admin pages
└── components/          # Admin components
```

## Adding New Features

### 1. Backend Feature Development

#### Step 1: Create Entity (if needed)

```typescript
// apps/backend/src/modules/posts/entities/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  published: boolean;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Step 2: Create Repository

```typescript
// apps/backend/src/modules/posts/repositories/post.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

export interface CreatePostData {
  title: string;
  content: string;
  authorId: string;
  published?: boolean;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  published?: boolean;
}

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>
  ) {}

  async create(data: CreatePostData): Promise<Post> {
    const post = this.postRepo.create({
      title: data.title,
      content: data.content,
      published: data.published ?? false,
      author: { id: data.authorId } as any,
    });
    return await this.postRepo.save(post);
  }

  async findById(id: string): Promise<Post | null> {
    return await this.postRepo.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async findByAuthor(authorId: string): Promise<Post[]> {
    return await this.postRepo.find({
      where: { author: { id: authorId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: UpdatePostData): Promise<Post | null> {
    await this.postRepo.update(id, data);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.postRepo.delete(id);
  }
}
```

#### Step 3: Create Service

```typescript
// apps/backend/src/modules/posts/services/post.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostRepository, CreatePostData, UpdatePostData } from '../repositories/post.repository';
import { Post } from '../entities/post.entity';

export interface CreatePostDto {
  title: string;
  content: string;
  published?: boolean;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  published?: boolean;
}

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(authorId: string, createPostDto: CreatePostDto): Promise<Post> {
    return await this.postRepository.create({
      ...createPostDto,
      authorId,
    });
  }

  async getPostById(id: string, userId?: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if post is published or user is the author
    if (!post.published && post.author.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return post;
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return await this.postRepository.findByAuthor(userId);
  }

  async updatePost(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.id !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return await this.postRepository.update(id, updatePostDto);
  }

  async deletePost(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.delete(id);
  }
}
```

#### Step 4: Create tRPC Router

```typescript
// apps/backend/src/trpc/routers/post.router.ts
import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { PostService } from '../../modules/posts/services/post.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AuthenticatedContext } from '../context';

// Zod schemas for validation
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

const postResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  published: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
  }),
});

@Injectable()
export class PostRouter {
  constructor(
    @Inject(PostService)
    private readonly postService: PostService,
  ) {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: createPostSchema,
    output: postResponseSchema,
  })
  async createPost(
    @Input() input: z.infer<typeof createPostSchema>,
    @Context() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof postResponseSchema>> {
    const post = await this.postService.createPost(ctx.user!.id, input);
    return this.toPostResponse(post);
  }

  @Query({
    input: z.object({ id: z.string() }),
    output: postResponseSchema,
  })
  async getPost(
    @Input() input: { id: string },
    @Context() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof postResponseSchema>> {
    const post = await this.postService.getPostById(input.id, ctx.user?.id);
    return this.toPostResponse(post);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.array(postResponseSchema),
  })
  async getMyPosts(
    @Context() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof postResponseSchema>[]> {
    const posts = await this.postService.getUserPosts(ctx.user!.id);
    return posts.map(post => this.toPostResponse(post));
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updatePostSchema),
    output: postResponseSchema,
  })
  async updatePost(
    @Input() input: { id: string } & z.infer<typeof updatePostSchema>,
    @Context() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof postResponseSchema>> {
    const { id, ...updateData } = input;
    const post = await this.postService.updatePost(id, ctx.user!.id, updateData);
    return this.toPostResponse(post);
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: z.void(),
  })
  async deletePost(
    @Input() input: { id: string },
    @Context() ctx: AuthenticatedContext
  ): Promise<void> {
    await this.postService.deletePost(input.id, ctx.user!.id);
  }

  private toPostResponse(post: any): z.infer<typeof postResponseSchema> {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author.id,
        username: post.author.username,
        email: post.author.email,
      },
    };
  }
}
```

#### Step 5: Create Module

```typescript
// apps/backend/src/modules/posts/post.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostRepository } from './repositories/post.repository';
import { PostService } from './services/post.service';
import { PostRouter } from '../../trpc/routers/post.router';
import { AuthModule } from '../../auth/auth.module';
import { AuthMiddleware } from '../../trpc/middlewares/auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    AuthModule,
  ],
  providers: [
    PostService,
    PostRepository,
    PostRouter,
    AuthMiddleware,
  ],
  exports: [PostService],
})
export class PostModule {}
```

#### Step 6: Update App Router

```typescript
// apps/backend/src/types/app-router.ts
import { mergeRouters } from '../trpc/trpc';
import { adminUserRouter } from '../trpc/routers/admin-user.router';
import { clientUserRouter } from '../trpc/routers/client-user.router';
import { postRouter } from '../trpc/routers/post.router';

export const appRouter = mergeRouters(
  adminUserRouter,
  clientUserRouter,
  postRouter,
);

export type AppRouter = typeof appRouter;
```

### 2. Frontend Integration

#### Update tRPC Types

The frontend will automatically get the new types when you rebuild the backend.

#### Use in React Components

```typescript
// apps/client/src/components/PostForm.tsx
import { useState } from 'react';
import { trpc } from '../utils/trpc';

export function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);

  const createPostMutation = trpc.posts.createPost.useMutation({
    onSuccess: () => {
      // Reset form
      setTitle('');
      setContent('');
      setPublished(false);
      
      // Refetch posts
      utils.posts.getMyPosts.invalidate();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createPostMutation.mutateAsync({
      title,
      content,
      published,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
      </div>
      
      <button type="submit" disabled={createPostMutation.isLoading}>
        {createPostMutation.isLoading ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

## Creating New Routers

### Router Naming Convention

- Use descriptive names: `PostRouter`, `CommentRouter`, `ProductRouter`
- Group related functionality in the same router
- Separate admin and client functionality when needed

### Router Structure Template

```typescript
@Injectable()
export class [Feature]Router {
  constructor(
    @Inject([Feature]Service)
    private readonly [feature]Service: [Feature]Service,
  ) {}

  // Public procedures (no middleware)
  @Query({...})
  async getPublic[Feature]() {}

  // Protected procedures (AuthMiddleware)
  @UseMiddlewares(AuthMiddleware)
  @Query({...})
  async get[Feature]() {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({...})
  async create[Feature]() {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({...})
  async update[Feature]() {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({...})
  async delete[Feature]() {}

  // Admin-only procedures
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({...})
  async admin[Feature]List() {}

  // Helper methods
  private to[Feature]Response(entity: [Feature]): [Feature]Response {
    // Transform entity to response format
  }
}
```

## Database Operations

### Creating Migrations

```bash
# Generate migration
yarn nx run backend:migration:generate --name=CreatePostsTable

# Run migrations
yarn nx run backend:migration:run

# Revert last migration
yarn nx run backend:migration:revert
```

### Entity Relationships

```typescript
// One-to-Many
@Entity()
export class User {
  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}

@Entity()
export class Post {
  @ManyToOne(() => User, user => user.posts)
  author: User;
}

// Many-to-Many
@Entity()
export class Post {
  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];
}

@Entity()
export class Tag {
  @ManyToMany(() => Post, post => post.tags)
  posts: Post[];
}
```

### Repository Best Practices

```typescript
@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>
  ) {}

  // Always use specific find methods
  async findById(id: string): Promise<Post | null> {
    return await this.postRepo.findOne({
      where: { id },
      relations: ['author', 'tags'], // Load relations explicitly
    });
  }

  // Use query builder for complex queries
  async findPostsWithFilters(filters: PostFilters): Promise<Post[]> {
    const query = this.postRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags');

    if (filters.published !== undefined) {
      query.andWhere('post.published = :published', { published: filters.published });
    }

    if (filters.authorId) {
      query.andWhere('author.id = :authorId', { authorId: filters.authorId });
    }

    if (filters.search) {
      query.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return await query
      .orderBy('post.createdAt', 'DESC')
      .limit(filters.limit || 10)
      .offset((filters.page - 1) * (filters.limit || 10))
      .getMany();
  }

  // Use transactions for complex operations
  async createPostWithTags(
    postData: CreatePostData,
    tagIds: string[]
  ): Promise<Post> {
    return await this.postRepo.manager.transaction(async manager => {
      // Create post
      const post = manager.create(Post, postData);
      await manager.save(post);

      // Add tags
      const tags = await manager.findByIds(Tag, tagIds);
      post.tags = tags;
      await manager.save(post);

      return post;
    });
  }
}
```

## Authentication & Authorization

### Custom Middleware

```typescript
// apps/backend/src/trpc/middlewares/ownership.middleware.ts
import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TRPCMiddleware, MiddlewareOptions, MiddlewareResponse } from 'nestjs-trpc';
import { AuthenticatedContext } from '../context';

@Injectable()
export class OwnershipMiddleware implements TRPCMiddleware {
  constructor(
    private readonly resourceService: any, // Inject relevant service
    private readonly resourceIdField = 'id'
  ) {}

  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    const { ctx, next, input } = opts;
    
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    // Extract resource ID from input
    const resourceId = (input as any)[this.resourceIdField];
    if (!resourceId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Resource ID required',
      });
    }

    // Check ownership
    const resource = await this.resourceService.findById(resourceId);
    if (!resource) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Resource not found',
      });
    }

    if (resource.authorId !== ctx.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Access denied: You can only modify your own resources',
      });
    }

    return next({
      ctx: {
        ...ctx,
        resource, // Add resource to context
      },
    });
  }
}
```

### Role-Based Permissions

```typescript
// apps/backend/src/trpc/middlewares/permissions.middleware.ts
import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TRPCMiddleware, MiddlewareOptions, MiddlewareResponse } from 'nestjs-trpc';
import { AuthenticatedContext } from '../context';
import { UserRole } from '../../modules/user/entities/user.entity';

export class RequirePermissions {
  static create(requiredRoles: UserRole[]) {
    @Injectable()
    class PermissionsMiddleware implements TRPCMiddleware {
      async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
        const { ctx, next } = opts;
        
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          });
        }

        if (!requiredRoles.includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Access denied: Requires one of: ${requiredRoles.join(', ')}`,
          });
        }

        return next({ ctx });
      }
    }
    
    return PermissionsMiddleware;
  }
}

// Usage in router
@UseMiddlewares(
  AuthMiddleware,
  RequirePermissions.create([UserRole.ADMIN, UserRole.SUPER_ADMIN])
)
@Mutation({...})
async adminOnlyFunction() {}
```

## Testing

### Unit Testing Services

```typescript
// apps/backend/src/modules/posts/services/post.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostService } from './post.service';
import { PostRepository } from '../repositories/post.repository';
import { Post } from '../entities/post.entity';

describe('PostService', () => {
  let service: PostService;
  let repository: jest.Mocked<PostRepository>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByAuthor: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PostRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    repository = module.get(PostRepository);
  });

  describe('getPostById', () => {
    it('should return post when found and published', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        published: true,
        author: { id: 'user-1' },
      } as Post;

      repository.findById.mockResolvedValue(mockPost);

      const result = await service.getPostById('1');
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getPostById('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when accessing unpublished post of another user', async () => {
      const mockPost = {
        id: '1',
        published: false,
        author: { id: 'other-user' },
      } as Post;

      repository.findById.mockResolvedValue(mockPost);

      await expect(service.getPostById('1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
```

### Integration Testing tRPC

```typescript
// apps/backend/src/trpc/routers/post.router.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PostRouter } from './post.router';
import { PostService } from '../../modules/posts/services/post.service';

describe('PostRouter (Integration)', () => {
  let app: INestApplication;
  let postService: jest.Mocked<PostService>;

  beforeEach(async () => {
    const mockPostService = {
      createPost: jest.fn(),
      getPostById: jest.fn(),
      getUserPosts: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        PostRouter,
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    postService = moduleFixture.get(PostService);
    await app.init();
  });

  it('should create post with valid auth', async () => {
    const mockPost = { id: '1', title: 'Test', content: 'Content' };
    postService.createPost.mockResolvedValue(mockPost as any);

    const response = await request(app.getHttpServer())
      .post('/trpc/posts.createPost')
      .set('Authorization', 'Bearer valid-token')
      .send({
        title: 'Test Post',
        content: 'Test content',
        published: false,
      })
      .expect(200);

    expect(response.body.result.data).toMatchObject(mockPost);
  });
});
```

### Frontend Testing

```typescript
// apps/client/src/components/PostForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreatePostForm } from './PostForm';
import { trpc } from '../utils/trpc';

// Mock tRPC
jest.mock('../utils/trpc', () => ({
  trpc: {
    posts: {
      createPost: {
        useMutation: jest.fn(),
      },
    },
  },
}));

describe('CreatePostForm', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('should submit form with correct data', async () => {
    const mockMutate = jest.fn();
    (trpc.posts.createPost.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutate,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CreatePostForm />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'Test Content' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Test Content',
        published: false,
      });
    });
  });
});
```

## Best Practices

### Schema Design

```typescript
// Use discriminated unions for better type safety
const createPostSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('draft'),
    title: z.string(),
    content: z.string(),
  }),
  z.object({
    type: z.literal('published'),
    title: z.string(),
    content: z.string(),
    publishedAt: z.date(),
    tags: z.array(z.string()),
  }),
]);

// Use brand types for IDs
const userIdSchema = z.string().uuid().brand('UserId');
const postIdSchema = z.string().uuid().brand('PostId');

// Create reusable schemas
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

const timestampsSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

### Error Handling

```typescript
// Create custom error classes
export class PostNotFoundError extends Error {
  constructor(id: string) {
    super(`Post with ID ${id} not found`);
    this.name = 'PostNotFoundError';
  }
}

// Handle errors consistently in services
async getPostById(id: string): Promise<Post> {
  const post = await this.repository.findById(id);
  if (!post) {
    throw new PostNotFoundError(id);
  }
  return post;
}

// Map errors in tRPC routers
@Query({...})
async getPost(@Input() input: { id: string }) {
  try {
    return await this.postService.getPostById(input.id);
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: error.message,
      });
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  }
}
```

### Performance Optimization

```typescript
// Use select to fetch only needed fields
async findById(id: string): Promise<Post> {
  return await this.postRepo.findOne({
    where: { id },
    select: ['id', 'title', 'content', 'published', 'createdAt'],
    relations: ['author'],
  });
}

// Implement pagination properly
async findPaginated(options: PaginationOptions): Promise<PaginatedResult<Post>> {
  const [items, total] = await this.postRepo.findAndCount({
    take: options.limit,
    skip: (options.page - 1) * options.limit,
    order: { createdAt: 'DESC' },
  });

  return {
    items,
    total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(total / options.limit),
  };
}

// Use batch loading for N+1 queries
@UseMiddlewares(AuthMiddleware)
@Query({...})
async getUserPosts(@Context() ctx: AuthenticatedContext) {
  // Use DataLoader or batch queries
  return await this.postService.batchLoadUserPosts([ctx.user!.id]);
}
```

### Security

```typescript
// Validate and sanitize input
const createPostSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .refine(title => !title.includes('<script>'), 'Invalid characters'),
  content: z.string()
    .min(1, 'Content is required')
    .transform(content => sanitizeHtml(content)),
});

// Use rate limiting (with a custom middleware)
@UseMiddlewares(AuthMiddleware, RateLimitMiddleware({ maxRequests: 10, windowMs: 60000 }))
@Mutation({...})
async createPost() {}

// Log security events
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
@Mutation({...})
async deleteUser(@Input() input: { id: string }, @Context() ctx: AuthenticatedContext) {
  this.logger.warn(`Admin ${ctx.user!.username} deleted user ${input.id}`);
  return await this.userService.deleteUser(input.id);
}
```

This development guide provides a comprehensive foundation for extending the tRPC architecture. Follow these patterns and practices to maintain consistency and quality as the application grows.



### Permission System Documentation  \n<small>Source: `docs/PERMISSIONS.md`</small>

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



### Statistics Cards Implementation  \n<small>Source: `docs/STATISTICS_CARDS.md`</small>

This document describes the implementation of reusable statistics cards for the admin application.

## Overview

The statistics cards system provides a clean, professional way to display key metrics and statistics across different list pages in the admin application. The implementation includes:

- **StatisticsCard**: A reusable card component for displaying individual statistics
- **StatisticsGrid**: A responsive grid layout for arranging multiple statistics cards
- **Backend API**: Service and router for fetching statistics data
- **Integration**: Example implementation on the users list page

## Components

### StatisticsCard

A reusable card component that displays a single statistic with optional trend information.

**Props:**
- `title`: The statistic title/label
- `value`: The statistic value (number or string)
- `icon`: React icon component
- `isLoading`: Shows skeleton when true
- `className`: Additional CSS classes
- `trend`: Optional trend information with value, direction, and label

**Features:**
- Automatic number formatting with locale-aware separators
- Loading skeleton animation
- Trend indicators with positive/negative styling
- Dark/light theme support
- Hover effects

### StatisticsGrid

A responsive grid layout component for arranging multiple statistics cards.

**Props:**
- `statistics`: Array of StatisticData objects
- `isLoading`: Shows skeleton cards when true
- `className`: Additional CSS classes
- `skeletonCount`: Number of skeleton cards to show when loading

**Features:**
- Responsive grid layout (1-4 columns based on screen size)
- Loading state with configurable skeleton count
- Empty state handling
- Consistent spacing and alignment

## Backend Implementation

### AdminUserStatisticsService

Service class that calculates user statistics from the database.

**Methods:**
- `getUserStatistics()`: Returns formatted statistics with trends
- `calculateRawStatistics()`: Performs database queries for raw data
- `formatStatisticsWithTrends()`: Formats data and calculates trends

**Statistics Calculated:**
- Total users count
- Active users count
- New users this month (with trend vs last month)
- Users with profiles (with completion percentage)

### AdminUserStatisticsRouter

tRPC router that exposes the statistics API endpoint.

**Endpoints:**
- `getUserStatistics`: Query endpoint for fetching user statistics

**Features:**
- Admin authentication required
- Proper error handling
- Response validation with Zod schemas

## Usage Example

### Basic Implementation

```tsx
import { StatisticsGrid, StatisticData } from '@admin/components/common/StatisticsGrid';
import { FiUsers, FiUserCheck } from 'react-icons/fi';

const MyPage = () => {
  const { data, isLoading } = trpc.adminUserStatistics.getUserStatistics.useQuery();
  
  const statistics: StatisticData[] = [
    {
      id: 'total-users',
      title: 'Total Users',
      value: data?.totalUsers.value || 0,
      icon: <FiUsers className="w-5 h-5" />,
      trend: data?.totalUsers.trend,
    },
    // ... more statistics
  ];

  return (
    <div>
      <StatisticsGrid
        statistics={statistics}
        isLoading={isLoading}
        skeletonCount={4}
      />
      {/* Rest of your page content */}
    </div>
  );
};
```

### Individual Card Usage

```tsx
import { StatisticsCard } from '@admin/components/common/StatisticsCard';
import { FiUsers } from 'react-icons/fi';

<StatisticsCard
  title="Total Users"
  value={1234}
  icon={<FiUsers className="w-5 h-5" />}
  trend={{
    value: 15,
    isPositive: true,
    label: 'vs last month'
  }}
/>
```

## Styling and Theming

The components use Tailwind CSS classes and support both light and dark themes:

- **Light theme**: Gray backgrounds with dark text
- **Dark theme**: Dark backgrounds with light text
- **Hover effects**: Subtle shadow transitions
- **Loading states**: Animated pulse skeletons

## Responsive Design

The grid layout adapts to different screen sizes:

- **Mobile (default)**: 1 column
- **Small screens (sm)**: 2 columns
- **Large screens (lg)**: 3 columns
- **Extra large (xl)**: 4 columns

## Adding Statistics to Other Pages

To add statistics to other list pages:

1. **Create API endpoint** (if needed):
   - Add service method for calculating statistics
   - Add tRPC router endpoint
   - Update type definitions in `app-router.ts`

2. **Implement in component**:
   - Import StatisticsGrid and StatisticData
   - Add tRPC query for statistics
   - Map data to StatisticData format
   - Add StatisticsGrid to JSX

3. **Choose appropriate icons**:
   - Use react-icons/fi (Feather Icons) for consistency
   - Size icons with `w-5 h-5` classes

## Testing

The implementation includes comprehensive tests:

- **StatisticsCard.test.tsx**: Tests for individual card component
- **StatisticsGrid.test.tsx**: Tests for grid layout component

Run tests with:
```bash
npm test -- StatisticsCard
npm test -- StatisticsGrid
```

## Performance Considerations

- **Parallel queries**: Database statistics are calculated in parallel
- **Caching**: tRPC queries can be cached for better performance
- **Skeleton loading**: Provides immediate feedback while data loads
- **Responsive images**: Icons are SVG-based for crisp display

## Future Enhancements

Potential improvements for the statistics system:

1. **Real-time updates**: WebSocket integration for live statistics
2. **Time range selection**: Allow users to select different time periods
3. **Export functionality**: Export statistics data to CSV/PDF
4. **Drill-down capability**: Click statistics to view detailed breakdowns
5. **Comparison views**: Compare statistics across different time periods



### SEO API Client - Shared Library  \n<small>Source: `libs/shared/src/README_SEO.md`</small>

This documentation explains how to use the shared SEO API client and hooks that have been implemented in the shared library for use across both admin and client applications.

## Overview

The SEO API client provides a unified interface for managing SEO data across the Quasar workspace. It includes:

- **Type-safe API client interfaces** for both admin and client operations
- **Shared hooks** that work with tRPC clients
- **Automatic document head updates** for SEO metadata
- **Consistent error handling** across applications

## Architecture

```
libs/shared/src/
├── api/
│   └── seo.api.ts          # API client interfaces and types
├── hooks/
│   └── useSeo.ts           # Shared hooks for SEO operations
├── types/
│   └── seo.types.ts        # SEO type definitions
└── index.ts                # Exports all SEO functionality
```

## API Client Interfaces

### Admin API Client (Full CRUD)

```typescript
export interface SeoAdminApiClient {
  getAll: () => Promise<ISEO[]>;
  getById: (id: string) => Promise<ISEO>;
  getByPath: (params: GetSEOByPathParams) => Promise<ISEO>;
  create: (data: CreateSeoInput) => Promise<ISEO>;
  update: (id: string, data: UpdateSeoInput) => Promise<ISEO>;
  delete: (id: string) => Promise<boolean>;
}
```

### Client API Client (Read-only)

```typescript
export interface SeoClientApiClient {
  getByPath: (params: GetSEOByPathParams) => Promise<ISEOResponse>;
}
```

## Shared Hooks

### 1. `createUseSeoHook(trpcClient)`

Creates a hook for reading SEO data (client-side usage).

```typescript
import { createUseSeoHook } from '@shared';
import { trpc } from '../utils/trpc';

const useSeo = createUseSeoHook(trpc);

// Usage in component
const { seo, isLoading, error, updateDocumentHead } = useSeo({
  path: '/current-page',
  defaultTitle: 'Default Title',
  defaultDescription: 'Default Description',
  defaultKeywords: 'default, keywords'
});

// Update the document head with SEO data
useEffect(() => {
  updateDocumentHead();
}, [updateDocumentHead]);
```

### 2. `createUseSeoAdminHook(trpcClient)`

Creates a hook for managing SEO data with full CRUD operations (admin-side usage).

```typescript
import { createUseSeoAdminHook } from '@shared';
import { trpc } from '../utils/trpc';

const useSeoAdmin = createUseSeoAdminHook(trpc);

// Usage in admin component
const { 
  seos, 
  isLoading, 
  error,
  createSeo, 
  updateSeo, 
  deleteSeo 
} = useSeoAdmin();

// Create new SEO entry
const handleCreate = () => {
  createSeo.mutate({
    title: 'New Page Title',
    description: 'Page description',
    keywords: 'keyword1, keyword2',
    path: '/new-page',
    isActive: true
  });
};

// Update existing SEO entry
const handleUpdate = (id: string) => {
  updateSeo.mutate({
    id,
    title: 'Updated Title',
    description: 'Updated description'
  });
};

// Delete SEO entry
const handleDelete = (id: string) => {
  deleteSeo.mutate({ id });
};
```

### 3. `createUseSeoByPathHook(trpcClient)`

Creates a hook for searching SEO data by path (admin context).

```typescript
import { createUseSeoByPathHook } from '@shared';
import { trpc } from '../utils/trpc';

const useSeoByPath = createUseSeoByPathHook(trpc);

// Usage
const { data, isLoading, error } = useSeoByPath('/about', {
  enabled: true
});
```

### 4. `createUseSeoByIdHook(trpcClient)`

Creates a hook for getting SEO data by ID (admin context).

```typescript
import { createUseSeoByIdHook } from '@shared';
import { trpc } from '../utils/trpc';

const useSeoById = createUseSeoByIdHook(trpc);

// Usage
const { data, isLoading, error } = useSeoById(seoId, {
  enabled: Boolean(seoId)
});
```

## Implementation Examples

### Admin App Implementation

```typescript
// apps/admin/src/hooks/useSeo.ts
import { trpc } from '../utils/trpc';
import { 
  createUseSeoHook, 
  createUseSeoAdminHook, 
  createUseSeoByPathHook, 
  createUseSeoByIdHook,
  UseSeoOptions
} from '@shared';

export const useSeo = createUseSeoHook(trpc);
export const useSeoAdmin = createUseSeoAdminHook(trpc);
export const useSeoByPath = createUseSeoByPathHook(trpc);
export const useSeoById = createUseSeoByIdHook(trpc);
```

### Client App Implementation (Next.js)

```typescript
// apps/client/src/hooks/useSeo.ts
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';
import { createUseSeoHook } from '@shared';

const useSharedSeo = createUseSeoHook(trpc);

export function useSeo(options = {}) {
  const router = useRouter();
  
  // Use the shared hook with Next.js router path
  const { seo, isLoading, error } = useSharedSeo({
    path: router.asPath,
    defaultTitle: options.defaultTitle || 'App Title',
    defaultDescription: options.defaultDescription || '',
    defaultKeywords: options.defaultKeywords || '',
    enabled: router.isReady
  });

  // Convert to Next.js SEO format
  const nextSeo = {
    title: seo.title,
    description: seo.description,
    additionalMetaTags: [
      ...(seo.keywords ? [{ name: 'keywords', content: seo.keywords }] : []),
      ...Object.entries(seo.additionalMetaTags).map(([name, content]) => ({
        name,
        content
      }))
    ]
  };

  return { seo: nextSeo, isLoading, error };
}
```

## Types

### Core SEO Types

```typescript
interface ISEO extends BaseEntity {
  title: string;
  description?: string;
  keywords?: string;
  path: string;
  isActive: boolean;
  additionalMetaTags?: Record<string, string>;
}

interface ISEOResponse {
  title: string;
  description?: string;
  keywords?: string;
  additionalMetaTags?: Record<string, string>;
}

interface CreateSeoInput {
  title: string;
  description?: string;
  keywords?: string;
  path: string;
  isActive?: boolean;
  additionalMetaTags?: Record<string, string>;
}

interface UpdateSeoInput {
  title?: string;
  description?: string;
  keywords?: string;
  path?: string;
  isActive?: boolean;
  additionalMetaTags?: Record<string, string>;
}
```

## Features

### ✅ Automatic Document Head Updates

The `useSeo` hook provides an `updateDocumentHead()` function that automatically updates:
- Document title
- Meta description
- Meta keywords
- Additional meta tags

### ✅ Type Safety

All hooks and API clients are fully typed with TypeScript for better developer experience and compile-time error checking.

### ✅ Error Handling

Consistent error handling across all operations with proper error types and messages.

### ✅ Loading States

All hooks provide loading states for better UX during API calls.

### ✅ Caching & Refetching

Built-in caching and refetching strategies optimized for SEO data patterns.

## Usage Best Practices

1. **Use appropriate hooks for your context**:
   - `useSeo` for reading SEO data (client-side)
   - `useSeoAdmin` for managing SEO data (admin-side)

2. **Handle loading states**:
   ```typescript
   if (isLoading) return <div>Loading SEO data...</div>;
   ```

3. **Update document head for SEO**:
   ```typescript
   useEffect(() => {
     updateDocumentHead();
   }, [updateDocumentHead]);
   ```

4. **Handle errors gracefully**:
   ```typescript
   if (error) {
     console.error('SEO error:', error);
     return <div>Error loading SEO data</div>;
   }
   ```

5. **Use path-based SEO loading**:
   ```typescript
   const { seo } = useSeo({
     path: router.asPath, // Next.js
     // or
     path: location.pathname, // React Router
     defaultTitle: 'Fallback Title'
   });
   ```

## Migration Guide

If you're migrating from existing SEO implementations:

1. **Update imports**:
   ```typescript
   // Before
   import { useSeo } from '../hooks/useSeo';
   
   // After
   import { useSeo } from '@shared';
   ```

2. **Update hook creation**:
   ```typescript
   // Before
   export function useSeo(options) { ... }
   
   // After
   export const useSeo = createUseSeoHook(trpc);
   ```

3. **Update component usage**:
   ```typescript
   // The hook API remains the same
   const { seo, isLoading, error, updateDocumentHead } = useSeo({
     path: '/current-page',
     defaultTitle: 'Default Title'
   });
   ```

This shared SEO implementation provides a consistent, type-safe, and maintainable way to manage SEO across all applications in the Quasar workspace.



### Quasar Design System  \n<small>Source: `libs/shared/src/styles/README.md`</small>

A comprehensive design system for the Quasar application with consistent colors, typography, spacing, and components.

## Overview

The Quasar Design System provides:

- **Design Tokens**: CSS custom properties and TypeScript constants for colors, typography, spacing, shadows, and borders
- **CSS Reset**: Modern CSS reset with accessibility considerations
- **Base Styles**: Typography, layout, and form styles
- **Responsive System**: Mobile-first responsive utilities
- **Tailwind Integration**: Pre-configured Tailwind CSS theme
- **Animation Utilities**: Smooth transitions and animations

## Installation

The design system is automatically available when you import from the shared library:

```typescript
import { colorTokens, typography, spacing } from '@quasar/shared';
```

The CSS is automatically imported in both admin and client applications via the global stylesheets.

## Color System

### Color Palette

Our color system uses semantic color tokens for consistent theming:

- **Primary**: `#3b82f6` (Blue) - Primary brand color
- **Secondary**: `#0ea5e9` (Sky) - Secondary actions and accents
- **Success**: `#22c55e` (Green) - Success states and positive actions
- **Warning**: `#f59e0b` (Orange) - Warning states and caution
- **Error**: `#ef4444` (Red) - Error states and destructive actions
- **Info**: `#0ea5e9` (Blue) - Informational content
- **Neutral**: Grayscale palette for text and backgrounds

### Usage

#### CSS Custom Properties
```css
.my-element {
  background-color: var(--color-primary-500);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
}
```

#### Tailwind CSS Classes
```html
<div class="bg-primary-500 text-white border border-neutral-200">
  Primary button
</div>
```

#### TypeScript
```typescript
import { colorTokens } from '@quasar/shared';

const primaryColor = colorTokens.primary[500]; // '#3b82f6'
const textColor = colorTokens.semantic.text.primary;
```

## Typography

### Font Families

- **Sans**: Inter (default), system fonts fallback
- **Mono**: JetBrains Mono, Monaco, Consolas fallback
- **Serif**: Georgia, serif fallback

### Typography Scale

Our type scale provides consistent sizing and spacing:

- **Headings**: h1 (48px) to h6 (18px)
- **Body**: Base (16px), Large (18px), Small (14px)
- **Captions**: XS (12px)

### Usage

#### CSS Classes
```html
<h1>Main Heading</h1>
<p class="text-large">Large body text</p>
<span class="text-small text-secondary">Secondary text</span>
```

#### Custom Elements
```css
.custom-heading {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
}
```

## Spacing System

### Spacing Scale

Our spacing system uses a 4px base unit with logical scaling:

- **Component**: 4px, 8px, 16px, 24px, 32px
- **Layout**: 16px, 24px, 32px, 48px, 64px, 96px
- **Section**: 32px, 48px, 64px, 96px, 128px

### Usage

#### CSS Custom Properties
```css
.container {
  padding: var(--spacing-layout-md);
  margin-bottom: var(--spacing-section-sm);
}
```

#### Tailwind CSS
```html
<div class="p-4 mb-8 gap-6">
  Content with consistent spacing
</div>
```

## Components

### Buttons

```html
<!-- Primary Button -->
<button class="btn">Primary Action</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Secondary Action</button>

<!-- Outline Button -->
<button class="btn btn-outline">Outline Button</button>

<!-- Danger Button -->
<button class="btn btn-danger">Delete</button>

<!-- Button Sizes -->
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>
```

### Form Elements

```html
<form class="form">
  <div class="form-group">
    <label for="email" class="label-required">Email</label>
    <input type="email" id="email" placeholder="Enter your email">
    <div class="form-help">We'll never share your email</div>
  </div>
  
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" placeholder="Your message"></textarea>
  </div>
  
  <button type="submit" class="btn">Submit</button>
</form>
```

### Layout

```html
<!-- Container -->
<div class="container">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-lg shadow-md p-6">Card content</div>
  </div>
</div>

<!-- Flexbox -->
<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
  <div class="flex-1">Content</div>
  <div class="flex-none">Sidebar</div>
</div>
```

## Responsive Design

### Breakpoints

- **xs**: 0px (mobile first)
- **sm**: 640px (large mobile)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)
- **2xl**: 1536px (extra large)

### Responsive Utilities

```html
<!-- Show/Hide at breakpoints -->
<div class="show-md-up">Visible on tablet and up</div>
<div class="hide-lg-up">Hidden on desktop and up</div>

<!-- Responsive layouts -->
<div class="flex-col md:flex-row">
  <div class="w-full md:w-1/2">Content</div>
</div>
```

## Animations

### Transitions

```html
<div class="transition-all duration-300 hover:scale-105">
  Hover to scale
</div>
```

### Keyframe Animations

```html
<div class="animate-fade-in">Fades in</div>
<div class="animate-slide-in-up">Slides in from bottom</div>
<div class="animate-zoom-in">Zooms in</div>
```

## CSS Custom Properties Reference

### Colors
- `--color-primary-[50-950]`: Primary brand colors
- `--color-text-primary`: Primary text color
- `--color-background-primary`: Primary background color
- `--color-border-default`: Default border color

### Typography
- `--font-family-sans`: Default sans-serif font stack
- `--font-size-base`: Base font size (16px)
- `--font-weight-medium`: Medium font weight (500)
- `--line-height-normal`: Normal line height (1.5)

### Spacing
- `--spacing-[0-96]`: Spacing scale from 0 to 384px
- `--spacing-component-md`: Medium component spacing
- `--spacing-layout-lg`: Large layout spacing

### Shadows
- `--shadow-sm`: Small shadow for subtle elevation
- `--shadow-md`: Medium shadow for cards
- `--shadow-lg`: Large shadow for modals

## Dark Mode

The design system is prepared for dark mode implementation. To enable dark mode:

1. Add dark mode variants to CSS custom properties
2. Use Tailwind's dark mode classes
3. Update the theme configuration

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background-primary: #1f2937;
    --color-text-primary: #f9fafb;
  }
}
```

## Best Practices

1. **Use semantic tokens**: Prefer `--color-text-primary` over specific color values
2. **Follow spacing scale**: Use predefined spacing values for consistency
3. **Mobile-first responsive**: Design for mobile, enhance for larger screens
4. **Accessibility**: Ensure adequate color contrast and focus states
5. **Performance**: Use CSS custom properties for runtime theming
6. **Consistency**: Stick to the design system for UI consistency

## Contributing

When adding new design tokens:

1. Add TypeScript definitions in `/tokens/`
2. Add CSS custom properties in `/css/tokens/`
3. Update Tailwind config if needed
4. Document usage examples
5. Test across all applications

## Migration Guide

### From Custom Styles

Replace custom styles with design system equivalents:

```css
/* Before */
.my-button {
  background: #3b82f6;
  padding: 12px 24px;
  border-radius: 8px;
}

/* After */
.my-button {
  background: var(--color-primary-500);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--border-radius-lg);
}
```

### From Inline Styles

Use utility classes instead of inline styles:

```html
<!-- Before -->
<div style="background: #f3f4f6; padding: 16px;">

<!-- After -->
<div class="bg-neutral-100 p-4">
```



### ui  \n<small>Source: `libs/ui/README.md`</small>

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test ui` to execute the unit tests via [Jest](https://jestjs.io).



### Range Slider Component Research Report  \n<small>Source: `range-slider-research.md`</small>

## Current Project Setup

### Installed Libraries
- **HeroUI/NextUI**: Already installed (`@heroui/react@2.8.4`, `@heroui/slider@2.4.23`)
- **Radix UI**: Several components installed (avatar, checkbox, dialog, dropdown-menu, label, navigation-menu, slot, switch, toast)
- **Tailwind CSS**: v3.3.5 with dark mode support
- **React**: v19.0.0
- **TypeScript**: v5.8.3

### Project Structure
- Monorepo with NX build system
- Multiple apps: frontend, admin, backend
- Shared UI library at `/libs/ui/src/`
- Tailwind configured with HeroUI theme integration

## Range Slider Component Options

### 1. HeroUI/NextUI Slider (RECOMMENDED)

**Status**: ✅ Already installed and ready to use

**Pros:**
- Full TypeScript support
- Dual-thumb range slider capability
- Built-in dark mode support
- Tailwind CSS integration
- Comprehensive customization options
- Accessible (built on React Aria)
- Active development and maintenance

**Cons:**
- Larger bundle size than minimal libraries

**Key Features:**
- Min/max value configuration
- Step control
- Range slider (dual-thumb) support
- Custom thumb rendering
- Tooltip support
- Marks and steps visualization
- Custom styling with Tailwind classes
- Vertical orientation support
- Value formatting
- Change event handling

**Implementation Example:**

```tsx
import { Slider } from '@heroui/slider';

function RangeSlider() {
  const [value, setValue] = useState<[number, number]>([25, 75]);

  return (
    <Slider
      label="Price Range"
      value={value}
      onChange={(value) => setValue(value as [number, number])}
      minValue={0}
      maxValue={1000}
      step={10}
      formatOptions={{ style: 'currency', currency: 'USD' }}
      showTooltip={true}
      showSteps={true}
      classNames={{
        track: 'bg-gray-300',
        thumb: 'bg-blue-500',
      }}
    />
  );
}
```

### 2. Radix UI React Slider

**Status**: ⚠️ Not installed, but other Radix UI components are present

**Pros:**
- Unstyled components (maximum flexibility)
- Excellent accessibility
- Small bundle size
- Great for custom styling with Tailwind
- Active maintenance

**Cons:**
- Requires more styling work
- Not installed in current project

**Installation:**
```bash
npm install @radix-ui/react-slider
```

**Implementation Example:**
```tsx
import * as Slider from '@radix-ui/react-slider';

function RangeSlider() {
  const [value, setValue] = useState<[number, number]>([25, 75]);

  return (
    <Slider.Root
      className="relative flex items-center select-none touch-none w-full h-5"
      value={value}
      onValueChange={setValue}
      min={0}
      max={100}
      step={1}
    >
      <Slider.Track className="relative grow rounded-full h-[3px] bg-gray-200">
        <Slider.Range className="absolute h-full rounded-full bg-blue-500" />
      </Slider.Track>
      <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50" />
      <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50" />
    </Slider.Root>
  );
}
```

### 3. react-range

**Status**: ⚠️ Not installed

**Pros:**
- Lightweight and focused
- Good performance
- Easy to use
- Dual-thumb support

**Cons:**
- Not installed
- Less feature-rich than HeroUI

**Installation:**
```bash
npm install react-range
```

### 4. rc-slider

**Status**: ⚠️ Not installed

**Pros:**
- Mature and stable
- Feature-rich
- Good performance

**Cons:**
- Not installed
- May require additional styling work

## Recommended Approach

### Primary Recommendation: HeroUI Slider

Given that HeroUI is already installed and configured in your project, this is the best choice:

1. **No additional dependencies** needed
2. **Consistent** with existing UI library usage
3. **Full TypeScript support** out of the box
4. **Dark mode support** already configured
5. **Tailwind integration** ready

### Implementation Steps

1. **Basic Range Slider:**
```tsx
// /apps/frontend/src/components/ui/RangeSlider.tsx
import { Slider } from '@heroui/slider';
import { useState } from 'react';

interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  label?: string;
  formatOptions?: Intl.NumberFormatOptions;
}

export function RangeSlider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  label,
  formatOptions
}: RangeSliderProps) {
  const [internalValue, setInternalValue] = useState<[number, number]>(value || [min, max]);

  const handleChange = (newValue: number | number[]) => {
    const rangeValue = newValue as [number, number];
    setInternalValue(rangeValue);
    onChange?.(rangeValue);
  };

  return (
    <Slider
      label={label}
      value={value || internalValue}
      onChange={handleChange}
      minValue={min}
      maxValue={max}
      step={step}
      formatOptions={formatOptions}
      showTooltip={true}
      classNames={{
        track: 'bg-gray-200 dark:bg-gray-700',
        thumb: 'bg-white dark:bg-gray-200 border-2 border-blue-500',
      }}
    />
  );
}
```

2. **Advanced Range Slider with Marks:**
```tsx
// /apps/frontend/src/components/ui/AdvancedRangeSlider.tsx
import { Slider } from '@heroui/slider';
import { useState } from 'react';

interface AdvancedRangeSliderProps {
  marks?: { value: number; label: string }[];
  showSteps?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function AdvancedRangeSlider({
  marks,
  showSteps = true,
  disabled = false,
  orientation = 'horizontal'
}: AdvancedRangeSliderProps) {
  const [value, setValue] = useState<[number, number]>([25, 75]);

  return (
    <Slider
      value={value}
      onChange={setValue}
      minValue={0}
      maxValue={100}
      step={5}
      marks={marks}
      showSteps={showSteps}
      isDisabled={disabled}
      orientation={orientation}
      showTooltip={true}
      getTooltipValue={(value) => `$${value}`}
      classNames={{
        track: 'bg-gray-200 dark:bg-gray-700',
        thumb: 'bg-blue-500 hover:bg-blue-600',
        value: 'text-sm font-medium',
      }}
    />
  );
}
```

3. **Custom Styled Range Slider:**
```tsx
// /apps/frontend/src/components/ui/CustomRangeSlider.tsx
import { Slider } from '@heroui/slider';
import { useState } from 'react';

export function CustomRangeSlider() {
  const [value, setValue] = useState<[number, number]>([20, 80]);

  return (
    <div className="w-full max-w-md">
      <Slider
        label="Custom Range Slider"
        value={value}
        onChange={setValue}
        minValue={0}
        maxValue={100}
        step={1}
        showTooltip={true}
        renderThumb={({ index, ...props }) => (
          <div
            {...props}
            className="group w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {value[index]}
            </div>
          </div>
        )}
        classNames={{
          track: 'bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 h-2',
          filler: 'bg-gradient-to-r from-blue-500 to-purple-500',
        }}
      />
    </div>
  );
}
```

## Dark Mode Support

HeroUI slider automatically supports dark mode through your existing Tailwind configuration:

```tsx
// Dark mode is already configured in tailwind.config.js
darkMode: "class",
```

The slider will automatically adapt to dark mode when the `dark` class is applied to parent elements.

## Performance Considerations

- **HeroUI Slider**: Uses React Aria for optimal accessibility and performance
- **Tree-shaking**: Individual component import reduces bundle size
- **Lazy loading**: Can be lazy-loaded if needed for code splitting

## Conclusion

**HeroUI Slider is the recommended choice** for your project because:

1. ✅ **Already installed** and configured
2. ✅ **Seamless integration** with existing HeroUI components
3. ✅ **Full TypeScript support** with proper type definitions
4. ✅ **Dark mode support** out of the box
5. ✅ **Tailwind CSS integration** ready
6. ✅ **Dual-thumb range slider** capability
7. ✅ **Comprehensive customization** options
8. ✅ **Excellent accessibility** features

The implementation examples above provide a solid foundation for creating range sliders that meet all your requirements: min/max values, step control, dark mode support, Tailwind styling, and TypeScript compatibility.

## 🚀 Deploying on DigitalOcean App Platform

The repository already ships with a production-ready `Dockerfile` and `/deploy/start.sh` entrypoint. DigitalOcean App Platform can build and run the image without extra commands.

### 1. Prepare the repository

1. Commit all changes and push to the branch you want to deploy.
2. Ensure the root `.env` file is **not** committed (it is ignored) and that `.env.example` reflects the variables you plan to supply.

### 2. Create the App Platform service

1. In the DigitalOcean control panel choose **Apps → Create App**.
2. Select this GitHub repo and branch, then pick the root `Dockerfile` as the source.
3. Leave the build and run commands empty (App Platform uses the Dockerfile `CMD /start.sh`).
4. Expose HTTP on port 80. App Platform injects its own `PORT` environment variable; the startup script respects it.

### 3. Configure environment variables / secrets

Add the following variables under **Settings → Environment Variables**. Mark sensitive values (passwords, tokens, keys) as **Encrypt at rest**.

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | External HTTP port. Usually `${PORT}` provided by App Platform. | `${PORT}` |
| `BACKEND_PORT` | Internal NestJS listener used by nginx (`/api`). | `3000` |
| `ADMIN_PORT` | Internal admin static server (`/admin`). | `4000` |
| `FRONTEND_PORT` | Internal Next.js server behind nginx (`/`). | `3000` |
| `REACT_APP_API_URL` / `NEXT_PUBLIC_API_URL` | Public API base so frontend fetches the right host. | `https://api.example.com/api` |
| `NEXT_PUBLIC_SITE_URL` | Canonical storefront URL for SEO + metadata. | `https://shop.example.com` |
| `NEXT_PUBLIC_SITE_NAME` | Text label used in SEO + social tags. | `Quasar` |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` / `DB_SCHEMA` | Managed PostgreSQL connection. | `db-postgresql-nyc3-12345-do-user-1.db.ondigitalocean.com`, `25060`, `quasar_prod`, `public` |
| `DB_USERNAME` / `DB_PASSWORD` | Database credentials. | `doadmin`, `••••` |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Secrets for access/refresh tokens. | long random strings |
| `AWS_*` (if S3 uploads) | AWS credentials + bucket settings. | See `.env.example` |
| `SMTP_*` / `EMAIL_FROM` | Outgoing email service (optional). |  |
| `REDIS_*` | Cache/session backend (optional). |  |
| `SKIP_RUNTIME_BUILD`, `SKIP_RUNTIME_SERVERS` | Leave at `0` unless you only need build artifacts. | `0` |

Copy any additional variables you rely on (maintenance tokens, analytics IDs, etc.) from `.env.example`. Avoid storing secrets in Git—App Platform’s dashboard keeps them encrypted.

### 4. Deploy

After the first deployment succeeds, App Platform will rebuild automatically when you push to the tracked branch. The startup script will:

1. Install dependencies and rebuild backend/admin/frontend artifacts.
2. Spin up backend/admin/frontends plus nginx on the provided `PORT`.
3. Stream logs via the App Platform UI (backend, frontend, and nginx logs show up under Components → Logs).

If you ever need to update environment variables, change them in App Platform, hit **Save**, and trigger a redeploy. No code changes are required.
