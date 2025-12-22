import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { FiMenu } from 'react-icons/fi';
import { trpc } from '../../utils/trpc';
import SelectComponent, { components as selectComponents, MenuListProps } from 'react-select';
import { useSelectMenuPortalTarget } from '../../hooks/useSelectMenuPortalTarget';

interface ProductOption {
  value: string;
  label: string;
  sku?: string | null;
  image?: string | null;
  priceLabel?: string | null;
  brandName?: string | null;
}

interface ProductSelectorProps {
  value?: string;
  onChange: (productId: string | undefined) => void;
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const mapProductToOption = (product: any): ProductOption => {
  let priceLabel: string | null = null;
  if (product?.priceRange) {
    priceLabel = product.priceRange;
  } else if (product?.lowestPrice != null && product?.highestPrice != null && product.lowestPrice !== product.highestPrice) {
    priceLabel = `${currencyFormatter.format(product.lowestPrice)} – ${currencyFormatter.format(product.highestPrice)}`;
  } else if (product?.lowestPrice != null) {
    priceLabel = currencyFormatter.format(product.lowestPrice);
  }
  const primaryImage = product?.primaryImage || product?.imageUrls?.[0] || product?.media?.[0]?.url || null;
  return {
    value: product.id,
    label: product.name || 'Unnamed product',
    sku: product.sku,
    image: primaryImage,
    priceLabel,
    brandName: product?.brand?.name ?? null,
  };
};

export const ProductSelector: React.FC<ProductSelectorProps> = ({ value, onChange }) => {
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [searchOptions, setSearchOptions] = useState<ProductOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuPortalTarget = useSelectMenuPortalTarget({ containerRef });
  const isPortaledToBody = typeof window !== 'undefined' && menuPortalTarget === window.document.body;

  const productsQuery = trpc.adminProducts.list.useQuery(
    {
      page,
      limit: 20,
      search: debouncedSearch,
      sortBy: 'name',
      sortOrder: 'ASC',
    },
    {
      placeholderData: (previousData) => previousData,
      enabled: debouncedSearch.length >= 0,
    },
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
    setSearchOptions([]);
  }, [debouncedSearch]);

  useEffect(() => {
    if (productsQuery.data && typeof productsQuery.data === 'object') {
      const data = productsQuery.data as any;

      // Try different possible data structures
      let items = [];
      let hasMore = false;

      if (data?.result?.data?.data?.items) {
        // Nested structure: result.data.data.items
        items = data.result.data.data.items;
        hasMore = data.result.data.data.page < data.result.data.data.totalPages;
      } else if (data?.data?.data?.items) {
        // Structure: data.data.items
        items = data.data.data.items;
        hasMore = data.data.data.page < data.data.data.totalPages;
      } else if (data?.data?.items) {
        // Structure: data.items
        items = data.data.items;
        hasMore = data.data.page < data.data.totalPages;
      } else if (data?.items) {
        // Direct structure: items
        items = data.items;
        hasMore = data.page < data.totalPages;
      }

      const newOptions = items.map(mapProductToOption);

      if (page === 1) {
        setSearchOptions(newOptions);
      } else {
        setSearchOptions(prev => [...prev, ...newOptions]);
      }
      setHasMore(hasMore);
    }
  }, [productsQuery.data, page]);

  useEffect(() => {
    if (value && !selectedOption) {
      let cancelled = false;
      (async () => {
        try {
          const { trpcClient } = await import('../../utils/trpc');
          const response = await trpcClient.adminProducts.detail.query({ id: value });
          const product = (response as any)?.data;
          if (!product || cancelled) return;
          const option = mapProductToOption(product);
          setSelectedOption(option);
          setSearchTerm(''); // Clear search term when product is loaded
        } catch (error) {
          console.error('Failed to fetch product detail', error);
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
    const map = new Map<string, ProductOption>();
    searchOptions.forEach((option) => {
      map.set(option.value, option);
    });
    if (selectedOption && !map.has(selectedOption.value)) {
      map.set(selectedOption.value, selectedOption);
    }
    return Array.from(map.values());
  }, [searchOptions, selectedOption]);

  const productSelectStyles = useMemo(
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
        position: isPortaledToBody ? 'fixed' : 'absolute',
        borderRadius: '6px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb',
        zIndex: 50,
      }),
      menuPortal: (provided: any) => ({
        ...provided,
        zIndex: 9999,
      }),
    }),
    [isPortaledToBody],
  );

  const loadMore = useCallback(() => {
    if (hasMore && !productsQuery.isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, productsQuery.isFetching]);

  const MenuList: React.FC<MenuListProps<ProductOption>> = (props) => {
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

  const formatOptionLabel = (option: ProductOption, { context }: { context: 'menu' | 'value' }) => {
    const image = option.image;
    if (context === 'menu') {
      return (
        <div className="flex items-center gap-3 text-inherit">
          {image ? (
            <img src={image} alt={option.label} className="w-10 h-10 rounded-md object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
              <FiMenu className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium">{option.label}</span>
            <span className="text-xs opacity-80">
              {option.sku ? `SKU: ${option.sku}` : 'No SKU'}
              {option.brandName ? ` · ${option.brandName}` : ''}
              {option.priceLabel ? ` · ${option.priceLabel}` : ''}
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
          <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-500">
            <FiMenu className="w-3.5 h-3.5" />
          </div>
        )}
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <div ref={containerRef}>
      <SelectComponent<ProductOption, false>
        placeholder="Search and select a product..."
        value={selectedOption}
        onChange={(option) => {
          setSelectedOption(option);
          onChange(option?.value);
        setSearchTerm(''); // Clear search term when option is selected
      }}
      options={allOptions}
      inputValue={isMenuOpen ? searchTerm : ''}
      onInputChange={(value, actionMeta) => {
        if (actionMeta.action === 'input-change' && isMenuOpen) {
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
      isLoading={productsQuery.isLoading && page === 1}
      loadingMessage={() => 'Loading products...'}
      noOptionsMessage={() => debouncedSearch ? 'No products found' : 'Start typing to search products'}
      formatOptionLabel={formatOptionLabel}
      menuPortalTarget={menuPortalTarget}
        menuPlacement="auto"
        menuShouldScrollIntoView={false}
        menuShouldBlockScroll={false}
        className={`react-select-container${isPortaledToBody ? ' react-select-container--body-portal' : ''}`}
        classNamePrefix="react-select"
        components={{ MenuList }}
      />
    </div>
  );
};
