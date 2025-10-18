'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import { components as selectComponents, MenuListProps } from 'react-select';
import '../common/CountrySelector.css';
import { Image as ImageIcon } from 'lucide-react';

export interface ProductOption {
  value: string;
  label: string;
  sku?: string | null;
  image?: string | null;
  priceLabel?: string | null;
  brandName?: string | null;
}

interface ProductSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  onLoadedOptions?: (options: Record<string, ProductOption>) => void;
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const mapProductToOption = (product: any): ProductOption => {
  const priceLabel = product?.priceRange
    || (product?.lowestPrice != null && product?.highestPrice != null && product.lowestPrice !== product.highestPrice
      ? `${currencyFormatter.format(product.lowestPrice)} – ${currencyFormatter.format(product.highestPrice)}`
      : product?.lowestPrice != null
        ? currencyFormatter.format(product.lowestPrice)
        : null);

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

const ProductSelect: React.FC<ProductSelectProps> = ({ value, onChange, onLoadedOptions }) => {
  const [optionsMap, setOptionsMap] = useState<Record<string, ProductOption>>({});
  const [pageState, setPageState] = useState<{ [search: string]: number }>({ '': 1 });
  const [hasMoreMap, setHasMoreMap] = useState<Record<string, boolean>>({ '': true });

  useEffect(() => {
    const missing = value.filter((id) => !optionsMap[id]);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const { trpcClient } = await import('../../utils/trpc');
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const response = await trpcClient.adminProducts.detail.query({ id });
              const product = (response as any)?.data;
              if (!product) return null;
              return mapProductToOption(product);
            } catch (error) {
              console.error('Failed to fetch product detail', error);
              return null;
            }
          })
        );
        if (cancelled) return;

        const filtered = results.filter(Boolean) as ProductOption[];
        if (filtered.length > 0) {
          setOptionsMap((prev) => {
            const next = { ...prev };
            filtered.forEach((option) => {
              next[option.value] = option;
            });
            onLoadedOptions?.(next);
            return next;
          });
        }
      } catch (error) {
        console.error('Failed to load selected products', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [value.join(','), optionsMap]);

  const loadOptions = useCallback(async (inputValue: string) => {
    const search = inputValue.trim();
    const currentPage = pageState[search] ?? 1;

    try {
      const { trpcClient } = await import('../../utils/trpc');
      const response = await trpcClient.adminProducts.list.query({
        page: currentPage,
        limit: 12,
        search: search || undefined,
        isActive: true,
      });

      const payload = (response as any)?.data;
      if (!payload) {
        setHasMoreMap((prev) => ({ ...prev, [search]: false }));
        return [];
      }

      const items = Array.isArray(payload.items) ? payload.items : [];
      const mapped = items.map(mapProductToOption);

      setOptionsMap((prev) => {
        const next = { ...prev };
        mapped.forEach((option) => {
          next[option.value] = option;
        });
        onLoadedOptions?.(next);
        return next;
      });

      setHasMoreMap((prev) => ({ ...prev, [search]: payload.page < payload.totalPages }));

      return mapped;
    } catch (error) {
      console.error('Failed to load products', error);
      setHasMoreMap((prev) => ({ ...prev, [search]: false }));
      return [];
    }
  }, [pageState, onLoadedOptions]);

  const loadMore = async (search: string) => {
    const nextPage = (pageState[search] ?? 1) + 1;
    setPageState((prev) => ({ ...prev, [search]: nextPage }));
    return loadOptions(search);
  };

  const selectedOptions = useMemo(() => value.map((id) => optionsMap[id]).filter(Boolean), [value, optionsMap]);

  const MenuList = (props: MenuListProps<ProductOption>) => {
    const search = props.selectProps.inputValue || '';
    const hasMore = hasMoreMap[search] ?? false;

    return (
      <selectComponents.MenuList {...props}>
        {props.children}
        {hasMore && (
          <div className="px-2 pb-2">
            <button
              type="button"
              onMouseDown={async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await loadMore(search);
              }}
              className="w-full text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 py-2"
            >
              Load more products
            </button>
          </div>
        )}
      </selectComponents.MenuList>
    );
  };

  const formatOptionLabel = (option: ProductOption, { context }: { context: 'menu' | 'value' }) => {
    const image = option.image;
    if (context === 'menu') {
      return (
        <div className="flex items-center gap-3">
          {image ? (
            <img src={image} alt={option.label} className="w-10 h-10 rounded-md object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{option.label}</span>
            <span className="text-xs text-gray-500">
              {option.sku ? `SKU: ${option.sku}` : 'No SKU'}
              {option.brandName ? ` · ${option.brandName}` : ''}
              {option.priceLabel ? ` · ${option.priceLabel}` : ''}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {image ? (
          <img src={image} alt={option.label} className="w-6 h-6 rounded object-cover" />
        ) : (
          <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-500">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
        )}
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <AsyncSelect
      isMulti
      placeholder="Search and select products…"
      defaultOptions
      value={selectedOptions}
      loadOptions={loadOptions}
      onChange={(items) => onChange(Array.isArray(items) ? items.map((item) => item.value) : [])}
      components={{ MenuList }}
      formatOptionLabel={formatOptionLabel}
      menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
      className="react-select-container"
      classNamePrefix="react-select"
    />
  );
};

export default ProductSelect;
