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
    createUser: procedure
      .input(z.object({
        email: z.string().email(),
        username: z.string().min(3),
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        password: z.string().min(8),
        phoneNumber: z.string().optional(),
        isActive: z.boolean().optional(),
        role: userRoleSchema.optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    getAllUsers: procedure
      .input(z.object({
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(10),
        search: z.string().optional(),
        role: userRoleSchema.optional(),
        isActive: z.boolean().optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getUserById: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    updateUser: procedure
      .input(z.object({
        id: z.string(),
        email: z.string().email().optional(),
        username: z.string().optional(),
        isActive: z.boolean().optional(),
        role: userRoleSchema.optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    deleteUser: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    updateUserStatus: procedure
      .input(z.object({
        id: z.string(),
        isActive: z.boolean(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
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
    updateUserProfileById: procedure
      .input(z.object({ id: z.string() }).and(z.any())) // client-side typing convenience
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
  }),

  // Add adminMailTemplate router to match the actual server implementation
  adminMailTemplate: router({
    createTemplate: procedure
      .input(z.object({
        name: z.string(),
        subject: z.string(),
        body: z.string(),
        type: z.string(),
        isActive: z.boolean().optional(),
        description: z.string().optional(),
        variables: z.array(z.string()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    getTemplates: procedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        search: z.string().optional(),
        type: z.string().optional(),
        isActive: z.boolean().optional(),
        sortBy: z.enum(['name', 'type', 'createdAt', 'updatedAt']).default('createdAt'),
        sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getTemplateById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getTemplateByName: procedure
      .input(z.object({ name: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    updateTemplate: procedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        subject: z.string().optional(),
        body: z.string().optional(),
        type: z.string().optional(),
        isActive: z.boolean().optional(),
        description: z.string().optional(),
        variables: z.array(z.string()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    deleteTemplate: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    processTemplate: procedure
      .input(z.object({
        templateId: z.string().uuid(),
        variables: z.record(z.any()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    cloneTemplate: procedure
      .input(z.object({
        templateId: z.string().uuid(),
        newName: z.string(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    getTemplateTypes: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getStatistics: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    bulkUpdateStatus: procedure
      .input(z.object({
        ids: z.array(z.string().uuid()),
        isActive: z.boolean(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    searchTemplates: procedure
      .input(z.object({ searchTerm: z.string().min(1) }))
      .output(apiResponseSchema)
      .query(() => {
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

    getOverview: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getUserGrowth: procedure
      .input(z.object({
        period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getRoleDistribution: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getActivityStats: procedure
      .input(z.object({
        period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
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

  // Admin User Activity router
  adminUserActivity: router({
    getActivities: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        userId: z.string().optional(),
        action: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getActivityById: procedure
      .input(z.object({ id: z.string() }))
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









  // Admin Role router
  adminRole: router({
    getAllRoles: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getRoleById: procedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    createRole: procedure
      .input(z.object({
        name: z.string().min(2).max(100),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
        permissionIds: z.array(z.string().uuid()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    updateRole: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().min(2).max(100).optional(),
          description: z.string().optional(),
          isActive: z.boolean().optional(),
          isDefault: z.boolean().optional(),
          permissionIds: z.array(z.string().uuid()).optional(),
        }),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    deleteRole: procedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    getAvailablePermissions: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getRoleStatistics: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    toggleRoleStatus: procedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    duplicateRole: procedure
      .input(z.object({
        id: z.string().uuid(),
        newName: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    addPermissionsToRole: procedure
      .input(z.object({
        roleId: z.string().uuid(),
        permissionIds: z.array(z.string().uuid()),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    searchUsersForRole: procedure
      .input(z.object({
        roleId: z.string().uuid(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    addUsersToRole: procedure
      .input(z.object({
        roleId: z.string().uuid(),
        userIds: z.array(z.string().uuid()),
      }))
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

  // Admin Permission router
  adminPermission: router({
    createPermission: procedure
      .input(z.object({
        name: z.string().min(1),
        resource: z.string().min(1),
        action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'APPROVE', 'REJECT', 'PUBLISH', 'ARCHIVE']),
        scope: z.enum(['OWN', 'DEPARTMENT', 'ORGANIZATION', 'ANY']),
        description: z.string().optional(),
        attributes: z.array(z.string()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    getAllPermissions: procedure
      .input(z.object({
        resource: z.string().optional(),
        action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'APPROVE', 'REJECT', 'PUBLISH', 'ARCHIVE']).optional(),
        scope: z.enum(['OWN', 'DEPARTMENT', 'ORGANIZATION', 'ANY']).optional(),
        isActive: z.boolean().optional(),
        search: z.string().optional(),
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(10),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getPermissionById: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    updatePermission: procedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        resource: z.string().optional(),
        action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'APPROVE', 'REJECT', 'PUBLISH', 'ARCHIVE']).optional(),
        scope: z.enum(['OWN', 'DEPARTMENT', 'ORGANIZATION', 'ANY']).optional(),
        description: z.string().optional(),
        attributes: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    deletePermission: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    assignPermissionToRole: procedure
      .input(z.object({
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'GUEST']),
        permissionId: z.string(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    removePermissionFromRole: procedure
      .input(z.object({
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'GUEST']),
        permissionId: z.string(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    getRolePermissions: procedure
      .input(z.object({
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'GUEST'])
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    grantPermissions: procedure
      .input(z.object({
        grants: z.array(z.object({
          role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'GUEST']),
          resource: z.string().min(1),
          action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'APPROVE', 'REJECT', 'PUBLISH', 'ARCHIVE']),
          scope: z.enum(['OWN', 'DEPARTMENT', 'ORGANIZATION', 'ANY']),
          attributes: z.array(z.string()).optional(),
        }))
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    checkPermission: procedure
      .input(z.object({
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'GUEST']),
        resource: z.string(),
        action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'APPROVE', 'REJECT', 'PUBLISH', 'ARCHIVE']),
        scope: z.enum(['OWN', 'DEPARTMENT', 'ORGANIZATION', 'ANY']),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),
  }),

  // Admin Posts router
  adminPosts: router({
    getPosts: procedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        search: z.string().optional(),
        status: z.enum(['draft', 'published', 'archived', 'scheduled']).optional(),
        type: z.enum(['post', 'page', 'news', 'event']).optional(),
        authorId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        tagId: z.string().uuid().optional(),
        locale: z.string().optional(),
        isFeatured: z.boolean().optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getPostById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getPostBySlug: procedure
      .input(z.object({ slug: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    createPost: procedure
      .input(z.object({
        slug: z.string(),
        status: z.enum(['draft', 'published', 'archived', 'scheduled']).default('draft'),
        type: z.enum(['post', 'page', 'news', 'event']).default('post'),
        featuredImage: z.string().optional(),
        authorId: z.string().uuid(),
        publishedAt: z.date().optional(),
        scheduledAt: z.date().optional(),
        isFeatured: z.boolean().default(false),
        allowComments: z.boolean().default(true),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        translations: z.array(z.object({
          locale: z.string(),
          title: z.string(),
          content: z.string(),
          excerpt: z.string().optional(),
          metaTitle: z.string().optional(),
          metaDescription: z.string().optional(),
          metaKeywords: z.string().optional(),
        })),
        categoryIds: z.array(z.string().uuid()).optional(),
        tagIds: z.array(z.string().uuid()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    updatePost: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          slug: z.string().optional(),
          status: z.enum(['draft', 'published', 'archived', 'scheduled']).optional(),
          type: z.enum(['post', 'page', 'news', 'event']).optional(),
          featuredImage: z.string().optional(),
          publishedAt: z.date().optional(),
          scheduledAt: z.date().optional(),
          isFeatured: z.boolean().optional(),
          allowComments: z.boolean().optional(),
          metaTitle: z.string().optional(),
          metaDescription: z.string().optional(),
          metaKeywords: z.string().optional(),
          translations: z.array(z.object({
            locale: z.string(),
            title: z.string(),
            content: z.string(),
            excerpt: z.string().optional(),
            metaTitle: z.string().optional(),
            metaDescription: z.string().optional(),
            metaKeywords: z.string().optional(),
          })).optional(),
          categoryIds: z.array(z.string().uuid()).optional(),
          tagIds: z.array(z.string().uuid()).optional(),
        }),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    deletePost: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    getFeaturedPosts: procedure
      .input(z.object({
        limit: z.number().default(5),
        locale: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    incrementViewCount: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
  }),

  // Admin Post Categories router
  adminPostCategories: router({
    getCategories: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getCategoryById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    createCategory: procedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        parentId: z.string().uuid().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    updateCategory: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          parentId: z.string().uuid().optional(),
          sortOrder: z.number().optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    deleteCategory: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
  }),

  // Admin Post Tags router
  adminPostTags: router({
    getTags: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getTagById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    searchTags: procedure
      .input(z.object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).default(10),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    createTag: procedure
      .input(z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100),
        description: z.string().optional(),
        color: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    updateTag: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().min(1).max(100).optional(),
          slug: z.string().min(1).max(100).optional(),
          description: z.string().optional(),
          color: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    deleteTag: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
  }),

  // Admin Email Channel router
  adminEmailChannel: router({
    createChannel: procedure
      .input(z.object({
        name: z.string().min(2).max(255),
        description: z.string().max(1000).optional(),
        smtpHost: z.string().max(255),
        smtpPort: z.number().int().min(1).max(65535),
        smtpSecure: z.boolean(),
        smtpUsername: z.string().max(255).optional(),
        smtpPassword: z.string().max(255).optional(),
        defaultFromEmail: z.string().email().max(255),
        defaultFromName: z.string().max(255),
        replyToEmail: z.string().email().max(255).optional(),
        isActive: z.boolean().optional().default(true),
        isDefault: z.boolean().optional().default(false),
        rateLimit: z.number().int().min(1).optional(),
        providerName: z.enum(['smtp', 'sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill']).optional().default('smtp'),
        priority: z.number().int().min(1).max(10).optional().default(5),
        usageType: z.enum(['transactional', 'marketing', 'notification', 'general']).optional().default('general'),
        configKeys: z.record(z.any()).optional(),
        advancedConfig: z.record(z.any()).optional(),
        maxDailyLimit: z.number().int().min(1).optional(),
        webhookUrl: z.string().max(500).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    getChannels: procedure
      .input(z.object({
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(10),
        search: z.string().max(255).optional(),
        isActive: z.boolean().optional(),
        providerName: z.string().max(100).optional(),
        usageType: z.string().max(50).optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getChannelById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getActiveChannels: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getChannelsByUsageType: procedure
      .input(z.object({ usageType: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getDefaultChannel: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    updateChannel: procedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(255).optional(),
        description: z.string().max(1000).optional(),
        smtpHost: z.string().max(255).optional(),
        smtpPort: z.number().int().min(1).max(65535).optional(),
        smtpSecure: z.boolean().optional(),
        smtpUsername: z.string().max(255).optional(),
        smtpPassword: z.string().max(255).optional(),
        defaultFromEmail: z.string().email().max(255).optional(),
        defaultFromName: z.string().max(255).optional(),
        replyToEmail: z.string().email().max(255).optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
        rateLimit: z.number().int().min(1).optional(),
        providerName: z.enum(['smtp', 'sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill']).optional(),
        priority: z.number().int().min(1).max(10).optional(),
        usageType: z.enum(['transactional', 'marketing', 'notification', 'general']).optional(),
        configKeys: z.record(z.any()).optional(),
        advancedConfig: z.record(z.any()).optional(),
        maxDailyLimit: z.number().int().min(1).optional(),
        webhookUrl: z.string().max(500).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    deleteChannel: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    setAsDefault: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    testChannel: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    cloneChannel: procedure
      .input(z.object({
        id: z.string().uuid(),
        newName: z.string().min(2).max(255),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
  }),

  // Admin Storage router
  adminStorage: router({
    getStorageConfig: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    updateStorageConfig: procedure
      .input(z.object({
        provider: z.enum(['local', 's3']),
        maxFileSize: z.number().min(1024).max(104857600),
        allowedFileTypes: z.array(z.string()),
        localUploadPath: z.string().optional(),
        localBaseUrl: z.string().optional(),
        s3AccessKey: z.string().optional(),
        s3SecretKey: z.string().optional(),
        s3Region: z.string().optional(),
        s3Bucket: z.string().optional(),
        s3Endpoint: z.string().optional(),
        s3ForcePathStyle: z.boolean().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    testStorageConnection: procedure
      .input(z.object({
        provider: z.enum(['local', 's3']),
        settings: z.record(z.string()),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
  }),

  // Admin Language router
  adminLanguage: router({
    getLanguages: procedure
      .input(z.object({
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(10),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getActiveLanguages: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getLanguageById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getDefaultLanguage: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    createLanguage: procedure
      .input(z.object({
        code: z.string().min(2).max(10),
        name: z.string().min(1).max(100),
        nativeName: z.string().min(1).max(100),
        icon: z.string().max(10).optional(),
        isActive: z.boolean().optional().default(true),
        isDefault: z.boolean().optional().default(false),
        sortOrder: z.number().int().min(0).optional().default(0),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    updateLanguage: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          code: z.string().min(2).max(10).optional(),
          name: z.string().min(1).max(100).optional(),
          nativeName: z.string().min(1).max(100).optional(),
          icon: z.string().max(10).optional(),
          isActive: z.boolean().optional(),
          isDefault: z.boolean().optional(),
          sortOrder: z.number().int().min(0).optional(),
        }),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    deleteLanguage: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    setDefaultLanguage: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    toggleLanguageStatus: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    updateSortOrders: procedure
      .input(z.object({
        updates: z.array(z.object({
          id: z.string().uuid(),
          sortOrder: z.number().int().min(0),
        })),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),
  }),

  // Admin Media router
  adminMedia: router({
    getUserMedia: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        type: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
        folder: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['createdAt', 'updatedAt', 'filename', 'originalName', 'size']).default('createdAt'),
        sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
      }).optional())
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getMediaById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    updateMedia: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          alt: z.string().optional(),
          caption: z.string().optional(),
          description: z.string().optional(),
        }),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    deleteMedia: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    deleteMultipleMedia: procedure
      .input(z.object({
        ids: z.array(z.string().uuid()).min(1),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as any;
      }),

    getMediaStats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),

    getRecentMedia: procedure
      .input(z.object({
        folder: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as any;
      }),
  }),
});

// For nestjs-trpc, the actual router structure is generated at runtime
// Use a permissive type that allows access to all router endpoints
export type AppRouter = typeof appRouter;