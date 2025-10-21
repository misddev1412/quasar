import React from 'react';
import { Select, SelectOption } from '../../components/common/Select';
import { AdminMenu, MenuTreeNode } from '../../hooks/useMenusManager';

interface ParentMenuSelectorProps {
  value?: string;
  onChange: (parentId: string | undefined) => void;
  menuTree: MenuTreeNode[];
  currentMenuId?: string;
  menuGroup: string;
}

interface MenuItemOption {
  value: string;
  label: string;
  level: number;
}

export const ParentMenuSelector: React.FC<ParentMenuSelectorProps> = ({
  value,
  onChange,
  menuTree,
  currentMenuId,
  menuGroup,
}) => {
  const buildMenuOptions = (nodes: MenuTreeNode[], level = 0): MenuItemOption[] => {
    const options: MenuItemOption[] = [];

    nodes.forEach(node => {
      // Skip the current menu being edited to prevent circular references
      if (node.id !== currentMenuId) {
        const prefix = '　'.repeat(level);
        options.push({
          value: node.id,
          label: `${prefix}${node.translations[0]?.label || node.id}`,
          level,
        });

        // Recursively add children
        if (node.children && node.children.length > 0) {
          options.push(...buildMenuOptions(node.children, level + 1));
        }
      }
    });

    return options;
  };

  const menuOptions: SelectOption[] = [
    { value: '', label: 'No Parent (Root Level)' },
    ...buildMenuOptions(menuTree).map(option => ({
      value: option.value,
      label: option.label,
    })),
  ];

  const handleChange = (selectedValue: string) => {
    onChange(selectedValue || undefined);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Parent Menu</label>
      <Select
        value={value || ''}
        onChange={handleChange}
        options={menuOptions}
        className="mt-1"
        placeholder="Select parent menu (optional)"
      />
    </div>
  );
};