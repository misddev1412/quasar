import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminThemesService } from '../services/admin-themes.service';
import { ResponseService } from '../../shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';
import { ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { THEME_MODES } from '../dto/theme.dto';
import type { CreateThemeDto, UpdateThemeDto } from '../dto/theme.dto';

const hexColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
  message: 'Color must be a valid hex value (e.g. #000000)',
});

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

const themeModeSchema = z.enum(THEME_MODES);

const themeFiltersSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(50).optional().default(12),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  mode: themeModeSchema.optional(),
});

const createThemeSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(160).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  mode: themeModeSchema.optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  colors: themeColorSchema,
});

const updateThemeSchema = z.object({
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

@Router({ alias: 'adminThemes' })
@Injectable()
export class AdminThemesRouter {
  constructor(
    @Inject(AdminThemesService)
    private readonly adminThemesService: AdminThemesService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: themeFiltersSchema,
    output: paginatedResponseSchema,
  })
  async getThemes(@Input() filters: z.infer<typeof themeFiltersSchema>) {
    try {
      const result = await this.adminThemesService.getThemes(filters);
      const paginated = {
        items: result.data,
        ...result.meta,
      };
      return this.responseService.createTrpcSuccess(paginated);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to load themes',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getThemeById(@Input() input: { id: string }) {
    try {
      const theme = await this.adminThemesService.getThemeById(input.id);
      return this.responseService.createTrpcSuccess(theme);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to load theme',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createThemeSchema,
    output: apiResponseSchema,
  })
  async createTheme(@Input() input: CreateThemeDto) {
    try {
      const theme = await this.adminThemesService.createTheme(input);
      return this.responseService.createTrpcSuccess(theme);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to create theme',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateThemeSchema,
    output: apiResponseSchema,
  })
  async updateTheme(@Input() input: { id: string; data: UpdateThemeDto }) {
    try {
      const theme = await this.adminThemesService.updateTheme(input.id, input.data);
      return this.responseService.createTrpcSuccess(theme);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to update theme',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async deleteTheme(@Input() input: { id: string }) {
    try {
      await this.adminThemesService.deleteTheme(input.id);
      return this.responseService.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.DELETE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to delete theme',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async toggleThemeStatus(@Input() input: { id: string }) {
    try {
      const theme = await this.adminThemesService.toggleThemeStatus(input.id);
      return this.responseService.createTrpcSuccess(theme);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to toggle theme status',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async setDefaultTheme(@Input() input: { id: string }) {
    try {
      const theme = await this.adminThemesService.setDefaultTheme(input.id);
      return this.responseService.createTrpcSuccess(theme);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to update default theme',
      );
    }
  }
}
