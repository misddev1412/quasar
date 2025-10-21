import React, { useMemo } from 'react';
import {
  FiMoreVertical, FiChevronDown, FiChevronRight, FiEdit, FiTrash2, FiPlus,
  FiHome, FiUser, FiShoppingCart, FiSearch, FiHeart, FiStar, FiPhone, FiMail,
  FiMapPin, FiCalendar, FiClock, FiCamera, FiBell, FiBookmark, FiMessageSquare,
  FiFile, FiFolder, FiSettings, FiTool, FiTrash2 as FiTrash, FiDownload, FiUpload,
  FiArrowLeft, FiArrowRight, FiArrowUp, FiArrowDown, FiChevronLeft,
  FiChevronUp, FiMinus, FiX, FiCheck
} from 'react-icons/fi';
import {
  FaHome, FaUser, FaShoppingBag, FaSearch, FaHeart, FaStar,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendar, FaClock,
  FaCamera, FaBell, FaBookmark, FaComments, FaFile, FaFolder,
  FaCog, FaWrench, FaTrash, FaDownload, FaUpload, FaArrowLeft,
  FaArrowRight, FaArrowUp, FaArrowDown, FaChevronLeft,
  FaChevronRight, FaChevronUp, FaChevronDown, FaPlus, FaMinus,
  FaTimes, FaCheck
} from 'react-icons/fa';
import {
  MdHome, MdPerson, MdShoppingCart, MdSearch, MdFavorite, MdStar, MdPhone, MdEmail,
  MdLocationOn, MdCalendarToday, MdAccessTime, MdCameraAlt, MdNotifications,
  MdBookmark, MdChat, MdDescription, MdFolder, MdSettings, MdBuild, MdDelete,
  MdDownload, MdUpload, MdArrowBack, MdArrowForward, MdArrowUpward, MdArrowDownward,
  MdChevronLeft, MdChevronRight, MdKeyboardArrowUp, MdKeyboardArrowDown,
  MdAdd, MdRemove, MdClose, MdCheck
} from 'react-icons/md';
import { Button } from '../../components/common/Button';
import { Dropdown } from '../../components/common/Dropdown';
import { ReorderableTable, DragHandle, type ReorderableColumn } from '../../components/common/ReorderableTable';
import { UnifiedIcon } from '../../components/common/UnifiedIcon';
import { AdminMenu, MenuTreeNode } from '../../hooks/useMenusManager';
import { MENU_TYPE_OPTIONS } from '../../hooks/useMenuPage';

interface MenuTableProps {
  flatMenuList: (AdminMenu & { level: number; children: MenuTreeNode[] })[];
  preferences: any;
  updateVisibleColumns: (columns: Set<string>) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  expandedNodes: Set<string>;
  toggleNodeExpansion: (nodeId: string) => void;
  draggedMenuId: string | null;
  dragOverId: string | null;
  reorderMenus: any;
  onEditMenu: (menu: AdminMenu) => void;
  onDeleteMenu: (menu: AdminMenu) => void;
  onAddMenu: () => void;
  handleRowDragStart: (event: React.DragEvent<HTMLElement>, menuId: string) => void;
  handleDragEnd: () => void;
  handleDragOver: (event: React.DragEvent<HTMLElement>, targetId: string) => void;
  handleDrop: (event: React.DragEvent<HTMLElement>, targetId: string) => void;
  handleDragLeave: (targetId: string) => void;
  loadingChildren?: Set<string>;
  hasChildren?: Set<string>;
}

export const MenuTable: React.FC<MenuTableProps> = ({
  flatMenuList,
  preferences,
  updateVisibleColumns,
  searchValue,
  setSearchValue,
  expandedNodes,
  toggleNodeExpansion,
  draggedMenuId,
  dragOverId,
  reorderMenus,
  onEditMenu,
  onDeleteMenu,
  onAddMenu,
  handleRowDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  handleDragLeave,
  loadingChildren = new Set(),
  hasChildren = new Set(),
}) => {
  
  const columns: ReorderableColumn<AdminMenu & { level: number; children: MenuTreeNode[] }>[] = useMemo(() => [
    {
      id: 'menu',
      header: 'Menu Item',
      accessor: (item) => (
        <div className={`flex items-start gap-3 ${item.level > 0 ? 'relative' : ''}`}>
          {item.level > 0 && (
            <div
              className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
              style={{ left: `${(item.level - 1) * 16 + 20}px` }}
            />
          )}
          <DragHandle
            aria-label="Reorder menu item"
            disabled={reorderMenus.isPending}
            isDragging={draggedMenuId === item.id}
          />
          <div
            className={`flex flex-1 flex-col gap-1 ${item.level > 0 ? 'relative' : ''}`}
            style={{ paddingLeft: `${item.level * 16}px` }}
          >
            {item.level > 0 && (
              <div
                className="absolute top-1/2 w-4 h-px bg-gray-200 dark:bg-gray-700"
                style={{ left: `-${item.level * 16 - 8}px` }}
              />
            )}
            <div className="flex items-center gap-2">
              {(hasChildren.has(item.id) || (item.children && item.children.length > 0)) && (
                <button
                  data-drag-ignore
                  onClick={() => toggleNodeExpansion(item.id)}
                  className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
                    item.level > 0
                      ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  disabled={loadingChildren.has(item.id)}
                >
                  {loadingChildren.has(item.id) ? (
                    <div className="animate-spin h-3 w-3 border border-gray-300 border-t-gray-600 rounded-full"></div>
                  ) : expandedNodes.has(item.id) ? (
                    <FiChevronDown className={`w-4 h-4 ${item.level > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                  ) : (
                    <FiChevronRight className={`w-4 h-4 ${item.level > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                  )}
                </button>
              )}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                item.level === 0
                  ? 'bg-gray-400 dark:bg-gray-500'
                  : item.level === 1
                    ? 'bg-blue-400 dark:bg-blue-500'
                    : 'bg-green-400 dark:bg-green-500'
              }`} />
              {item.icon && <span className="mr-1"><UnifiedIcon icon={item.icon} variant="table" /></span>}
              {(item.textColor || item.backgroundColor) && (
                <div className="mr-2 flex gap-1">
                  {item.textColor && (
                    <div
                      className="w-3 h-3 rounded border border-gray-300"
                      style={{ backgroundColor: item.textColor }}
                      title={`Text color: ${item.textColor}`}
                    />
                  )}
                  {item.backgroundColor && (
                    <div
                      className="w-3 h-3 rounded border border-gray-300"
                      style={{ backgroundColor: item.backgroundColor }}
                      title={`Background color: ${item.backgroundColor}`}
                    />
                  )}
                </div>
              )}
              <span
                className={`font-medium ${
                  item.level === 0
                    ? 'text-gray-900 dark:text-gray-100 text-base'
                    : item.level === 1
                      ? 'text-gray-800 dark:text-gray-200 text-sm'
                      : 'text-gray-700 dark:text-gray-300 text-sm'
                }`}
                style={{
                  color: item.textColor || undefined,
                  backgroundColor: item.backgroundColor || undefined,
                  padding: item.backgroundColor ? '2px 6px' : undefined,
                  borderRadius: item.backgroundColor ? '4px' : undefined,
                }}
              >
                {item.translations.find(t => t.locale === 'en')?.label || item.translations[0]?.label || 'Untitled'}
              </span>
            </div>
            {item.url && (
              <span className={`truncate ${
                item.level === 0
                  ? 'text-sm text-gray-500 dark:text-gray-400 ml-7'
                  : 'text-xs text-gray-400 dark:text-gray-500 ml-7'
              }`}>
                {item.url}
              </span>
            )}
          </div>
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'type',
      header: 'Type',
      accessor: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {MENU_TYPE_OPTIONS.find(opt => opt.value === item.type)?.label || item.type}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.isEnabled
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {item.isEnabled ? 'Active' : 'Inactive'}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'position',
      header: 'Position',
      accessor: 'position',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      width: '80px',
      hideable: false,
      isSortable: false,
      accessor: (item) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" data-drag-ignore>
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          }
          items={[
            {
              label: 'Edit',
              icon: <FiEdit className="w-4 h-4" />,
              onClick: () => onEditMenu(item),
            },
            {
              label: 'Delete',
              icon: <FiTrash2 className="w-4 h-4" />,
              onClick: () => onDeleteMenu(item),
              className: 'text-red-600 dark:text-red-400',
            },
          ]}
        />
      ),
    },
  ], [expandedNodes, reorderMenus.isPending, draggedMenuId, toggleNodeExpansion, onEditMenu, onDeleteMenu]);

  return (
    <ReorderableTable<AdminMenu & { level: number; children: MenuTreeNode[] }>
      tableId="menus-table"
      columns={columns}
      data={flatMenuList}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Search menu items..."
      visibleColumns={preferences.visibleColumns}
      onColumnVisibilityChange={(columnId, visible) => {
        const newSet = new Set(preferences.visibleColumns as Set<string>);
        if (visible) {
          newSet.add(columnId);
        } else {
          newSet.delete(columnId);
        }
        updateVisibleColumns(newSet);
      }}
      showColumnVisibility={true}
      enableRowHover={true}
      density="normal"
      emptyMessage="No menu items found"
      emptyAction={{
        label: 'Create Menu Item',
        onClick: onAddMenu,
        icon: <FiPlus />,
      }}
      dragState={{
        disabled: reorderMenus.isPending,
        draggedId: draggedMenuId,
        dragOverId: dragOverId,
      }}
      onDragStart={(event, item, _index) => handleRowDragStart(event, item.id)}
      onDragEnd={(_event, _item, _index) => handleDragEnd()}
      onDragOver={(event, item, _index) => handleDragOver(event, item.id)}
      onDrop={(event, item, _index) => handleDrop(event, item.id)}
      onDragLeave={(_event, item, _index) => handleDragLeave(item.id)}
    />
  );
};
