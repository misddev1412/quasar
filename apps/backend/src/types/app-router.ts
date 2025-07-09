import { router } from '../trpc/trpc';
import { AdminUserRouter, AdminPermissionRouter } from '../trpc/routers/admin';
import { ClientUserRouter } from '../trpc/routers/client';
import { TranslationRouter } from '../trpc/routers/translation.router';

// This creates the combined app router
export const appRouter = router({
  // Note: These are class-based routers registered through nestjs-trpc module setup
  // The actual router generation is handled by the NestJS-tRPC module
});

// For nestjs-trpc, the actual router structure is generated at runtime
// Use a permissive type that allows access to all router endpoints
export type AppRouter = Record<string, any>; 