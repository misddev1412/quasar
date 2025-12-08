import { initTRPC, TRPCError } from '@trpc/server';
import { Injectable } from '@nestjs/common';
import { AuthenticatedContext } from './context';

@Injectable()
export class TrpcService {
  trpc = initTRPC.context<AuthenticatedContext>().create();

  procedure = this.trpc.procedure;
  router = this.trpc.router;
  middleware = this.trpc.middleware;

  publicProcedure = this.trpc.procedure;
  
  protectedProcedure = this.trpc.procedure.use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });
}