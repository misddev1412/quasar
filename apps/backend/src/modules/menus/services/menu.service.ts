import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { MenuRepository } from '../repositories/menu.repository';
import { MenuTranslationRepository } from '../repositories/menu-translation.repository';
import { CreateMenuDto, UpdateMenuDto, ReorderMenuDto } from '../dto/menu.dto';
import { MenuEntity } from '../entities/menu.entity';
import { MenuTranslationEntity } from '../entities/menu-translation.entity';

type MenuTreeTranslation = Omit<MenuTranslationEntity, 'menu'> & {
  config?: Record<string, unknown> | null;
};

interface MenuTreeNode {
  id: string;
  menuGroup: string;
  type: MenuEntity['type'];
  url?: string | null;
  referenceId?: string | null;
  target: MenuEntity['target'];
  position: number;
  isEnabled: boolean;
  icon?: string | null;
  textColor?: string | null;
  backgroundColor?: string | null;
  config: Record<string, unknown>;
  isMegaMenu: boolean;
  megaMenuColumns?: number | null;
  parentId: string | null;
  translations: MenuTreeTranslation[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  version: number;
  children: MenuTreeNode[];
}

const mapTranslation = (translation: MenuTranslationEntity): MenuTreeTranslation => {
  const { menu: _menu, config, ...rest } = translation;

  return {
    ...rest,
    config: config ?? null,
  } as MenuTreeTranslation;
};

@Injectable()
export class MenuService {
  constructor(
    private readonly menuRepository: MenuRepository,
    private readonly menuTranslationRepository: MenuTranslationRepository,
  ) {}

  async findAll(menuGroup?: string): Promise<MenuEntity[]> {
    return this.menuRepository.findAll(menuGroup);
  }

  async findByMenuGroup(menuGroup: string): Promise<MenuEntity[]> {
    return this.menuRepository.findByMenuGroup(menuGroup);
  }

  async findById(id: string): Promise<MenuEntity> {
    const menu = await this.menuRepository.findById(id);
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    return menu;
  }

  async create(createMenuDto: CreateMenuDto): Promise<MenuEntity> {
    // Check if position is already taken in the same group and parent
    const existingMenu = await this.findMenuByPosition(
      createMenuDto.menuGroup,
      createMenuDto.position,
      createMenuDto.parentId,
    );
    if (existingMenu) {
      throw new ConflictException(`Position ${createMenuDto.position} is already taken`);
    }

    const menuData = {
      ...createMenuDto,
      translations: undefined, // We'll handle translations separately
    };

    const menu = await this.menuRepository.create(menuData);

    // Create translations
    for (const [locale, translationData] of Object.entries(createMenuDto.translations)) {
      await this.menuTranslationRepository.upsert(menu.id, locale, translationData);
    }

    return this.findById(menu.id);
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<MenuEntity> {
    const existingMenu = await this.findById(id);

    // Check if new position conflicts with another menu
    if (updateMenuDto.position !== undefined && updateMenuDto.position !== existingMenu.position) {
      const conflictingMenu = await this.findMenuByPosition(
        existingMenu.menuGroup,
        updateMenuDto.position,
        updateMenuDto.parentId,
        id, // Exclude current menu from conflict check
      );
      if (conflictingMenu) {
        throw new ConflictException(`Position ${updateMenuDto.position} is already taken`);
      }
    }

    const updateData = {
      ...updateMenuDto,
      translations: undefined,
    };

    await this.menuRepository.update(id, updateData);

    // Update translations if provided
    if (updateMenuDto.translations) {
      for (const [locale, translationData] of Object.entries(updateMenuDto.translations)) {
        await this.menuTranslationRepository.upsert(id, locale, translationData);
      }
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const menu = await this.findById(id);

    // Check if menu has children
    if (menu.children && menu.children.length > 0) {
      throw new ConflictException('Cannot delete menu item with children. Delete children first.');
    }

    await this.menuRepository.delete(id);
  }

  async reorder(menuGroup: string, reorderData: ReorderMenuDto[]): Promise<MenuEntity[]> {
    // Validate all positions are unique within the same parent
    const positionsByParent = new Map<string | undefined, Set<number>>();

    for (const item of reorderData) {
      const parentKey = item.parentId || 'root';
      if (!positionsByParent.has(parentKey)) {
        positionsByParent.set(parentKey, new Set());
      }

      if (positionsByParent.get(parentKey)?.has(item.position)) {
        throw new ConflictException(`Duplicate position ${item.position} found for parent ${parentKey}`);
      }

      positionsByParent.get(parentKey)?.add(item.position);
    }

    await this.menuRepository.reorder(
      menuGroup,
      reorderData.map(item => ({
        id: item.id.toString(),
        position: item.position,
        parentId: item.parentId,
      })),
    );

    return this.findByMenuGroup(menuGroup);
  }

  private async findMenuByPosition(
    menuGroup: string,
    position: number,
    parentId?: string | undefined,
    excludeId?: string,
  ): Promise<MenuEntity | null> {
    const allMenus = await this.menuRepository.findAll();

    const conflictingMenu = allMenus.find(menu =>
      menu.menuGroup === menuGroup &&
      menu.position === position &&
      (menu.parent?.id === parentId || (menu.parent === null && parentId === undefined)) &&
      menu.id !== excludeId
    );

    return conflictingMenu || null;
  }

  async getMenuTree(menuGroup: string): Promise<MenuTreeNode[]> {
    const menus = await this.menuRepository.findAllWithParent(menuGroup);

    const nodeMap = new Map<string, MenuTreeNode>();
    const roots: MenuTreeNode[] = [];

    menus.forEach(menu => {
      nodeMap.set(menu.id, {
        id: menu.id,
        menuGroup: menu.menuGroup,
        type: menu.type,
        url: menu.url ?? null,
        referenceId: menu.referenceId ?? null,
        target: menu.target,
        position: menu.position,
        isEnabled: menu.isEnabled,
        icon: menu.icon ?? null,
        textColor: menu.textColor ?? null,
        backgroundColor: menu.backgroundColor ?? null,
        config: menu.config ?? {},
        isMegaMenu: menu.isMegaMenu,
        megaMenuColumns: menu.megaMenuColumns ?? null,
        parentId: menu.parent?.id ?? null,
        translations: menu.translations?.map(mapTranslation) ?? [],
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt,
        deletedAt: menu.deletedAt ?? undefined,
        createdBy: menu.createdBy,
        updatedBy: menu.updatedBy,
        deletedBy: menu.deletedBy,
        version: menu.version,
        children: [],
      });
    });

    nodeMap.forEach(node => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortTree = (nodes: MenuTreeNode[]) => {
      nodes.sort((a, b) => a.position - b.position);
      nodes.forEach(child => sortTree(child.children));
    };

    sortTree(roots);

    return roots;
  }

  async getMenuGroups(): Promise<string[]> {
    const menus = await this.menuRepository.findAll();
    const groups = [...new Set(menus.map(menu => menu.menuGroup))];
    return groups.sort();
  }
}
