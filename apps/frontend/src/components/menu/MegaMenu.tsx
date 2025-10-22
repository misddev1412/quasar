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
}

export interface MegaMenuSection {
  id: string;
  title: string;
  description?: string;
  items: MegaMenuItem[];
  isEnabled?: boolean;
  position?: number;
}

interface MegaMenuProps {
  sections: MegaMenuSection[];
  featuredItems?: MegaMenuItem[];
  bannerTitle?: string;
  bannerLink?: string;
  onClose: () => void;
}

const MegaMenuSectionContent: React.FC<{
  section: MegaMenuSection;
  onClose: () => void;
}> = ({ section, onClose }) => {
  return (
    <div className="h-full">
      {/* Section Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
          {section.title}
        </h3>
        {section.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            {section.description}
          </p>
        )}
      </div>

      {/* Section Items */}
      <div className="space-y-2">
        {section.items
          .filter(item => item.isEnabled !== false)
          .sort((a, b) => (a.position || 0) - (b.position || 0))
          .map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="
                group flex items-center gap-4 px-3 py-2.5 rounded-lg
                hover:bg-gray-50 dark:hover:bg-gray-800/80
                transition-colors duration-200
              "
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
                  size={20}
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
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

const FeaturedProducts: React.FC<{
  items: MegaMenuItem[];
  onClose: () => void;
}> = ({ items, onClose }) => {
  const t = useTranslations();
  const featuredProductsLabel = t.has('menu.megaMenu.featuredProducts')
    ? t('menu.megaMenu.featuredProducts')
    : 'Featured Products';
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
            className="group flex items-center gap-4 px-4 py-3 bg-white dark:bg-gray-900/40 rounded-lg border border-transparent hover:border-blue-100 dark:hover:border-blue-900 transition-all duration-200"
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
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 gap-1"
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
}> = ({ link, title, onClose }) => {
  if (!title) return null;

  const content = (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 p-6 text-white">
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-2">
          {title}
        </h3>
        <p className="text-sm opacity-90 mb-4">
          Discover our latest collection with exclusive deals
        </p>
        <div className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
          Shop Now →
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} onClick={onClose}>
        {content}
      </Link>
    );
  }

  return content;
};

const MegaMenu: React.FC<MegaMenuProps> = ({
  sections,
  featuredItems = [],
  bannerTitle,
  bannerLink,
  onClose
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

  const hasBanner = bannerTitle;
  const hasFeatured = featuredItems.length > 0;

  // Determine grid layout based on content
  const getGridClasses = () => {
    if (hasFeatured && sections.length > 0) {
      // Layout with featured items
      return 'grid-cols-1 lg:grid-cols-4 gap-8';
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

  return (
    <div
      ref={menuRef}
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-7xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[60] min-w-[320px]"
      style={{
        top: menuTop ?? undefined,
        visibility: menuTop === null ? 'hidden' : undefined
      }}
    >
      <div className="w-full px-5 py-6 lg:px-7 lg:py-8">
        <div className={`grid ${getGridClasses()}`}>
          {/* Menu Sections */}
          {sections.map((section) => (
            <div key={section.id} className="space-y-5">
              <MegaMenuSectionContent
                section={section}
                onClose={onClose}
              />
            </div>
          ))}

          {/* Featured Products - takes last column */}
          {hasFeatured && (
            <div className="space-y-4">
              <FeaturedProducts
                items={featuredItems}
                onClose={onClose}
              />
            </div>
          )}
        </div>

        {/* Banner Section */}
        {hasBanner && (
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
            <div className="max-w-md">
              <BannerSection
                link={bannerLink}
                title={bannerTitle}
                onClose={onClose}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MegaMenu;
