import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { FiMenu } from 'react-icons/fi';
import { trpc } from '../../utils/trpc';
import SelectComponent, { components as selectComponents, MenuListProps } from 'react-select';

interface CategoryOption {
  value: string;
  label: string;
  image?: string | null;
  level?: number;
  productCount?: number;
  isActive?: boolean;
  description?: string | null;
}

interface CategorySelectorProps {
  value?: string;
  onChange: (categoryId: string | undefined) => void;
}

const mapCategoryToOption = (category: any): CategoryOption => {
  // Try to get translated name first, then fallback to default name
  const name = category?.translations?.[0]?.name || category?.name || 'Unnamed category';
  const description = category?.translations?.[0]?.description || category?.description || null;

  return {
    value: category.id,
    label: name,
    image: category.image,
    level: category.level || 0,
    productCount: category.productCount || 0,
    isActive: category.isActive !== false, // Default to true if undefined
    description,
  };
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const [selectedOption, setSelectedOption] = useState<CategoryOption | null>(null);
  const [searchOptions, setSearchOptions] = useState<CategoryOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuPortalTarget = typeof window !== 'undefined' ? window.document.body : undefined;

  const categoriesQuery = trpc.adminProductCategories.getAll.useQuery(
    {
      page,
      limit: 20,
      search: debouncedSearch,
      sortBy: 'level' as any,
      sortOrder: 'ASC',
      isActive: true, // Only show active categories by default
    },
    {
      placeholderData: (previousData) => previousData,
      enabled: true, // Always enabled for better UX
    },
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (initialLoad) {
      // Trigger initial load
      setInitialLoad(false);
      return;
    }
    setPage(1);
    setSearchOptions([]);
  }, [debouncedSearch]);

  useEffect(() => {
    if (categoriesQuery.data && typeof categoriesQuery.data === 'object') {
      const data = categoriesQuery.data as any;

      // Try different possible data structures
      let items = [];
      let hasMore = false;

      if (data?.result?.data?.data?.items && Array.isArray(data.result.data.data.items)) {
        // Nested structure: result.data.data.items
        items = data.result.data.data.items;
        hasMore = data.result.data.data.page < data.result.data.data.totalPages;
      } else if (data?.data?.data?.items && Array.isArray(data.data.data.items)) {
        // Structure: data.data.items
        items = data.data.data.items;
        hasMore = data.data.data.page < data.data.data.totalPages;
      } else if (data?.data?.items && Array.isArray(data.data.items)) {
        // Structure: data.items
        items = data.data.items;
        hasMore = data.data.page < data.data.totalPages;
      } else if (data?.items && Array.isArray(data.items)) {
        // Direct structure: items
        items = data.items;
        hasMore = data.page < data.totalPages;
      } else if (Array.isArray(data?.data)) {
        // Direct data array
        items = data.data;
        hasMore = false;
      }

      // Ensure items is always an array
      if (!Array.isArray(items)) {
        console.warn('CategorySelector: items is not an array, falling back to empty array', { items, data });
        items = [];
        hasMore = false;
      }

      const newOptions = items.map(mapCategoryToOption);

      if (page === 1) {
        setSearchOptions(newOptions);
      } else {
        setSearchOptions(prev => [...prev, ...newOptions]);
      }
      setHasMore(hasMore);
    }
  }, [categoriesQuery.data, page]);

  useEffect(() => {
    if (value && !selectedOption) {
      let cancelled = false;
      (async () => {
        try {
          const { trpcClient } = await import('../../utils/trpc');
          const response = await trpcClient.adminProductCategories.getById.query({ id: value });
          const category = (response as any)?.data;
          if (!category || cancelled) return;
          const option = mapCategoryToOption(category);
          setSelectedOption(option);
          setSearchTerm(''); // Clear search term when category is loaded
        } catch (error) {
          console.error('Failed to fetch category detail', error);
        }
      })();
      return () => {
        cancelled = true;
      };
    } else if (!value && selectedOption) {
      setSelectedOption(null);
      setSearchTerm(''); // Clear search term when value is cleared
    }
  }, [value, selectedOption]);

  useEffect(() => {
    if (!isMenuOpen || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [isMenuOpen]);

  const allOptions = useMemo(() => {
    const map = new Map<string, CategoryOption>();
    searchOptions.forEach((option) => {
      map.set(option.value, option);
    });
    if (selectedOption && !map.has(selectedOption.value)) {
      map.set(selectedOption.value, selectedOption);
    }
    // Sort by level first (0 comes first), then by name
    return Array.from(map.values()).sort((a, b) => {
      // First sort by level (level 0 comes first)
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      // Then sort by name alphabetically
      return a.label.localeCompare(b.label);
    });
  }, [searchOptions, selectedOption]);

  const categorySelectStyles = useMemo(
    () => ({
      control: (provided: any, state: any) => ({
        ...provided,
        minHeight: '38px',
        borderRadius: '6px',
        borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
        '&:hover': {
          borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
        },
        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      }),
      option: (provided: any, state: any) => ({
        ...provided,
        padding: '8px 12px',
        backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
        color: state.isSelected ? '#1f2937' : '#374151',
        '&:hover': {
          backgroundColor: '#f3f4f6',
        },
      }),
      menu: (provided: any) => ({
        ...provided,
        borderRadius: '6px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb',
        zIndex: 50,
      }),
    }),
    [],
  );

  const loadMore = useCallback(() => {
    if (hasMore && !categoriesQuery.isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, categoriesQuery.isFetching]);

  const MenuList: React.FC<MenuListProps<CategoryOption>> = (props) => {
    const { innerRef, innerProps, children, ...restProps } = props;
    const menuListRef = useRef<HTMLDivElement | null>(null);

    const assignRef = useCallback(
      (node: HTMLDivElement | null) => {
        menuListRef.current = node;

        if (!innerRef) return;

        if (typeof innerRef === 'function') {
          innerRef(node);
        } else {
          (innerRef as MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [innerRef],
    );

    const maybeTriggerLoadMore = useCallback(
      (element: HTMLDivElement | null) => {
        if (!element || !hasMore) return;

        const maxScrollTop = element.scrollHeight - element.clientHeight;
        if (maxScrollTop <= 0) return;

        const threshold = 16;
        if (element.scrollTop >= maxScrollTop - threshold) {
          loadMore();
        }
      },
      [hasMore, loadMore],
    );

    const handleWheel = useCallback(
      (event: React.WheelEvent<HTMLDivElement>) => {
        const element = menuListRef.current;
        if (!element || event.defaultPrevented) return;

        const previousScrollTop = element.scrollTop;
        element.scrollTop += event.deltaY;

        if (element.scrollTop !== previousScrollTop) {
          event.preventDefault();
          event.stopPropagation();
        }

        maybeTriggerLoadMore(element);
      },
      [maybeTriggerLoadMore],
    );

    const mergedInnerProps = useMemo(() => {
      const originalOnWheel = innerProps?.onWheel;
      const originalOnScroll = innerProps?.onScroll;

      return {
        ...(innerProps ?? {}),
        onWheel: (event: React.WheelEvent<HTMLDivElement>) => {
          handleWheel(event);
          originalOnWheel?.(event);
        },
        onScroll: (event: React.UIEvent<HTMLDivElement>) => {
          originalOnScroll?.(event);
          maybeTriggerLoadMore(event.currentTarget as HTMLDivElement);
        },
      };
    }, [handleWheel, innerProps, maybeTriggerLoadMore]);

    return (
      <selectComponents.MenuList
        {...restProps}
        innerRef={assignRef}
        innerProps={mergedInnerProps}
      >
        {children}
      </selectComponents.MenuList>
    );
  };

  const formatOptionLabel = (option: CategoryOption, { context }: { context: 'menu' | 'value' }) => {
    const image = option.image;
    const levelIndent = (option.level || 0) * 16; // 16px indent per level

    if (context === 'menu') {
      return (
        <div className="flex items-center gap-3 text-inherit" style={{ paddingLeft: `${levelIndent}px` }}>
          {image ? (
            <img src={image} alt={option.label} className="w-10 h-10 rounded-md object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
              <FiMenu className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{option.label}</span>
              {option.isActive === false && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Inactive</span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {option.level === 0 ? 'Root Category' : `Level ${option.level + 1}`}
              {option.productCount !== undefined && option.productCount > 0 ? ` · ${option.productCount} products` : ''}
              {option.description && ` · ${option.description.substring(0, 50)}${option.description.length > 50 ? '...' : ''}`}
            </span>
          </div>
        </div>
      );
    }
    // For selected value display - show as a tag
    return (
      <div className="flex items-center gap-2">
        {image ? (
          <img src={image} alt={option.label} className="w-6 h-6 rounded object-cover" />
        ) : (
          <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center text-green-500">
            <FiMenu className="w-3.5 h-3.5" />
          </div>
        )}
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <SelectComponent<CategoryOption, false>
      placeholder="Search categories by name..."
      value={selectedOption}
      onChange={(option) => {
        setSelectedOption(option);
        onChange(option?.value);
        setSearchTerm(''); // Clear search term when option is selected
      }}
      options={allOptions}
      inputValue={isMenuOpen ? searchTerm : ''}
      onInputChange={(value, actionMeta) => {
        if (actionMeta.action === 'input-change') {
          setSearchTerm(value);
        }
        return value;
      }}
      onMenuOpen={() => {
        setIsMenuOpen(true);
        setSearchTerm(''); // Clear search when opening menu
      }}
      onMenuClose={() => {
        setIsMenuOpen(false);
        setSearchTerm(''); // Clear search when closing menu
      }}
      isClearable={true}
      isLoading={categoriesQuery.isLoading && page === 1}
      loadingMessage={() => 'Loading categories...'}
      noOptionsMessage={() => {
        return debouncedSearch ? 'No categories found matching your search' : 'All categories will appear here';
      }}
      formatOptionLabel={formatOptionLabel}
      menuPortalTarget={menuPortalTarget}
      menuPlacement="auto"
      menuShouldScrollIntoView={false}
      className="react-select-container"
      classNamePrefix="react-select"
      components={{ MenuList }}
    />
  );
};