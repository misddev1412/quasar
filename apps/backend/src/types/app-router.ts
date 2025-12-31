import { router, procedure } from '../trpc/trpc';
import { z } from 'zod';
import { MenuTarget, MenuType } from '@shared/enums/menu.enums';
import { ComponentCategory, ComponentStructureType } from '@shared/enums/component.enums';
import { apiResponseSchema, paginatedResponseSchema, ApiResponse } from '../trpc/schemas/response.schemas';
import { createSectionSchema, updateSectionSchema, reorderSectionsSchema } from '../modules/sections/dto/section.dto';
import { AdministrativeDivisionType } from '../modules/products/entities/administrative-division.entity';
import {
  listSiteContentQuerySchema,
  createSiteContentSchema,
  updateSiteContentSchema,
  siteContentIdSchema,
  bulkDeleteSiteContentSchema,
} from '../modules/site-content/dto/site-content.dto';
import { SiteContentCategory, SiteContentStatus } from '@shared/enums/site-content.enums';
import {
  searchSpecificationLabelsSchema,
  createSpecificationLabelSchema,
} from '../modules/products/routers/admin-product-specification-labels.router';
import {
  CreateServiceSchema,
  UpdateServiceSchema,
  ServiceFilterSchema,
} from '../modules/services/dto/service.dto';

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

const exportFormatSchema = z.enum(['csv', 'json']);
const exportJobStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);
const exportJobSchema = z.object({
  id: z.string(),
  resource: z.string(),
  format: exportFormatSchema,
  status: exportJobStatusSchema,
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  totalRecords: z.number().nullable().optional(),
  createdAt: z.date(),
  completedAt: z.date().nullable().optional(),
});

const themeModeSchema = z.enum(['light', 'dark']);
const hexColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/);
const themeColorSchema = z.object({
  bodyBackgroundColor: hexColorSchema,
  surfaceBackgroundColor: hexColorSchema,
  textColor: hexColorSchema,
  mutedTextColor: hexColorSchema,
  primaryColor: hexColorSchema,
  primaryTextColor: hexColorSchema,
  secondaryColor: hexColorSchema,
  secondaryTextColor: hexColorSchema,
  accentColor: hexColorSchema,
  borderColor: hexColorSchema,
});
const createThemeInputSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(160).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  mode: themeModeSchema.optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  colors: themeColorSchema,
});
const updateThemeInputSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    name: z.string().min(2).max(150).optional(),
    slug: z.string().min(2).max(160).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().max(500).optional(),
    mode: themeModeSchema.optional(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    colors: themeColorSchema.partial().optional(),
  }),
});
const themeFiltersSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(50).optional().default(12),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  mode: themeModeSchema.optional(),
});

const exportJobResponseSchema = apiResponseSchema.extend({
  data: exportJobSchema.optional(),
});

const exportJobListResponseSchema = apiResponseSchema.extend({
  data: z.object({
    items: z.array(exportJobSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

const exportEstimateResponseSchema = apiResponseSchema.extend({
  data: z.object({
    total: z.number(),
  }).optional(),
});

const menuTranslationSchema = z.object({
  label: z.string().optional(),
  description: z.string().optional(),
  customHtml: z.string().optional(),
  config: z.record(z.unknown()).optional(),
});

const createMenuSchema = z.object({
  menuGroup: z.string().min(1),
  type: z.nativeEnum(MenuType),
  url: z.string().optional(),
  referenceId: z.string().optional(),
  target: z.nativeEnum(MenuTarget),
  position: z.number().int().min(0),
  isEnabled: z.boolean(),
  icon: z.string().optional(),
  textColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  config: z.record(z.unknown()),
  isMegaMenu: z.boolean(),
  megaMenuColumns: z.number().int().min(1).max(6).optional(),
  parentId: z.string().uuid().optional(),
  translations: z.record(menuTranslationSchema),
});

const updateMenuSchema = createMenuSchema.partial();

const reorderMenuSchema = z.object({
  menuGroup: z.string().min(1),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int().min(0),
      parentId: z.string().uuid().optional(),
    }),
  ),
});

const adminAddressCountrySchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  iso2: z.string().nullable(),
  iso3: z.string().nullable(),
  phoneCode: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

const adminAdministrativeDivisionSchema = z.object({
  id: z.string(),
  countryId: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  code: z.string().nullable(),
  type: z.nativeEnum(AdministrativeDivisionType),
  i18nKey: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

const siteContentSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  slug: z.string(),
  category: z.nativeEnum(SiteContentCategory),
  status: z.nativeEnum(SiteContentStatus),
  summary: z.string().nullable(),
  content: z.string().nullable(),
  languageCode: z.string(),
  publishedAt: z.date().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  displayOrder: z.number(),
  isFeatured: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const clientSiteContentSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  slug: z.string(),
  category: z.nativeEnum(SiteContentCategory),
  status: z.nativeEnum(SiteContentStatus),
  summary: z.string().nullable(),
  content: z.string().nullable(),
  languageCode: z.string(),
  publishedAt: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  displayOrder: z.number(),
  isFeatured: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const clientSiteContentListResponseSchema = z.object({
  items: z.array(clientSiteContentSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  }),
});

const customerTransactionTypeSchema = z.enum([
  'order_payment',
  'refund',
  'wallet_topup',
  'withdrawal',
  'adjustment',
  'subscription',
]);

const customerTransactionStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
]);

const ledgerEntryDirectionSchema = z.enum(['credit', 'debit']);

const transactionChannelSchema = z.enum(['system', 'admin', 'customer', 'automation']);

const ledgerAccountSchema = z.enum(['customer_balance', 'platform_clearing', 'promotion_reserve', 'bank_settlement', 'adjustment']);

const fulfillmentStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
]);

const fulfillmentPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']);

const brandShowcaseStrategySchema = z.enum(['newest', 'alphabetical', 'custom']);

const brandShowcaseRequestSchema = z.object({
  strategy: brandShowcaseStrategySchema.optional(),
  limit: z.number().min(1).max(30).optional(),
  brandIds: z.array(z.string().uuid()).optional(),
  locale: z.string().min(2).max(10).optional(),
});


// This creates the combined app router
export const appRouter = router({
  // Directly defined procedure
  hello: procedure.query(() => {
    return { message: 'Hello API' };
  }),

  public: router({
    settings: router({
      getByGroup: procedure
        .input(z.object({ group: z.string() }))
        .output(apiResponseSchema)
        .query(() => {
          return {} as ApiResponse;
        }),
    }),
  }),

  adminImpersonation: router({
    startImpersonation: procedure
      .input(z.object({
        userId: z.string().uuid(),
        reason: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    endImpersonation: procedure
      .input(z.object({
        originalAdminAccessToken: z.string(),
        originalAdminRefreshToken: z.string(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    getImpersonationHistory: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        adminUserId: z.string().uuid().optional(),
        impersonatedUserId: z.string().uuid().optional(),
        status: z.enum(['ACTIVE', 'ENDED', 'EXPIRED']).optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    getCurrentImpersonationStatus: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  services: router({
    getServices: procedure
      .input(ServiceFilterSchema)
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    getServiceById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    createService: procedure
      .input(CreateServiceSchema)
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    updateService: procedure
      .input(z.object({ id: z.string().uuid(), data: UpdateServiceSchema }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    deleteService: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Define type information for client-side usage
  // The actual implementation is handled by NestJS-tRPC at runtime
  // Sections router
  sections: router({
    list: procedure
      .input(z.object({
        page: z.string(),
        locale: z.string(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    listAll: procedure
      .input(z.object({ page: z.string().optional().nullable() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(createSectionSchema)
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({ id: z.string(), data: updateSectionSchema }))
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

    reorder: procedure
      .input(reorderSectionsSchema)
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    clone: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

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

  clientDeliveryMethods: router({
    list: procedure
      .input(z.object({
        orderAmount: z.number().min(0).default(0),
        weight: z.number().min(0).optional(),
        distance: z.number().min(0).optional(),
        coverageArea: z.string().optional(),
        paymentMethodId: z.string().optional(),
      }).optional())
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

  adminWarehouses: router({
    getAll: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(
        z.object({
          name: z.string(),
          code: z.string(),
          description: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          postalCode: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          managerName: z.string().optional(),
          isActive: z.boolean(),
          isDefault: z.boolean(),
          sortOrder: z.number().int(),
        })
      )
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getById: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          code: z.string().optional(),
          description: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          postalCode: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          managerName: z.string().optional(),
          isActive: z.boolean().optional(),
          isDefault: z.boolean().optional(),
          sortOrder: z.number().int().optional(),
        })
      )
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

    exportUsers: procedure
      .input(z.object({
        format: exportFormatSchema.default('csv'),
        filters: z.record(z.unknown()).optional(),
      }))
      .output(exportJobResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    estimateExportUsers: procedure
      .input(z.object({
        filters: z.record(z.unknown()).optional(),
      }))
      .output(exportEstimateResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    listExportJobs: procedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
        page: z.number().min(1).default(1),
      }))
      .output(exportJobListResponseSchema)
      .query(() => {
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

  adminCustomerTransactions: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: customerTransactionStatusSchema.optional(),
        type: customerTransactionTypeSchema.optional(),
        direction: ledgerEntryDirectionSchema.optional(),
        currency: z.string().length(3).optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        customerId: z.string().uuid().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        sortBy: z.enum(['createdAt', 'amount', 'status']).optional(),
        sortOrder: z.enum(['ASC', 'DESC']).optional(),
        relatedEntityType: z.string().max(50).optional(),
        relatedEntityId: z.string().uuid().optional(),
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
        customerId: z.string().uuid(),
        type: customerTransactionTypeSchema,
        direction: ledgerEntryDirectionSchema,
        amount: z.number().positive(),
        currency: z.string().length(3).optional(),
        description: z.string().optional(),
        referenceId: z.string().optional(),
        channel: transactionChannelSchema.optional(),
        metadata: z.record(z.unknown()).optional(),
        status: customerTransactionStatusSchema.optional(),
        counterAccount: ledgerAccountSchema.optional(),
        relatedEntityType: z.string().max(50).optional(),
        relatedEntityId: z.string().uuid().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    updateStatus: procedure
      .input(z.object({
        id: z.string(),
        status: customerTransactionStatusSchema,
        failureReason: z.string().optional(),
        processedAt: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    stats: procedure
      .input(z.object({
        currency: z.string().length(3).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }).optional())
      .output(apiResponseSchema)
      .query(() => {
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
      .input(z.object({ searchTerm: z.string().optional().default('') }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  adminMailLog: router({
    getLogs: procedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().max(100).default(20),
        search: z.string().optional(),
        status: z.enum(['queued', 'sent', 'failed', 'delivered']).optional(),
        providerId: z.string().uuid().optional(),
        templateId: z.string().uuid().optional(),
        flowId: z.string().uuid().optional(),
        isTest: z.boolean().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        channel: z.enum(['email', 'sms', 'push']).optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getLogById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getStatistics: procedure
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

  // Admin Component Configs router
  adminComponentConfigs: router({
    list: procedure
      .input(z.object({
        parentId: z.string().uuid().optional().nullable(),
        category: z.nativeEnum(ComponentCategory).optional(),
        componentType: z.nativeEnum(ComponentStructureType).optional(),
        onlyEnabled: z.boolean().optional(),
        includeChildren: z.boolean().optional(),
        sectionId: z.string().uuid().optional().nullable(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    byId: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    byKey: procedure
      .input(z.object({ componentKey: z.string().min(1).max(150) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(z.object({
        componentKey: z.string().min(1).max(150),
        displayName: z.string().min(1).max(255),
        description: z.string().max(1000).optional().nullable(),
        componentType: z.nativeEnum(ComponentStructureType),
        category: z.nativeEnum(ComponentCategory),
        position: z.number().int().min(0).optional(),
        isEnabled: z.boolean().optional(),
        defaultConfig: z.record(z.unknown()).optional(),
        configSchema: z.record(z.unknown()).optional(),
        metadata: z.record(z.unknown()).optional(),
        allowedChildKeys: z.array(z.string().min(1)).optional(),
        previewMediaUrl: z.string().url().optional().nullable(),
        parentId: z.string().uuid().optional().nullable(),
        slotKey: z.string().max(100).optional().nullable(),
        sectionIds: z.array(z.string().uuid()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          componentKey: z.string().min(1).max(150).optional(),
          displayName: z.string().min(1).max(255).optional(),
          description: z.string().max(1000).optional().nullable(),
          componentType: z.nativeEnum(ComponentStructureType).optional(),
          category: z.nativeEnum(ComponentCategory).optional(),
          position: z.number().int().min(0).optional(),
          isEnabled: z.boolean().optional(),
          defaultConfig: z.record(z.unknown()).optional(),
          configSchema: z.record(z.unknown()).optional(),
          metadata: z.record(z.unknown()).optional(),
          allowedChildKeys: z.array(z.string().min(1)).optional(),
          previewMediaUrl: z.string().url().optional().nullable(),
          parentId: z.string().uuid().optional().nullable(),
          slotKey: z.string().max(100).optional().nullable(),
          sectionIds: z.array(z.string().uuid()).optional(),
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
  }),

  // Client Component Configs router
  clientComponentConfigs: router({
    listByKeys: procedure
      .input(z.object({
        componentKeys: z.array(z.string().min(1).max(150)).min(1),
        sectionId: z.string().uuid().optional().nullable(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  adminMenus: router({
    list: procedure
      .input(z.object({ menuGroup: z.string().optional() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    byId: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    tree: procedure
      .input(z.object({ menuGroup: z.string().min(1) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    children: procedure
      .input(z.object({
        parentId: z.string().uuid().optional(),
        menuGroup: z.string().min(1),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    groups: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    statistics: procedure
      .input(z.object({ menuGroup: z.string().optional() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(createMenuSchema)
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({ id: z.string().uuid(), data: updateMenuSchema }))
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


    clone: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    reorder: procedure
      .input(reorderMenuSchema)
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getNextPosition: procedure
      .input(z.object({
        menuGroup: z.string().min(1),
        parentId: z.string().uuid().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
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

    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        group: z.string().optional(),
      }))
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
        publishedAt: z.coerce.date().optional().nullable(),
        scheduledAt: z.coerce.date().optional().nullable(),
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
          publishedAt: z.coerce.date().optional().nullable(),
          scheduledAt: z.coerce.date().optional().nullable(),
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

    bulkUpdateStatus: procedure
      .input(z.object({
        ids: z.array(z.string().uuid()).min(1),
        status: z.enum(['draft', 'published', 'archived', 'scheduled']),
        publishedAt: z.coerce.date().optional().nullable(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  clientSiteContents: router({
    listSiteContents: procedure
      .input(z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(10),
        category: z.nativeEnum(SiteContentCategory).optional(),
        languageCode: z.string().min(2).max(10).optional(),
        isFeatured: z.boolean().optional(),
        sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'displayOrder']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse<z.infer<typeof clientSiteContentListResponseSchema>>;
      }),

    getSiteContentBySlug: procedure
      .input(z.object({
        slug: z.string().min(1),
        languageCode: z.string().min(2).max(10).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse<z.infer<typeof clientSiteContentSchema>>;
      }),

    getSiteContentByCode: procedure
      .input(z.object({
        code: z.string().min(1),
        languageCode: z.string().min(2).max(10).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse<z.infer<typeof clientSiteContentSchema>>;
      }),
  }),

  adminSiteContents: router({
    listSiteContents: procedure
      .input(listSiteContentQuerySchema)
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getSiteContentById: procedure
      .input(siteContentIdSchema)
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    createSiteContent: procedure
      .input(createSiteContentSchema)
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateSiteContent: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: updateSiteContentSchema,
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteSiteContent: procedure
      .input(siteContentIdSchema)
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    bulkDeleteSiteContents: procedure
      .input(bulkDeleteSiteContentSchema)
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

  // Admin Mail Provider router
  adminMailProvider: router({
    createProvider: procedure
      .input(z.object({
        name: z.string().min(2).max(255),
        providerType: z.string().max(100).default('smtp'),
        description: z.string().max(1000).optional(),
        smtpHost: z.string().max(255).optional(),
        smtpPort: z.number().int().min(1).max(65535).optional(),
        smtpSecure: z.boolean().optional().default(true),
        smtpUsername: z.string().max(255).optional(),
        smtpPassword: z.string().max(255).optional(),
        apiKey: z.string().max(500).optional(),
        apiSecret: z.string().max(500).optional(),
        apiHost: z.string().max(255).optional(),
        defaultFromEmail: z.string().email().max(255).optional(),
        defaultFromName: z.string().max(255).optional(),
        replyToEmail: z.string().email().max(255).optional(),
        isActive: z.boolean().optional().default(true),
        rateLimit: z.number().int().min(1).optional(),
        maxDailyLimit: z.number().int().min(1).optional(),
        priority: z.number().int().min(1).max(10).optional().default(5),
        config: z.record(z.any()).optional(),
        webhookUrl: z.string().max(500).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getProviders: procedure
      .input(z.object({
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(10),
        search: z.string().max(255).optional(),
        isActive: z.boolean().optional(),
        providerType: z.string().max(100).optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getProviderById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getActiveProviders: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    updateProvider: procedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(255).optional(),
        providerType: z.string().max(100).optional(),
        description: z.string().max(1000).optional(),
        smtpHost: z.string().max(255).optional(),
        smtpPort: z.number().int().min(1).max(65535).optional(),
        smtpSecure: z.boolean().optional(),
        smtpUsername: z.string().max(255).optional(),
        smtpPassword: z.string().max(255).optional(),
        apiKey: z.string().max(500).optional(),
        apiSecret: z.string().max(500).optional(),
        apiHost: z.string().max(255).optional(),
        defaultFromEmail: z.string().email().max(255).optional(),
        defaultFromName: z.string().max(255).optional(),
        replyToEmail: z.string().email().max(255).optional(),
        isActive: z.boolean().optional(),
        rateLimit: z.number().int().min(1).optional(),
        maxDailyLimit: z.number().int().min(1).optional(),
        priority: z.number().int().min(1).max(10).optional(),
        config: z.record(z.any()).optional(),
        webhookUrl: z.string().max(500).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteProvider: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    testConnection: procedure
      .input(z.object({
        id: z.string().uuid(),
        testEmail: z.string().email().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    testConnectionWithData: procedure
      .input(z.object({
        name: z.string().min(2).max(255),
        providerType: z.string().max(100).default('smtp'),
        description: z.string().max(1000).optional(),
        smtpHost: z.string().max(255).optional(),
        smtpPort: z.number().int().min(1).max(65535).optional(),
        smtpSecure: z.boolean().optional().default(true),
        smtpUsername: z.string().max(255).optional(),
        smtpPassword: z.string().max(255).optional(),
        apiKey: z.string().max(500).optional(),
        apiSecret: z.string().max(500).optional(),
        apiHost: z.string().max(255).optional(),
        defaultFromEmail: z.string().email().max(255).optional(),
        defaultFromName: z.string().max(255).optional(),
        replyToEmail: z.string().email().max(255).optional(),
        isActive: z.boolean().optional().default(true),
        rateLimit: z.number().int().min(1).optional(),
        maxDailyLimit: z.number().int().min(1).optional(),
        priority: z.number().int().min(1).max(10).optional().default(5),
        config: z.record(z.any()).optional(),
        webhookUrl: z.string().max(500).optional(),
        testEmail: z.string().email().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Mail Channel Priority router
  adminMailChannelPriority: router({
    createFlow: procedure
      .input(z.object({
        name: z.string().min(2).max(255),
        description: z.string().max(1000).optional(),
        mailProviderId: z.string().uuid(),
        isActive: z.boolean().optional().default(true),
        priority: z.number().int().min(1).max(10).optional().default(5),
        config: z.record(z.any()).optional(),
        mailTemplateId: z.string().uuid().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getFlows: procedure
      .input(z.object({
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(10),
        search: z.string().max(255).optional(),
        isActive: z.boolean().optional(),
        mailProviderId: z.string().uuid().optional(),
        mailTemplateId: z.string().uuid().optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getFlowById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getActiveFlows: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getFlowsByProvider: procedure
      .input(z.object({ mailProviderId: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    updateFlow: procedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(255).optional(),
        description: z.string().max(1000).optional(),
        mailProviderId: z.string().uuid().optional(),
        isActive: z.boolean().optional(),
        priority: z.number().int().min(1).max(10).optional(),
        config: z.record(z.any()).optional(),
        mailTemplateId: z.string().uuid().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteFlow: procedure
      .input(z.object({ id: z.string().uuid() }))
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
        s3CdnUrl: z.string().optional(),
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
  adminThemes: router({
    getThemes: procedure
      .input(themeFiltersSchema)
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    getThemeById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    createTheme: procedure
      .input(createThemeInputSchema)
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    updateTheme: procedure
      .input(updateThemeInputSchema)
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    deleteTheme: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    toggleThemeStatus: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    setDefaultTheme: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

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

  // Admin Translation router
  adminTranslation: router({
    getTranslations: procedure
      .input(z.object({
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(10),
        search: z.string().optional(),
        locale: z.string().optional(),
        namespace: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getTranslationById: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getLocales: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getNamespaces: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    createTranslation: procedure
      .input(z.object({
        key: z.string().min(1).max(255),
        locale: z.string().length(5),
        value: z.string(),
        namespace: z.string().max(100).optional(),
        isActive: z.boolean().optional().default(true),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateTranslation: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          key: z.string().min(1).max(255).optional(),
          locale: z.string().length(5).optional(),
          value: z.string().optional(),
          namespace: z.string().max(100).optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteTranslation: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    toggleTranslationStatus: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Client Language router
  clientLanguage: router({
    getActiveLanguages: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getDefaultLanguage: procedure
      .output(apiResponseSchema)
      .query(() => {
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

    exportProducts: procedure
      .input(z.object({
        format: exportFormatSchema.default('csv'),
        filters: z.record(z.unknown()).optional(),
      }))
      .output(exportJobResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    estimateExportProducts: procedure
      .input(z.object({
        filters: z.record(z.unknown()).optional(),
      }))
      .output(exportEstimateResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    listExportJobs: procedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
        page: z.number().min(1).default(1),
      }))
      .output(exportJobListResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    detail: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getPurchaseHistory: procedure
      .input(z.object({
        productId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    variantDetail: procedure
      .input(z.object({ id: z.string() }))
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

    importFromExcel: procedure
      .input(z.any())
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

    updateVariant: procedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        sku: z.string().nullable().optional(),
        barcode: z.string().nullable().optional(),
        price: z.number().optional(),
        compareAtPrice: z.number().nullable().optional(),
        costPrice: z.number().nullable().optional(),
        stockQuantity: z.number().optional(),
        lowStockThreshold: z.number().nullable().optional(),
        trackInventory: z.boolean().optional(),
        allowBackorders: z.boolean().optional(),
        weight: z.number().nullable().optional(),
        dimensions: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
        variantItems: z.array(z.object({
          attributeId: z.string(),
          attributeValueId: z.string(),
          sortOrder: z.number().optional(),
        })).optional(),
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

    bulkAction: procedure
      .input(z.object({
        ids: z.array(z.string().uuid()).min(1),
        action: z.enum(['activate', 'deactivate', 'delete']),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  clientBrands: router({
    list: procedure
      .input(brandShowcaseRequestSchema.optional())
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  clientNews: router({
    getNews: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(12),
        category: z.string().optional(),
        search: z.string().optional(),
        isActive: z.boolean().default(true),
        sortBy: z.enum(['publishDate', 'createdAt', 'sortOrder']).default('publishDate'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getNewsBySlug: procedure
      .input(z.object({ slug: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getNewsCategories: procedure
      .output(apiResponseSchema)
      .query(() => {
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

    getProductsByIds: procedure
      .input(z.object({
        ids: z.array(z.string().uuid()).min(1),
      }))
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

  // Admin Product Specification Labels router
  adminProductSpecificationLabels: router({
    search: procedure
      .input(searchSpecificationLabelsSchema)
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(createSpecificationLabelSchema)
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
        eventKey: z.enum([
          'user.registered',
          'user.verified',
          'order.created',
          'order.confirmed',
          'order.shipped',
          'order.delivered',
          'order.cancelled',
          'order.refunded',
          'system.announcement',
          'marketing.campaign',
          'export.completed',
          'export.failed',
          'custom.manual',
        ]).optional(),
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
        eventKey: z.enum([
          'user.registered',
          'user.verified',
          'order.created',
          'order.confirmed',
          'order.shipped',
          'order.delivered',
          'order.cancelled',
          'order.refunded',
          'system.announcement',
          'marketing.campaign',
          'export.completed',
          'export.failed',
          'custom.manual',
        ]).optional(),
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

    listEventFlows: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        channel: z.enum(['push', 'email', 'in_app', 'sms', 'telegram']).optional(),
        eventKey: z.enum([
          'user.registered',
          'user.verified',
          'order.created',
          'order.confirmed',
          'order.shipped',
          'order.delivered',
          'order.cancelled',
          'order.refunded',
          'system.announcement',
          'marketing.campaign',
          'export.completed',
          'export.failed',
          'custom.manual',
        ]).optional(),
        isActive: z.boolean().optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getEventFlow: procedure
      .input(z.object({
        id: z.string().uuid().optional(),
        eventKey: z.enum([
          'user.registered',
          'user.verified',
          'order.created',
          'order.confirmed',
          'order.shipped',
          'order.delivered',
          'order.cancelled',
          'order.refunded',
          'system.announcement',
          'marketing.campaign',
          'export.completed',
          'export.failed',
          'custom.manual',
        ]).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    upsertEventFlow: procedure
      .input(z.object({
        id: z.string().uuid().optional(),
        eventKey: z.enum([
          'user.registered',
          'user.verified',
          'order.created',
          'order.confirmed',
          'order.shipped',
          'order.delivered',
          'order.cancelled',
          'order.refunded',
          'system.announcement',
          'marketing.campaign',
          'export.completed',
          'export.failed',
          'custom.manual',
        ]),
        displayName: z.string().min(3).max(150),
        description: z.string().max(500).optional(),
        channelPreferences: z.array(z.enum(['push', 'email', 'in_app', 'sms', 'telegram'])).min(1),
        includeActor: z.boolean().optional(),
        recipientUserIds: z.array(z.string().uuid()).optional(),
        ccUserIds: z.array(z.string().uuid()).optional(),
        bccUserIds: z.array(z.string().uuid()).optional(),
        ccEmails: z.array(z.string().email()).optional(),
        bccEmails: z.array(z.string().email()).optional(),
        mailTemplateIds: z.array(z.string().uuid()).optional(),
        channelMetadata: z.record(z.unknown()).optional(),
        isActive: z.boolean().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteEventFlow: procedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    searchNotificationRecipients: procedure
      .input(z.object({
        query: z.string().default(''),
        limit: z.number().min(1).max(50).default(10),
      }))
      .output(apiResponseSchema)
      .query(() => {
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
        channel: z.enum(['push', 'email', 'in_app', 'sms', 'telegram']),
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
        channel: z.enum(['push', 'email', 'in_app', 'sms', 'telegram']),
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
          channel: z.enum(['push', 'email', 'in_app', 'sms', 'telegram']),
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
        channel: z.enum(['push', 'email', 'in_app', 'sms', 'telegram']),
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
        channel: z.enum(['push', 'email', 'in_app', 'sms', 'telegram']),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    canSendNotification: procedure
      .input(z.object({
        userId: z.string().uuid(),
        type: z.enum(['info', 'success', 'warning', 'error', 'system', 'product', 'order', 'user']),
        channel: z.enum(['push', 'email', 'in_app', 'sms', 'telegram']),
        timezone: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  adminNotificationChannels: router({
    listConfigs: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    upsertConfig: procedure
      .input(z.object({
        eventKey: z.enum([
          'user.registered',
          'user.verified',
          'order.created',
          'order.confirmed',
          'order.shipped',
          'order.delivered',
          'order.cancelled',
          'order.refunded',
          'system.announcement',
          'marketing.campaign',
          'export.completed',
          'export.failed',
          'custom.manual',
        ]),
        displayName: z.string().min(3).max(150),
        description: z.string().max(500).optional(),
        allowedChannels: z.array(z.enum(['push', 'email', 'in_app', 'sms', 'telegram'])).min(1),
        isActive: z.boolean().optional(),
        metadata: z.record(z.unknown()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateAllowedChannels: procedure
      .input(z.object({
        eventKey: z.enum([
          'user.registered',
          'user.verified',
          'order.created',
          'order.confirmed',
          'order.shipped',
          'order.delivered',
          'order.cancelled',
          'order.refunded',
          'system.announcement',
          'marketing.campaign',
          'export.completed',
          'export.failed',
          'custom.manual',
        ]),
        channels: z.array(z.enum(['push', 'email', 'in_app', 'sms', 'telegram'])).min(1),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    initializeDefaults: procedure
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),



  adminNotificationTelegramConfigs: router({
    list: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(z.object({
        name: z.string().min(3).max(150),
        botUsername: z.string().min(3).max(150),
        botToken: z.string().min(10),
        chatId: z.string().min(1).max(120),
        threadId: z.number().int().min(1).nullable().optional(),
        description: z.string().max(500).optional(),
        isActive: z.boolean().optional(),
        metadata: z.record(z.unknown()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(3).max(150).optional(),
        botUsername: z.string().min(3).max(150).optional(),
        botToken: z.string().min(10).optional(),
        chatId: z.string().min(1).max(120).optional(),
        threadId: z.number().int().min(1).nullable().optional(),
        description: z.string().max(500).optional(),
        isActive: z.boolean().optional(),
        metadata: z.record(z.unknown()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    delete: procedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
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
    getCountries: procedure
      .output(z.array(adminAddressCountrySchema))
      .query(() => {
        return [];
      }),
    getAdministrativeDivisions: procedure
      .input(z.object({
        countryId: z.string(),
        type: z.nativeEnum(AdministrativeDivisionType).optional(),
      }))
      .output(z.array(adminAdministrativeDivisionSchema))
      .query(() => {
        return [];
      }),
    getAdministrativeDivisionsByParentId: procedure
      .input(z.object({ parentId: z.string() }))
      .output(z.array(adminAdministrativeDivisionSchema))
      .query(() => {
        return [];
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

    estimateExportOrders: procedure
      .input(z.object({
        filters: z.record(z.any()).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    exportOrders: procedure
      .input(z.object({
        format: exportFormatSchema.default('csv'),
        filters: z.record(z.any()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    listExportJobs: procedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
        page: z.number().min(1).default(1),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Payment Methods router
  adminPaymentMethods: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET', 'CASH', 'CHECK', 'CRYPTOCURRENCY', 'BUY_NOW_PAY_LATER', 'OTHER']).optional(),
        isActive: z.boolean().optional(),
        currency: z.string().optional(),
        minAmount: z.number().min(0).optional(),
        maxAmount: z.number().min(0).optional(),
      }).optional())
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    active: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    forAmount: procedure
      .input(z.object({
        amount: z.number().min(0.01),
        currency: z.string().optional(),
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
        name: z.string().min(1).max(255),
        type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET', 'CASH', 'CHECK', 'CRYPTOCURRENCY', 'BUY_NOW_PAY_LATER', 'OTHER']),
        description: z.string().optional(),
        isActive: z.boolean().optional().default(true),
        sortOrder: z.number().int().min(0).optional(),
        processingFee: z.number().min(0).optional().default(0),
        processingFeeType: z.enum(['FIXED', 'PERCENTAGE']).optional().default('FIXED'),
        minAmount: z.number().min(0).optional(),
        maxAmount: z.number().min(0).optional(),
        supportedCurrencies: z.array(z.string()).optional(),
        iconUrl: z.string().url().optional(),
        isDefault: z.boolean().optional().default(false),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().min(1).max(255).optional(),
          type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET', 'CASH', 'CHECK', 'CRYPTOCURRENCY', 'BUY_NOW_PAY_LATER', 'OTHER']).optional(),
          description: z.string().optional(),
          isActive: z.boolean().optional(),
          sortOrder: z.number().int().min(0).optional(),
          processingFee: z.number().min(0).optional(),
          processingFeeType: z.enum(['FIXED', 'PERCENTAGE']).optional(),
          minAmount: z.number().min(0).optional(),
          maxAmount: z.number().min(0).optional(),
          supportedCurrencies: z.array(z.string()).optional(),
          iconUrl: z.string().url().optional(),
          isDefault: z.boolean().optional(),
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

    setDefault: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    toggleActive: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    reorder: procedure
      .input(z.object({
        items: z.array(z.object({
          id: z.string().uuid(),
          sortOrder: z.number().int().min(0),
        })),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    calculatePayment: procedure
      .input(z.object({
        paymentMethodId: z.string().uuid(),
        amount: z.number().min(0.01),
        currency: z.string().optional().default('USD'),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    stats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    providerConfig: procedure
      .input(z.object({
        paymentMethodId: z.string().uuid(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    saveProviderConfig: procedure
      .input(z.object({
        id: z.string().uuid().optional(),
        paymentMethodId: z.string().uuid(),
        providerKey: z.string().min(1).max(100),
        displayName: z.string().min(1).max(255),
        providerType: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        environment: z.string().min(2).max(50).optional(),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        checksumKey: z.string().optional(),
        publicKey: z.string().optional(),
        webhookUrl: z.string().optional(),
        webhookSecret: z.string().optional(),
        callbackUrl: z.string().optional(),
        credentials: z.record(z.any()).optional(),
        settings: z.record(z.any()).optional(),
        metadata: z.record(z.any()).optional(),
        isActive: z.boolean().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    deleteProviderConfig: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Delivery Methods router
  adminDeliveryMethods: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        type: z.enum(['STANDARD', 'EXPRESS', 'OVERNIGHT', 'SAME_DAY', 'PICKUP', 'DIGITAL', 'COURIER', 'FREIGHT', 'OTHER']).optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
        costCalculationType: z.enum(['FIXED', 'WEIGHT_BASED', 'DISTANCE_BASED', 'FREE']).optional(),
        trackingEnabled: z.boolean().optional(),
        insuranceEnabled: z.boolean().optional(),
        signatureRequired: z.boolean().optional(),
        search: z.string().optional(),
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

    getActive: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getByType: procedure
      .input(z.object({ type: z.enum(['STANDARD', 'EXPRESS', 'OVERNIGHT', 'SAME_DAY', 'PICKUP', 'DIGITAL', 'COURIER', 'FREIGHT', 'OTHER']) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(z.object({
        name: z.string().min(1).max(255),
        type: z.enum(['STANDARD', 'EXPRESS', 'OVERNIGHT', 'SAME_DAY', 'PICKUP', 'DIGITAL', 'COURIER', 'FREIGHT', 'OTHER']),
        description: z.string().optional(),
        isActive: z.boolean().optional().default(true),
        isDefault: z.boolean().optional().default(false),
        sortOrder: z.number().int().min(0).optional(),
        deliveryCost: z.number().min(0).optional().default(0),
        costCalculationType: z.enum(['FIXED', 'WEIGHT_BASED', 'DISTANCE_BASED', 'FREE']).optional().default('FIXED'),
        freeDeliveryThreshold: z.number().min(0).optional(),
        minDeliveryTimeHours: z.number().int().min(0).optional(),
        maxDeliveryTimeHours: z.number().int().min(0).optional(),
        weightLimitKg: z.number().min(0).optional(),
        sizeLimitCm: z.string().max(50).optional(),
        coverageAreas: z.array(z.string()).optional(),
        supportedPaymentMethods: z.array(z.string().uuid()).optional(),
        providerName: z.string().max(255).optional(),
        providerApiConfig: z.record(z.any()).optional(),
        trackingEnabled: z.boolean().optional().default(false),
        insuranceEnabled: z.boolean().optional().default(false),
        signatureRequired: z.boolean().optional().default(false),
        iconUrl: z.string().max(512).url().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().min(1).max(255).optional(),
          type: z.enum(['STANDARD', 'EXPRESS', 'OVERNIGHT', 'SAME_DAY', 'PICKUP', 'DIGITAL', 'COURIER', 'FREIGHT', 'OTHER']).optional(),
          description: z.string().optional(),
          isActive: z.boolean().optional(),
          isDefault: z.boolean().optional(),
          sortOrder: z.number().int().min(0).optional(),
          deliveryCost: z.number().min(0).optional(),
          costCalculationType: z.enum(['FIXED', 'WEIGHT_BASED', 'DISTANCE_BASED', 'FREE']).optional(),
          freeDeliveryThreshold: z.number().min(0).optional(),
          minDeliveryTimeHours: z.number().int().min(0).optional(),
          maxDeliveryTimeHours: z.number().int().min(0).optional(),
          weightLimitKg: z.number().min(0).optional(),
          sizeLimitCm: z.string().max(50).optional(),
          coverageAreas: z.array(z.string()).optional(),
          supportedPaymentMethods: z.array(z.string().uuid()).optional(),
          providerName: z.string().max(255).optional(),
          providerApiConfig: z.record(z.any()).optional(),
          trackingEnabled: z.boolean().optional(),
          insuranceEnabled: z.boolean().optional(),
          signatureRequired: z.boolean().optional(),
          iconUrl: z.string().max(512).url().optional(),
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

    setDefault: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    toggleActive: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    reorder: procedure
      .input(z.object({
        items: z.array(z.object({
          id: z.string().uuid(),
          sortOrder: z.number().int().min(0),
        })),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    calculateDelivery: procedure
      .input(z.object({
        deliveryMethodId: z.string().uuid(),
        orderAmount: z.number().min(0),
        weight: z.number().min(0).optional(),
        distance: z.number().min(0).optional(),
        coverageArea: z.string().optional(),
        paymentMethodId: z.string().uuid().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getQuotes: procedure
      .input(z.object({
        orderAmount: z.number().min(0),
        weight: z.number().min(0).optional(),
        distance: z.number().min(0).optional(),
        coverageArea: z.string().optional(),
        paymentMethodId: z.string().uuid().optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    stats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Admin Support Clients router
  adminSupportClients: router({
    getAll: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        type: z.enum(['MESSENGER', 'ZALO', 'WHATSAPP', 'TELEGRAM', 'VIBER', 'SKYPE', 'LINE', 'WECHAT', 'KAKAOTALK', 'EMAIL', 'PHONE', 'CUSTOM']).optional(),
        isActive: z.boolean().optional(),
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

    getDefault: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    create: procedure
      .input(z.object({
        name: z.string().min(1).max(255),
        type: z.enum(['MESSENGER', 'ZALO', 'WHATSAPP', 'TELEGRAM', 'VIBER', 'SKYPE', 'LINE', 'WECHAT', 'KAKAOTALK', 'EMAIL', 'PHONE', 'CUSTOM']),
        description: z.string().optional(),
        configuration: z.record(z.any()),
        widgetSettings: z.record(z.any()),
        iconUrl: z.string().url().optional().or(z.literal('')),
        targetAudience: z.record(z.any()).optional(),
        scheduleEnabled: z.boolean().default(false),
        scheduleStart: z.date().optional(),
        scheduleEnd: z.date().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    update: procedure
      .input(z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          isActive: z.boolean().optional(),
          configuration: z.record(z.any()).optional(),
          widgetSettings: z.record(z.any()).optional(),
          iconUrl: z.string().url().optional().or(z.literal('')),
          targetAudience: z.record(z.any()).optional(),
          scheduleEnabled: z.boolean().optional(),
          scheduleStart: z.date().optional(),
          scheduleEnd: z.date().optional(),
          sortOrder: z.number().int().min(0).optional(),
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

    setAsDefault: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateSortOrder: procedure
      .input(z.array(z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int().min(0),
      })))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    duplicate: procedure
      .input(z.object({
        id: z.string().uuid(),
        newName: z.string().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getWidgetScripts: procedure
      .input(z.object({
        context: z.object({
          country: z.string().optional(),
          language: z.string().optional(),
          deviceType: z.string().optional(),
          currentPage: z.string().optional(),
        }).optional(),
      }).optional())
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getAvailableClients: procedure
      .input(z.object({
        context: z.object({
          country: z.string().optional(),
          language: z.string().optional(),
          deviceType: z.string().optional(),
          currentPage: z.string().optional(),
        }).optional(),
      }).optional())
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getStats: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    validateConfiguration: procedure
      .input(z.object({
        type: z.enum(['MESSENGER', 'ZALO', 'WHATSAPP', 'TELEGRAM', 'VIBER', 'SKYPE', 'LINE', 'WECHAT', 'KAKAOTALK', 'EMAIL', 'PHONE', 'CUSTOM']),
        configuration: z.record(z.any()),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),

    getRecommendedSettings: procedure
      .input(z.object({
        type: z.enum(['MESSENGER', 'ZALO', 'WHATSAPP', 'TELEGRAM', 'VIBER', 'SKYPE', 'LINE', 'WECHAT', 'KAKAOTALK', 'EMAIL', 'PHONE', 'CUSTOM']),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getTypes: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getWidgetPositions: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    getWidgetThemes: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),

    testAvailability: procedure
      .input(z.object({
        id: z.string().uuid(),
        context: z.object({
          country: z.string().optional(),
          language: z.string().optional(),
          deviceType: z.string().optional(),
          currentPage: z.string().optional(),
        }).optional(),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Client Settings router
  settings: router({
    getPublicSettings: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    getPublicSetting: procedure
      .input(z.object({ key: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  orderFulfillments: router({
    getAll: procedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
          search: z.string().optional(),
          status: fulfillmentStatusSchema.optional(),
          priorityLevel: fulfillmentPrioritySchema.optional(),
          shippingProviderId: z.string().optional(),
          hasTrackingNumber: z.boolean().optional(),
          isOverdue: z.boolean().optional(),
          orderId: z.string().optional(),
        })
      )
      .output(z.any())
      .query(() => {
        return {} as ApiResponse;
      }),

    getById: procedure
      .input(z.object({ id: z.string() }))
      .output(z.any())
      .query(() => {
        return {} as ApiResponse;
      }),

    updateStatus: procedure
      .input(
        z.object({
          id: z.string(),
          status: fulfillmentStatusSchema,
          notes: z.string().optional(),
        })
      )
      .output(z.any())
      .mutation(() => {
        return {} as ApiResponse;
      }),

    updateTracking: procedure
      .input(
        z.object({
          id: z.string(),
          trackingNumber: z.string().min(1),
        })
      )
      .output(z.any())
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Client Menus router
  clientMenus: router({
    getByGroup: procedure
      .input(z.object({
        menuGroup: z.string().min(1),
        locale: z.string().optional().default('en')
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    getTree: procedure
      .input(z.object({
        menuGroup: z.string().min(1),
        locale: z.string().optional().default('en')
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  clientCurrency: router({
    getDefaultCurrency: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  // Loyalty routers
  adminLoyaltyTiers: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        sortBy: z.enum(['name', 'minPoints', 'sortOrder', 'createdAt']).default('sortOrder'),
        sortOrder: z.enum(['ASC', 'DESC']).default('ASC'),
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
        name: z.string().min(1),
        description: z.string().optional(),
        minPoints: z.number().min(0),
        maxPoints: z.number().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        benefits: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    update: procedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        minPoints: z.number().min(0).optional(),
        maxPoints: z.number().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        benefits: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
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
    active: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  adminLoyaltyRewards: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        type: z.enum(['discount', 'free_shipping', 'free_product', 'cashback', 'gift_card', 'exclusive_access']).optional(),
        isActive: z.boolean().optional(),
        sortBy: z.enum(['name', 'pointsRequired', 'sortOrder', 'createdAt']).default('sortOrder'),
        sortOrder: z.enum(['ASC', 'DESC']).default('ASC'),
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
        name: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(['discount', 'free_shipping', 'free_product', 'cashback', 'gift_card', 'exclusive_access']),
        pointsRequired: z.number().min(0),
        value: z.number().optional(),
        discountType: z.enum(['percentage', 'fixed']).optional(),
        conditions: z.string().optional(),
        isActive: z.boolean().optional(),
        isLimited: z.boolean().optional(),
        totalQuantity: z.number().optional(),
        remainingQuantity: z.number().optional(),
        startsAt: z.date().optional(),
        endsAt: z.date().optional(),
        imageUrl: z.string().optional(),
        termsConditions: z.string().optional(),
        tierRestrictions: z.array(z.string()).optional(),
        autoApply: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    update: procedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(['discount', 'free_shipping', 'free_product', 'cashback', 'gift_card', 'exclusive_access']).optional(),
        pointsRequired: z.number().min(0).optional(),
        value: z.number().optional(),
        discountType: z.enum(['percentage', 'fixed']).optional(),
        conditions: z.string().optional(),
        isActive: z.boolean().optional(),
        isLimited: z.boolean().optional(),
        totalQuantity: z.number().optional(),
        remainingQuantity: z.number().optional(),
        startsAt: z.date().optional(),
        endsAt: z.date().optional(),
        imageUrl: z.string().optional(),
        termsConditions: z.string().optional(),
        tierRestrictions: z.array(z.string()).optional(),
        autoApply: z.boolean().optional(),
        sortOrder: z.number().optional(),
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
    active: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    availableForCustomer: procedure
      .input(z.object({ customerPoints: z.number().min(0) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  adminLoyaltyTransactions: router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        customerId: z.string().optional(),
        type: z.enum(['earned', 'redeemed', 'expired', 'adjusted', 'referral_bonus']).optional(),
        orderId: z.string().optional(),
        rewardId: z.string().optional(),
        sortBy: z.enum(['createdAt', 'points', 'balanceAfter']).default('createdAt'),
        sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
        createdFrom: z.string().optional(),
        createdTo: z.string().optional(),
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
        customerId: z.string(),
        points: z.number(),
        type: z.enum(['earned', 'redeemed', 'expired', 'adjusted', 'referral_bonus']),
        description: z.string().min(1),
        orderId: z.string().optional(),
        rewardId: z.string().optional(),
        balanceAfter: z.number(),
        expiresAt: z.date().optional(),
        metadata: z.record(z.any()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    adjustPoints: procedure
      .input(z.object({
        customerId: z.string(),
        points: z.number(),
        description: z.string().min(1),
        metadata: z.record(z.any()).optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    customerTransactions: procedure
      .input(z.object({ customerId: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    customerBalance: procedure
      .input(z.object({ customerId: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    orderTransactions: procedure
      .input(z.object({ orderId: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    stats: procedure
      .input(z.object({ days: z.number().min(1).max(365).default(30) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    topCustomers: procedure
      .input(z.object({ days: z.number().min(1).max(365).default(30), limit: z.number().min(1).max(50).default(10) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    popularRewards: procedure
      .input(z.object({ days: z.number().min(1).max(365).default(30), limit: z.number().min(1).max(50).default(10) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    recent: procedure
      .input(z.object({ days: z.number().min(1).max(365).default(30), limit: z.number().min(1).max(100).default(20) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  adminLoyaltyStats: router({
    get: procedure
      .input(z.object({ days: z.number().min(1).max(365).default(30) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    dashboard: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    customerEngagement: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    pointsFlow: procedure
      .input(z.object({ days: z.number().min(1).max(365).default(30) }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    tierDistribution: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    rewardPerformance: procedure
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
  }),

  adminCurrency: router({
    createCurrency: procedure
      .input(z.object({
        code: z.string().min(3).max(3),
        name: z.string().min(2).max(100),
        symbol: z.string().min(1).max(10),
        exchangeRate: z.number().positive().optional(),
        decimalPlaces: z.number().int().min(0).max(8).optional(),
        format: z.string().min(3).max(30).optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    getCurrencies: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as any;
      }),
    deleteCurrency: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    toggleCurrencyStatus: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    setDefaultCurrency: procedure
      .input(z.object({ id: z.string().uuid() }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  clientVisitorStats: router({
    getPublicStats: procedure
      .input(z.object({
        days: z.number().min(1).max(30).default(7),
        limit: z.number().min(1).max(10).default(5),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    trackStorefrontVisitor: procedure
      .input(z.object({
        fingerprint: z.string().min(8),
        sessionId: z.string().optional(),
        pageUrl: z.string().min(1),
        pageTitle: z.string().optional(),
        referrer: z.string().optional(),
        timeOnPageSeconds: z.number().min(0).optional(),
        viewportWidth: z.number().min(0).optional(),
        viewportHeight: z.number().min(0).optional(),
        scrollDepthPercent: z.number().min(0).max(100).optional(),
        language: z.string().optional(),
        timezoneOffset: z.number().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

  // Client Orders router (for storefront)
  clientOrders: router({
    lookup: procedure
      .input(z.object({
        orderNumber: z.string().min(1),
        emailOrPhone: z.string().min(1),
      }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']).optional(),
        paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
        sortBy: z.enum(['orderDate', 'totalAmount', 'status']).default('orderDate'),
        sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as any;
      }),
    detail: procedure
      .input(z.object({ id: z.string() }))
      .output(apiResponseSchema)
      .query(() => {
        return {} as ApiResponse;
      }),
    create: procedure
      .input(z.object({
        email: z.string().email(),
        shippingAddress: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          company: z.string().optional(),
          address1: z.string().min(1),
          address2: z.string().optional(),
          city: z.string().min(1),
          state: z.string().min(1),
          postalCode: z.string().optional(),
          country: z.string().min(1),
          phone: z.string().optional(),
        }),
        billingAddress: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          company: z.string().optional(),
          address1: z.string().min(1),
          address2: z.string().optional(),
          city: z.string().min(1),
          state: z.string().min(1),
          postalCode: z.string().optional(),
          country: z.string().min(1),
          phone: z.string().optional(),
        }).optional(),
        shippingMethodId: z.string().optional(),
        paymentMethod: z.object({
          type: z.string().min(1),
          cardholderName: z.string().optional(),
          last4: z.string().optional(),
          provider: z.string().optional(),
          reference: z.string().optional(),
          paymentMethodId: z.string().uuid().optional(),
          metadata: z.record(z.any()).optional(),
        }),
        orderNotes: z.string().optional(),
        items: z.array(z.object({
          productId: z.string(),
          productVariantId: z.string().optional(),
          quantity: z.number().min(1),
          unitPrice: z.number().min(0).optional(),
          discountAmount: z.number().min(0).optional(),
          taxAmount: z.number().min(0).optional(),
          productName: z.string().optional(),
          productSku: z.string().optional(),
          variantName: z.string().optional(),
          variantSku: z.string().optional(),
          productImage: z.string().optional(),
          productAttributes: z.record(z.string()).optional(),
        })).min(1),
        totals: z.object({
          subtotal: z.number().min(0),
          taxAmount: z.number().min(0).optional(),
          shippingCost: z.number().min(0).optional(),
          discountAmount: z.number().min(0).optional(),
          totalAmount: z.number().min(0).optional(),
          currency: z.string().max(3).optional(),
        }).optional(),
        agreeToMarketing: z.boolean().optional(),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
    recent: procedure
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as any;
      }),
    active: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      }))
      .output(paginatedResponseSchema)
      .query(() => {
        return {} as any;
      }),
    cancelOrder: procedure
      .input(z.object({
        id: z.string(),
        reason: z.string().min(1).max(500),
      }))
      .output(apiResponseSchema)
      .mutation(() => {
        return {} as ApiResponse;
      }),
  }),

});

// For nestjs-trpc, the actual router structure is generated at runtime
// Use a permissive type that allows access to all router endpoints
export type AppRouter = typeof appRouter;
