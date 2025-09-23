import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Chip } from '@heroui/react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  children?: Category[];
  featured?: boolean;
}

interface CategoryListProps {
  categories: Category[];
  loading?: boolean;
  error?: string | null;
  className?: string;
  showProductCount?: boolean;
  showImages?: boolean;
  showDescription?: boolean;
  showChildren?: boolean;
  maxColumns?: number;
  variant?: 'grid' | 'list' | 'hierarchical';
  emptyMessage?: string;
  onCategoryClick?: (category: Category) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  loading = false,
  error = null,
  className = '',
  showProductCount = true,
  showImages = true,
  showDescription = false,
  showChildren = false,
  maxColumns = 4,
  variant = 'grid',
  emptyMessage = 'No categories found.',
  onCategoryClick,
}) => {
  const renderSkeletons = () => {
    const skeletonCount = variant === 'grid' ? maxColumns * 2 : 5;
    
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <div key={`skeleton-${index}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {showImages && (
          <div className="w-full h-32 bg-gray-200 animate-pulse"></div>
        )}
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    ));
  };

  const renderGridCategory = (category: Category) => {
    return (
      <Link
        key={category.id}
        to={`/categories/${category.slug}`}
        className="group"
        onClick={() => onCategoryClick && onCategoryClick(category)}
      >
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg h-full">
          {showImages && category.image && (
            <div className="relative h-32 overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {category.featured && (
                <Chip size="sm" color="primary" className="absolute top-2 left-2">
                  Featured
                </Chip>
              )}
            </div>
          )}
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">
                {category.name}
              </h3>
              {showProductCount && category.productCount !== undefined && (
                <Chip size="sm" variant="flat">
                  {category.productCount}
                </Chip>
              )}
            </div>
            
            {showDescription && category.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                {category.description}
              </p>
            )}
            
            {showChildren && category.children && category.children.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-gray-500">
                  {category.children.length} subcategories
                </div>
              </div>
            )}
          </div>
        </Card>
      </Link>
    );
  };

  const renderListCategory = (category: Category) => {
    return (
      <Link
        key={category.id}
        to={`/categories/${category.slug}`}
        className="group"
        onClick={() => onCategoryClick && onCategoryClick(category)}
      >
        <Card className="p-4 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-4">
            {showImages && category.image && (
              <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2">
                  {category.featured && (
                    <Chip size="sm" color="primary">
                      Featured
                    </Chip>
                  )}
                  {showProductCount && category.productCount !== undefined && (
                    <Chip size="sm" variant="flat">
                      {category.productCount}
                    </Chip>
                  )}
                </div>
              </div>
              
              {showDescription && category.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {category.description}
                </p>
              )}
              
              {showChildren && category.children && category.children.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500">
                    {category.children.length} subcategories
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    );
  };

  const renderHierarchicalCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <div key={category.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <Link
          to={`/categories/${category.slug}`}
          className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => onCategoryClick && onCategoryClick(category)}
        >
          <div className="flex items-center gap-3">
            {showImages && category.image && (
              <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900 group-hover:text-primary-500 transition-colors">
                  {category.name}
                </h3>
                {category.featured && (
                  <Chip size="sm" color="primary">
                    Featured
                  </Chip>
                )}
              </div>
              
              {showDescription && category.description && (
                <p className="text-sm text-gray-500 line-clamp-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showProductCount && category.productCount !== undefined && (
              <Chip size="sm" variant="flat">
                {category.productCount}
              </Chip>
            )}
            {hasChildren && (
              <span className="text-gray-400">
                {category.children?.length}
              </span>
            )}
          </div>
        </Link>
        
        {hasChildren && showChildren && (
          <div className="mt-1">
            {category.children?.map((child) => renderHierarchicalCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getGridClasses = () => {
    const cols = Math.min(maxColumns, 4);
    return `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${cols} gap-4`;
  };

  if (loading) {
    return (
      <div className={variant === 'grid' ? getGridClasses() : 'space-y-4'}>
        {renderSkeletons()}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 font-medium">Error loading categories</div>
        <div className="text-gray-500 mt-1">{error}</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {variant === 'grid' && (
        <div className={getGridClasses()}>
          {categories.map(renderGridCategory)}
        </div>
      )}
      
      {variant === 'list' && (
        <div className="space-y-4">
          {categories.map(renderListCategory)}
        </div>
      )}
      
      {variant === 'hierarchical' && (
        <div className="space-y-1">
          {categories.map((category) => renderHierarchicalCategory(category))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;