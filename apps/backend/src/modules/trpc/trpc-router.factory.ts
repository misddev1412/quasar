import { router as baseRouter, adminProcedure } from '@backend/trpc/trpc';

export const createTRPCRouter = baseRouter;
export const adminOnlyProcedure = adminProcedure;
