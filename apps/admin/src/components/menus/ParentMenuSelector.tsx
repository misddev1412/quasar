import React, { useMemo, useCallback } from 'react';
import ModalReactSelect from '../common/ModalReactSelect';
import { MenuTreeNode } from '../../hooks/useMenusManager';

interface ParentMenuSelectorProps {
  value?: string;
  onChange: (parentId: string | undefined) => void;
  menuTree: MenuTreeNode[];
  currentMenuId?: string;
  menuGroup: string;
  menuPortalTarget?: HTMLElement | null;
}

interface MenuItemOption {
  value: string;
  label: string;
  level: number;
  searchLabel: string;
}

export const ParentMenuSelector: React.FC<ParentMenuSelectorProps> = ({
  value,
  onChange,
  menuTree,
  currentMenuId,
  menuGroup: _menuGroup,
  menuPortalTarget,
}) => {
  const buildMenuOptions = useCallback((nodes: MenuTreeNode[], level = 0): MenuItemOption[] => {
    const options: MenuItemOption[] = [];

    nodes.forEach(node => {
      if (node.id !== currentMenuId) {
        const prefix = '　'.repeat(level);
        const label = node.translations[0]?.label || node.id;
        const searchLabel = label.toLowerCase();

        options.push({
          value: node.id,
          label: `${prefix}${label}`,
          searchLabel,
          level,
        });

        if (node.children && node.children.length > 0) {
          options.push(...buildMenuOptions(node.children, level + 1));
        }
      }
    });

    return options;
  }, [currentMenuId]);

  const menuOptions = useMemo(() => {
    const builtOptions = buildMenuOptions(menuTree);
    return [
      { value: '', label: 'No Parent (Root Level)', searchLabel: 'no parent root level', level: 0 },
      ...builtOptions,
    ];
  }, [menuTree, buildMenuOptions]);

  const currentValue = menuOptions.find(option => option.value === (value || '')) || null;

  const customStyles = useMemo(() => ({
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '44px',
      height: '44px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      borderWidth: '1px',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: '#9ca3af',
      },
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      height: '42px',
      padding: '0 12px',
    }),
    input: (provided: any) => ({
      ...provided,
      margin: '0',
      padding: '0',
      color: '#111827',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6b7280',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#111827',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (provided: any, state: any) => ({
      ...provided,
      padding: '0 8px',
      color: state.isFocused ? '#3b82f6' : '#6b7280',
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      marginTop: '0.25rem',
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: '0.25rem',
      backgroundColor: 'white',
      borderRadius: '0.375rem',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
      color: '#111827',
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      cursor: 'pointer',
      borderRadius: '0.25rem',
      margin: '0.125rem',
      '&:hover': {
        backgroundColor: '#f3f4f6',
      },
      '&:active': {
        backgroundColor: '#e5e7eb',
      },
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      padding: '0.5rem 0.75rem',
      color: '#6b7280',
      fontSize: '0.875rem',
    }),
    groupHeading: (provided: any) => ({
      ...provided,
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      color: '#6b7280',
      padding: '0.5rem 0.75rem 0.25rem',
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
  }), []);

  const filterOption = (option: any, rawInput: string) => {
    if (!rawInput) return true;

    const searchWords = rawInput.toLowerCase().split(' ');
    const optionData = option.data as MenuItemOption;
    const optionLabel = optionData.searchLabel;

    return searchWords.every((word: string) => optionLabel.includes(word));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Parent Menu</label>
      <div className="mt-1">
        <ModalReactSelect<MenuItemOption>
          value={currentValue}
          onChange={(option) => onChange(option?.value || undefined)}
          options={menuOptions}
          styles={customStyles}
          menuPortalTarget={menuPortalTarget}
          menuShouldScrollIntoView={false}
          menuShouldBlockScroll={false}
          placeholder="Select parent menu (optional)"
          isClearable
          isSearchable
          noOptionsMessage={({ inputValue }) =>
            inputValue.length > 0 ? 'No matching menus found' : 'No menus available'
          }
          filterOption={filterOption}
        />
      </div>
    </div>
  );
};

export default ParentMenuSelector;
