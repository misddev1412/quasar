'use client';

import React, { useState, useEffect } from 'react';
import CategoryCard from './CategoryCard';
import { Button } from '@heroui/react';
import { CategoryService } from '../../services/category.service';
import type { Category, CategoryTree } from '../../types/product';
import { useTranslation } from 'react-i18next';

interface CategoriesContainerProps {
  initialCategories?: Category[];
}

const CategoriesContainer: React.FC<CategoriesContainerProps> = ({ initialCategories }) => {
  // State for categories and view mode
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid');
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories function
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCategories = await CategoryService.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch category tree function
  const fetchCategoryTree = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tree = await CategoryService.getCategoryTree();
      setCategoryTree(tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category tree');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (viewMode === 'grid') {
      fetchCategories();
    } else {
      fetchCategoryTree();
    }
  }, [viewMode]);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error loading categories</div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error}
          </p>
          <Button
            onClick={() => viewMode === 'grid' ? fetchCategories() : fetchCategoryTree()}
            color="primary"
            variant="bordered"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* View Mode Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Categories
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {viewMode === 'grid'
              ? `Showing ${categories.length} categories`
              : `Browse categories by hierarchy`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">View:</span>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'tree'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Tree
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              className="transform hover:scale-105 transition-all duration-300"
            />
          ))}
        </div>
      )}

      {/* Categories Tree */}
      {viewMode === 'tree' && (
        <div className="space-y-6">
          {categoryTree.map((category) => (
            <CategoryTreeNode
              key={category.id}
              category={category}
              level={0}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {((viewMode === 'grid' && categories.length === 0) ||
        (viewMode === 'tree' && categoryTree.length === 0)) && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No categories found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Categories will appear here once they are created.
          </p>
        </div>
      )}
    </div>
  );
};

// Tree view component for nested categories
interface CategoryTreeNodeProps {
  category: CategoryTree;
  level: number;
}

const CategoryTreeNode: React.FC<CategoryTreeNodeProps> = ({ category, level }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className={`${level > 0 ? 'ml-6' : ''}`}>
      <div
        className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 transition-colors cursor-pointer`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {hasChildren && (
            <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <div className={`w-2 h-2 bg-green-500 rounded-full ${level === 0 ? '' : 'opacity-60'}`}></div>
          <div>
            <h3 className={`font-medium text-gray-900 dark:text-white ${level === 0 ? 'text-lg' : 'text-base'}`}>
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {category.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {category.productCount !== undefined && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('ecommerce.categoryCard.productCount', { count: category.productCount })}
            </span>
          )}
          <a
            href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {t('ecommerce.categoryCard.viewProducts')} →
          </a>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-3 space-y-2">
          {category.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesContainer;
