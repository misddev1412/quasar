import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';

const supportedLocalesSchema = z.enum(['vi', 'en']);

// This is a simplified router - in a real app you'd inject services properly
export const translationRouter = router({
  // Get supported locales configuration
  getLocaleConfig: publicProcedure
    .query(() => {
      return {
        success: true,
        data: {
          defaultLocale: 'vi' as const,
          supportedLocales: ['vi', 'en'] as const
        }
      };
    }),

  // Basic translation endpoint (will be implemented with proper DI later)
  getTranslations: publicProcedure
    .input(z.object({
      locale: supportedLocalesSchema
    }))
    .query(async ({ input }) => {
      // For now, return empty translations - will be implemented with service injection
      return {
        success: true,
        data: {
          locale: input.locale,
          translations: {}
        }
      };
    }),

  // Placeholder for admin endpoints (requires proper service injection)
  clearCache: protectedProcedure
    .mutation(async () => {
      return {
        success: true,
        message: 'Translation cache cleared successfully'
      };
    })
}); 