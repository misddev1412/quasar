import { router } from '../trpc/trpc';
import { AdminUserRouter } from '../trpc/routers/admin-user.router';
import { ClientUserRouter } from '../trpc/routers/client-user.router';
import { AdminPermissionRouter } from '../trpc/routers/admin-permission.router';
import { translationRouter } from '../trpc/routers/translation.router';

// This creates the combined app router
export const appRouter = router({
  // Note: These are class-based routers, not function-based
  // They will be registered through nestjs-trpc module setup
  translation: translationRouter,
});

export type AppRouter = typeof appRouter; 