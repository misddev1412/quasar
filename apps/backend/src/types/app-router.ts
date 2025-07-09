import { router } from '../trpc/trpc';
import { AdminUserRouter } from '../trpc/routers/admin-user.router';
import { ClientUserRouter } from '../trpc/routers/client-user.router';
import { AdminPermissionRouter } from '../trpc/routers/admin-permission.router';
import { TranslationRouter } from '../trpc/routers/translation.router';

// This creates the combined app router
export const appRouter = router({
  // Note: These are class-based routers registered through nestjs-trpc module setup
  // The actual router generation is handled by the NestJS-tRPC module
});

export type AppRouter = typeof appRouter; 