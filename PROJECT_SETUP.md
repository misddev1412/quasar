# Quasar NX Monorepo Setup

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

### Environment Variables
Create `.env` files in `apps/backend/` with:
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=quasar_db
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

## 🔄 Next Steps

1. Set up your PostgreSQL database
2. Copy `.env.template` to `.env` and configure your database credentials
3. Run migrations: `yarn migration:run`
4. Start developing your applications!

## 📚 Additional Resources

- [NX Documentation](https://nx.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [ShadCN UI Documentation](https://ui.shadcn.com) 