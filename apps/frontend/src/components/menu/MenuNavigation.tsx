'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UnifiedIcon } from '../common/UnifiedIcon';
import MegaMenu, { MegaMenuSection } from './MegaMenu';
import { MenuType } from '@shared/enums/menu.enums';
import {
  MainMenuConfig,
  MainMenuItemSize,
  MainMenuItemWeight,
  MainMenuItemTransform,
  DEFAULT_MAIN_MENU_CONFIG,
} from '@shared/types/navigation.types';
import { useTheme } from '../../contexts/ThemeContext';

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

type ItemSizeStyle = {
  desktopText: string;
  desktopPadding: string;
  desktopGap: string;
  mobileText: string;
  mobilePadding: string;
  mobileGap: string;
};

const ITEM_SIZE_STYLES: Record<MainMenuItemSize, ItemSizeStyle> = {
  compact: {
    desktopText: 'text-xs',
    desktopPadding: 'py-1.5 px-2.5',
    desktopGap: 'gap-1.5',
    mobileText: 'text-sm',
    mobilePadding: 'py-2.5 px-3.5',
    mobileGap: 'gap-2',
  },
  comfortable: {
    desktopText: 'text-sm',
    desktopPadding: 'py-2 px-3',
    desktopGap: 'gap-2',
    mobileText: 'text-base',
    mobilePadding: 'py-3 px-4',
    mobileGap: 'gap-3',
  },
  spacious: {
    desktopText: 'text-base',
    desktopPadding: 'py-3 px-4',
    desktopGap: 'gap-3',
    mobileText: 'text-lg',
    mobilePadding: 'py-4 px-5',
    mobileGap: 'gap-3',
  },
};

const ITEM_WEIGHT_CLASSES: Record<MainMenuItemWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const ITEM_TRANSFORM_CLASSES: Record<MainMenuItemTransform, string> = {
  normal: 'normal-case',
  uppercase: 'uppercase',
  capitalize: 'capitalize',
};

export interface NavigationItem {
  id: string;
  type: MenuType;
  name: string;
  href?: string;
  target?: string;
  description?: string;
  isMegaMenu?: boolean;
  megaMenuColumns?: number;
  icon?: string | null;
  image?: string;
  badge?: string;
  featured?: boolean;
  config?: Record<string, unknown>;
  borderColor?: string | null;
  borderWidth?: string | null;
  children?: NavigationItem[];
}

export interface NavigationItemRendererProps {
  item: NavigationItem;
  context: 'desktop' | 'mobile';
  closeMobileMenu?: () => void;
}

export type NavigationItemRenderer = (props: NavigationItemRendererProps) => React.ReactNode;

const getBorderStyles = (item: NavigationItem): React.CSSProperties => {
  const style: React.CSSProperties = {};
  if (item.borderColor) {
    style.borderColor = item.borderColor;
  }
  if (item.borderWidth) {
    style.borderWidth = item.borderWidth;
  }
  if (item.borderColor || item.borderWidth) {
    style.borderStyle = style.borderStyle || 'solid';
    if (!style.borderWidth) {
      style.borderWidth = '1px';
    }
  }
  return style;
};


const DesktopNavigationItem: React.FC<{
  item: NavigationItem;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ item, isActive, onMouseEnter, onMouseLeave }) => {
  const hasChildren = item.children && item.children.length > 0;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const hasCustomBorder = Boolean(item.borderColor || item.borderWidth);

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
        href={item.href || '#'}
        target={item.target}
        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
        className={`
          flex items-center gap-1 text-sm font-medium transition-all duration-200 relative py-2 px-3 rounded-lg ${hasCustomBorder ? 'border' : 'border-0'}
          ${
            isActive
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
        `}
        style={getBorderStyles(item)}
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
                  href={child.href || '#'}
                  target={child.target}
                rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="
                block px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800
                transition-colors
              "
              style={getBorderStyles(child)}
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
      icon: grandChild.icon,
      target: grandChild.target,
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
  renderers?: Partial<Record<MenuType, NavigationItemRenderer>>;
  itemSizeStyle: ItemSizeStyle;
  style?: React.CSSProperties;
  itemWeightClass: string;
  itemTransformClass: string;
  textColor?: string;
}> = ({ pathname, items, renderers, itemSizeStyle, style, itemWeightClass, itemTransformClass, textColor }) => {
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
    <nav
      className="hidden lg:flex items-center gap-2 rounded-2xl py-1 transition-colors"
      style={style}
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        const hasChildren = item.children && item.children.length > 0;
        const isMega = item.isMegaMenu && hasChildren;
        const renderer = renderers?.[item.type];
        const hasCustomBorder = Boolean(item.borderColor || item.borderWidth);

        if (renderer) {
          return (
            <div key={item.id} className="flex items-center">
              {renderer({ item, context: 'desktop' })}
            </div>
          );
        }

        const iconColor = !isActive && textColor ? textColor : undefined;
        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => isMega ? handleMegaMenuEnter(item.id) : handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={item.href || '#'}
              target={item.target}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              className={`
                flex items-center ${itemSizeStyle.desktopGap} ${itemSizeStyle.desktopText} ${itemWeightClass} ${itemTransformClass} transition-all duration-200 relative ${itemSizeStyle.desktopPadding} rounded-lg ${hasCustomBorder ? 'border' : 'border-0'}
                ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : `${textColor ? '' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'} hover:underline hover:font-semibold underline-offset-4`
                }
              `}
              style={{
                ...getBorderStyles(item),
                color: !isActive && textColor ? textColor : undefined,
              }}
            >
              <span className={`flex items-center ${itemSizeStyle.desktopGap}`}>
                <UnifiedIcon icon={item.icon} variant={isActive ? 'nav-active' : 'nav'} color={iconColor} />
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
                <div className="py-2 space-y-1">
                  {item.children?.map((child) => (
                    <div key={child.id} className="px-2 py-1 rounded-lg transition-colors">
                      <Link
                        href={child.href || '#'}
                        target={child.target}
                        rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
                        className={`
                          block px-2 py-2 text-sm
                          ${textColor ? '' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}
                          transition-colors
                        `}
                        style={{
                          ...getBorderStyles(child),
                          color: textColor || undefined,
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2">
                            <UnifiedIcon icon={child.icon} variant="nav" color={textColor || undefined} />
                            <span>{child.name}</span>
                          </span>
                          {child.children && child.children.length > 0 && <ChevronRightIcon />}
                        </div>
                        {child.description && (
                          <p
                            className={`text-xs mt-1 ${textColor ? '' : 'text-gray-500 dark:text-gray-400'}`}
                            style={{ color: textColor || undefined }}
                          >
                            {child.description}
                          </p>
                        )}
                      </Link>
                      {child.children && child.children.length > 0 && (
                        <div className="mt-2 ml-6 border-l border-gray-100 dark:border-gray-700 pl-3 space-y-1">
                          {child.children.map((grandChild) => (
                            <Link
                              key={grandChild.id}
                              href={grandChild.href || '#'}
                              target={grandChild.target}
                              rel={grandChild.target === '_blank' ? 'noopener noreferrer' : undefined}
                              className={`
                                block text-xs py-1
                                ${textColor ? '' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}
                              `}
                              style={{
                                ...getBorderStyles(grandChild),
                                color: textColor || undefined,
                              }}
                            >
                              <span className="flex items-center gap-2">
                                <UnifiedIcon icon={grandChild.icon} variant="nav" color={textColor || undefined} />
                                <span>{grandChild.name}</span>
                              </span>
                              {grandChild.description && (
                                <span
                                  className={`block text-[11px] ${textColor ? '' : 'text-gray-400 dark:text-gray-500'}`}
                                  style={{ color: textColor || undefined }}
                                >
                                  {grandChild.description}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
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
  renderer?: NavigationItemRenderer;
  itemSizeStyle: ItemSizeStyle;
  itemWeightClass: string;
  itemTransformClass: string;
  textColor?: string;
}> = ({ item, isActive, onClose, renderer, itemSizeStyle, itemWeightClass, itemTransformClass, textColor }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (renderer) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        {renderer({ item, context: 'mobile', closeMobileMenu: onClose })}
      </div>
    );
  }

  const iconColor = !isActive && textColor ? textColor : undefined;
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <Link
          href={item.href || '#'}
          target={item.target}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              className={`
                flex-1 ${itemSizeStyle.mobileText} ${itemWeightClass} ${itemTransformClass} transition-colors ${itemSizeStyle.mobilePadding}
                ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : `${textColor ? '' : 'text-gray-700 dark:text-gray-300'}`
                }
              `}
              style={{
                ...getBorderStyles(item),
                color: !isActive && textColor ? textColor : undefined,
              }}
              onClick={() => {
                if (!hasChildren) {
                  onClose();
                }
              }}
            >
              <span className={`flex items-center ${itemSizeStyle.mobileGap}`}>
                <UnifiedIcon icon={item.icon} variant="button" color={iconColor} />
                <span>{item.name}</span>
              </span>
            </Link>
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-3 ${textColor ? '' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                style={textColor ? { color: textColor } : undefined}
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
            <div key={child.id} className="border-t border-gray-100 dark:border-gray-700 first:border-t-0">
              <Link
                href={child.href || '#'}
                target={child.target}
                rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
                className={`
                  block py-2 px-8 text-sm
                  ${textColor ? '' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}
                  transition-colors
                `}
                style={{
                  ...getBorderStyles(child),
                  color: textColor || undefined,
                }}
                onClick={onClose}
              >
                <span className="flex items-center gap-2">
                  <UnifiedIcon icon={child.icon} variant="nav" color={textColor || undefined} />
                  <span>{child.name}</span>
                </span>
                {child.description && (
                  <p
                    className={`text-xs mt-1 ${textColor ? '' : 'text-gray-500 dark:text-gray-400'}`}
                    style={{ color: textColor || undefined }}
                  >
                    {child.description}
                  </p>
                )}
              </Link>

              {child.children && child.children.length > 0 && (
                <div className="ml-8 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-1 pb-3">
                  {child.children.map((grandChild) => (
                    <Link
                      key={grandChild.id}
                      href={grandChild.href || '#'}
                      target={grandChild.target}
                      rel={grandChild.target === '_blank' ? 'noopener noreferrer' : undefined}
                      className={`
                        block text-sm py-1 px-4
                        ${textColor ? '' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}
                        transition-colors
                      `}
                      style={{
                        ...getBorderStyles(grandChild),
                        color: textColor || undefined,
                      }}
                      onClick={onClose}
                    >
                      <span className="flex items-center gap-2">
                        <UnifiedIcon icon={grandChild.icon} variant="nav" color={textColor || undefined} />
                        <span>{grandChild.name}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
  renderers?: Partial<Record<MenuType, NavigationItemRenderer>>;
  appearanceConfig?: MainMenuConfig;
  isLoading?: boolean;
}

const skeletonBaseClass =
  'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800';

const DesktopMenuSkeleton: React.FC = () => {
  const labelWidths = ['w-16', 'w-20', 'w-24', 'w-28'];
  const metaWidths = ['w-10', 'w-12', 'w-14'];

  return (
    <div className="hidden lg:flex items-center gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`desktop-menu-skeleton-${index}`}
          className="flex h-11 items-center gap-3 rounded-2xl border border-gray-200/80 dark:border-gray-800/70 bg-white/90 dark:bg-gray-900/60 px-4 py-2 shadow-sm animate-pulse"
        >
          <span className={`h-6 w-6 rounded-full ${skeletonBaseClass}`} />
          <div className="space-y-1.5">
            <span className={`block h-3 rounded-full ${skeletonBaseClass} ${labelWidths[index % labelWidths.length]}`} />
            <span className={`block h-2.5 rounded-full opacity-70 ${skeletonBaseClass} ${metaWidths[index % metaWidths.length]}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

const MobileMenuSkeleton: React.FC = () => {
  const labelWidths = ['w-24', 'w-28', 'w-32', 'w-36'];
  const metaWidths = ['w-14', 'w-16', 'w-20'];

  return (
    <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-100/80 dark:divide-gray-800/70">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`mobile-menu-skeleton-${index}`}
          className="flex items-center justify-between px-4 py-4 bg-white/90 dark:bg-gray-950/80 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <span className={`h-9 w-9 rounded-2xl ${skeletonBaseClass}`} />
            <div className="space-y-1.5">
              <span className={`block h-3 rounded-full ${skeletonBaseClass} ${labelWidths[index % labelWidths.length]}`} />
              <span className={`block h-2.5 rounded-full opacity-70 ${skeletonBaseClass} ${metaWidths[index % metaWidths.length]}`} />
            </div>
          </div>
          <span className={`h-3 w-6 rounded-full ${skeletonBaseClass}`} />
        </div>
      ))}
    </div>
  );
};

const MenuNavigation: React.FC<MenuNavigationProps> = ({
  items,
  isMobileMenuOpen = false,
  onMobileMenuClose,
  renderers,
  appearanceConfig,
  isLoading = false,
}) => {
  const pathname = usePathname();
  const config = appearanceConfig ?? DEFAULT_MAIN_MENU_CONFIG;
  const { theme } = useTheme();
  const itemSizeStyle = ITEM_SIZE_STYLES[config.itemSize] ?? ITEM_SIZE_STYLES.comfortable;
  const itemWeightClass = ITEM_WEIGHT_CLASSES[config.itemWeight] ?? ITEM_WEIGHT_CLASSES.medium;
  const itemTransformClass = ITEM_TRANSFORM_CLASSES[config.itemTransform] ?? ITEM_TRANSFORM_CLASSES.normal;
  const resolvedTextColor =
    (theme === 'dark' ? config.textColor.dark : config.textColor.light)?.trim() || '';
  const navStyle = resolvedTextColor ? { color: resolvedTextColor } : undefined;

  const shouldShowSkeleton = isLoading && items.length === 0;

  // Mobile menu
  if (isMobileMenuOpen) {
    if (shouldShowSkeleton) {
      return <MobileMenuSkeleton />;
    }

    return (
      <div
        className="lg:hidden border-t border-gray-200 dark:border-gray-700"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {items.map((item) => (
            <MobileMenuItem
              key={item.id}
              item={item}
              isActive={pathname === item.href}
              onClose={() => onMobileMenuClose?.()}
              renderer={renderers?.[item.type]}
              itemSizeStyle={itemSizeStyle}
              itemWeightClass={itemWeightClass}
              itemTransformClass={itemTransformClass}
              textColor={resolvedTextColor || undefined}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop navigation
  if (shouldShowSkeleton) {
    return <DesktopMenuSkeleton />;
  }

  return (
    <DesktopNavigation
      pathname={pathname}
      items={items}
      renderers={renderers}
      itemSizeStyle={itemSizeStyle}
      itemWeightClass={itemWeightClass}
      itemTransformClass={itemTransformClass}
      style={navStyle}
      textColor={resolvedTextColor || undefined}
    />
  );
};

export default MenuNavigation;
