import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Chip } from '@heroui/react';
import { Category } from './CategoryList';

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
  const {
    id,
    name,
    slug,
    description,
    image,
    productCount,
    featured,
  } = category;

  const handleClick = () => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  return (
    <Link
      to={`/categories/${slug}`}
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
          
          {/* Featured Badge */}
          {featured && (
            <Chip size="sm" color="primary" className="absolute top-2 left-2">
              Featured
            </Chip>
          )}
          
          {/* Product Count Badge */}
          {showProductCount && productCount !== undefined && (
            <Chip size="sm" variant="flat" className="absolute top-2 right-2 bg-white bg-opacity-80">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </Chip>
          )}
        </div>
        
        {/* Category Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors mb-2">
            {name}
          </h3>
          
          {showDescription && description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {description}
            </p>
          )}
          
          {/* View Products Button */}
          <div className="mt-4">
            <span className="text-sm font-medium text-primary-500 group-hover:text-primary-600 transition-colors">
              View Products →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CategoryCard;