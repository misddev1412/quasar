import { INestApplication, Injectable } from '@nestjs/common';
import * as trpcExpress from '@trpc/server/adapters/express';
import { router } from './trpc';
import { adminUserRouter } from './routers/admin-user.router';
import { clientUserRouter } from './routers/client-user.router';
import { adminPermissionRouter } from './routers/admin-permission.router';
import { translationRouter } from './routers/translation.router';

@Injectable()
export class TrpcRouter {
  // Merge all routers
  appRouter = router({
    adminUser: adminUserRouter,
    clientUser: clientUserRouter,
    adminPermission: adminPermissionRouter,
    translation: translationRouter
  });

  // Apply middleware to expose the tRPC API
  async applyMiddleware(app: INestApplication) {
    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        router: this.appRouter,
        createContext: ({ req, res }) => ({ req, res })
      })
    );
  }
}

export type AppRouter = TrpcRouter['appRouter']; 