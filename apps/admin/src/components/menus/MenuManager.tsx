import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit3, Trash2, GripVertical, ChevronDown, ChevronRight, RefreshCcw, Menu, Settings } from 'lucide-react';
import { useMenusManager, AdminMenu, MenuTreeNode, ActiveLanguage, MenuFormData } from '../../hooks/useMenusManager';
import { MenuType, MenuTarget } from '@shared/enums/menu.enums';
import { Button } from '../common/Button';
import { Select, SelectOption } from '../common/Select';
import { Toggle } from '../common/Toggle';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { useToast } from '../../context/ToastContext';
import { cn } from '@admin/lib/utils';

interface MenuManagerProps {
  initialMenuGroup?: string;
}

interface MenuTranslationForm {
  label?: string;
  description?: string;
  customHtml?: string;
  config?: Record<string, unknown>;
}

interface MenuFormState extends MenuFormData {
  translations: Record<string, MenuTranslationForm>;
}

const DEFAULT_MENU_GROUP_OPTIONS: SelectOption[] = [
  { value: 'main', label: 'Main Menu' },
  { value: 'footer', label: 'Footer Menu' },
  { value: 'mobile', label: 'Mobile Menu' },
];

const MENU_TYPE_OPTIONS: SelectOption[] = (Object.entries({
  [MenuType.LINK]: 'Custom Link',
  [MenuType.PRODUCT]: 'Product',
  [MenuType.CATEGORY]: 'Category',
  [MenuType.BRAND]: 'Brand',
  [MenuType.NEW_PRODUCTS]: 'New Products',
  [MenuType.SALE_PRODUCTS]: 'Sale Products',
  [MenuType.FEATURED_PRODUCTS]: 'Featured Products',
  [MenuType.BANNER]: 'Banner',
  [MenuType.CUSTOM_HTML]: 'Custom HTML',
}) as Array<[MenuType, string]>).map(([value, label]) => ({
  value,
  label,
}));

const MENU_TARGET_OPTIONS: SelectOption[] = (Object.entries({
  [MenuTarget.SELF]: 'Same window',
  [MenuTarget.BLANK]: 'New window',
}) as Array<[MenuTarget, string]>).map(([value, label]) => ({
  value,
  label,
}));

const MenuIconSelector = ({ value, onChange }: { value?: string; onChange: (icon: string) => void }) => {
  const commonIcons = [
    'home', 'user', 'shopping-cart', 'heart', 'search', 'menu', 'settings',
    'phone', 'mail', 'map-pin', 'clock', 'star', 'tag', 'package', 'truck',
    'shield', 'credit-card', 'help-circle', 'info', 'chevron-down', 'chevron-right',
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Icon</label>
      <div className="grid grid-cols-8 gap-2">
        {commonIcons.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => onChange(icon)}
            className={cn(
              'p-2 border rounded-md hover:bg-gray-50 transition-colors',
              value === icon && 'border-blue-500 bg-blue-50',
            )}
          >
            <span className="text-xs">{icon}</span>
          </button>
        ))}
      </div>
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Custom icon name"
        className="mt-2"
      />
    </div>
  );
};

const ColorPicker = ({ value, onChange, label }: { value?: string; onChange: (color: string) => void; label: string }) => {
  const commonColors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#f3f4f6', '#1f2937',
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-2">
        <div className="grid grid-cols-6 gap-1">
          {commonColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={cn(
                'w-8 h-8 rounded border-2 hover:scale-110 transition-transform',
                value === color ? 'border-blue-500' : 'border-gray-300',
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="w-24 text-xs"
        />
      </div>
    </div>
  );
};

const MenuItemRow: React.FC<{
  menu: MenuTreeNode;
  level: number;
  onEdit: (menu: AdminMenu) => void;
  onDelete: (menu: AdminMenu) => void;
  onToggleChildren: (id: string) => void;
  expandedNodes: Set<string>;
}> = ({ menu, level, onEdit, onDelete, onToggleChildren, expandedNodes }) => {
  const hasChildren = menu.children && menu.children.length > 0;
  const isExpanded = expandedNodes.has(menu.id);

  return (
    <>
      <div
        className={cn(
          'flex items-center space-x-2 p-3 border-b hover:bg-gray-50 transition-colors',
          !menu.isEnabled && 'opacity-50',
        )}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <div className="flex items-center space-x-2 flex-1">
          {hasChildren ? (
            <button
              onClick={() => onToggleChildren(menu.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />

          {menu.icon && (
            <span className="text-sm text-gray-600">{menu.icon}</span>
          )}

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {menu.translations.find(t => t.locale === 'en')?.label || menu.translations[0]?.label || 'Untitled'}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {menu.type}
              </span>
              {menu.isMegaMenu && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Mega
                </span>
              )}
              {menu.textColor && (
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: menu.textColor }}
                  title="Text color"
                />
              )}
              {menu.backgroundColor && (
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: menu.backgroundColor }}
                  title="Background color"
                />
              )}
            </div>
            {menu.url && (
              <div className="text-sm text-gray-500 truncate">{menu.url}</div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Toggle
              checked={menu.isEnabled}
              onChange={() => onEdit(menu)}
              size="sm"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(menu)}
              className="p-1"
            >
              <Edit3 className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(menu)}
              className="p-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && menu.children.map((child) => (
        <MenuItemRow
          key={child.id}
          menu={child}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleChildren={onToggleChildren}
          expandedNodes={expandedNodes}
        />
      ))}
    </>
  );
};

const MenuForm: React.FC<{
  menu?: AdminMenu;
  onSubmit: (data: MenuFormState) => void;
  onCancel: () => void;
  languages: ActiveLanguage[];
  menuGroups: string[];
}> = ({ menu, onSubmit, onCancel, languages, menuGroups }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<MenuFormState>(() => {
    if (menu) {
      const translations: Record<string, MenuTranslationForm> = {};
      menu.translations.forEach((translation) => {
        translations[translation.locale] = {
          label: translation.label || undefined,
          description: translation.description || undefined,
          customHtml: translation.customHtml || undefined,
          config: translation.config || undefined,
        };
      });

      return {
        menuGroup: menu.menuGroup,
        type: menu.type,
        url: menu.url || undefined,
        referenceId: menu.referenceId || undefined,
        target: menu.target,
        position: menu.position,
        isEnabled: menu.isEnabled,
        icon: menu.icon || undefined,
        textColor: menu.textColor || undefined,
        backgroundColor: menu.backgroundColor || undefined,
        config: menu.config,
        isMegaMenu: menu.isMegaMenu,
        megaMenuColumns: menu.megaMenuColumns || undefined,
        parentId: menu.parentId || undefined,
        translations,
      };
    }

    const defaultTranslations: Record<string, MenuTranslationForm> = {};
    languages.forEach((lang) => {
      defaultTranslations[lang.code] = {};
    });

    return {
      menuGroup: 'main',
      type: MenuType.LINK,
      target: MenuTarget.SELF,
      position: 0,
      isEnabled: true,
      config: {},
      isMegaMenu: false,
      translations: defaultTranslations,
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFormData = (field: keyof MenuFormState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateTranslation = (locale: string, field: keyof MenuTranslationForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: {
          ...prev.translations[locale],
          [field]: value,
        },
      },
    }));
  };

  const groupOptions: SelectOption[] = [
    ...DEFAULT_MENU_GROUP_OPTIONS,
    ...menuGroups.filter(group => !DEFAULT_MENU_GROUP_OPTIONS.find(opt => opt.value === group))
      .map(group => ({ value: group, label: group })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Menu Group</label>
          <Select
            value={formData.menuGroup}
            onChange={(value) => updateFormData('menuGroup', value)}
            options={groupOptions}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <Select
            value={formData.type}
            onChange={(value) => updateFormData('type', value as MenuType)}
            options={MENU_TYPE_OPTIONS}
            className="mt-1"
          />
        </div>
      </div>

      {(formData.type === MenuType.LINK || formData.type === MenuType.BANNER) && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <Input
              value={formData.url || ''}
              onChange={(e) => updateFormData('url', e.target.value)}
              placeholder="https://example.com"
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Target</label>
            <Select
              value={formData.target}
              onChange={(value) => updateFormData('target', value as MenuTarget)}
              options={MENU_TARGET_OPTIONS}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {(formData.type === MenuType.PRODUCT || formData.type === MenuType.CATEGORY || formData.type === MenuType.BRAND) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Reference ID</label>
          <Input
            value={formData.referenceId || ''}
            onChange={(e) => updateFormData('referenceId', e.target.value)}
            placeholder="Product/Category/Brand ID"
            className="mt-1"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <Input
            type="number"
            value={formData.position}
            onChange={(e) => updateFormData('position', parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-4 pt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => updateFormData('isEnabled', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Enabled</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isMegaMenu}
              onChange={(e) => updateFormData('isMegaMenu', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Mega Menu</span>
          </label>
        </div>
      </div>

      {formData.isMegaMenu && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Mega Menu Columns (1-6)</label>
          <Input
            type="number"
            min="1"
            max="6"
            value={formData.megaMenuColumns || 3}
            onChange={(e) => updateFormData('megaMenuColumns', parseInt(e.target.value) || 3)}
            className="mt-1 w-24"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <MenuIconSelector
          value={formData.icon}
          onChange={(icon) => updateFormData('icon', icon)}
        />

        <div>
          <ColorPicker
            value={formData.textColor}
            onChange={(color) => updateFormData('textColor', color)}
            label="Text Color"
          />
        </div>
      </div>

      <div>
        <ColorPicker
          value={formData.backgroundColor}
          onChange={(color) => updateFormData('backgroundColor', color)}
          label="Background Color"
        />
      </div>

      {/* Translations */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Translations</h3>
        {languages.map((language) => (
          <div key={language.code} className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-gray-800">
              {language.name} {language.isDefault && '(Default)'}
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700">Label</label>
              <Input
                value={formData.translations[language.code]?.label || ''}
                onChange={(e) => updateTranslation(language.code, 'label', e.target.value)}
                placeholder="Menu label"
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.translations[language.code]?.description || ''}
                onChange={(e) => updateTranslation(language.code, 'description', e.target.value)}
                placeholder="Menu description"
                rows={3}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formData.type === MenuType.CUSTOM_HTML && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom HTML</label>
                <textarea
                  value={formData.translations[language.code]?.customHtml || ''}
                  onChange={(e) => updateTranslation(language.code, 'customHtml', e.target.value)}
                  placeholder="Custom HTML content"
                  rows={6}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {menu ? 'Update Menu' : 'Create Menu'}
        </Button>
      </div>
    </form>
  );
};

export const MenuManager: React.FC<MenuManagerProps> = ({ initialMenuGroup }) => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const [selectedMenuGroup, setSelectedMenuGroup] = useState(initialMenuGroup || 'main');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<AdminMenu | undefined>();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const {
    menuTree,
    groups,
    languages,
    createMenu,
    updateMenu,
    deleteMenu,
    reorderMenus,
    treeQuery,
    languagesQuery,
  } = useMenusManager(selectedMenuGroup);

  const handleAddMenu = () => {
    setEditingMenu(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditMenu = (menu: AdminMenu) => {
    setEditingMenu(menu);
    setIsFormModalOpen(true);
  };

  const handleDeleteMenu = async (menu: AdminMenu) => {
    if (!confirm(`Are you sure you want to delete "${menu.translations[0]?.label || 'this menu item'}"?`)) {
      return;
    }

    try {
      await deleteMenu.mutateAsync({ id: menu.id });
      addToast({ title: 'Menu deleted successfully', type: 'success' });
    } catch (error) {
      addToast({ title: 'Failed to delete menu', type: 'error' });
    }
  };

  const handleFormSubmit = async (formData: MenuFormState) => {
    try {
      if (editingMenu) {
        await updateMenu.mutateAsync({
          id: editingMenu.id,
          data: formData,
        });
        addToast({ title: 'Menu updated successfully', type: 'success' });
      } else {
        await createMenu.mutateAsync(formData);
        addToast({ title: 'Menu created successfully', type: 'success' });
      }
      setIsFormModalOpen(false);
      setEditingMenu(undefined);
    } catch (error) {
      addToast({ title: 'Failed to save menu', type: 'error' });
    }
  };

  const handleToggleChildren = (menuId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectIds = (nodes: MenuTreeNode[]) => {
      nodes.forEach(node => {
        allNodeIds.add(node.id);
        if (node.children.length > 0) {
          collectIds(node.children);
        }
      });
    };
    collectIds(menuTree);
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const groupOptions: SelectOption[] = [
    ...DEFAULT_MENU_GROUP_OPTIONS,
    ...groups.filter(group => !DEFAULT_MENU_GROUP_OPTIONS.find(opt => opt.value === group))
      .map(group => ({ value: group, label: group })),
  ];

  const modalTitle = editingMenu ? 'Edit Menu Item' : 'Add Menu Item';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>

          <Select
            value={selectedMenuGroup}
            onChange={setSelectedMenuGroup}
            options={groupOptions}
            className="w-48"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => treeQuery.refetch()}
            disabled={treeQuery.isLoading}
          >
            <RefreshCcw className={cn('w-4 h-4 mr-2', treeQuery.isLoading && 'animate-spin')} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
          >
            Expand All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
          >
            Collapse All
          </Button>

          <Button onClick={handleAddMenu}>
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>
      </div>

      {treeQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : menuTree.length === 0 ? (
        <div className="text-center py-12">
          <Menu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first menu item.</p>
          <Button onClick={handleAddMenu}>
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="border-b bg-gray-50 px-4 py-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Menu className="w-4 h-4" />
              <span>{selectedMenuGroup} Menu Structure</span>
            </div>
          </div>

          <div>
            {menuTree.map((menu) => (
              <MenuItemRow
                key={menu.id}
                menu={menu}
                level={0}
                onEdit={handleEditMenu}
                onDelete={handleDeleteMenu}
                onToggleChildren={handleToggleChildren}
                expandedNodes={expandedNodes}
              />
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMenu(undefined);
        }}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
          {languagesQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <MenuForm
              menu={editingMenu}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormModalOpen(false);
                setEditingMenu(undefined);
              }}
              languages={languages}
              menuGroups={groups}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
