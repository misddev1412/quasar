import React, { useState, useCallback, useEffect } from 'react';
import { 
  FiChevronRight, 
  FiChevronDown, 
  FiFolder, 
  FiFolderPlus, 
  FiEdit2, 
  FiTrash2, 
  FiMoreVertical,
  FiTag,
  FiEye,
  FiUsers,
  FiLoader,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import { Button } from '../common/Button';
import { Dropdown } from '../common/Dropdown';
import { FormInput } from '../common/FormInput';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Category } from '../../types/product';
import { trpc } from '../../utils/trpc';
import { CategoryFilter, CategoryFilterOptions } from './CategoryFilter';

interface CategoryTreeNode {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
  children?: CategoryTreeNode[];
}

interface LazyCategory extends Category {
  children?: LazyCategory[];
  hasChildren?: boolean;
  isLoaded?: boolean;
  isExpanded?: boolean;
}

interface LazyLoadingCategoryTreeViewProps {
  onEdit: (category: LazyCategory) => void;
  onDelete: (category: LazyCategory) => void;
  onAddChild: (parentCategory: LazyCategory) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  includeInactive?: boolean;
  showFilters?: boolean;
  onFilterClick?: () => void;
  filters?: CategoryFilterOptions;
  onFiltersChange?: (filters: CategoryFilterOptions) => void;
  useFilteredEndpoint?: boolean;
}

interface CategoryTreeItemProps {
  category: LazyCategory;
  level: number;
  onToggleExpand: (category: LazyCategory) => void;
  onEdit: (category: LazyCategory) => void;
  onDelete: (category: LazyCategory) => void;
  onAddChild: (parentCategory: LazyCategory) => void;
  searchValue?: string;
  isLoading?: boolean;
  isLastInGroup?: boolean;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  level,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddChild,
  searchValue,
  isLoading = false,
  isLastInGroup = false,
}) => {
  const { t } = useTranslationWithBackend();
  
  const handleToggleExpand = () => {
    if (category.hasChildren) {
      onToggleExpand(category);
    }
  };

  const isHighlighted = searchValue && (
    category.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchValue.toLowerCase()))
  );

  const highlightText = (text: string) => {
    if (!searchValue || !text) return text;
    
    const regex = new RegExp(`(${searchValue})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className={`${isHighlighted ? 'bg-yellow-50 dark:bg-yellow-900/20 rounded-lg' : ''} ${!isLastInGroup || (category.hasChildren && category.isExpanded) ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
      <div
        className={`
          group flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg
          border-l-2 transition-all duration-200 ease-in-out
          ${level === 0 ? 'border-l-blue-500' : level === 1 ? 'border-l-green-500' : level === 2 ? 'border-l-purple-500' : 'border-l-gray-300'}
        `}
        style={{ 
          marginLeft: `${level * 12}px`,
          paddingLeft: `${16 + level * 8}px`
        }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={handleToggleExpand}
          className={`
            mr-3 p-1 rounded transition-colors duration-200
            ${category.hasChildren
              ? 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700' 
              : 'text-transparent cursor-default'
            }
          `}
          disabled={!category.hasChildren || isLoading}
        >
          {category.hasChildren ? (
            isLoading ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : category.isExpanded ? (
              <FiChevronDown className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>

        {/* Category Image/Icon */}
        <div className="flex-shrink-0 mr-3">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-10 h-10 object-cover rounded-lg shadow-sm"
            />
          ) : (
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center shadow-sm
              ${level === 0 
                ? 'bg-blue-100 dark:bg-blue-900/30' 
                : level === 1 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : level === 2 
                    ? 'bg-purple-100 dark:bg-purple-900/30' 
                    : 'bg-gray-100 dark:bg-gray-800'
              }
            `}>
              <FiFolder className={`w-5 h-5 ${
                level === 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : level === 1 
                    ? 'text-green-600 dark:text-green-400' 
                    : level === 2 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-gray-400'
              }`} />
            </div>
          )}
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {highlightText(category.name)}
                </h4>
                
                {/* Status Badge */}
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${category.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }
                `}>
                  {category.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                </span>

                {/* Level Badge */}
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                  title={`Level ${category.level ?? 0} - ${category.level === 0 ? 'Root category' : `${category.level} level${category.level > 1 ? 's' : ''} deep`}`}
                >
                  L{category.level ?? 0}
                </span>

                {/* Has Children Indicator */}
                {category.hasChildren && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <FiTag className="w-3 h-3 mr-1" />
                    {t('categories.hasChildren', 'Has children')}
                  </span>
                )}

                {/* Product Count Badge */}
                {(category.productsCount ?? 0) > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    <FiUsers className="w-3 h-3 mr-1" />
                    {category.productsCount} {category.productsCount === 1 ? 'product' : 'products'}
                  </span>
                )}
              </div>
              
              {category.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                  {highlightText(category.description)}
                </p>
              )}
              
              {category.slug && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 font-mono">
                  /{category.slug}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Dropdown
                button={
                  <Button variant="ghost" size="sm" className="p-2">
                    <FiMoreVertical className="w-4 h-4" />
                  </Button>
                }
                items={[
                  {
                    label: t('categories.addSubcategory', 'Add Subcategory'),
                    icon: <FiFolderPlus className="w-4 h-4" />,
                    onClick: () => onAddChild(category)
                  },
                  {
                    label: t('common.edit', 'Edit'),
                    icon: <FiEdit2 className="w-4 h-4" />,
                    onClick: () => onEdit(category)
                  },
                  {
                    label: t('common.view', 'View Details'),
                    icon: <FiEye className="w-4 h-4" />,
                    onClick: () => {
                      // TODO: Add view details functionality
                    }
                  },
                  {
                    label: t('common.delete', 'Delete'),
                    icon: <FiTrash2 className="w-4 h-4" />,
                    onClick: () => onDelete(category),
                    className: 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {category.hasChildren && category.isExpanded && category.children && (
        <div className="ml-4 border-l border-b border-gray-200 dark:border-gray-700">
          {category.children.map((child, index) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              searchValue={searchValue}
              isLastInGroup={index === category.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const LazyLoadingCategoryTreeView: React.FC<LazyLoadingCategoryTreeViewProps> = ({
  onEdit,
  onDelete,
  onAddChild,
  searchValue,
  onSearchChange,
  includeInactive = false,
  showFilters = false,
  onFilterClick,
  filters = {},
  onFiltersChange,
  useFilteredEndpoint = false,
}) => {
  const { t } = useTranslationWithBackend();
  const [categories, setCategories] = useState<LazyCategory[]>([]);
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());

  // Utils for manual queries
  const utils = trpc.useUtils();

  // Load root categories initially
  const { data: rootCategoriesData, isLoading, error } = trpc.adminProductCategories.getRootCategories.useQuery({
    includeInactive,
  });

  // For now, we'll simulate filtered tree by using client-side filtering
  // Once tRPC types are properly updated, this can use the getFilteredTree endpoint
  const [filteredTreeData, setFilteredTreeData] = useState<any>(null);
  const [filteredLoading, setFilteredLoading] = useState(false);
  const [filteredError, setFilteredError] = useState<any>(null);

  // Calculate active filter count
  const activeFilterCount = React.useMemo(() => {
    if (!filters) return 0;
    let count = 0;
    if (filters.search) count++;
    if (filters.isActive !== undefined) count++;
    if (filters.parentId) count++;
    if (filters.level !== undefined) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  // Manual filtering effect when using filtered endpoint
  useEffect(() => {
    if (useFilteredEndpoint && Object.keys(filters).length > 0) {
      setFilteredLoading(true);
      setFilteredError(null);
      
      // Try to use the utils.fetch method to call getFilteredTree manually
      const fetchFilteredData = async () => {
        try {
          // For now, we'll use getTree and apply client-side filtering
          // This will be replaced with getFilteredTree once tRPC types are fixed
          const response = await utils.adminProductCategories.getTree.fetch({
            includeInactive,
          }) as { data?: any[] };
          
          // Apply client-side search filtering if search is provided
          if (filters.search && response?.data) {
            const filterTree = (nodes: any[]): any[] => {
              return nodes.filter(node => {
                const matchesSearch = node.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
                  (node.description && node.description.toLowerCase().includes(filters.search!.toLowerCase()));
                
                // Also include if any children match
                const childrenMatch = node.children && filterTree(node.children).length > 0;
                
                if (matchesSearch || childrenMatch) {
                  return {
                    ...node,
                    children: node.children ? filterTree(node.children) : undefined
                  };
                }
                return false;
              }).filter(Boolean);
            };
            
            const filteredData = {
              ...response,
              data: filterTree(response.data)
            };
            setFilteredTreeData(filteredData);
          } else {
            setFilteredTreeData(response);
          }
        } catch (err) {
          setFilteredError(err);
          console.error('Error fetching filtered tree:', err);
        } finally {
          setFilteredLoading(false);
        }
      };
      
      void fetchFilteredData();
    } else {
      setFilteredTreeData(null);
      setFilteredLoading(false);
      setFilteredError(null);
    }
  }, [useFilteredEndpoint, filters, includeInactive, utils]);

  useEffect(() => {
    // Use filtered tree data if available and filtered endpoint is enabled, otherwise use root categories
    const dataToUse = (useFilteredEndpoint && filteredTreeData) ? filteredTreeData : rootCategoriesData;
    
    if (dataToUse && (dataToUse as any)?.data) {
      const categoryData = (dataToUse as any).data;
      
      // Handle both tree structure (from getTree) and flat structure (from getRootCategories)
      let categoriesToProcess: (Category & { hasChildren?: boolean })[];
      
      if (Array.isArray(categoryData)) {
        // If it's an array, it could be either root categories or tree nodes
        if (categoryData.length > 0 && categoryData[0].children !== undefined) {
          // It's a tree structure, flatten to root level for lazy loading
          categoriesToProcess = categoryData.map(cat => ({
            ...cat,
            hasChildren: cat.children && cat.children.length > 0,
            children: undefined, // Remove children for lazy loading
          }));
        } else {
          // It's a flat array of root categories
          categoriesToProcess = categoryData;
        }
      } else {
        // Handle unexpected data structure
        categoriesToProcess = [];
      }
      
      // Convert to lazy-loaded format
      const lazyCategories: LazyCategory[] = categoriesToProcess.map(cat => ({
        ...cat,
        hasChildren: cat.hasChildren || false,
        isLoaded: false,
        isExpanded: false,
        children: undefined,
      }));
      
      setCategories(lazyCategories);
    }
  }, [rootCategoriesData, filteredTreeData, useFilteredEndpoint]);

  // Helper function to recursively update hasChildren property
  const updateCategoriesHasChildren = (
    categories: LazyCategory[], 
    targetId: string, 
    hasChildren: boolean
  ): LazyCategory[] => {
    return categories.map(cat => {
      if (cat.id === targetId) {
        return { ...cat, hasChildren };
      }
      
      if (cat.children) {
        return {
          ...cat,
          children: updateCategoriesHasChildren(cat.children, targetId, hasChildren),
        };
      }
      
      return cat;
    });
  };

  // Helper function to recursively update category expansion state
  const updateCategoryExpansion = (
    categories: LazyCategory[], 
    targetId: string, 
    isExpanded: boolean
  ): LazyCategory[] => {
    return categories.map(cat => {
      if (cat.id === targetId) {
        return { ...cat, isExpanded };
      }
      
      if (cat.children) {
        return {
          ...cat,
          children: updateCategoryExpansion(cat.children, targetId, isExpanded),
        };
      }
      
      return cat;
    });
  };

  const handleToggleExpand = useCallback(async (category: LazyCategory) => {
    if (!category.hasChildren) return;

    // If expanding and children not loaded yet, load them first
    if (!category.isExpanded && !category.isLoaded) {
      setLoadingNodes(prev => new Set(prev).add(category.id));

      try {
        // Fetch direct children of this category using API
        const childrenResponse = await utils.adminProductCategories.getCategoryChildren.fetch({
          parentId: category.id,
          includeInactive,
        });
        
        if ((childrenResponse as any)?.data) {
          const children = (childrenResponse as any).data as (Category & { hasChildren: boolean })[];

          // Convert children to lazy-loaded format
          const lazyChildren: LazyCategory[] = children.map((child) => ({
            ...child,
            hasChildren: child.hasChildren || false,
            isLoaded: false,
            isExpanded: false,
            children: undefined,
          }));

          // If no children found, update hasChildren to false
          if (lazyChildren.length === 0) {
            setCategories(prev => updateCategoriesHasChildren(prev, category.id, false));
            return;
          }

          // Update with children and expand
          setCategories(prev => {
            const withChildren = updateCategoryTree(prev, category.id, lazyChildren);
            return updateCategoryExpansion(withChildren, category.id, true);
          });
        }
      } catch (error) {
        console.error('Failed to load children:', error);
        // TODO: Add proper error handling/toast
      } finally {
        setLoadingNodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(category.id);
          return newSet;
        });
      }
    } else {
      // Just toggle expansion state if children are already loaded
      setCategories(prev => updateCategoryExpansion(prev, category.id, !category.isExpanded));
    }
  }, [utils, includeInactive]);

  // Helper function to update category tree with children
  const updateCategoryTree = (
    categories: LazyCategory[], 
    parentId: string, 
    children: LazyCategory[]
  ): LazyCategory[] => {
    return categories.map(cat => {
      if (cat.id === parentId) {
        return {
          ...cat,
          children,
          isLoaded: true,
        };
      }
      
      if (cat.children) {
        return {
          ...cat,
          children: updateCategoryTree(cat.children, parentId, children),
        };
      }
      
      return cat;
    });
  };

  // Determine which loading/error state to show
  const currentLoading = useFilteredEndpoint && Object.keys(filters).length > 0 ? filteredLoading : isLoading;
  const currentError = useFilteredEndpoint && Object.keys(filters).length > 0 ? filteredError : error;

  if (currentLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FiLoader className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">{t('common.loading', 'Loading...')}</span>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        <p>{t('common.error', 'Error')}: {(currentError as any).message}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <FiFolder className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('categories.noCategories', 'No categories')}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('categories.noCategoriesDesc', 'Get started by creating your first category.')}
        </p>
      </div>
    );
  }

  const handleResetFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({});
    }
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input with Filter Button */}
      {onSearchChange && (
        <div className="flex items-center space-x-3">
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <FiSearch
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none z-10"
              style={{ left: '12px' }}
            />
            <input
              type="text"
              placeholder={t('categories.searchPlaceholder', 'Search categories...')}
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="table-search-input w-full h-10 pl-11 pr-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 text-sm"
              aria-label={t('categories.searchLabel', 'Search categories')}
            />
          </div>
          
          {/* Filter Button */}
          {onFilterClick && (
            <Button
              variant={showFilters ? "primary" : "outline"}
              size="sm"
              onClick={onFilterClick}
              className={`whitespace-nowrap flex-shrink-0 w-auto transition-all duration-200 ${
                showFilters
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md'
                  : ''
              }`}
              aria-label={showFilters ? t('common.hideFilters', 'Hide Filters') : t('common.showFilters', 'Show Filters')}
            >
              <FiFilter className={`w-4 h-4 mr-2 ${showFilters ? 'text-white' : ''}`} />
              {t('common.filter', 'Filter')}
            </Button>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {onFiltersChange && showFilters && (
        <CategoryFilter
          filters={filters || {}}
          onFiltersChange={onFiltersChange}
          onClearFilters={handleResetFilters}
          activeFilterCount={activeFilterCount}
        />
      )}

      {/* Categories Tree */}
      <div className="space-y-2">
        {categories.map((category, index) => (
          <CategoryTreeItem
            key={category.id}
            category={category}
            level={0}
            onToggleExpand={handleToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            searchValue={searchValue}
            isLoading={loadingNodes.has(category.id)}
            isLastInGroup={index === categories.length - 1}
          />
        ))}
      </div>
    </div>
  );
};