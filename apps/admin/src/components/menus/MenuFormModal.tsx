import React from 'react';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import { AdminMenu, MenuTreeNode } from '../../hooks/useMenusManager';
import { MenuFormState } from '../../hooks/useMenuPage';
import { MenuForm } from './MenuForm';

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMenu: AdminMenu | undefined;
  languages: any[];
  languagesQuery: any;
  groups: string[];
  menuTree: MenuTreeNode[];
  currentMenuGroup: string;
  onSubmit: (data: MenuFormState) => void;
  isSubmitting: boolean;
}

export const MenuFormModal: React.FC<MenuFormModalProps> = ({
  isOpen,
  onClose,
  editingMenu,
  languages,
  languagesQuery,
  groups,
  menuTree,
  currentMenuGroup,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {editingMenu ? 'Update the menu item details and translations.' : 'Create a new menu item with translations.'}
          </p>
        </div>
        {languagesQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <MenuForm
            menu={editingMenu}
            onSubmit={onSubmit}
            onCancel={onClose}
            languages={languages}
            menuGroups={groups}
            menuTree={menuTree}
            currentMenuGroup={currentMenuGroup}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </Modal>
  );
};
