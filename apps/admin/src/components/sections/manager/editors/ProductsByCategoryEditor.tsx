import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Toggle } from '../../../common/Toggle';
import { Input } from '../../../common/Input';
import { Button } from '../../../common/Button';
import { SearchSelect } from '../../../common/SearchSelect';
import { useToast } from '../../../../context/ToastContext';
import { trpc } from '../../../../utils/trpc';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { Image as ImageIcon } from 'lucide-react';
import SelectComponent, { components as selectComponents, type MenuListProps, type FilterOptionOption } from 'react-select';
import { ConfigChangeHandler, ProductOption, SelectOption } from '../types';
import { ensureNumber, mapProductToOption } from '../utils';

interface ProductsByCategoryConfigEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

type ProductsByCategoryStrategy = 'latest' | 'featured' | 'bestsellers' | 'custom';
type ProductsByCategoryDisplayStyle = 'grid' | 'carousel';

interface ProductsByCategoryAdminRow {
    id: string;
    categoryId?: string;
    title: string;
    strategy: ProductsByCategoryStrategy;
    productIds: string[];
    limit: number;
    displayStyle: ProductsByCategoryDisplayStyle;
    showDisplayTitle: boolean;
    showCategoryLabel: boolean;
    showStrategyLabel: boolean;
}

const DEFAULT_ROW_LIMIT = 6;

interface CategorySelectOption extends SelectOption {
    searchText: string;
    categoryName: string;
}

const createRowId = () => `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeStrategyValue = (value: unknown): ProductsByCategoryStrategy => {
    const raw = typeof value === 'string' ? value.trim() : '';
    switch (raw) {
        case 'featured':
            return 'featured';
        case 'bestsellers':
            return 'bestsellers';
        case 'custom':
            return 'custom';
        case 'most_viewed':
            return 'featured';
        default:
            return 'latest';
    }
};

const normalizeDisplayStyle = (value: unknown): ProductsByCategoryDisplayStyle => {
    const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
    return raw === 'carousel' ? 'carousel' : 'grid';
};

const createDefaultRow = (): ProductsByCategoryAdminRow => ({
    id: createRowId(),
    categoryId: undefined,
    title: '',
    strategy: 'latest',
    productIds: [],
    limit: DEFAULT_ROW_LIMIT,
    displayStyle: 'grid',
    showDisplayTitle: true,
    showCategoryLabel: true,
    showStrategyLabel: true,
});

const flattenCategoryOptions = (categories: any[], prefix = ''): CategorySelectOption[] => {
    if (!Array.isArray(categories)) {
        return [];
    }

    return categories.flatMap((category: any) => {
        const label = prefix ? `${prefix} › ${category.name}` : category.name;
        const searchPieces = [category?.name, category?.id, category?.slug, prefix]
            .map((piece) => (typeof piece === 'string' ? piece.trim().toLowerCase() : ''))
            .filter(Boolean);

        const currentOption: CategorySelectOption = {
            value: category.id,
            label,
            searchText: searchPieces.join(' '),
            categoryName: typeof category?.name === 'string' ? category.name : label,
        };

        const children = flattenCategoryOptions(category.children, label);
        return [currentOption, ...children];
    });
};

const parseRowsFromValue = (raw: Record<string, unknown>): ProductsByCategoryAdminRow[] => {
    const rawRows = Array.isArray(raw?.rows) ? (raw.rows as any[]) : [];
    const globalDisplayStyle = normalizeDisplayStyle(raw?.displayStyle);

    if (rawRows.length > 0) {
        return rawRows.map((row, index) => {
            const id = typeof row?.id === 'string' && row.id.trim().length > 0 ? row.id : createRowId();
            const strategy = normalizeStrategyValue(row?.strategy);
            const productIds = Array.isArray(row?.productIds)
                ? row.productIds.filter((idValue: unknown): idValue is string => typeof idValue === 'string' && idValue.trim().length > 0)
                : [];
            const limit = ensureNumber(row?.limit, DEFAULT_ROW_LIMIT);
            const displayStyle = normalizeDisplayStyle((row as any)?.displayStyle ?? globalDisplayStyle);

            return {
                id: index === 0 ? id : `${id}-${index}`,
                categoryId: typeof row?.categoryId === 'string' ? row.categoryId : undefined,
                title: typeof row?.title === 'string' ? row.title : '',
                strategy,
                productIds,
                limit,
                displayStyle,
                showDisplayTitle: row?.showDisplayTitle !== false,
                showCategoryLabel: row?.showCategoryLabel !== false,
                showStrategyLabel: row?.showStrategyLabel !== false,
            };
        });
    }

    const legacyCategoryId = typeof raw?.categoryId === 'string' ? raw.categoryId : undefined;
    const legacyProductIds = Array.isArray(raw?.productIds)
        ? (raw.productIds as unknown[]).filter((idValue): idValue is string => typeof idValue === 'string' && idValue.trim().length > 0)
        : [];
    const legacySort = typeof raw?.sort === 'string' ? raw.sort : 'latest';
    const legacyDisplayStyle = normalizeDisplayStyle(raw?.displayStyle);

    return [{
        id: createRowId(),
        categoryId: legacyCategoryId,
        title: '',
        strategy: normalizeStrategyValue(legacySort),
        productIds: legacyProductIds,
        limit: ensureNumber((raw?.limit as number) ?? DEFAULT_ROW_LIMIT, DEFAULT_ROW_LIMIT),
        displayStyle: legacyDisplayStyle,
        showDisplayTitle: true,
        showCategoryLabel: true,
        showStrategyLabel: true,
    }];
};

const sanitizeConfigValue = (
    base: Record<string, unknown>,
    rows: ProductsByCategoryAdminRow[],
    sidebar: unknown,
    sidebarEnabled: boolean,
): Record<string, unknown> => {
    const sanitizedRows = rows.map((row) => {
        const trimmedTitle = typeof row.title === 'string' ? row.title.trim() : '';
        return {
            id: row.id,
            categoryId: row.categoryId,
            title: trimmedTitle || undefined,
            strategy: row.strategy,
            productIds: row.productIds,
            limit: row.limit,
            displayStyle: row.displayStyle,
            showDisplayTitle: row.showDisplayTitle,
            showCategoryLabel: row.showCategoryLabel,
            showStrategyLabel: row.showStrategyLabel,
        };
    });

    const next: Record<string, unknown> = { ...(base ?? {}) };
    delete next.categoryId;
    delete next.productIds;
    delete next.sort;
    delete next.limit;
    delete next.displayStyle;

    next.rows = sanitizedRows;
    if (typeof sidebar !== 'undefined') {
        next.sidebar = sidebar;
    }
    next.sidebarEnabled = sidebarEnabled;

    return next;
};

const removeSidebarFromConfig = (raw?: Record<string, unknown>): Record<string, unknown> => {
    if (!raw || typeof raw !== 'object') {
        return {};
    }
    const base = { ...raw };
    if ('sidebar' in base) {
        delete base.sidebar;
    }
    return base;
};

const rowsAreEqual = (
    a: ProductsByCategoryAdminRow[],
    b: ProductsByCategoryAdminRow[],
): boolean => {
    if (a === b) return true;
    if (a.length !== b.length) return false;

    return a.every((row, index) => {
        const other = b[index];
        if (!other) return false;
        if (row.id !== other.id) return false;
        if (row.categoryId !== other.categoryId) return false;
        if (row.title !== other.title) return false;
        if (row.strategy !== other.strategy) return false;
        if (row.limit !== other.limit) return false;
        if (row.displayStyle !== other.displayStyle) return false;
        if (row.showDisplayTitle !== other.showDisplayTitle) return false;
        if (row.showCategoryLabel !== other.showCategoryLabel) return false;
        if (row.showStrategyLabel !== other.showStrategyLabel) return false;
        if (row.productIds.length !== other.productIds.length) return false;
        return row.productIds.every((id, idx) => id === other.productIds[idx]);
    });
};

interface CategoryRowEditorProps {
    index: number;
    row: ProductsByCategoryAdminRow;
    categoryOptions: CategorySelectOption[];
    categoriesLoading: boolean;
    onChange: (row: ProductsByCategoryAdminRow) => void;
    onRemove: () => void;
    canRemove: boolean;
}

const CategoryRowEditor: React.FC<CategoryRowEditorProps> = ({
    index,
    row,
    categoryOptions,
    categoriesLoading,
    onChange,
    onRemove,
    canRemove,
}) => {
    const { t } = useTranslationWithBackend();

    const STRATEGY_SELECT_OPTIONS = useMemo(() => [
        { value: 'latest', label: t('sections.manager.productsByCategory.latest') },
        { value: 'best_selling', label: t('sections.manager.productsByCategory.bestSelling') },
        { value: 'featured', label: t('sections.manager.productsByCategory.featured') },
        { value: 'custom', label: t('sections.manager.productsByCategory.custom') },
    ], [t]);

    const { addToast } = useToast();
    const selectedIds = row.productIds;
    const isCustomStrategy = row.strategy === 'custom';

    const selectedCategoryOption = useMemo<CategorySelectOption | null>(() => {
        if (!row.categoryId) {
            return null;
        }
        const existing = categoryOptions.find((option) => option.value === row.categoryId);
        if (existing) {
            return existing;
        }
        const fallbackLabel = `ID: ${row.categoryId}`;
        return {
            value: row.categoryId,
            label: fallbackLabel,
            searchText: [fallbackLabel, row.categoryId.toLowerCase()].join(' '),
            categoryName: fallbackLabel,
        };
    }, [categoryOptions, row.categoryId]);

    const categoryFilterOption = useCallback(
        (candidate: FilterOptionOption<CategorySelectOption>, rawInput: string) => {
            const search = rawInput.trim().toLowerCase();
            if (!search) return true;
            const option = candidate.data;
            return (
                option.searchText.includes(search) ||
                option.label.toLowerCase().includes(search) ||
                option.value.toLowerCase().includes(search)
            );
        },
        [],
    );

    const formatCategoryOptionLabel = useCallback(
        (option: CategorySelectOption, { context }: { context: 'menu' | 'value' }) => {
            if (context === 'menu') {
                return (
                    <div className="flex flex-col text-inherit">
                        <span className="text-sm font-medium">{option.label}</span>
                        <span className="text-xs opacity-80">ID: {option.value}</span>
                    </div>
                );
            }
            return <span>{option.label}</span>;
        },
        [],
    );

    const [optionsMap, setOptionsMap] = useState<Record<string, ProductOption>>({});
    const [searchOptions, setSearchOptions] = useState<ProductOption[]>([]);
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
        setOptionsMap({});
        setSearchOptions([]);
        setPage(1);
        setHasMore(false);
        setPreviewOptions([]);
    }, [row.categoryId, row.strategy, row.id]);

    useEffect(() => {
        setPage(1);
        setSearchOptions([]);
    }, [debouncedSearch, row.categoryId, row.strategy]);

    const productsQuery = trpc.adminProducts.list.useQuery(
        {
            page,
            limit: 12,
            search: debouncedSearch || undefined,
            isActive: true,
            categoryId: row.categoryId || undefined,
        },
        {
            enabled: Boolean(row.categoryId),
        },
    );

    useEffect(() => {
        if (!row.categoryId) {
            setOptionsMap({});
            setSearchOptions([]);
            setHasMore(false);
            setPreviewOptions([]);
            return;
        }

        const payload = (productsQuery.data as any)?.data;
        if (!payload) {
            if (!productsQuery.isFetching && !productsQuery.isLoading && page === 1) {
                setSearchOptions([]);
            }
            setHasMore(false);
            setPreviewOptions([]);
            return;
        }

        const items = Array.isArray(payload.items) ? payload.items : [];
        const mapped = items.map((p: any) => mapProductToOption(p, t));

        if (isCustomStrategy) {
            setOptionsMap((prev) => {
                const next = { ...prev };
                mapped.forEach((option) => {
                    next[option.value] = option;
                });
                return next;
            });
        }

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
        setPreviewOptions(mapped.slice(0, row.limit));
    }, [isCustomStrategy, row.categoryId, row.limit, productsQuery.data, productsQuery.isFetching, productsQuery.isLoading, page, t]);

    useEffect(() => {
        if (!isCustomStrategy || selectedIds.length === 0) {
            return;
        }

        const missing = selectedIds.filter((id) => !optionsMap[id]);
        if (missing.length === 0) return;

        let cancelled = false;
        (async () => {
            try {
                const { trpcClient } = await import('../../../../utils/trpc');
                const fetched = await Promise.all(
                    missing.map(async (id) => {
                        try {
                            const response = await trpcClient.adminProducts.detail.query({ id });
                            const product = (response as any)?.data;
                            return product ? mapProductToOption(product, t) : null;
                        } catch (error) {
                            console.error('Failed to fetch product detail', error);
                            return null;
                        }
                    }),
                );
                if (cancelled) return;
                const filtered = fetched.filter(Boolean) as ProductOption[];
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
    }, [isCustomStrategy, selectedIds.join(','), optionsMap, t]);

    const allOptions = useMemo(() => {
        const map = new Map<string, ProductOption>();
        searchOptions.forEach((option) => {
            map.set(option.value, option);
        });
        selectedIds.forEach((idValue) => {
            const option = optionsMap[idValue];
            if (option) {
                map.set(idValue, option);
            }
        });
        return Array.from(map.values());
    }, [searchOptions, selectedIds, optionsMap]);

    const selectedOptions = useMemo(() => selectedIds.map((idValue) => optionsMap[idValue] || { value: idValue, label: `Product ${idValue}` }), [optionsMap, selectedIds]);

    const productSelectStyles = useMemo(
        () => ({
            control: (provided: any, state: any) => ({
                ...provided,
                minHeight: '46px',
                borderRadius: '12px',
                borderColor: state.isFocused ? '#4f46e5' : '#e5e7eb',
                boxShadow: 'none',
                backgroundColor: state.isDisabled ? '#f9fafb' : '#ffffff',
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
        if (!isCustomStrategy || !row.categoryId) {
            return;
        }
        if (hasMore && !productsQuery.isFetching) {
            setPage((prev) => prev + 1);
        }
    }, [hasMore, productsQuery.isFetching, isCustomStrategy, row.categoryId]);

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

    const handleCategoryChange = (option: CategorySelectOption | null) => {
        const sanitized = option?.value || undefined;
        const categoryTitle = option?.categoryName?.trim() || '';
        const hasCustomTitle = typeof row.title === 'string' && row.title.trim().length > 0;
        const shouldAutofillTitle = Boolean(sanitized) && (!hasCustomTitle || row.categoryId !== sanitized);
        onChange({
            ...row,
            categoryId: sanitized,
            title: sanitized ? (shouldAutofillTitle ? categoryTitle : row.title) : '',
            productIds: [],
        });
        setSearchTerm('');
        setDebouncedSearch('');
    };

    const handleStrategyChange = (nextStrategy: ProductsByCategoryStrategy) => {
        if (nextStrategy === 'bestsellers') {
            addToast({
                type: 'info',
                title: t('sections.manager.productsByCategory.bestsellersComingSoonTitle'),
                description: t('sections.manager.productsByCategory.bestsellersComingSoonDescription'),
            });
            return;
        }
        onChange({
            ...row,
            strategy: nextStrategy,
            productIds: nextStrategy === 'custom' ? row.productIds : [],
        });
    };

    const handleDisplayStyleChange = (nextStyle: ProductsByCategoryDisplayStyle) => {
        onChange({
            ...row,
            displayStyle: nextStyle,
        });
    };

    const handleLimitChange = (nextValue: number) => {
        const sanitized = Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1;
        onChange({
            ...row,
            limit: sanitized,
        });
    };

    const handleSelectionChange = (items: readonly ProductOption[] | null) => {
        const ids = (items ?? []).map((item) => item.value);
        onChange({
            ...row,
            productIds: ids,
        });
    };

    const handleTitleChange = (nextTitle: string) => {
        onChange({
            ...row,
            title: nextTitle,
        });
    };

    const handleVisibilityChange = (field: 'showDisplayTitle' | 'showCategoryLabel' | 'showStrategyLabel', enabled: boolean) => {
        onChange({
            ...row,
            [field]: enabled,
        });
    };

    return (
        <div className="rounded-xl border border-gray-200/80 bg-white/90 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{t('sections.manager.productsByCategory.categoryIndex')} #{index + 1}</p>
                    <p className="text-xs text-gray-500">{t('sections.manager.productsByCategory.categoryDescription')}</p>
                </div>
                <div className="flex flex-wrap items-start gap-3">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t('sections.manager.productsByCategory.displayStrategy')}
                        <select
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            value={row.strategy}
                            onChange={(event) => handleStrategyChange(event.target.value as ProductsByCategoryStrategy)}
                        >
                            {STRATEGY_SELECT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t('sections.manager.productsByCategory.displayStyle')}
                        <select
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            value={row.displayStyle}
                            onChange={(event) => handleDisplayStyleChange(event.target.value as ProductsByCategoryDisplayStyle)}
                        >
                            <option value="grid">Grid</option>
                            <option value="carousel">Carousel</option>
                        </select>
                    </label>
                    {canRemove && (
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 invisible select-none" aria-hidden="true">
                                placeholder
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-0 h-[35.5px] px-3"
                                onClick={onRemove}
                                startIcon={<FiTrash2 className="w-4 h-4" />}
                            >
                                {t('sections.manager.productsByCategory.remove')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-5 px-5 py-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <label className="lg:col-span-12 flex flex-col gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('sections.manager.productsByCategory.displayTitle')}</span>
                        <Input
                            type="text"
                            value={row.title}
                            onChange={(event) => handleTitleChange(event.target.value)}
                            placeholder="Nhập tiêu đề hiển thị"
                            className="text-sm"
                            inputSize="md"
                        />
                        <span className="text-xs text-gray-500">Tự động gợi ý theo danh mục, có thể chỉnh sửa.</span>
                    </label>
                    <label className="lg:col-span-8 flex flex-col gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Danh mục</span>
                        <SearchSelect<CategorySelectOption>
                            isClearable
                            isSearchable
                            isDisabled={categoriesLoading}
                            isLoading={categoriesLoading}
                            options={categoryOptions}
                            value={selectedCategoryOption}
                            onChange={(option) => handleCategoryChange(option as CategorySelectOption | null)}
                            placeholder={categoriesLoading ? 'Đang tải danh mục...' : 'Chọn danh mục'}
                            filterOption={categoryFilterOption}
                            formatOptionLabel={formatCategoryOptionLabel}
                            menuPortalTarget={menuPortalTarget}
                            menuPlacement="auto"
                            components={{ IndicatorSeparator: () => null }}
                            noOptionsMessage={() => 'Không tìm thấy danh mục'}
                            size="md"
                        />
                    </label>
                    <label className="lg:col-span-4 flex flex-col gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Số lượng sản phẩm</span>
                        <Input
                            type="number"
                            min={1}
                            value={row.limit}
                            onChange={(event) => handleLimitChange(Number(event.target.value) || 1)}
                            className="text-sm"
                            inputSize="md"
                        />
                    </label>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Toggle
                        checked={row.showDisplayTitle}
                        onChange={(checked) => handleVisibilityChange('showDisplayTitle', checked)}
                        label={t('sections.manager.productsByCategory.showDisplayTitle', 'Show display title')}
                        className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                    />
                    <Toggle
                        checked={row.showCategoryLabel}
                        onChange={(checked) => handleVisibilityChange('showCategoryLabel', checked)}
                        label={t('sections.manager.productsByCategory.showCategoryLabel', 'Show storefront category name')}
                        className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                    />
                    <Toggle
                        checked={row.showStrategyLabel}
                        onChange={(checked) => handleVisibilityChange('showStrategyLabel', checked)}
                        label={t('sections.manager.productsByCategory.showStrategyLabel', 'Show strategy badge')}
                        className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                    />
                </div>

                {isCustomStrategy && row.categoryId ? (
                    <div className="space-y-3">
                        <span className="text-sm font-medium text-gray-700">Chọn sản phẩm</span>
                        <SelectComponent<ProductOption, true>
                            isMulti
                            placeholder="Tìm kiếm và chọn sản phẩm..."
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
                            loadingMessage={() => 'Đang tải sản phẩm...'}
                            noOptionsMessage={() => (debouncedSearch ? 'Không tìm thấy sản phẩm' : 'Nhập từ khóa để tìm kiếm')}
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
                        <p className="text-xs text-gray-500">Chỉ hiển thị các sản phẩm thuộc danh mục đã chọn.</p>

                        {selectedOptions.length > 0 && (
                            <div className="space-y-2">
                                {selectedOptions.map((option, order) => (
                                    <div
                                        key={option.value}
                                        className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
                                    >
                                        {option.image ? (
                                            <img src={option.image} alt={option.label} className="h-12 w-12 rounded-md object-cover" />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                                                <ImageIcon className="h-5 w-5" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {order + 1}. {option.label}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {option.sku ? `SKU: ${option.sku}` : 'Không có SKU'}
                                                {option.brandName ? ` · ${option.brandName}` : ''}
                                                {option.priceLabel ? ` · ${option.priceLabel}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {row.strategy === 'custom' && !row.categoryId && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
                                <p className="text-xs text-gray-600">Chọn danh mục trước khi thêm sản phẩm cụ thể.</p>
                            </div>
                        )}
                        {previewOptions.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {previewOptions.map((option, order) => (
                                    <div
                                        key={`${row.id}-preview-${option.value}`}
                                        className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
                                    >
                                        {option.image ? (
                                            <img src={option.image} alt={option.label} className="h-10 w-10 rounded-md object-cover" />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                                                <ImageIcon className="h-4 w-4" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {order + 1}. {option.label}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {option.sku ? `SKU: ${option.sku}` : 'Không có SKU'}
                                                {option.brandName ? ` · ${option.brandName}` : ''}
                                                {option.priceLabel ? ` · ${option.priceLabel}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                                {row.categoryId
                                    ? 'Không tồn tại sản phẩm trong danh mục này.'
                                    : 'Chọn danh mục để xem trước sản phẩm sẽ hiển thị.'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ProductsByCategoryConfigEditor: React.FC<ProductsByCategoryConfigEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const { data: categoriesData, isLoading: categoriesLoading } = trpc.adminProductCategories.getTree.useQuery({
        includeInactive: false,
    });

    const categoryOptions = useMemo<CategorySelectOption[]>(() => {
        const categories = (categoriesData as any)?.data;
        return flattenCategoryOptions(categories);
    }, [categoriesData]);

    const sidebarConfig = value?.sidebar;
    const sanitizedValue = useMemo(() => removeSidebarFromConfig(value), [value]);
    const initialSidebarEnabled = typeof value?.sidebarEnabled === 'boolean' ? value.sidebarEnabled : true;

    const [rows, setRows] = useState<ProductsByCategoryAdminRow[]>(() => parseRowsFromValue(sanitizedValue));
    const skipRowsSyncRef = useRef(false);
    const [sidebarEnabled, setSidebarEnabled] = useState<boolean>(initialSidebarEnabled);

    useEffect(() => {
        if (skipRowsSyncRef.current) {
            skipRowsSyncRef.current = false;
            return;
        }
        const nextRows = parseRowsFromValue(sanitizedValue);
        setRows((prev) => (rowsAreEqual(prev, nextRows) ? prev : nextRows));
    }, [sanitizedValue]);

    useEffect(() => {
        setSidebarEnabled(initialSidebarEnabled);
    }, [initialSidebarEnabled]);

    const commitConfig = useCallback(
        (nextRows: ProductsByCategoryAdminRow[], nextSidebarEnabled: boolean) => {
            const nextValue = sanitizeConfigValue(sanitizedValue, nextRows, sidebarConfig, nextSidebarEnabled);
            onChange(nextValue);
        },
        [onChange, sanitizedValue, sidebarConfig],
    );

    const applyUpdate = useCallback(
        (nextRows: ProductsByCategoryAdminRow[]) => {
            skipRowsSyncRef.current = true;
            setRows(nextRows);
            commitConfig(nextRows, sidebarEnabled);
        },
        [commitConfig, sidebarEnabled],
    );

    const handleAddRow = useCallback(() => {
        applyUpdate([...rows, createDefaultRow()]);
    }, [applyUpdate, rows]);

    const handleRemoveRow = useCallback(
        (rowId: string) => {
            const filtered = rows.filter((row) => row.id !== rowId);
            applyUpdate(filtered.length > 0 ? filtered : [createDefaultRow()]);
        },
        [applyUpdate, rows],
    );

    const handleRowChange = useCallback(
        (rowId: string, nextRow: ProductsByCategoryAdminRow) => {
            const updated = rows.map((row) => (row.id === rowId ? nextRow : row));
            applyUpdate(updated);
        },
        [applyUpdate, rows],
    );

    const handleSidebarToggle = useCallback(
        (enabled: boolean) => {
            setSidebarEnabled(enabled);
            commitConfig(rows, enabled);
        },
        [commitConfig, rows],
    );

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm px-5 py-4">
                <Toggle
                    checked={sidebarEnabled}
                    onChange={handleSidebarToggle}
                    label={t('sections.manager.productsByCategory.enableSidebar')}
                    description={t('sections.manager.productsByCategory.sidebarDescription')}
                />
                <p className="mt-1 text-xs text-gray-500">
                    {t('sections.manager.productsByCategory.sidebarNote')}
                </p>
            </div>

            <div className="space-y-1">
                <h4 className="text-sm font-semibold text-gray-700">{t('sections.manager.productsByCategory.displayCategories')}</h4>
                <p className="text-xs text-gray-500">{t('sections.manager.productsByCategory.displayCategoriesDescription')}</p>
            </div>

            <div className="space-y-4">
                {rows.map((row, index) => (
                    <CategoryRowEditor
                        key={row.id}
                        index={index}
                        row={row}
                        categoryOptions={categoryOptions}
                        categoriesLoading={categoriesLoading}
                        onChange={(nextRow) => handleRowChange(row.id, nextRow)}
                        onRemove={() => handleRemoveRow(row.id)}
                        canRemove={rows.length > 1}
                    />
                ))}
            </div>

            <button
                type="button"
                onClick={handleAddRow}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white py-3 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
                <FiPlus className="w-4 h-4" />
                {t('sections.manager.productsByCategory.addCategory')}
            </button>

        </div>
    );
};
