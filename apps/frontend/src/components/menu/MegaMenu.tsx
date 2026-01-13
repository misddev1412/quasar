'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { UnifiedIcon } from '../common/UnifiedIcon';

export interface MegaMenuItem {
  id: string;
  name: string;
  href: string;
  description?: string;
  icon?: string;
  featured?: boolean;
  children?: MegaMenuItem[];
  isEnabled?: boolean;
  position?: number;
  textColor?: string;
  backgroundColor?: string;
  config?: Record<string, any>;
  isMegaMenu?: boolean;
  megaMenuColumns?: number;
  target?: string;
  referenceId?: string;
  // Enhanced customization options
  badge?: {
    text: string;
    color: string;
    backgroundColor: string;
  };
  hoverEffect?: 'none' | 'scale' | 'slide' | 'fade';
  customClass?: string;
  imageSize?: 'small' | 'medium' | 'large';
  showDescription?: boolean;
}

export interface MegaMenuSection {
  id: string;
  title: string;
  description?: string;
  items: MegaMenuItem[];
  isEnabled?: boolean;
  position?: number;
  // Enhanced customization options
  columnSpan?: number;
  backgroundColor?: string;
  borderColor?: string;
  titleColor?: string;
  showTitle?: boolean;
  maxItems?: number;
  layout?: 'vertical' | 'grid' | 'horizontal';
}

interface MegaMenuProps {
  sections: MegaMenuSection[];
  featuredItems?: MegaMenuItem[];
  bannerTitle?: string;
  bannerLink?: string;
  onClose: () => void;
  // Enhanced customization options
  layout?: 'auto' | 'custom';
  customColumns?: number;
  maxWidth?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  showFeaturedItems?: boolean;
  featuredItemsTitle?: string;
  featuredItemsPosition?: 'left' | 'right' | 'bottom';
  // Banner customization
  bannerConfig?: {
    title?: string;
    subtitle?: string;
    description?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundImage?: string;
    position?: 'top' | 'bottom';
  };
}

const MegaMenuSectionContent: React.FC<{
  section: MegaMenuSection;
  onClose: () => void;
}> = ({ section, onClose }) => {
  // Apply custom styling
  const sectionStyle = {
    backgroundColor: section.backgroundColor || undefined,
    borderColor: section.borderColor || undefined,
  };

  const titleStyle = {
    color: section.titleColor || undefined,
  };

  // Filter items based on maxItems setting
  const filteredItems = section.items
    .filter(item => item.isEnabled !== false)
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .slice(0, section.maxItems || undefined);

  return (
    <div className="h-full" style={sectionStyle}>
      {/* Section Header */}
      {section.showTitle !== false && (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-5" style={{ borderColor: section.borderColor || undefined }}>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]" style={titleStyle}>
            {section.title}
          </h3>
          {section.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {section.description}
            </p>
          )}
        </div>
      )}

      {/* Section Items */}
      <div className={section.layout === 'grid' ? 'grid grid-cols-2 gap-2' : section.layout === 'horizontal' ? 'flex gap-2 overflow-x-auto' : 'space-y-2'}>
        {filteredItems.map((item) => {
          // Get icon size based on item configuration
          const iconSize = item.imageSize === 'small' ? 16 : item.imageSize === 'large' ? 24 : 20;

          // Apply hover effect
          const hoverClasses = {
            none: '',
            scale: 'hover:scale-105',
            slide: 'hover:translate-x-1',
            fade: 'hover:opacity-80'
          }[item.hoverEffect || 'none'];

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                group flex items-center gap-4 px-3 py-2.5 rounded-lg
                hover:bg-gray-50 dark:hover:bg-gray-800/80
                transition-all duration-200
                ${hoverClasses}
                ${item.customClass || ''}
                ${section.layout === 'horizontal' ? 'flex-shrink-0' : ''}
              `}
              onClick={onClose}
              target={item.target === '_blank' ? '_blank' : undefined}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              style={{
                color: item.textColor || undefined,
                backgroundColor: item.backgroundColor || undefined
              }}
            >
              {/* Item Icon */}
              {item.icon && (
                <UnifiedIcon
                  icon={item.icon}
                  variant="nav"
                  size={iconSize}
                  className="transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                />
              )}

              {/* Item Content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate mb-0"
                    style={{ color: item.textColor || undefined }}
                  >
                    {item.name}
                  </h4>
                  {item.featured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Featured
                    </span>
                  )}
                  {item.badge && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                      style={{
                        color: item.badge.color,
                        backgroundColor: item.badge.backgroundColor,
                      }}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </div>
                {item.description && item.showDescription !== false && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const FeaturedProducts: React.FC<{
  items: MegaMenuItem[];
  onClose: () => void;
  customTitle?: string;
}> = ({ items, onClose, customTitle }) => {
  const t = useTranslations();
  const featuredProductsLabel = customTitle || (t.has('menu.megaMenu.featuredProducts')
    ? t('menu.megaMenu.featuredProducts')
    : 'Featured Products');
  const viewAllProductsLabel = t.has('menu.megaMenu.viewAll')
    ? t('menu.megaMenu.viewAll')
    : 'View All Products';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 h-full shadow-sm">
      <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] mb-5">
        {featuredProductsLabel}
      </h3>

      <div className="space-y-3.5">
        {items.filter(item => item.isEnabled !== false).sort((a, b) => (a.position || 0) - (b.position || 0)).slice(0, 3).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex items-center gap-4 px-4 py-3 bg-white dark:bg-gray-900/40 rounded-lg border-0 transition-all duration-200"
            onClick={onClose}
            target={item.target === '_blank' ? '_blank' : undefined}
            rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
            style={{
              backgroundColor: item.backgroundColor || undefined
            }}
          >
            {item.icon && (
              <UnifiedIcon
                icon={item.icon}
                variant="nav"
                size={20}
                className="transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
              />
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate mb-0" style={{ color: item.textColor || undefined }}>
                {item.name}
              </h4>
              {item.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {items.length > 3 && (
        <div className="mt-4 text-center">
          <Link
            href="/featured-products"
            className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 gap-1"
            onClick={onClose}
          >
            {viewAllProductsLabel}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

const BannerSection: React.FC<{
  link?: string;
  title?: string;
  onClose: () => void;
  bannerConfig?: {
    title?: string;
    subtitle?: string;
    description?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundImage?: string;
    position?: 'top' | 'bottom';
  };
}> = ({ link, title, onClose, bannerConfig }) => {
  if (!title && !bannerConfig?.title) return null;

  const bannerTitle = bannerConfig?.title || title;
  const bannerSubtitle = bannerConfig?.subtitle;
  const bannerDescription = bannerConfig?.description;
  const buttonText = bannerConfig?.buttonText || 'Shop Now';
  const buttonLink = bannerConfig?.buttonLink || link;

  const bannerStyle = {
    backgroundColor: bannerConfig?.backgroundColor || undefined,
    color: bannerConfig?.textColor || undefined,
    backgroundImage: bannerConfig?.backgroundImage ? `url(${bannerConfig.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const content = (
    <div
      className={`relative overflow-hidden rounded-lg p-6 ${
        bannerConfig?.backgroundImage ? 'text-white' : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
      }`}
      style={bannerStyle}
    >
      {/* Overlay for background images */}
      {bannerConfig?.backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>
      )}

      <div className="relative z-10">
        {bannerSubtitle && (
          <p className="text-xs uppercase tracking-wider opacity-75 mb-2">
            {bannerSubtitle}
          </p>
        )}
        <h3 className="text-lg font-bold mb-2">
          {bannerTitle}
        </h3>
        {bannerDescription && (
          <p className="text-sm opacity-90 mb-4">
            {bannerDescription}
          </p>
        )}
        {buttonLink && (
          <Link
            href={buttonLink}
            onClick={onClose}
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            {buttonText} →
          </Link>
        )}
      </div>
    </div>
  );

  if (buttonLink) {
    return content;
  }

  return content;
};

const MegaMenu: React.FC<MegaMenuProps> = ({
  sections,
  featuredItems = [],
  bannerTitle,
  bannerLink,
  onClose,
  layout = 'auto',
  customColumns,
  maxWidth,
  backgroundColor,
  borderColor,
  borderRadius,
  showFeaturedItems = true,
  featuredItemsTitle,
  featuredItemsPosition = 'right',
  bannerConfig
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuTop, setMenuTop] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const parentElement = menuRef.current?.parentElement;
    if (!parentElement) return;

    const updatePosition = () => {
      const rect = parentElement.getBoundingClientRect();
      setMenuTop(rect.bottom + 8); // 8px gap = mt-2
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

  const hasBanner = bannerTitle || bannerConfig?.title;
  const hasFeatured = featuredItems.length > 0 && showFeaturedItems;

  // Apply custom styling to the menu container
  const menuStyle = {
    maxWidth: maxWidth || undefined,
    backgroundColor: backgroundColor || undefined,
    borderColor: borderColor || undefined,
    borderRadius: borderRadius || undefined,
  };

  // Determine grid layout based on content and custom settings
  const getGridClasses = () => {
    if (layout === 'custom' && customColumns) {
      return `grid-cols-1 md:grid-cols-${customColumns} gap-8`;
    }

    if (hasFeatured && sections.length > 0) {
      // Layout with featured items
      return featuredItemsPosition === 'bottom'
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
        : 'grid-cols-1 lg:grid-cols-4 gap-8';
    } else if (sections.length === 1) {
      return 'grid-cols-1';
    } else if (sections.length === 2) {
      return 'grid-cols-1 md:grid-cols-2 gap-8';
    } else if (sections.length <= 4) {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
    } else {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8';
    }
  };

  // Calculate column spans for sections
  const getSectionColumnSpan = (section: MegaMenuSection) => {
    return section.columnSpan || 1;
  };

  return (
    <div
      ref={menuRef}
      className="fixed left-1/2 -translate-x-1/2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[60] min-w-[320px]"
      style={{
        top: menuTop ?? undefined,
        visibility: menuTop === null ? 'hidden' : undefined,
        ...menuStyle
      }}
    >
      {/* Banner at top */}
      {hasBanner && bannerConfig?.position === 'top' && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="px-5 py-4">
            <BannerSection
              link={bannerLink}
              title={bannerTitle}
              onClose={onClose}
              bannerConfig={bannerConfig}
            />
          </div>
        </div>
      )}

      <div className="w-full px-5 py-6 lg:px-7 lg:py-8">
        <div className={`grid ${getGridClasses()}`}>
          {/* Menu Sections */}
          {sections.map((section) => (
            <div
              key={section.id}
              className={`space-y-5 ${
                getSectionColumnSpan(section) > 1
                  ? `col-span-${getSectionColumnSpan(section)}`
                  : ''
              }`}
            >
              <MegaMenuSectionContent
                section={section}
                onClose={onClose}
              />
            </div>
          ))}

          {/* Featured Products */}
          {hasFeatured && featuredItemsPosition === 'right' && (
            <div className="space-y-4">
              <FeaturedProducts
                items={featuredItems}
                onClose={onClose}
                customTitle={featuredItemsTitle}
              />
            </div>
          )}
        </div>

        {/* Featured Products at bottom */}
        {hasFeatured && featuredItemsPosition === 'bottom' && (
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
            <FeaturedProducts
              items={featuredItems}
              onClose={onClose}
              customTitle={featuredItemsTitle}
            />
          </div>
        )}

        {/* Banner Section */}
        {hasBanner && bannerConfig?.position !== 'top' && (
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
            <div className="max-w-md">
              <BannerSection
                link={bannerLink}
                title={bannerTitle}
                onClose={onClose}
                bannerConfig={bannerConfig}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MegaMenu;
