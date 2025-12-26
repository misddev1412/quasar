import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Image as ImageIcon } from 'lucide-react';
import { trpc } from '../../../../utils/trpc';
import SelectComponent, { components as selectComponents, type MenuListProps } from 'react-select';
import { ConfigChangeHandler, ProductOption } from '../types';
import { mapProductToOption, ensureNumber } from '../utils';

interface FeaturedProductsConfigEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

export const FeaturedProductsConfigEditor: React.FC<FeaturedProductsConfigEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const selectedIds = Array.isArray(value?.productIds) ? (value.productIds as string[]) : [];
    const [optionsMap, setOptionsMap] = useState<Record<string, ProductOption>>({});
    const [searchOptions, setSearchOptions] = useState<ProductOption[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [previewOptions, setPreviewOptions] = useState<ProductOption[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const menuPortalTarget = typeof window !== 'undefined' ? window.document.body : undefined;

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

    const productsQuery = trpc.adminProducts.list.useQuery(
        {
            page,
            limit: 12,
            search: debouncedSearch || undefined,
            isActive: true,
        },
    );

    useEffect(() => {
        const payload = (productsQuery.data as any)?.data;
        if (!payload) {
            if (!productsQuery.isFetching && !productsQuery.isLoading) {
                setSearchOptions((prev) => (page === 1 ? [] : prev));
                setHasMore(false);
            }
            return;
        }

        const items = Array.isArray(payload.items) ? payload.items : [];
        const mapped = items.map((p: any) => mapProductToOption(p, t));

        setOptionsMap((prev) => {
            const next = { ...prev };
            mapped.forEach((option) => {
                next[option.value] = option;
            });
            return next;
        });

        setSearchOptions((prev) => {
            if (page === 1) {
                return mapped;
            }
            const existing = new Map(prev.map((option) => [option.value, option]));
            mapped.forEach((option) => {
                if (!existing.has(option.value)) {
                    existing.set(option.value, option);
                }
            });
            return Array.from(existing.values());
        });

        setHasMore(payload.page < payload.totalPages);
        setPreviewOptions(mapped.slice(0, value?.limit ? Number(value.limit) : 4));
    }, [productsQuery.data, page, productsQuery.isFetching, productsQuery.isLoading, t, value?.limit]);

    useEffect(() => {
        const missing = selectedIds.filter((id) => !optionsMap[id]);
        if (missing.length === 0) return;

        let cancelled = false;
        (async () => {
            try {
                const { trpcClient } = await import('../../../../utils/trpc');
                const results = await Promise.all(
                    missing.map(async (id) => {
                        try {
                            const response = await trpcClient.adminProducts.detail.query({ id });
                            const product = (response as any)?.data;
                            if (!product) return null;
                            return mapProductToOption(product, t);
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
    }, [selectedIds.join(','), optionsMap, t]);

    const allOptions = useMemo(() => {
        const map = new Map<string, ProductOption>();
        searchOptions.forEach((option) => {
            map.set(option.value, option);
        });
        selectedIds.forEach((id) => {
            const option = optionsMap[id];
            if (option) {
                map.set(id, option);
            }
        });
        return Array.from(map.values());
    }, [searchOptions, selectedIds, optionsMap]);

    const selectedOptions = useMemo(() => {
        return selectedIds.map((id) => optionsMap[id] || { value: id, label: `Product ${id}`, image: null });
    }, [optionsMap, selectedIds]);

    const productSelectStyles = useMemo(
        () => ({
            control: (provided: any, state: any) => ({
                ...provided,
                minHeight: '46px',
                borderRadius: '12px',
                borderColor: state.isFocused ? '#4f46e5' : '#e5e7eb',
                boxShadow: state.isFocused
                    ? '0 0 0 4px rgba(99, 102, 241, 0.18)'
                    : '0 1px 2px rgba(15, 23, 42, 0.05)',
                backgroundColor: state.isDisabled ? '#f3f4f6' : '#ffffff',
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
                '&:hover': {
                    borderColor: '#4f46e5',
                },
            }),
            menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
            menu: (base: any) => ({
                ...base,
                zIndex: 9999,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)',
            }),
            option: (base: any, state: any) => ({
                ...base,
                padding: '10px 14px',
                backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : '#fff',
                color: state.isSelected ? '#fff' : '#1f2937',
            }),
            multiValue: (base: any) => ({
                ...base,
                backgroundColor: '#eef2ff',
                borderRadius: '9999px',
                padding: '2px 6px',
            }),
            multiValueLabel: (base: any) => ({
                ...base,
                color: '#4338ca',
                fontWeight: 500,
            }),
            multiValueRemove: (base: any) => ({
                ...base,
                color: '#4338ca',
                borderRadius: '9999px',
                ':hover': {
                    backgroundColor: '#c7d2fe',
                    color: '#312e81',
                },
            }),
        }),
        [],
    );

    const loadMore = useCallback(() => {
        if (hasMore && !productsQuery.isFetching) {
            setPage((prev) => prev + 1);
        }
    }, [hasMore, productsQuery.isFetching]);

    const handleSelectionChange = (items: readonly ProductOption[] | null) => {
        const ids = (items ?? []).map((item) => item.value);
        onChange({
            ...(value ?? {}),
            productIds: ids,
        });
    };

    const handleDisplayStyleChange = (next: string) => {
        onChange({
            ...(value ?? {}),
            displayStyle: next,
        });
    };

    const handleItemsPerRowChange = (next: number) => {
        onChange({
            ...(value ?? {}),
            itemsPerRow: next,
        });
    };

    const MenuList = (props: MenuListProps<ProductOption>) => (
        <selectComponents.MenuList {...props}>
            {props.children}
            {hasMore && (
                <div className="px-2 pb-2">
                    <button
                        type="button"
                        onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            loadMore();
                        }}
                        className="w-full text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 py-2"
                        disabled={productsQuery.isFetching}
                    >
                        {productsQuery.isFetching ? 'Loading...' : 'Load more products'}
                    </button>
                </div>
            )}
        </selectComponents.MenuList>
    );

    const formatOptionLabel = (option: ProductOption, { context }: { context: 'menu' | 'value' }) => {
        const image = option.image;
        if (context === 'menu') {
            return (
                <div className="flex items-center gap-3 text-inherit">
                    {image ? (
                        <img src={image} alt={option.label} className="w-10 h-10 rounded-md object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-5 h-5" />
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
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('sections.manager.productsByCategory.featureProducts')}</label>
                <SelectComponent<ProductOption, true>
                    isMulti
                    placeholder={t('sections.manager.productsByCategory.searchProducts')}
                    value={selectedOptions}
                    onChange={(items) => handleSelectionChange(items as ProductOption[])}
                    options={allOptions}
                    inputValue={searchTerm}
                    onInputChange={(val, actionMeta) => {
                        if (actionMeta.action === 'input-change') {
                            setSearchTerm(val);
                        }
                    }}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    isLoading={productsQuery.isLoading && page === 1}
                    isClearable={false}
                    loadingMessage={() => t('sections.manager.productsByCategory.loadingProducts')}
                    noOptionsMessage={() => (debouncedSearch ? t('sections.manager.productsByCategory.noProductsFound') : t('sections.manager.productsByCategory.startTyping'))}
                    styles={productSelectStyles}
                    components={{ MenuList }}
                    formatOptionLabel={formatOptionLabel}
                    menuPortalTarget={menuPortalTarget}
                    menuPlacement="auto"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    onMenuScrollToBottom={() => {
                        loadMore();
                    }}
                />
                <p className="text-xs text-gray-500">
                    {t('sections.manager.productsByCategory.productsAppearOrder')}
                </p>
            </div>

            <div className="space-y-3">
                {selectedOptions.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500">
                        {t('sections.manager.productsByCategory.noProductsSelected')}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {selectedOptions.map((option, index) => (
                            <div
                                key={option.value}
                                className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 bg-white"
                            >
                                {option.image ? (
                                    <img src={option.image} alt={option.label} className="w-12 h-12 rounded-md object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {index + 1}. {option.label}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {option.sku ? `SKU: ${option.sku}` : t('sections.manager.productsByCategory.noSku')}
                                        {option.brandName ? ` · ${option.brandName}` : ''}
                                        {option.priceLabel ? ` · ${option.priceLabel}` : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.productsByCategory.style')}
                    <select
                        className="border rounded-md px-3.5 py-2.5 text-sm !h-11"
                        value={(value?.displayStyle as string) || 'grid'}
                        onChange={(e) => handleDisplayStyleChange(e.target.value)}
                    >
                        <option value="grid">Grid</option>
                        <option value="carousel">Carousel</option>
                    </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.productsByCategory.itemsPerRow')}
                    <Input
                        type="number"
                        min={1}
                        max={6}
                        value={ensureNumber(value?.itemsPerRow, 4)}
                        onChange={(e) => handleItemsPerRowChange(Number(e.target.value) || 1)}
                        className="text-sm w-20"
                        inputSize="md"
                    />
                </label>
            </div>
        </div>
    );
};
