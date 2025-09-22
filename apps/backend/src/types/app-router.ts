import { router, procedure } from '../trpc/trpc';
import { z } from 'zod';
import { apiResponseSchema, paginatedResponseSchema, ApiResponse } from '../trpc/schemas/response.schemas';

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
        return {} as ApiResponse;
      }),

    getTranslation: procedure
      .input(z.object({
        key: z.string(),
        locale: z.enum(['en', 'vi']),
        defaultValue: z.string().optional(),
      }))
      .query(() => {
        return {} as ApiResponse;
      }),

    createTranslation: procedure
      .input(z.object({
        key: z.string(),
        locale: z.enum(['en', 'vi']),
        value: z.string(),
        namespace: z.string().optional(),
      }))
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateTranslation: procedure
      .input(z.object({
        key: z.string(),
        locale: z.enum(['en', 'vi']),
        value: z.string(),
        namespace: z.string().optional(),
      }))
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteTranslation: procedure
      .input(z.object({
        key: z.string(),
        locale: z.enum(['en', 'vi']),
      }))
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getLocaleConfig: procedure
      .query(() => {
        return {} as ApiResponse;
      }),

    clearCache: procedure
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // SEO router for client
  seo: router({
    getByPath: procedure
      .input(z.object({ path: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin routers
  admin: router({
    // Admin SEO router
    seo: router({
      getAll: procedure
        .output(apiResponseSchema)
        .query(() => {
          return {} as ApiResponse;
        }),

      getById: procedure
        .input(z.object({ id: z.string() }))
        .output(apiResponseSchema)
        .query(() => {
          return {} as ApiResponse;
        }),

      getByPath: procedure
        .input(z.object({ path: z.string() }))
        .output(apiResponseSchema)
        .query(() => {
          return {} as ApiResponse;
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
          return {} as ApiResponse;
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
          return {} as ApiResponse;
        }),

      delete: procedure
        .input(z.object({ id: z.string() }))
        .output(apiResponseSchema)
        .mutation(() => {
          return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    getUserById: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    deleteUser: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateUserStatus: procedure
      .input(z.object({
        id: z.string(),
        isActive: z.boolean(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getProfile: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    updateProfile: procedure
      .input(z.any()) // Using z.any() for simplicity on the client-side type definition
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    updatePassword: procedure
      .input(z.any()) // Using z.any() for simplicity on the client-side type definition
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    updateUserProfileById: procedure
      .input(z.object({ id: z.string() }).and(z.any())) // client-side typing convenience
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    getTemplateById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getTemplateByName: procedure
      .input(z.object({ name: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    deleteTemplate: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    processTemplate: procedure
      .input(z.object({
        templateId: z.string().uuid(),
        variables: z.record(z.any()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    cloneTemplate: procedure
      .input(z.object({
        templateId: z.string().uuid(),
        newName: z.string(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getTemplateTypes: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getStatistics: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    bulkUpdateStatus: procedure
      .input(z.object({
        ids: z.array(z.string().uuid()),
        isActive: z.boolean(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    searchTemplates: procedure
      .input(z.object({ searchTerm: z.string().min(1) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Add adminSeo router to match the actual server implementation
  adminSeo: router({
    getAll: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getById: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getByPath: procedure
      .input(z.object({ path: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    delete: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin User Statistics router - Updated
  adminUserStatistics: router({
    getUserStatistics: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getOverview: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getUserGrowth: procedure
      .input(z.object({
        period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getRoleDistribution: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getActivityStats: procedure
      .input(z.object({
        period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    getAvailableChartTypes: procedure
      .input(z.object({
        statisticId: z.string(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    getActivityById: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Settings router
  adminSettings: router({
    getAll: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getById: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getByKey: procedure
      .input(z.object({ key: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getByGroup: procedure
      .input(z.object({ group: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    delete: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    getRoleById: procedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    deleteRole: procedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getAvailablePermissions: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getRoleStatistics: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    toggleRoleStatus: procedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    duplicateRole: procedure
      .input(z.object({
        id: z.string().uuid(),
        newName: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    addPermissionsToRole: procedure
      .input(z.object({
        roleId: z.string().uuid(),
        permissionIds: z.array(z.string().uuid()),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    addUsersToRole: procedure
      .input(z.object({
        roleId: z.string().uuid(),
        userIds: z.array(z.string().uuid()),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    loginWithFirebase: procedure
      .input(z.object({
        firebaseIdToken: z.string()
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    refresh: procedure
      .input(z.object({
        refreshToken: z.string()
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    me: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    getPermissionById: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    deletePermission: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    assignPermissionToRole: procedure
      .input(z.object({
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'GUEST']),
        permissionId: z.string(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    removePermissionFromRole: procedure
      .input(z.object({
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'GUEST']),
        permissionId: z.string(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getRolePermissions: procedure
      .input(z.object({
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'GUEST'])
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    getPostById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getPostBySlug: procedure
      .input(z.object({ slug: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    deletePost: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getFeaturedPosts: procedure
      .input(z.object({
        limit: z.number().default(5),
        locale: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    incrementViewCount: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Post Categories router
  adminPostCategories: router({
    getCategories: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getCategoryById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    deleteCategory: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Post Tags router
  adminPostTags: router({
    getTags: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getTagById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    searchTags: procedure
      .input(z.object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).default(10),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    deleteTag: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    getChannelById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getActiveChannels: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getChannelsByUsageType: procedure
      .input(z.object({ usageType: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getDefaultChannel: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    deleteChannel: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    setAsDefault: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    testChannel: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    cloneChannel: procedure
      .input(z.object({
        id: z.string().uuid(),
        newName: z.string().min(2).max(255),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Storage router
  adminStorage: router({
    getStorageConfig: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    testStorageConnection: procedure
      .input(z.object({
        provider: z.enum(['local', 's3']),
        settings: z.record(z.string()),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    getActiveLanguages: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getLanguageById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getDefaultLanguage: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    deleteLanguage: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    setDefaultLanguage: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    toggleLanguageStatus: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    getMediaById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
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
        return {} as ApiResponse;
      }),

    deleteMedia: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteMultipleMedia: procedure
      .input(z.object({
        ids: z.array(z.string().uuid()).min(1),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getMediaStats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getRecentMedia: procedure
      .input(z.object({
        folder: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Product Management Routers
  adminProducts: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional(),
        categoryId: z.string().optional(),
        brandId: z.string().optional(),
        isFeatured: z.boolean().optional(),
        isActive: z.boolean().optional(),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        hasStock: z.boolean().optional(),
        createdFrom: z.string().optional(),
        createdTo: z.string().optional(),
        sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
        sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
      }).optional())
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    detail: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().min(0),
        comparePrice: z.number().min(0).optional(),
        cost: z.number().min(0).optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        trackQuantity: z.boolean().default(true),
        quantity: z.number().min(0).default(0),
        weight: z.number().min(0).optional(),
        dimensions: z.object({
          length: z.number().min(0).optional(),
          width: z.number().min(0).optional(),
          height: z.number().min(0).optional(),
        }).optional(),
        status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('DRAFT'),
        categoryId: z.string().optional(),
        brandId: z.string().optional(),
        images: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          price: z.number().min(0).optional(),
          comparePrice: z.number().min(0).optional(),
          cost: z.number().min(0).optional(),
          sku: z.string().optional(),
          barcode: z.string().optional(),
          trackQuantity: z.boolean().optional(),
          quantity: z.number().min(0).optional(),
          weight: z.number().min(0).optional(),
          dimensions: z.object({
            length: z.number().min(0).optional(),
            width: z.number().min(0).optional(),
            height: z.number().min(0).optional(),
          }).optional(),
          status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional(),
          categoryId: z.string().optional(),
          brandId: z.string().optional(),
          images: z.array(z.string()).optional(),
          tags: z.array(z.string()).optional(),
          seoTitle: z.string().optional(),
          seoDescription: z.string().optional(),
          metaKeywords: z.string().optional(),
        }),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    delete: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    stats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    updateStatus: procedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED']),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  clientProducts: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        categoryId: z.string().optional(),
        brandId: z.string().optional(),
        priceRange: z.object({
          min: z.number().min(0).optional(),
          max: z.number().min(0).optional(),
        }).optional(),
        sortBy: z.enum(['name', 'price', 'popularity', 'newest']).default('newest'),
        sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
      }).optional())
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    detail: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    featured: procedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
      }).optional())
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    byCategory: procedure
      .input(z.object({
        categoryId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    byBrand: procedure
      .input(z.object({
        brandId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  publicProducts: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        categoryId: z.string().optional(),
        brandId: z.string().optional(),
        priceRange: z.object({
          min: z.number().min(0).optional(),
          max: z.number().min(0).optional(),
        }).optional(),
        sortBy: z.enum(['name', 'price', 'popularity', 'newest']).default('newest'),
        sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
      }).optional())
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    detail: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    featured: procedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
      }).optional())
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    byCategory: procedure
      .input(z.object({
        categoryId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    byBrand: procedure
      .input(z.object({
        brandId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    search: procedure
      .input(z.object({
        query: z.string().min(1),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        filters: z.object({
          categoryId: z.string().optional(),
          brandId: z.string().optional(),
          priceRange: z.object({
            min: z.number().min(0).optional(),
            max: z.number().min(0).optional(),
          }).optional(),
        }).optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Client User router
  clientUser: router({
    getProfile: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    register: procedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        username: z.string().min(3).optional(),
        phoneNumber: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    login: procedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateProfile: procedure
      .input(z.object({
        firstName: z.string().min(2).optional(),
        lastName: z.string().min(2).optional(),
        phoneNumber: z.string().optional(),
        dateOfBirth: z.string().optional(),
        avatar: z.string().optional(),
        bio: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    refreshToken: procedure
      .input(z.object({ refreshToken: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Firebase Config router
  adminFirebaseConfig: router({
    getAllConfigs: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getConfig: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    createConfig: procedure
      .input(z.object({
        name: z.string().min(1),
        apiKey: z.string().min(1),
        authDomain: z.string().min(1),
        projectId: z.string().min(1),
        storageBucket: z.string().optional(),
        messagingSenderId: z.string().optional(),
        appId: z.string().min(1),
        measurementId: z.string().optional(),
        active: z.boolean().default(true),
        description: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateConfig: procedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        apiKey: z.string().min(1).optional(),
        authDomain: z.string().min(1).optional(),
        projectId: z.string().min(1).optional(),
        storageBucket: z.string().optional(),
        messagingSenderId: z.string().optional(),
        appId: z.string().min(1).optional(),
        measurementId: z.string().optional(),
        active: z.boolean().optional(),
        description: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteConfig: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Product Brands router
  adminProductBrands: router({
    getAll: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
        sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
      }).optional())
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        logo: z.string().optional(),
        website: z.string().optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().min(0).default(0),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        website: z.string().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().min(0).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    delete: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getStats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    // Brand translation endpoints
    getBrandTranslations: procedure
      .input(z.object({ 
        brandId: z.string().uuid(),
        locale: z.string().min(2).max(5).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getByIdWithTranslations: procedure
      .input(z.object({ 
        id: z.string().uuid(),
        locale: z.string().min(2).max(5).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    createBrandTranslation: procedure
      .input(z.object({
        brandId: z.string().uuid(),
        locale: z.string().min(2).max(5),
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateBrandTranslation: procedure
      .input(z.object({
        brandId: z.string().uuid(),
        locale: z.string().min(2).max(5),
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteBrandTranslation: procedure
      .input(z.object({
        brandId: z.string().uuid(),
        locale: z.string().min(2).max(5),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Standalone Admin Product Categories router
  adminProductCategories: router({
    getAll: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        parentId: z.string().uuid().optional(),
        sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'sortOrder']).default('sortOrder'),
        sortOrder: z.enum(['ASC', 'DESC']).default('ASC'),
      }).optional())
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getTree: procedure
      .input(z.object({
        includeInactive: z.boolean().default(false),
      }).optional())
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getRootCategories: procedure
      .input(z.object({
        includeInactive: z.boolean().default(false),
      }).optional())
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getCategoryChildren: procedure
      .input(z.object({
        parentId: z.string().uuid(),
        includeInactive: z.boolean().default(false),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        slug: z.string().min(1),
        parentId: z.string().uuid().optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().min(0).default(0),
        image: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        slug: z.string().min(1).optional(),
        parentId: z.string().uuid().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().min(0).optional(),
        image: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    delete: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getStats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    // Category translation endpoints
    getCategoryTranslations: procedure
      .input(z.object({ 
        categoryId: z.string().uuid(),
        locale: z.string().min(2).max(5).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getByIdWithTranslations: procedure
      .input(z.object({ 
        id: z.string().uuid(),
        locale: z.string().min(2).max(5).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getTreeWithTranslations: procedure
      .input(z.object({
        locale: z.string().min(2).max(5).optional(),
        includeInactive: z.boolean().default(false),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    createCategoryTranslation: procedure
      .input(z.object({
        categoryId: z.string().uuid(),
        locale: z.string().min(2).max(5),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        slug: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateCategoryTranslation: procedure
      .input(z.object({
        categoryId: z.string().uuid(),
        locale: z.string().min(2).max(5),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        slug: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteCategoryTranslation: procedure
      .input(z.object({
        categoryId: z.string().uuid(),
        locale: z.string().min(2).max(5),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Product router (with nested categories and brands)
  adminProduct: router({
    categories: router({
      getAll: procedure
        .input(z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
          search: z.string().optional(),
          isActive: z.boolean().optional(),
          parentId: z.string().uuid().optional(),
          sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'sortOrder']).default('sortOrder'),
          sortOrder: z.enum(['ASC', 'DESC']).default('ASC'),
        }).optional())
        .output(paginatedResponseSchema)
        .query(() => {
          return {} as ApiResponse;
        }),

      getTree: procedure
        .input(z.object({
          includeInactive: z.boolean().default(false),
        }).optional())
        .output(apiResponseSchema)
        .query(() => {
          return {} as ApiResponse;
        }),

      getById: procedure
        .input(z.object({ id: z.string().uuid() }))
        .output(apiResponseSchema)
        .query(() => {
          return {} as ApiResponse;
        }),

      create: procedure
        .input(z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          slug: z.string().min(1),
          parentId: z.string().uuid().optional(),
          isActive: z.boolean().default(true),
          sortOrder: z.number().min(0).default(0),
          image: z.string().optional(),
          seoTitle: z.string().optional(),
          seoDescription: z.string().optional(),
          metaKeywords: z.string().optional(),
        }))
        .output(apiResponseSchema)
        .mutation(() => {
          return {} as ApiResponse;
        }),

      update: procedure
        .input(z.object({
          id: z.string().uuid(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          slug: z.string().min(1).optional(),
          parentId: z.string().uuid().optional(),
          isActive: z.boolean().optional(),
          sortOrder: z.number().min(0).optional(),
          image: z.string().optional(),
          seoTitle: z.string().optional(),
          seoDescription: z.string().optional(),
          metaKeywords: z.string().optional(),
        }))
        .output(apiResponseSchema)
        .mutation(() => {
          return {} as ApiResponse;
        }),

      delete: procedure
        .input(z.object({ id: z.string().uuid() }))
        .output(apiResponseSchema)
        .mutation(() => {
          return {} as ApiResponse;
        }),

      getStats: procedure
        .output(apiResponseSchema)
        .query(() => {
          return {} as ApiResponse;
        }),
    }),

    brands: router({
      getAll: procedure
        .input(z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
          search: z.string().optional(),
          isActive: z.boolean().optional(),
          sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
          sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
        }).optional())
        .output(paginatedResponseSchema)
        .query(() => {
          return {} as ApiResponse;
        }),

      getById: procedure
        .input(z.object({ id: z.string().uuid() }))
        .output(apiResponseSchema)
        .query(() => {
          return {} as ApiResponse;
        }),

      create: procedure
        .input(z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          logo: z.string().optional(),
          website: z.string().optional(),
          isActive: z.boolean().default(true),
          sortOrder: z.number().min(0).default(0),
        }))
        .output(apiResponseSchema)
        .mutation(() => {
          return {} as ApiResponse;
        }),

      update: procedure
        .input(z.object({
          id: z.string().uuid(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          logo: z.string().optional(),
          website: z.string().optional(),
          isActive: z.boolean().optional(),
          sortOrder: z.number().min(0).optional(),
        }))
        .output(apiResponseSchema)
        .mutation(() => {
          return {} as ApiResponse;
        }),

      delete: procedure
        .input(z.object({ id: z.string().uuid() }))
        .output(apiResponseSchema)
        .mutation(() => {
          return {} as ApiResponse;
        }),

      getStats: procedure
        .output(apiResponseSchema)
        .query(() => {
          return {} as ApiResponse;
        }),
    }),
  }),

  // Admin Product Attributes router
  adminProductAttributes: router({
    getAll: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        type: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'COLOR', 'DATE']).optional(),
        isRequired: z.boolean().optional(),
        isFilterable: z.boolean().optional(),
        sortBy: z.enum(['name', 'displayName', 'createdAt', 'updatedAt', 'sortOrder']).default('sortOrder'),
        sortOrder: z.enum(['ASC', 'DESC']).default('ASC'),
      }).optional())
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getSelectAttributes: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getFilterableAttributes: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(z.object({
        name: z.string().min(1),
        displayName: z.string().optional(),
        type: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'COLOR', 'DATE']),
        isRequired: z.boolean().default(false),
        isFilterable: z.boolean().default(false),
        sortOrder: z.number().min(0).default(0),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        displayName: z.string().optional(),
        type: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'COLOR', 'DATE']).optional(),
        isRequired: z.boolean().optional(),
        isFilterable: z.boolean().optional(),
        sortOrder: z.number().min(0).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    delete: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getAttributeValues: procedure
      .input(z.object({ attributeId: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    createAttributeValue: procedure
      .input(z.object({
        attributeId: z.string().uuid(),
        value: z.string().min(1),
        displayValue: z.string().optional(),
        sortOrder: z.number().min(0).default(0),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateAttributeValue: procedure
      .input(z.object({
        id: z.string().uuid(),
        value: z.string().min(1).optional(),
        displayValue: z.string().optional(),
        sortOrder: z.number().min(0).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteAttributeValue: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getStats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    // Translation endpoints
    getAttributeTranslations: procedure
      .input(z.object({ 
        attributeId: z.string().uuid(),
        locale: z.string().min(2).max(5).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getByIdWithTranslations: procedure
      .input(z.object({ 
        id: z.string().uuid(),
        locale: z.string().min(2).max(5).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    createAttributeTranslation: procedure
      .input(z.object({
        attributeId: z.string().uuid(),
        locale: z.string().min(2).max(5),
        displayName: z.string().min(1),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateAttributeTranslation: procedure
      .input(z.object({
        attributeId: z.string().uuid(),
        locale: z.string().min(2).max(5),
        displayName: z.string().min(1),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteAttributeTranslation: procedure
      .input(z.object({
        attributeId: z.string().uuid(),
        locale: z.string().min(2).max(5),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Product Suppliers router
  adminProductSuppliers: router({
    getAll: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        country: z.string().optional(),
        sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
        sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
      }).optional())
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        logo: z.string().optional(),
        website: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
        contactPerson: z.string().optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().min(0).default(0),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        website: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
        contactPerson: z.string().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().min(0).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    delete: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getStats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    // Supplier translation endpoints
    getSupplierTranslations: procedure
      .input(z.object({
        supplierId: z.string().uuid(),
        locale: z.string().min(2).max(5).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getByIdWithTranslations: procedure
      .input(z.object({
        id: z.string().uuid(),
        locale: z.string().min(2).max(5).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    createSupplierTranslation: procedure
      .input(z.object({
        supplierId: z.string().uuid(),
        locale: z.string().min(2).max(5),
        name: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        contactPerson: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateSupplierTranslation: procedure
      .input(z.object({
        supplierId: z.string().uuid(),
        locale: z.string().min(2).max(5),
        name: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        contactPerson: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteSupplierTranslation: procedure
      .input(z.object({
        supplierId: z.string().uuid(),
        locale: z.string().min(2).max(5),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Public Auth router - no authentication required
  publicAuth: router({
    getFirebaseConfig: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Notification router
  adminNotification: router({
    getNotifications: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        userId: z.string().optional(),
        type: z.enum(['info', 'success', 'warning', 'error', 'system', 'product', 'order', 'user']).optional(),
        read: z.boolean().optional(),
        sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
        sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getNotificationById: procedure
      .input(z.object({ id: z.string().min(1) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getNotificationStats: procedure
      .input(z.object({ userId: z.string().optional() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    sendNotificationToUser: procedure
      .input(z.object({
        userId: z.string().min(1),
        title: z.string().min(1).max(255),
        body: z.string().min(1),
        type: z.enum(['info', 'success', 'warning', 'error', 'system', 'product', 'order', 'user']).optional(),
        actionUrl: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        data: z.record(z.unknown()).optional(),
        fcmTokens: z.array(z.string()).optional(),
        sendPush: z.boolean().default(true),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    sendBulkNotifications: procedure
      .input(z.object({
        userIds: z.array(z.string().min(1)).min(1),
        title: z.string().min(1).max(255),
        body: z.string().min(1),
        type: z.enum(['info', 'success', 'warning', 'error', 'system', 'product', 'order', 'user']).optional(),
        actionUrl: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        data: z.record(z.unknown()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    sendTopicNotification: procedure
      .input(z.object({
        topic: z.string().min(1),
        title: z.string().min(1).max(255),
        body: z.string().min(1),
        actionUrl: z.string().optional(),
        data: z.record(z.unknown()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    markAsRead: procedure
      .input(z.object({ id: z.string().min(1) }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteNotification: procedure
      .input(z.object({ id: z.string().min(1) }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Notification Preferences router
  adminNotificationPreferences: router({
    getUserPreferences: procedure
      .input(z.object({ userId: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getUserPreferencesRaw: procedure
      .input(z.object({ userId: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    createPreference: procedure
      .input(z.object({
        userId: z.string().uuid(),
        type: z.enum(['info', 'success', 'warning', 'error', 'system', 'product', 'order', 'user']),
        channel: z.enum(['push', 'email', 'in_app']),
        enabled: z.boolean().optional().default(true),
        frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly', 'never']).optional().default('immediate'),
        quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        quietHoursTimezone: z.string().optional(),
        settings: z.record(z.unknown()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updatePreference: procedure
      .input(z.object({
        id: z.string().uuid(),
        enabled: z.boolean().optional(),
        frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly', 'never']).optional(),
        quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        quietHoursTimezone: z.string().optional(),
        settings: z.record(z.unknown()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateUserPreference: procedure
      .input(z.object({
        userId: z.string().uuid(),
        type: z.enum(['info', 'success', 'warning', 'error', 'system', 'product', 'order', 'user']),
        channel: z.enum(['push', 'email', 'in_app']),
        enabled: z.boolean().optional(),
        frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly', 'never']).optional(),
        quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        quietHoursTimezone: z.string().optional(),
        settings: z.record(z.unknown()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    bulkUpdateUserPreferences: procedure
      .input(z.object({
        userId: z.string().uuid(),
        preferences: z.array(z.object({
          type: z.enum(['info', 'success', 'warning', 'error', 'system', 'product', 'order', 'user']),
          channel: z.enum(['push', 'email', 'in_app']),
          enabled: z.boolean().optional(),
          frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly', 'never']).optional(),
          quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
          quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
          quietHoursTimezone: z.string().optional(),
          settings: z.record(z.unknown()).optional(),
        })),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deletePreference: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    initializeUserPreferences: procedure
      .input(z.object({ userId: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    toggleNotificationType: procedure
      .input(z.object({
        userId: z.string().uuid(),
        type: z.enum(['info', 'success', 'warning', 'error', 'system', 'product', 'order', 'user']),
        enabled: z.boolean(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    setQuietHours: procedure
      .input(z.object({
        userId: z.string().uuid(),
        channel: z.enum(['push', 'email', 'in_app']),
        start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        timezone: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getQuietHours: procedure
      .input(z.object({
        userId: z.string().uuid(),
        channel: z.enum(['push', 'email', 'in_app']),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    canSendNotification: procedure
      .input(z.object({
        userId: z.string().uuid(),
        type: z.enum(['info', 'success', 'warning', 'error', 'system', 'product', 'order', 'user']),
        channel: z.enum(['push', 'email', 'in_app']),
        timezone: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Customers router
  adminCustomers: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING']).optional(),
        type: z.enum(['INDIVIDUAL', 'BUSINESS']).optional(),
        hasOrders: z.boolean().optional(),
        isVip: z.boolean().optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    detail: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.string().optional(),
        companyName: z.string().optional(),
        jobTitle: z.string().optional(),
        type: z.enum(['INDIVIDUAL', 'BUSINESS']).optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING']).optional(),
        languagePreference: z.string().optional(),
        currencyPreference: z.string().optional(),
        timezone: z.string().optional(),
        marketingConsent: z.boolean().optional(),
        newsletterSubscribed: z.boolean().optional(),
        customerTags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        referralSource: z.string().optional(),
        taxExempt: z.boolean().optional(),
        taxId: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.string().optional(),
        companyName: z.string().optional(),
        jobTitle: z.string().optional(),
        type: z.enum(['INDIVIDUAL', 'BUSINESS']).optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING']).optional(),
        languagePreference: z.string().optional(),
        currencyPreference: z.string().optional(),
        timezone: z.string().optional(),
        marketingConsent: z.boolean().optional(),
        newsletterSubscribed: z.boolean().optional(),
        customerTags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        referralSource: z.string().optional(),
        taxExempt: z.boolean().optional(),
        taxId: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    delete: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    stats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    updateStatus: procedure
      .input(z.object({
        id: z.string(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING']),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    search: procedure
      .input(z.object({
        search: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    topCustomers: procedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    recentCustomers: procedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    inactiveCustomers: procedure
      .input(z.object({
        daysSinceLastOrder: z.number().min(1).default(90),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    customersByTag: procedure
      .input(z.object({
        tag: z.string().min(1),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    addLoyaltyPoints: procedure
      .input(z.object({
        customerId: z.string(),
        points: z.number().min(1),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    redeemLoyaltyPoints: procedure
      .input(z.object({
        customerId: z.string(),
        points: z.number().min(1),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    bulkUpdateStatus: procedure
      .input(z.object({
        customerIds: z.array(z.string()).min(1),
        status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING']),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Address Book router
  adminAddressBook: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        customerId: z.string().uuid().optional(),
        countryId: z.string().optional(),
        addressType: z.enum(['BILLING', 'SHIPPING', 'BOTH']).optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    detail: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    getByCustomerId: procedure
      .input(z.object({ customerId: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    getByCustomerIdAndType: procedure
      .input(z.object({
        customerId: z.string().uuid(),
        addressType: z.enum(['BILLING', 'SHIPPING', 'BOTH']),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    create: procedure
      .input(z.object({
        customerId: z.string().uuid(),
        countryId: z.string(),
        provinceId: z.string().optional(),
        wardId: z.string().optional(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        companyName: z.string().optional(),
        addressLine1: z.string().min(1),
        addressLine2: z.string().optional(),
        postalCode: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().email().optional(),
        addressType: z.enum(['BILLING', 'SHIPPING', 'BOTH']).default('BOTH'),
        isDefault: z.boolean().default(false),
        label: z.string().optional(),
        deliveryInstructions: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    update: procedure
      .input(z.object({
        id: z.string().uuid(),
        countryId: z.string().optional(),
        provinceId: z.string().optional(),
        wardId: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        companyName: z.string().optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        postalCode: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().email().optional(),
        addressType: z.enum(['BILLING', 'SHIPPING', 'BOTH']).optional(),
        isDefault: z.boolean().optional(),
        label: z.string().optional(),
        deliveryInstructions: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    delete: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    setAsDefault: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    stats: procedure
      .input(z.object({ customerId: z.string().uuid().optional() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Orders router
  adminOrders: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']).optional(),
        paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
        source: z.enum(['WEBSITE', 'MOBILE_APP', 'PHONE', 'EMAIL', 'IN_STORE', 'SOCIAL_MEDIA', 'MARKETPLACE']).optional(),
        customerId: z.string().optional(),
        customerEmail: z.string().optional(),
        orderNumber: z.string().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        isPaid: z.boolean().optional(),
        isCompleted: z.boolean().optional(),
        isCancelled: z.boolean().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        shippedDateFrom: z.string().optional(),
        shippedDateTo: z.string().optional(),
        deliveredDateFrom: z.string().optional(),
        deliveredDateTo: z.string().optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    detail: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getByOrderNumber: procedure
      .input(z.object({ orderNumber: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(z.object({
        customerId: z.string().optional(),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        customerName: z.string().min(1),
        source: z.enum(['WEBSITE', 'MOBILE_APP', 'PHONE', 'EMAIL', 'IN_STORE', 'SOCIAL_MEDIA', 'MARKETPLACE']).optional(),
        billingAddress: z.object({
          firstName: z.string(),
          lastName: z.string(),
          company: z.string().optional(),
          address1: z.string(),
          address2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string(),
        }).optional(),
        shippingAddress: z.object({
          firstName: z.string(),
          lastName: z.string(),
          company: z.string().optional(),
          address1: z.string(),
          address2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string(),
        }).optional(),
        paymentMethod: z.string().optional(),
        shippingMethod: z.string().optional(),
        currency: z.string().optional(),
        notes: z.string().optional(),
        customerNotes: z.string().optional(),
        internalNotes: z.string().optional(),
        discountCode: z.string().optional(),
        isGift: z.boolean().optional(),
        giftMessage: z.string().optional(),
        items: z.array(z.object({
          productId: z.string(),
          productVariantId: z.string().optional(),
          productName: z.string(),
          productSku: z.string().optional(),
          variantName: z.string().optional(),
          variantSku: z.string().optional(),
          quantity: z.number().min(1),
          unitPrice: z.number().min(0),
          discountAmount: z.number().min(0).optional(),
          taxAmount: z.number().min(0).optional(),
          productImage: z.string().optional(),
          productAttributes: z.record(z.string()).optional(),
          isDigital: z.boolean().optional(),
          weight: z.number().optional(),
          dimensions: z.string().optional(),
          requiresShipping: z.boolean().optional(),
          isGiftCard: z.boolean().optional(),
          giftCardCode: z.string().optional(),
          notes: z.string().optional(),
          sortOrder: z.number().optional(),
        })).min(1),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string(),
        status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']).optional(),
        paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
        customerName: z.string().optional(),
        billingAddress: z.object({
          firstName: z.string(),
          lastName: z.string(),
          company: z.string().optional(),
          address1: z.string(),
          address2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string(),
        }).optional(),
        shippingAddress: z.object({
          firstName: z.string(),
          lastName: z.string(),
          company: z.string().optional(),
          address1: z.string(),
          address2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string(),
        }).optional(),
        paymentMethod: z.string().optional(),
        paymentReference: z.string().optional(),
        shippingMethod: z.string().optional(),
        trackingNumber: z.string().optional(),
        estimatedDeliveryDate: z.string().optional(),
        notes: z.string().optional(),
        customerNotes: z.string().optional(),
        internalNotes: z.string().optional(),
        discountCode: z.string().optional(),
        discountAmount: z.number().optional(),
        isGift: z.boolean().optional(),
        giftMessage: z.string().optional(),
        cancelledReason: z.string().optional(),
        refundAmount: z.number().optional(),
        refundReason: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateStatus: procedure
      .input(z.object({
        id: z.string(),
        status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']),
        reason: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updatePaymentStatus: procedure
      .input(z.object({
        id: z.string(),
        paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'CANCELLED']),
        paymentReference: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    cancel: procedure
      .input(z.object({
        id: z.string(),
        reason: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    refund: procedure
      .input(z.object({
        id: z.string(),
        refundAmount: z.number().optional(),
        reason: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    ship: procedure
      .input(z.object({
        id: z.string(),
        trackingNumber: z.string().optional(),
        shippingMethod: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    fulfill: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    delete: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    stats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getByCustomer: procedure
      .input(z.object({
        customerId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getByCustomerEmail: procedure
      .input(z.object({
        customerEmail: z.string().email(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    fulfillItem: procedure
      .input(z.object({
        itemId: z.string(),
        quantity: z.number().min(1),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    refundItem: procedure
      .input(z.object({
        itemId: z.string(),
        quantity: z.number().min(1),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteItem: procedure
      .input(z.object({ itemId: z.string() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),
});

// For nestjs-trpc, the actual router structure is generated at runtime
// Use a permissive type that allows access to all router endpoints
export type AppRouter = typeof appRouter;