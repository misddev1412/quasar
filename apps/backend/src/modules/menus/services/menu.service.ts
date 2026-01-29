import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { MenuRepository } from '../repositories/menu.repository';
import { MenuTranslationRepository } from '../repositories/menu-translation.repository';
import { CreateMenuDto, UpdateMenuDto, ReorderMenuDto } from '../dto/menu.dto';
import { MenuEntity } from '../entities/menu.entity';
import { MenuTranslationEntity } from '../entities/menu-translation.entity';
import * as XLSX from 'xlsx';
import { ApiStatusCodes } from '@shared';
import { ResponseService } from '../../shared/services/response.service';
import { ImportJobService } from '../../import/services/import-job.service';

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
  borderColor?: string | null;
  borderWidth?: string | null;
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
    private readonly responseHandler: ResponseService,
    private readonly importJobService: ImportJobService,
  ) { }

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
    // Get the next available position if the provided position conflicts
    let position = createMenuDto.position;
    let existingMenu = await this.findMenuByPosition(
      createMenuDto.menuGroup,
      position,
      createMenuDto.parentId,
    );

    if (existingMenu) {
      // If position is taken, get the next available position
      position = await this.menuRepository.getLatestPosition(
        createMenuDto.menuGroup,
        createMenuDto.parentId,
      );
    }

    const menuData = {
      ...createMenuDto,
      position, // Use the potentially updated position
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

  async clone(id: string): Promise<MenuEntity> {
    const original = await this.menuRepository.findById(id);
    if (!original) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    // 1. Calculate new position (append at end of current level)
    const newPosition = await this.menuRepository.getLatestPosition(
      original.menuGroup,
      original.parent?.id,
    );

    // 2. Clone the menu entity
    const createDto: any = {
      menuGroup: original.menuGroup,
      type: original.type,
      url: original.url,
      referenceId: original.referenceId,
      target: original.target,
      position: newPosition,
      isEnabled: false, // Disable cloned item by default
      icon: original.icon,
      textColor: original.textColor,
      backgroundColor: original.backgroundColor,
      borderColor: original.borderColor,
      borderWidth: original.borderWidth,
      config: original.config,
      isMegaMenu: original.isMegaMenu,
      megaMenuColumns: original.megaMenuColumns,
      parentId: original.parent?.id,
    };

    const newMenu = await this.menuRepository.create(createDto);

    // 3. Clone translations with prefix "(Copy)"
    if (original.translations && original.translations.length > 0) {
      for (const t of original.translations) {
        await this.menuTranslationRepository.upsert(newMenu.id, t.locale, {
          label: `${t.label} (Copy)`,
          description: t.description,
          customHtml: t.customHtml,
          config: t.config,
        });
      }
    }

    // 4. Recursive clone for children
    if (original.children && original.children.length > 0) {
      await this.cloneChildren(original.children, newMenu.id);
    }

    return this.findById(newMenu.id);
  }

  private async cloneChildren(children: MenuEntity[], parentId: string): Promise<void> {
    for (const child of children) {
      // Create child copy
      const childDto: any = {
        menuGroup: child.menuGroup,
        type: child.type,
        url: child.url,
        referenceId: child.referenceId,
        target: child.target,
        position: child.position,
        isEnabled: child.isEnabled,
        icon: child.icon,
        textColor: child.textColor,
        backgroundColor: child.backgroundColor,
        borderColor: child.borderColor,
        borderWidth: child.borderWidth,
        config: child.config,
        isMegaMenu: child.isMegaMenu,
        megaMenuColumns: child.megaMenuColumns,
        parentId: parentId,
      };

      const newChild = await this.menuRepository.create(childDto);

      // Clone child translations
      if (child.translations) {
        for (const t of child.translations) {
          await this.menuTranslationRepository.upsert(newChild.id, t.locale, {
            label: t.label, // No need to append (Copy) for children usually, or can retain exact name
            description: t.description,
            customHtml: t.customHtml,
            config: t.config,
          });
        }
      }

      // Recurse if this child also has children
      if (child.children && child.children.length > 0) {
        await this.cloneChildren(child.children, newChild.id);
      }
    }
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
        borderColor: menu.borderColor ?? null,
        borderWidth: menu.borderWidth ?? null,
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

  async getChildrenByParent(menuGroup: string, parentId?: string): Promise<MenuEntity[]> {
    return this.menuRepository.findChildrenByParent(menuGroup, parentId);
  }

  async getChildrenTreeByParent(menuGroup: string, parentId?: string): Promise<MenuTreeNode[]> {
    const menus = await this.menuRepository.findDescendantsByParent(menuGroup, parentId);

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
        borderColor: menu.borderColor ?? null,
        borderWidth: menu.borderWidth ?? null,
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
    return this.menuRepository.getMenuGroups();
  }

  async getNextPosition(menuGroup: string, parentId?: string): Promise<number> {
    return this.menuRepository.getLatestPosition(menuGroup, parentId);
  }

  async getStatistics(menuGroup?: string): Promise<{
    totalMenus: number;
    activeMenus: number;
    inactiveMenus: number;
    totalGroups: number;
    menusByType: Record<string, number>;
    menusByTarget: Record<string, number>;
  }> {
    const menus = await this.menuRepository.findAll(menuGroup);
    const groups = await this.menuRepository.getMenuGroups();

    const menusByType: Record<string, number> = {};
    const menusByTarget: Record<string, number> = {};

    menus.forEach(menu => {
      // Count by type
      menusByType[menu.type] = (menusByType[menu.type] || 0) + 1;

      // Count by target
      menusByTarget[menu.target] = (menusByTarget[menu.target] || 0) + 1;
    });

    return {
      totalMenus: menus.length,
      activeMenus: menus.filter(menu => menu.isEnabled).length,
      inactiveMenus: menus.filter(menu => !menu.isEnabled).length,
      totalGroups: groups.length,
      menusByType,
      menusByTarget,
    };
  }

  async generateExcelTemplate(locale: string = 'en'): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    const isVi = locale === 'vi';

    // 1. Template Sheet
    const templateHeaders = isVi ? [
      'Nhóm Menu',
      'Loại',
      'URL',
      'Mã tham chiếu',
      'Đích (Target)',
      'Vị trí',
      'Đã bật',
      'Biểu tượng',
      'Màu chữ',
      'Màu nền',
      'Màu viền',
      'Độ rộng viền',
      'Cấu hình (JSON)',
      'Mega Menu',
      'Số cột Mega Menu',
      'Mã Menu cha (UUID)',
    ] : [
      'Menu Group',
      'Type',
      'URL',
      'Reference ID',
      'Target',
      'Position',
      'Is Enabled',
      'Icon',
      'Text Color',
      'Background Color',
      'Border Color',
      'Border Width',
      'Config (JSON)',
      'Is Mega Menu',
      'Mega Menu Columns',
      'Parent ID (UUID)',
    ];

    const templateSample = isVi ? {
      'Nhóm Menu': 'main',
      'Loại': 'link',
      'URL': '/',
      'Mã tham chiếu': '',
      'Đích (Target)': '_self',
      'Vị trí': 0,
      'Đã bật': 'true',
      'Biểu tượng': 'home',
      'Màu chữ': '',
      'Màu nền': '',
      'Màu viền': '',
      'Độ rộng viền': '',
      'Cấu hình (JSON)': '{}',
      'Mega Menu': 'false',
      'Số cột Mega Menu': '',
      'Mã Menu cha (UUID)': '',
    } : {
      'Menu Group': 'main',
      'Type': 'link',
      'URL': '/',
      'Reference ID': '',
      'Target': '_self',
      'Position': 0,
      'Is Enabled': 'true',
      'Icon': 'home',
      'Text Color': '',
      'Background Color': '',
      'Border Color': '',
      'Border Width': '',
      'Config (JSON)': '{}',
      'Is Mega Menu': 'false',
      'Mega Menu Columns': '',
      'Parent ID (UUID)': '',
    };

    const templateSheet = XLSX.utils.json_to_sheet([templateSample], { header: templateHeaders });
    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Template');

    // 2. Instructions Sheet
    const instructionsData = isVi ? [
      ['Hướng dẫn nhập Menu'],
      [''],
      ['1. THÔNG TIN CƠ BẢN'],
      ['- Nhóm Menu: main, footer, top, mobile, v.v.'],
      ['- Loại: link, product, category, brand, v.v.'],
      ['- Đích (Target): _self (Trang hiện tại), _blank (Tab mới)'],
      ['- Vị trí: Số thứ tự (0, 1, 2...)'],
      ['- Đã bật: true/false'],
      [''],
      ['2. PHÂN CẤP'],
      ['- Mã Menu cha: UUID của menu cha nếu muốn tạo menu con'],
      [''],
      ['3. SHEET BẢN DỊCH (Translations)'],
      ['- Nhãn (Label): Tên hiển thị của menu'],
      ['- Ngôn ngữ: vi, en, v.v.'],
    ] : [
      ['Menu Import Instructions'],
      [''],
      ['1. BASIC INFO'],
      ['- Menu Group: main, footer, top, mobile, etc.'],
      ['- Type: link, product, category, brand, etc.'],
      ['- Target: _self, _blank'],
      ['- Position: Number (0, 1, 2...)'],
      ['- Is Enabled: true/false'],
      [''],
      ['2. HIERARCHY'],
      ['- Parent ID: UUID of parent menu for submenus'],
      [''],
      ['3. TRANSLATIONS SHEET'],
      ['- Label: Display name of the menu'],
      ['- Locale: en, vi, etc.'],
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // 3. Translations Sheet
    const translationHeaders = isVi ? [
      'Nhóm Menu',
      'Vị trí',
      'Ngôn ngữ',
      'Nhãn',
      'Mô tả',
      'HTML Tùy chỉnh',
    ] : [
      'Menu Group',
      'Position',
      'Locale',
      'Label',
      'Description',
      'Custom HTML',
    ];

    const translationSample = isVi ? {
      'Nhóm Menu': 'main',
      'Vị trí': 0,
      'Ngôn ngữ': 'vi',
      'Nhãn': 'Trang chủ',
      'Mô tả': 'Về trang chủ',
      'HTML Tùy chỉnh': '',
    } : {
      'Menu Group': 'main',
      'Position': 0,
      'Locale': 'en',
      'Label': 'Home',
      'Description': 'Back to home',
      'Custom HTML': '',
    };

    const translationsSheet = XLSX.utils.json_to_sheet([translationSample], { header: translationHeaders });
    XLSX.utils.book_append_sheet(workbook, translationsSheet, 'Translations');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importMenusFromExcel(params: {
    fileName: string;
    fileData: string;
    overrideExisting?: boolean;
    dryRun?: boolean;
    actorId?: string | null;
  }): Promise<{ jobId: string }> {
    const {
      fileData,
      fileName,
      overrideExisting = false,
      dryRun = false,
      actorId,
    } = params;

    if (!fileData || fileData.trim().length === 0) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'File data is required for import',
        'BAD_REQUEST',
      );
    }

    const job = await this.importJobService.createJob('menus', fileName, actorId ?? undefined);

    // Run processing in background
    (async () => {
      try {
        const summary = {
          totalRows: 0,
          imported: 0,
          skipped: 0,
          duplicates: 0,
          updated: 0,
          errors: [] as Array<{ row: number; message: string }>,
          details: [] as Array<{
            row: number;
            label: string;
            status: 'IMPORTED' | 'UPDATED' | 'SKIPPED' | 'ERROR';
            message?: string;
          }>,
        };

        const sanitizeBase64 = (input: string): string => {
          const trimmed = input.trim();
          const commaIndex = trimmed.indexOf(',');
          if (commaIndex !== -1) {
            return trimmed.slice(commaIndex + 1);
          }
          return trimmed;
        };

        const buffer = Buffer.from(sanitizeBase64(fileData), 'base64');
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('The uploaded workbook does not contain any sheets.');
        }

        const worksheet = workbook.Sheets['Template'] || workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
          defval: '',
          raw: false,
          blankrows: false,
        });

        const translationSheet = workbook.Sheets['Translations'];
        const translationRows = translationSheet ? XLSX.utils.sheet_to_json<Record<string, any>>(translationSheet, {
          defval: '',
          raw: false,
          blankrows: false,
        }) : [];

        summary.totalRows = rawRows.length;

        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          const rowNumber = i + 2;

          try {
            // Find translations for this row
            const menuGroup = row['Nhóm Menu'] || row['Menu Group'];
            const position = parseInt(row['Vị trí'] || row['Position']);

            const rowTranslations: Record<string, any> = {};
            translationRows
              .filter(t => (t['Nhóm Menu'] || t['Menu Group']) === menuGroup && parseInt(t['Vị trí'] || t['Position']) === position)
              .forEach(t => {
                const locale = t['Ngôn ngữ'] || t['Locale'];
                rowTranslations[locale] = {
                  label: t['Nhãn'] || t['Label'],
                  description: t['Mô tả'] || t['Description'],
                  customHtml: t['HTML Tùy chỉnh'] || t['Custom HTML'],
                };
              });

            const menuData: any = {
              menuGroup,
              type: row['Loại'] || row['Type'],
              url: row['URL'],
              referenceId: row['Mã tham chiếu'] || row['Reference ID'],
              target: row['Đích (Target)'] || row['Target'],
              position,
              isEnabled: String(row['Đã bật'] || row['Is Enabled']).toLowerCase() === 'true',
              icon: row['Biểu tượng'] || row['Icon'],
              textColor: row['Màu chữ'] || row['Text Color'],
              backgroundColor: row['Màu nền'] || row['Background Color'],
              borderColor: row['Màu viền'] || row['Border Color'],
              borderWidth: row['Độ rộng viền'] || row['Border Width'],
              config: JSON.parse(row['Cấu hình (JSON)'] || row['Config (JSON)'] || '{}'),
              isMegaMenu: String(row['Mega Menu'] || row['Is Mega Menu']).toLowerCase() === 'true',
              megaMenuColumns: row['Số cột Mega Menu'] || row['Mega Menu Columns'] ? parseInt(row['Số cột Mega Menu'] || row['Mega Menu Columns']) : undefined,
              parentId: row['Mã Menu cha (UUID)'] || row['Parent ID (UUID)'] || undefined,
              translations: rowTranslations,
            };

            if (dryRun) {
              summary.imported++;
              summary.details.push({
                row: rowNumber,
                label: rowTranslations['vi']?.label || rowTranslations['en']?.label || 'Unknown',
                status: 'IMPORTED',
                message: 'Dry-run: Validated successfully',
              });
              continue;
            }

            // Check if exists
            const existing = await this.findMenuByPosition(menuGroup, position, menuData.parentId);
            if (existing) {
              if (overrideExisting) {
                await this.update(existing.id, menuData);
                summary.updated++;
                summary.details.push({
                  row: rowNumber,
                  label: rowTranslations['vi']?.label || rowTranslations['en']?.label || 'Updated',
                  status: 'UPDATED',
                });
              } else {
                summary.skipped++;
                summary.details.push({
                  row: rowNumber,
                  label: rowTranslations['vi']?.label || rowTranslations['en']?.label || 'Skipped',
                  status: 'SKIPPED',
                  message: 'Position already taken. Use override to update.',
                });
              }
            } else {
              await this.create(menuData);
              summary.imported++;
              summary.details.push({
                row: rowNumber,
                label: rowTranslations['vi']?.label || rowTranslations['en']?.label || 'Imported',
                status: 'IMPORTED',
              });
            }

            // Update job progress
            const progress = Math.round(((i + 1) / rawRows.length) * 100);
            const processedItems = summary.imported + summary.updated + summary.skipped;
            const failedItems = summary.errors.length;
            await this.importJobService.updateProgress(job.id, progress, processedItems, failedItems, summary.totalRows);

          } catch (err: any) {
            summary.errors.push({ row: rowNumber, message: err.message });
            summary.details.push({
              row: rowNumber,
              label: 'Error',
              status: 'ERROR',
              message: err.message,
            });
          }
        }

        await this.importJobService.completeJob(job.id, summary);
      } catch (error) {
        await this.importJobService.failJob(job.id, error.message);
      }
    })();

    return { jobId: job.id };
  }
}
