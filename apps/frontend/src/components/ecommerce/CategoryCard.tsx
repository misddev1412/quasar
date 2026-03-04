import React from 'react';
import Link from 'next/link';
import { Card, Chip } from '@heroui/react';
import type { Category } from '../../types/product';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'next-intl';
import { getCategoryLink } from '../../lib/link-utils';

interface CategoryCardProps {
  category: Category;
  className?: string;
  showProductCount?: boolean;
  showDescription?: boolean;
  imageHeight?: string;
  onCategoryClick?: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  className = '',
  showProductCount = true,
  showDescription = true,
  imageHeight = 'h-48',
  onCategoryClick,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeBase = locale.split('-')[0].toLowerCase();
  const { id, name, description, image, productCount } = category;
  const productCountLabel = typeof productCount === 'number'
    ? t('ecommerce.categoryCard.productCount', { count: productCount })
    : null;

  const handleClick = () => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  // Determine the best identifier for the link
  // User prefers slugs over IDs for aesthetics/SEO.
  // Priority:
  // 1. Translation Slug (Official, stored in DB)
  // 2. Name-based Slug (Generated, relies on backend fuzzy search)
  // 3. ID (Fallback)

  let linkSlug: string | undefined;

  // 1. Try translation slug
  if (Array.isArray(category.translations) && category.translations.length > 0) {
    const translation = category.translations.find((translation) => {
      if (!translation?.slug) return false;
      const normalizedLocale = translation.locale?.split('-')[0]?.toLowerCase();
      return normalizedLocale === localeBase;
    }) || category.translations.find((translation) => Boolean(translation?.slug));
    if (translation && translation.slug) {
      linkSlug = translation.slug;
    }
  }

  // 2. Provide fallback: Name-based slug (User preference)
  if (!linkSlug && name) {
    linkSlug = name.toLowerCase().trim().replace(/\s+/g, '-');
  }

  // 3. Absolute fallback: ID
  if (!linkSlug) {
    linkSlug = id;
  }

  return (
    <Link
      href={getCategoryLink(linkSlug, localeBase)}
      className={`group ${className}`}
      onClick={handleClick}
    >
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg h-full">
        {/* Category Image */}
        <div className={`relative overflow-hidden ${imageHeight}`}>
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">{name.charAt(0)}</span>
            </div>
          )}


          {/* Product Count Badge */}
          {showProductCount && productCount !== undefined && (
            <Chip
              size="sm"
              variant="solid"
              className="absolute top-2 right-2 bg-black/70 text-white border border-white/25 backdrop-blur-sm font-semibold"
            >
              {productCountLabel}
            </Chip>
          )}
        </div>

        {/* Category Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors mb-2">
            {name}
          </h3>

          {showDescription && description && (
            <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
          )}

          {/* View Products Button */}
          <div className="mt-4">
            <span className="text-sm font-medium text-primary-500 group-hover:text-primary-600 transition-colors">
              {t('ecommerce.categoryCard.viewProducts')} →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CategoryCard;
