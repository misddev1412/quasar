import { router } from '../trpc/trpc';
import { AdminUserRouter } from '../trpc/routers/admin-user.router';
import { ClientUserRouter } from '../trpc/routers/client-user.router';

// This creates the combined app router type
// In a real nestjs-trpc setup, this would be auto-generated
export const appRouter = router({
  admin: {} as any, // AdminUserRouter procedures will be here
  client: {} as any, // ClientUserRouter procedures will be here
});

// Export the router type for frontend consumption
export type AppRouter = typeof appRouter; 