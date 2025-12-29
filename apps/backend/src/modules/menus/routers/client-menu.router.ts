import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { MenuService } from '../services/menu.service';
import { ResponseService } from '../../shared/services/response.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

const DEFAULT_FALLBACK_LOCALE = 'en';

interface ClientMenuTranslation {
  id: string;
  menuId: string;
  locale: string;
  label?: string | null;
  description?: string | null;
  customHtml?: string | null;
  config?: Record<string, unknown> | null;
}

interface ClientMenuItem {
  id: string;
  menuGroup: string;
  type: string;
  url?: string | null;
  referenceId?: string | null;
  target: string;
  position: number;
  isEnabled: boolean;
  icon?: string | null;
  textColor?: string | null;
  backgroundColor?: string | null;
  borderColor?: string | null;
  borderWidth?: string | null;
  paddingTop?: string | null;
  paddingBottom?: string | null;
  config: Record<string, unknown>;
  isMegaMenu: boolean;
  megaMenuColumns?: number | null;
  parentId: string | null;
  translations: ClientMenuTranslation[];
  createdAt: Date;
  updatedAt: Date;
  children: ClientMenuItem[];
}

type RawMenuNode = {
  id: string;
  menuGroup: string;
  type: string;
  url?: string | null;
  referenceId?: string | null;
  target: string;
  position: number;
  isEnabled: boolean;
  icon?: string | null;
  textColor?: string | null;
  backgroundColor?: string | null;
  borderColor?: string | null;
  borderWidth?: string | null;
  paddingTop?: string | null;
  paddingBottom?: string | null;
  config?: Record<string, unknown> | null;
  isMegaMenu?: boolean;
  megaMenuColumns?: number | null;
  parentId?: string | null;
  translations?: Array<{
    id: string;
    menuId?: string;
    locale: string;
    label?: string | null;
    description?: string | null;
    customHtml?: string | null;
    config?: Record<string, unknown> | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
  children?: RawMenuNode[];
};

const selectTranslations = (
  translations: RawMenuNode['translations'] = [],
  locale: string,
  fallbackLocale: string,
  menuId: string,
): ClientMenuTranslation[] => {
  const ensurePlainTranslation = (translation: RawMenuNode['translations'][number]): ClientMenuTranslation => ({
    id: translation.id,
    menuId: translation.menuId ?? menuId,
    locale: translation.locale,
    label: translation.label ?? null,
    description: translation.description ?? null,
    customHtml: translation.customHtml ?? null,
    config: translation.config ?? null,
  });

  const primary = translations.filter((translation) => translation.locale === locale);
  if (primary.length > 0) {
    return primary.map(ensurePlainTranslation);
  }

  const fallback = translations.filter((translation) => translation.locale === fallbackLocale);
  if (fallback.length > 0) {
    return fallback.map(ensurePlainTranslation);
  }

  return translations.map(ensurePlainTranslation);
};

const transformMenuNode = (
  node: RawMenuNode,
  locale: string,
  fallbackLocale: string,
  parentId: string | null = null,
): ClientMenuItem => {
  const children = Array.isArray(node.children) ? node.children : [];

  return {
    id: node.id,
    menuGroup: node.menuGroup,
    type: node.type,
    url: node.url ?? null,
    referenceId: node.referenceId ?? null,
    target: node.target,
    position: node.position,
    isEnabled: node.isEnabled,
    icon: node.icon ?? null,
    textColor: node.textColor ?? null,
    backgroundColor: node.backgroundColor ?? null,
    borderColor: node.borderColor ?? null,
    borderWidth: node.borderWidth ?? null,
    paddingTop: node.paddingTop ?? null,
    paddingBottom: node.paddingBottom ?? null,
    config: node.config ?? {},
    isMegaMenu: node.isMegaMenu ?? false,
    megaMenuColumns: node.megaMenuColumns ?? null,
    parentId,
    translations: selectTranslations(node.translations, locale, fallbackLocale, node.id),
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    children: children
      .filter((child) => !!child && child.isEnabled)
      .map((child) => transformMenuNode(child, locale, fallbackLocale, node.id)),
  };
};

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
      const locale = input.locale || DEFAULT_FALLBACK_LOCALE;

      const menuTree = await this.menuService.getMenuTree(input.menuGroup);
      const sanitizedMenus = menuTree
        .filter((menu) => menu.isEnabled)
        .map((menu) => transformMenuNode(menu as RawMenuNode, locale, DEFAULT_FALLBACK_LOCALE));

      return this.responseService.createReadResponse(ModuleCode.MENU, 'data', {
        items: sanitizedMenus,
        total: sanitizedMenus.length,
        page: 1,
        limit: sanitizedMenus.length,
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
      const locale = input.locale || DEFAULT_FALLBACK_LOCALE;
      const menuTree = await this.menuService.getMenuTree(input.menuGroup);
      const sanitizedTree = menuTree
        .filter((menu) => menu.isEnabled)
        .map((menu) => transformMenuNode(menu as RawMenuNode, locale, DEFAULT_FALLBACK_LOCALE));

      return this.responseService.createReadResponse(ModuleCode.MENU, 'data', sanitizedTree);
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
