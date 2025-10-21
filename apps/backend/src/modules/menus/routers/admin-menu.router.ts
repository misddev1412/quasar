import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { MenuService } from '../services/menu.service';
import { ResponseService } from '../../shared/services/response.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { MenuType, MenuTarget } from '@shared/enums/menu.enums';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { AuthenticatedContext } from '../../../trpc/context';
import { CreateMenuDto, ReorderMenuDto } from '../dto/menu.dto';

const MenuTranslationSchema = z.object({
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
  translations: z.record(MenuTranslationSchema),
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

const listInputSchema = z.object({
  menuGroup: z.string().optional(),
});

const byIdInputSchema = z.object({
  id: z.string().uuid(),
});

const updateInputSchema = z.object({
  id: z.string().uuid(),
  data: updateMenuSchema,
});

const deleteInputSchema = z.object({
  id: z.string().uuid(),
});

const childrenInputSchema = z.object({
  parentId: z.string().uuid().optional(),
  menuGroup: z.string().min(1),
});

const nextPositionInputSchema = z.object({
  menuGroup: z.string().min(1),
  parentId: z.string().uuid().optional(),
});

@Router({ alias: 'adminMenus' })
@Injectable()
export class AdminMenuRouter {
  constructor(
    @Inject(MenuService)
    private readonly menuService: MenuService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    input: listInputSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async list(@Input() input: z.infer<typeof listInputSchema>) {
    try {
      const menus = input.menuGroup
        ? await this.menuService.findByMenuGroup(input.menuGroup)
        : await this.menuService.findAll();

      return this.responseService.createReadResponse(ModuleCode.MENU, 'menus', menus);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.MENU,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve menus',
        error,
      );
    }
  }

  @Query({
    input: byIdInputSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async byId(@Input() input: z.infer<typeof byIdInputSchema>) {
    try {
      const menu = await this.menuService.findById(input.id);
      return this.responseService.createReadResponse(ModuleCode.MENU, 'menu', menu);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.MENU,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        'Menu not found',
        error,
      );
    }
  }

  @Query({
    input: z.object({ menuGroup: z.string().min(1) }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async tree(@Input() input: { menuGroup: string }) {
    try {
      const menus = await this.menuService.getMenuTree(input.menuGroup);
      return this.responseService.createReadResponse(ModuleCode.MENU, 'menuTree', menus);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.MENU,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve menu tree',
        error,
      );
    }
  }

  @Query({
    input: childrenInputSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async children(@Input() input: z.infer<typeof childrenInputSchema>) {
    try {
      const children = await this.menuService.getChildrenTreeByParent(input.menuGroup, input.parentId);
      return this.responseService.createReadResponse(ModuleCode.MENU, 'menuChildren', children);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.MENU,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve menu children',
        error,
      );
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async groups() {
    try {
      const groups = await this.menuService.getMenuGroups();
      return this.responseService.createReadResponse(ModuleCode.MENU, 'menuGroups', groups);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.MENU,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve menu groups',
        error,
      );
    }
  }

  @Query({
    input: z.object({
      menuGroup: z.string().optional(),
    }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async statistics(@Input() input: { menuGroup?: string }) {
    try {
      const statistics = await this.menuService.getStatistics(input.menuGroup);
      return this.responseService.createReadResponse(ModuleCode.MENU, 'menuStatistics', statistics);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.MENU,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve menu statistics',
        error,
      );
    }
  }

  @Mutation({
    input: createMenuSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async create(@Input() input: z.infer<typeof createMenuSchema>, @Ctx() context: AuthenticatedContext) {
    try {
      const menu = await this.menuService.create(input as CreateMenuDto);
      return this.responseService.createCreatedResponse(ModuleCode.MENU, 'menu', menu);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.MENU,
        OperationCode.CREATE,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to create menu',
        error,
      );
    }
  }

  @Mutation({
    input: updateInputSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async update(@Input() input: z.infer<typeof updateInputSchema>, @Ctx() context: AuthenticatedContext) {
    try {
      const menu = await this.menuService.update(input.id, input.data);
      return this.responseService.createUpdatedResponse(ModuleCode.MENU, 'menu', menu);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.MENU,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to update menu',
        error,
      );
    }
  }

  @Mutation({
    input: deleteInputSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async delete(@Input() input: z.infer<typeof deleteInputSchema>, @Ctx() context: AuthenticatedContext) {
    try {
      await this.menuService.delete(input.id);
      return this.responseService.createDeletedResponse(ModuleCode.MENU, 'menu');
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.MENU,
        OperationCode.DELETE,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to delete menu',
        error,
      );
    }
  }

  @Mutation({
    input: reorderMenuSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async reorder(@Input() input: z.infer<typeof reorderMenuSchema>, @Ctx() context: AuthenticatedContext) {
    try {
      const menus = await this.menuService.reorder(input.menuGroup, input.items as ReorderMenuDto[]);
      return this.responseService.createUpdatedResponse(ModuleCode.MENU, 'menus', menus);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.MENU,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to reorder menus',
        error,
      );
    }
  }

  @Query({
    input: nextPositionInputSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getNextPosition(@Input() input: z.infer<typeof nextPositionInputSchema>) {
    try {
      const position = await this.menuService.getNextPosition(input.menuGroup, input.parentId);
      return this.responseService.createReadResponse(ModuleCode.MENU, 'nextPosition', position);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.MENU,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to get next position',
        error,
      );
    }
  }
}