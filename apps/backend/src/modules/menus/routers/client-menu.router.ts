import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { MenuService } from '../services/menu.service';
import { ResponseService } from '../../shared/services/response.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

const getByGroupInputSchema = z.object({
  menuGroup: z.string().min(1),
  locale: z.string().optional().default('en')
});

const getTreeInputSchema = z.object({
  menuGroup: z.string().min(1),
  locale: z.string().optional().default('en')
});

@Router({ alias: 'clientMenus' })
@Injectable()
export class ClientMenuRouter {
  constructor(
    @Inject(MenuService)
    private readonly menuService: MenuService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    input: getByGroupInputSchema,
    output: apiResponseSchema,
  })
  async getByGroup(@Input() input: z.infer<typeof getByGroupInputSchema>) {
    try {
      const menus = await this.menuService.findByMenuGroup(input.menuGroup);

      // Filter only enabled menus and exclude sensitive data
      const filteredMenus = menus
        .filter(menu => menu.isEnabled)
        .map(menu => ({
          id: menu.id,
          menuGroup: menu.menuGroup,
          type: menu.type,
          url: menu.url,
          referenceId: menu.referenceId,
          target: menu.target,
          position: menu.position,
          isEnabled: menu.isEnabled,
          icon: menu.icon,
          textColor: menu.textColor,
          backgroundColor: menu.backgroundColor,
          config: menu.config,
          isMegaMenu: menu.isMegaMenu,
          megaMenuColumns: menu.megaMenuColumns,
          parentId: menu.parent?.id || null,
          translations: menu.translations?.filter(t => t.locale === input.locale) || [],
          createdAt: menu.createdAt,
          updatedAt: menu.updatedAt,
          children: menu.children?.filter(child => child.isEnabled) || [],
        }));

      return this.responseService.createReadResponse(ModuleCode.MENU, 'data', {
        items: filteredMenus,
        total: filteredMenus.length,
        page: 1,
        limit: filteredMenus.length,
      });
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
    input: getTreeInputSchema,
    output: apiResponseSchema,
  })
  async getTree(@Input() input: z.infer<typeof getTreeInputSchema>) {
    try {
      const menuTree = await this.menuService.getMenuTree(input.menuGroup);

      // Filter only enabled menus and translations for the specified locale
      const filterTreeByLocaleAndEnabled = (nodes: any[]): any[] => {
        return nodes
          .filter(node => node.isEnabled)
          .map(node => ({
            ...node,
            translations: node.translations?.filter((t: any) => t.locale === input.locale) || [],
            children: filterTreeByLocaleAndEnabled(node.children || []),
          }));
      };

      const filteredTree = filterTreeByLocaleAndEnabled(menuTree);

      return this.responseService.createReadResponse(ModuleCode.MENU, 'data', filteredTree);
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
}
