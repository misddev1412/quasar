'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@heroui/react';

interface SidebarItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  logo?: React.ReactNode;
  brandName?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  footer?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  logo,
  brandName,
  collapsible = true,
  defaultCollapsed = false,
  footer,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return pathname === path;
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isActive(item.path);

    return (
      <div key={item.label}>
        {item.path && !hasChildren ? (
          <Link
            href={item.path || '#'}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
              ${active ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}
              ${level > 0 ? 'ml-6' : ''}
            `}
          >
            {item.icon && <span className="w-5 h-5">{item.icon}</span>}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpanded(item.label)}
            className={`
              w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors
              hover:bg-gray-100
              ${level > 0 ? 'ml-6' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              {item.icon && <span className="w-5 h-5">{item.icon}</span>}
              {!collapsed && <span>{item.label}</span>}
            </div>
            {hasChildren && !collapsed && (
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        )}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1">
            {item.children!.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`
        bg-white border-r h-full flex flex-col transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo && <div className="w-8 h-8">{logo}</div>}
            {!collapsed && brandName && <span className="font-bold text-lg">{brandName}</span>}
          </div>
          {collapsible && (
            <Button isIconOnly size="sm" variant="light" onPress={() => setCollapsed(!collapsed)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
                />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">{items.map((item) => renderSidebarItem(item))}</div>
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-3 border-t">
          {collapsed ? <div className="flex justify-center">{footer}</div> : footer}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
