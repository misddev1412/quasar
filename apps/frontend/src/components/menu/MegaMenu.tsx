'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Icons
const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

export interface MegaMenuItem {
  id: string;
  name: string;
  href: string;
  description?: string;
  image?: string;
  badge?: string;
  featured?: boolean;
  children?: MegaMenuItem[];
}

export interface MegaMenuSection {
  id: string;
  title: string;
  description?: string;
  items: MegaMenuItem[];
}

interface MegaMenuProps {
  sections: MegaMenuSection[];
  featuredItems?: MegaMenuItem[];
  bannerImage?: string;
  bannerLink?: string;
  bannerTitle?: string;
  onClose: () => void;
}

const MegaMenuSection: React.FC<{
  section: MegaMenuSection;
  onClose: () => void;
}> = ({ section, onClose }) => {
  return (
    <div className="h-full">
      {/* Section Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
          {section.title}
        </h3>
        {section.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {section.description}
          </p>
        )}
      </div>

      {/* Section Items */}
      <div className="space-y-1">
        {section.items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="
              group flex items-start gap-3 p-2 rounded-lg
              hover:bg-gray-50 dark:hover:bg-gray-800
              transition-colors duration-200
            "
            onClick={onClose}
          >
            {/* Item Image */}
            {item.image && (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}
            {!item.image && (
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-200">
                <ImageIcon />
              </div>
            )}

            {/* Item Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                  {item.name}
                </h4>
                {item.badge && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {item.badge}
                  </span>
                )}
                {item.featured && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Featured
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
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

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 h-full">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
        {t('menu.megaMenu.featuredProducts', 'Featured Products')}
      </h3>

      <div className="space-y-3">
        {items.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            onClick={onClose}
          >
            {item.image && (
              <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            )}
            {!item.image && (
              <div className="w-14 h-14 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-200">
                <ImageIcon />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
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
            {t('menu.megaMenu.viewAll', 'View All Products')}
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
  image?: string;
  link?: string;
  title?: string;
  onClose: () => void;
}> = ({ image, link, title, onClose }) => {
  if (!image && !title) return null;

  const content = (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 p-6 text-white">
      {image && (
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={title || 'Banner'}
            fill
            className="object-cover opacity-30"
          />
        </div>
      )}

      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-2">
          {title || 'Special Offer'}
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
  bannerImage,
  bannerLink,
  bannerTitle,
  onClose
}) => {
  const hasBanner = bannerImage || bannerTitle;
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
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-[60] min-w-[320px]">
      <div className="max-w-[90vw] lg:max-w-7xl mx-auto p-4 lg:p-6">
        <div className={`grid ${getGridClasses()}`}>
          {/* Menu Sections */}
          {sections.map((section) => (
            <div key={section.id} className="space-y-4">
              <MegaMenuSection
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
          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
            <div className="max-w-md">
              <BannerSection
                image={bannerImage}
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