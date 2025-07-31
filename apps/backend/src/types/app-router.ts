import { router, procedure } from '../trpc/trpc';
import { z } from 'zod';
import { apiResponseSchema, paginatedResponseSchema } from '../trpc/schemas/response.schemas';

// Zod schemas for validation
const userRoleSchema = z.enum([
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'USER',
  'GUEST'
]);

const userProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const adminUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  isActive: z.boolean(),
  role: userRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  profile: userProfileSchema.optional(),
});

const getUsersResponseSchema = apiResponseSchema.extend({
  data: z.object({
    users: z.array(adminUserResponseSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
});


// This creates the combined app router
export const appRouter = router({
  // Directly defined procedure
  hello: procedure.query(() => {
    return { message: 'Hello API' };
  }),
  
  // Define type information for client-side usage
  // The actual implementation is handled by NestJS-tRPC at runtime
  translation: router({
    getTranslations: procedure
      .input(z.object({ locale: z.enum(['en', 'vi']) }))
      .query(() => {
        // This is just for type definition
        // The actual implementation is handled by NestJS-tRPC
        return {} as any;
      }),
      
    getTranslation: procedure
      .input(z.object({
        key: z.string(),
        locale: z.enum(['en', 'vi']),
        defaultValue: z.string().optional(),
      }))
      .query(() => {
        return {} as any;
      }),
      
    createTranslation: procedure
      .input(z.object({
        key: z.string(),
        locale: z.enum(['en', 'vi']),
        value: z.string(),
        namespace: z.string().optional(),
      }))
      .mutation(() => {
        return {} as any;
      }),
      
    updateTranslation: procedure
      .input(z.object({
        key: z.string(),
        locale: z.enum(['en', 'vi']),
        value: z.string(),
        namespace: z.string().optional(),
      }))
      .mutation(() => {
        return {} as any;
      }),
      
    deleteTranslation: procedure
      .input(z.object({
        key: z.string(),
        locale: z.enum(['en', 'vi']),
      }))
      .mutation(() => {
        return {} as any;
      }),
      
    getLocaleConfig: procedure
      .query(() => {
        return {} as any;
      }),
      
    clearCache: procedure
      .mutation(() => {
        return {} as any;
      }),
  }),
  
  // SEO router for client
  seo: router({
    getByPath: procedure
      .input(z.object({ path: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),
  }),
  
  // Admin routers
  admin: router({
    // Admin SEO router
    seo: router({
      getAll: procedure
        .output(apiResponseSchema)
        .query(() => {
          return {} as any;
        }),
      
      getById: procedure
        .input(z.object({ id: z.string() }))
        .output(apiResponseSchema)
        .query(() => {
          return {} as any;
        }),
      
      getByPath: procedure
        .input(z.object({ path: z.string() }))
        .output(apiResponseSchema)
        .query(() => {
          return {} as any;
        }),
      
      create: procedure
        .input(z.object({
          title: z.string(),
          description: z.string().optional(),
          keywords: z.string().optional(),
          path: z.string(),
          active: z.boolean().optional(),
          additionalMetaTags: z.record(z.string()).optional(),
        }))
        .output(apiResponseSchema)
        .mutation(() => {
          return {} as any;
        }),
      
      update: procedure
        .input(z.object({
          id: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          keywords: z.string().optional(),
          path: z.string().optional(),
          active: z.boolean().optional(),
          additionalMetaTags: z.record(z.string()).optional(),
        }))
        .output(apiResponseSchema)
        .mutation(() => {
          return {} as any;
        }),
      
      delete: procedure
        .input(z.object({ id: z.string() }))
        .output(apiResponseSchema)
        .mutation(() => {
          return {} as any;
        }),
    }),
  }),
  
  adminUser: router({
    getAllUsers: procedure
      .input(z.object({
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(10),
        search: z.string().optional(),
        role: userRoleSchema.optional(),
        isActive: z.boolean().optional(),
      }))
      .output(getUsersResponseSchema)
      .query(() => {
        return {} as any;
      }),
    getProfile: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),
    updateProfile: procedure
      .input(z.any()) // Using z.any() for simplicity on the client-side type definition
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
    updatePassword: procedure
      .input(z.any()) // Using z.any() for simplicity on the client-side type definition
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
  }),

  // Add adminSeo router to match the actual server implementation
  adminSeo: router({
    getAll: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getById: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getByPath: procedure
      .input(z.object({ path: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    create: procedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        keywords: z.string().optional(),
        path: z.string(),
        active: z.boolean().optional(),
        additionalMetaTags: z.record(z.string()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    update: procedure
      .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.string().optional(),
        path: z.string().optional(),
        active: z.boolean().optional(),
        additionalMetaTags: z.record(z.string()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
    
    delete: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
  }),

  // Admin User Statistics router - Updated
  adminUserStatistics: router({
    getUserStatistics: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),
  }),

  // Admin Chart Data router
  adminChartData: router({
    getChartData: procedure
      .input(z.object({
        statisticId: z.string(),
        chartType: z.enum(['line', 'bar', 'pie', 'area']),
        period: z.enum(['7d', '30d', '90d', '1y', 'custom']),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getAvailableChartTypes: procedure
      .input(z.object({
        statisticId: z.string(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),
  }),

  // Admin Settings router
  adminSettings: router({
    getAll: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),
    
    getById: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),
    
    getByKey: procedure
      .input(z.object({ key: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),
    
    getByGroup: procedure
      .input(z.object({ group: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),
    
    create: procedure
      .input(z.object({
        key: z.string(),
        value: z.string().optional(),
        type: z.enum(['string', 'number', 'boolean', 'json', 'array']).default('string'),
        group: z.string().optional(),
        isPublic: z.boolean().default(false),
        description: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
    
    update: procedure
      .input(z.object({
        id: z.string(),
        value: z.string().optional(),
        type: z.enum(['string', 'number', 'boolean', 'json', 'array']).optional(),
        group: z.string().optional(),
        isPublic: z.boolean().optional(),
        description: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
    
    bulkUpdate: procedure
      .input(z.object({
        settings: z.array(z.object({
          key: z.string(),
          value: z.string().optional(),
        }))
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
    
    delete: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
  }),

  // Admin Auth router
  adminAuth: router({
    login: procedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6)
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    refresh: procedure
      .input(z.object({
        refreshToken: z.string()
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    me: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),
  }),
});

// For nestjs-trpc, the actual router structure is generated at runtime
// Use a permissive type that allows access to all router endpoints
export type AppRouter = typeof appRouter;