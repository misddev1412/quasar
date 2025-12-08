import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { MenuEntity } from '../entities/menu.entity';

@Injectable()
export class MenuRepository {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
    @InjectRepository(MenuEntity)
    private readonly menuTreeRepository: TreeRepository<MenuEntity>,
  ) {}

  async findByMenuGroup(menuGroup: string): Promise<MenuEntity[]> {
    const trees = await this.menuTreeRepository.findTrees({
      relations: ['translations', 'children'],
    });

    // Filter by menuGroup after getting the trees
    return this.filterTreesByMenuGroup(trees, menuGroup);
  }

  private filterTreesByMenuGroup(trees: MenuEntity[], menuGroup: string): MenuEntity[] {
    return trees
      .filter(menu => menu.menuGroup === menuGroup && menu.isEnabled)
      .map(menu => {
        menu.children = this.filterTreesByMenuGroup(menu.children, menuGroup);
        return menu;
      });
  }

  async findAll(menuGroup?: string): Promise<MenuEntity[]> {
    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.translations', 'translations')
      .leftJoinAndSelect('menu.children', 'children')
      .leftJoinAndSelect('children.translations', 'childrenTranslations')
      .orderBy('menu.position', 'ASC')
      .addOrderBy('children.position', 'ASC');

    if (menuGroup) {
      queryBuilder.where('menu.menuGroup = :menuGroup', { menuGroup });
    }

    return queryBuilder.getMany();
  }

  async findAllWithParent(menuGroup: string): Promise<MenuEntity[]> {
    return this.menuRepository.find({
      where: { menuGroup },
      relations: ['translations', 'parent'],
      order: { position: 'ASC' },
    });
  }

  async findById(id: string): Promise<MenuEntity | null> {
    return this.menuRepository.findOne({
      where: { id },
      relations: ['translations', 'children', 'parent'],
    });
  }

  async create(menuData: Partial<MenuEntity>): Promise<MenuEntity> {
    const { parentId, ...dataWithoutParentId } = menuData;
    const menu = this.menuRepository.create(dataWithoutParentId);

    // Handle parentId - use the @TreeParent decorator relationship
    if (parentId) {
      // Set the parent relationship using the tree decorator
      (menu as any).parentId = parentId;
    }

    return this.menuRepository.save(menu);
  }

  async update(id: string, menuData: Partial<MenuEntity>): Promise<MenuEntity | null> {
    const { parentId, ...dataWithoutParentId } = menuData;

    // Update the entity first
    await this.menuRepository.update(id, dataWithoutParentId);

    // Handle parentId if provided
    if (parentId !== undefined) {
      await this.menuRepository.update(id, { parentId });
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.menuRepository.softDelete(id);
  }

  async reorder(menuGroup: string, reorderData: Array<{ id: string; position: number; parentId?: string }>): Promise<void> {
    await this.menuRepository.manager.transaction(async (manager) => {
      for (const item of reorderData) {
        await manager.update(MenuEntity, item.id, {
          position: item.position,
          parent: item.parentId ? { id: item.parentId } : null,
        });
      }
    });
  }

  async findRoots(menuGroup: string): Promise<MenuEntity[]> {
    return this.menuRepository.find({
      where: { menuGroup, parent: null },
      relations: ['translations'],
      order: { position: 'ASC' },
    });
  }

  async findChildren(parentId: string): Promise<MenuEntity[]> {
    return this.menuRepository.find({
      where: { parent: { id: parentId } },
      relations: ['translations', 'children'],
      order: { position: 'ASC' },
    });
  }

  async findChildrenByParent(menuGroup: string, parentId?: string): Promise<MenuEntity[]> {
    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.translations', 'translations')
      .orderBy('menu.position', 'ASC');

    queryBuilder.where('menu.menuGroup = :menuGroup', { menuGroup });

    if (parentId) {
      queryBuilder.andWhere('menu.parentId = :parentId', { parentId });
    } else {
      // Get root items (no parent)
      queryBuilder.andWhere('menu.parentId IS NULL');
    }

    return queryBuilder.getMany();
  }

  async findDescendantsByParent(menuGroup: string, parentId?: string): Promise<MenuEntity[]> {
    if (parentId) {
      // Use recursive query to get all descendants
      const descendantQuery = `
        WITH RECURSIVE menu_descendants AS (
          SELECT m.id, 0 as level, m.position
          FROM menus m
          WHERE m.id = $1 AND m.menu_group = $2

          UNION ALL

          SELECT m.id, md.level + 1, m.position
          FROM menus m
          INNER JOIN menu_descendants md ON m.parent_id = md.id
          WHERE m.menu_group = $2
        )
        SELECT md.id, md.level, md.position
        FROM menu_descendants md
        WHERE md.level > 0
        ORDER BY md.level, md.position
      `;

      const rawDescendants = await this.menuRepository.query(descendantQuery, [parentId, menuGroup]);

      if (!rawDescendants.length) {
        return [];
      }

      const descendantIds = rawDescendants.map((menu: { id: string }) => menu.id);
      const descendants = await this.menuRepository
        .createQueryBuilder('menu')
        .leftJoinAndSelect('menu.translations', 'translations')
        .leftJoinAndSelect('menu.parent', 'parent')
        .leftJoinAndSelect('menu.children', 'children')
        .leftJoinAndSelect('children.translations', 'childrenTranslations')
        .where('menu.id IN (:...descendantIds)', { descendantIds })
        .orderBy('menu.position', 'ASC')
        .addOrderBy('children.position', 'ASC')
        .getMany();

      const descendantsById = new Map(descendants.map(menu => [menu.id, menu]));

      return rawDescendants
        .map((entry: { id: string }) => descendantsById.get(entry.id))
        .filter((menu): menu is MenuEntity => Boolean(menu));
    } else {
      // For root (no parentId), get all menus in the group with their translations
      return this.menuRepository
        .createQueryBuilder('menu')
        .leftJoinAndSelect('menu.translations', 'translations')
        .leftJoinAndSelect('menu.parent', 'parent')
        .where('menu.menuGroup = :menuGroup', { menuGroup })
        .orderBy('menu.position', 'ASC')
        .getMany();
    }
  }

  async getMenuGroups(): Promise<string[]> {
    const result = await this.menuRepository
      .createQueryBuilder('menu')
      .select('DISTINCT menu.menuGroup', 'menuGroup')
      .getRawMany();

    return result.map(item => item.menuGroup).sort();
  }

  async getLatestPosition(menuGroup: string, parentId?: string): Promise<number> {
    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .select('MAX(menu.position)', 'maxPosition')
      .where('menu.menuGroup = :menuGroup', { menuGroup });

    if (parentId) {
      queryBuilder.andWhere('menu.parentId = :parentId', { parentId });
    } else {
      queryBuilder.andWhere('menu.parentId IS NULL');
    }

    const result = await queryBuilder.getRawOne();
    return result?.maxPosition ? result.maxPosition + 1 : 0;
  }
}
