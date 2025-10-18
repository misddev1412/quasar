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

  async findById(id: string): Promise<MenuEntity | null> {
    return this.menuRepository.findOne({
      where: { id },
      relations: ['translations', 'children', 'parent'],
    });
  }

  async create(menuData: Partial<MenuEntity>): Promise<MenuEntity> {
    const menu = this.menuRepository.create(menuData);
    return this.menuRepository.save(menu);
  }

  async update(id: string, menuData: Partial<MenuEntity>): Promise<MenuEntity | null> {
    await this.menuRepository.update(id, menuData);
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
}