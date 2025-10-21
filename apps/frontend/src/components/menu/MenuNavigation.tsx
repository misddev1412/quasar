'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { UnifiedIcon } from '../common/UnifiedIcon';
import MegaMenu, { MegaMenuSection } from './MegaMenu';

// Icons
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  target?: string;
  description?: string;
  isMegaMenu?: boolean;
  megaMenuColumns?: number;
  icon?: string | null;
  image?: string;
  badge?: string;
  featured?: boolean;
  children?: NavigationItem[];
}


const DesktopNavigationItem: React.FC<{
  item: NavigationItem;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ item, isActive, onMouseEnter, onMouseLeave }) => {
  const hasChildren = item.children && item.children.length > 0;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        onMouseEnter();
        setIsDropdownOpen(true);
      }}
      onMouseLeave={() => {
        onMouseLeave();
        setIsDropdownOpen(false);
      }}
    >
      <Link
        href={item.href}
        target={item.target}
        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
        className={`
          flex items-center gap-1 text-sm font-medium transition-all duration-200 relative py-2 px-3 rounded-lg
          ${
            isActive
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
        `}
      >
        <span className="flex items-center gap-2">
          <UnifiedIcon icon={item.icon} variant={isActive ? 'nav-active' : 'nav'} />
          <span>{item.name}</span>
        </span>
        {hasChildren && <ChevronDownIcon />}
      </Link>

      {/* Dropdown Menu */}
      {hasChildren && isDropdownOpen && (
        <div
          className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[60] min-w-[200px]"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <div className="py-2">
            {item.children?.map((child) => (
              <Link
                key={child.id}
                href={child.href}
                target={child.target}
                rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
                className="
                  block px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                  hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800
                  transition-colors
                "
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <UnifiedIcon icon={child.icon} variant="nav" />
                    <span>{child.name}</span>
                  </span>
                  {child.children && child.children.length > 0 && <ChevronRightIcon />}
                </div>
                {child.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {child.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to convert NavigationItem to MegaMenuSection
const convertToMegaMenuSections = (item: NavigationItem): MegaMenuSection[] => {
  if (!item.children) return [];

  return item.children.map((child) => ({
    id: child.id,
    title: child.name,
    description: child.description,
    items: child.children?.map((grandChild) => ({
      id: grandChild.id,
      name: grandChild.name,
      href: grandChild.href,
      description: grandChild.description,
      image: grandChild.image,
      badge: grandChild.badge,
      featured: grandChild.featured,
    })) || []
  }));
};

// Enhanced Mega Menu Dropdown using the advanced MegaMenu component
const EnhancedMegaMenuDropdown: React.FC<{
  item: NavigationItem;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const sections = convertToMegaMenuSections(item);

  // Extract featured items from all sections
  const featuredItems = sections.flatMap(section =>
    section.items.filter(item => item.featured)
  );

  return (
    <div
      className="absolute top-full left-0 right-0 mt-1 z-[60]"
      onMouseEnter={() => {}}
      onMouseLeave={onClose}
    >
      <div className="w-full left-0 right-0">
        <MegaMenu
          sections={sections}
          featuredItems={featuredItems}
          bannerTitle="Special Offers"
          bannerLink="/offers"
          onClose={onClose}
        />
      </div>
    </div>
  );
};

const DesktopNavigation: React.FC<{
  pathname: string;
  items: NavigationItem[];
}> = ({ pathname, items }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (itemId: string) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(itemId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setMegaMenuOpen(null);
    }, 150);
  };

  const handleMegaMenuEnter = (itemId: string) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(itemId);
    setMegaMenuOpen(itemId);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="hidden lg:flex items-center gap-2">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const hasChildren = item.children && item.children.length > 0;
        const isMega = item.isMegaMenu && hasChildren;

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => isMega ? handleMegaMenuEnter(item.id) : handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={item.href}
              target={item.target}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              className={`
                flex items-center gap-1 text-sm font-medium transition-all duration-200 relative py-2 px-3 rounded-lg
                ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <UnifiedIcon icon={item.icon} variant={isActive ? 'nav-active' : 'nav'} />
                <span>{item.name}</span>
              </span>
              {hasChildren && <ChevronDownIcon />}
            </Link>

            {/* Enhanced Mega Menu */}
            {isMega && megaMenuOpen === item.id && (
              <EnhancedMegaMenuDropdown
                item={item}
                onClose={() => setMegaMenuOpen(null)}
              />
            )}

            {/* Regular Dropdown */}
            {!isMega && hasChildren && activeDropdown === item.id && (
              <div
                className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[60] min-w-[200px]"
                onMouseEnter={() => setActiveDropdown(item.id)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="py-2">
                  {item.children?.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href}
                      target={child.target}
                      rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
                      className="
                        block px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                        hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800
                        transition-colors
                      "
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <UnifiedIcon icon={child.icon} variant="nav" />
                          <span>{child.name}</span>
                        </span>
                        {child.children && child.children.length > 0 && <ChevronRightIcon />}
                      </div>
                      {child.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {child.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

const MobileMenuItem: React.FC<{
  item: NavigationItem;
  isActive: boolean;
  onClose: () => void;
}> = ({ item, isActive, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <Link
          href={item.href}
          target={item.target}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              className={`
                flex-1 text-base font-medium transition-colors py-3 px-4
                ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }
              `}
              onClick={() => {
                if (!hasChildren) {
                  onClose();
                }
              }}
            >
              <span className="flex items-center gap-3">
                <UnifiedIcon icon={item.icon} variant="button" />
                <span>{item.name}</span>
              </span>
            </Link>
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <ChevronDownIcon
              className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="bg-gray-50 dark:bg-gray-800">
          {item.children?.map((child) => (
            <Link
              key={child.id}
              href={child.href}
              target={child.target}
              rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="
                block py-2 px-8 text-sm text-gray-600 dark:text-gray-400
                hover:text-blue-600 dark:hover:text-blue-400
                transition-colors
              "
              onClick={onClose}
            >
              <span className="flex items-center gap-2">
                <UnifiedIcon icon={child.icon} variant="nav" />
                <span>{child.name}</span>
              </span>
              {child.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {child.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

interface MenuNavigationProps {
  items: NavigationItem[];
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const MenuNavigation: React.FC<MenuNavigationProps> = ({
  items,
  isMobileMenuOpen = false,
  onMobileMenuClose
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Mobile menu
  if (isMobileMenuOpen) {
    return (
      <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-h-[70vh] overflow-y-auto">
          {items.map((item) => (
            <MobileMenuItem
              key={item.id}
              item={item}
              isActive={pathname === item.href}
              onClose={() => onMobileMenuClose?.()}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop navigation
  return <DesktopNavigation pathname={pathname} items={items} />;
};

export default MenuNavigation;
