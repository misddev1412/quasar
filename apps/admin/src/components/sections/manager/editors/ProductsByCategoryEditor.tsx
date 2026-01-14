import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Toggle } from '../../../common/Toggle';
import { Input } from '../../../common/Input';
import { SearchSelect } from '../../../common/SearchSelect';
import { Button } from '../../../common/Button';
import Tabs from '../../../common/Tabs';
import { trpc } from '../../../../utils/trpc';
import { useToast } from '@admin/contexts/ToastContext';
import SelectComponent, { components as selectComponents, type MenuListProps, type FilterOptionOption } from 'react-select';
import { ConfigChangeHandler, ProductOption, SelectOption } from '../types';
import { SectionHeadingConfig, SectionHeadingConfigData, SectionHeadingTextTransform, SectionHeadingTitleSize } from '../common/SectionHeadingConfig';
import { ensureNumber, mapProductToOption } from '../utils';
import { Image as ImageIcon } from 'lucide-react';

interface ProductsByCategoryConfigEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

type ProductsByCategoryStrategy = 'latest' | 'featured' | 'bestsellers' | 'custom';
type ProductsByCategoryDisplayStyle = 'grid' | 'carousel';
type HeadingStyle = 'default' | 'banner';

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
    headingStyle?: HeadingStyle;
    headingBackgroundColor?: string;
    headingTextColor?: string;
    headingTextTransform?: SectionHeadingTextTransform;
    headingTitleSize?: SectionHeadingTitleSize;
    headingBarHeight?: number;
}

const DEFAULT_ROW_LIMIT = 6;

interface CategorySelectOption extends SelectOption {
    categoryName: string;
    searchText: string;
}

const STRATEGY_SELECT_OPTIONS: { value: ProductsByCategoryStrategy; label: string }[] = [
    { value: 'latest', label: 'Mới nhất' },
    { value: 'featured', label: 'Nổi bật' },
    { value: 'bestsellers', label: 'Bán chạy' },
    { value: 'custom', label: 'Tùy chỉnh' },
];

const createDefaultRow = (): ProductsByCategoryAdminRow => ({
    id: crypto.randomUUID(),
    categoryId: undefined,
    title: '',
    strategy: 'latest',
    productIds: [],
    limit: DEFAULT_ROW_LIMIT,
    displayStyle: 'grid',
    showDisplayTitle: true,
    showCategoryLabel: true,
    showStrategyLabel: true,
    headingStyle: 'default',
});

const buildHeadingConfigFromRow = (row?: ProductsByCategoryAdminRow): SectionHeadingConfigData => ({
    headingStyle: row?.headingStyle ?? 'default',
    headingBackgroundColor: row?.headingBackgroundColor,
    headingTextColor: row?.headingTextColor,
    headingTextTransform: row?.headingTextTransform,
    headingTitleSize: row?.headingTitleSize,
    headingBarHeight: row?.headingBarHeight,
});

const flattenCategoryOptions = (categories: any[], prefix = ''): CategorySelectOption[] => {
    if (!Array.isArray(categories)) return [];
    let options: CategorySelectOption[] = [];
    for (const cat of categories) {
        const optionLabel = prefix ? `${prefix} > ${cat.name}` : cat.name;
        options.push({
            value: cat.id,
            label: optionLabel,
            categoryName: cat.name,
            searchText: `${cat.name} ${optionLabel}`.toLowerCase(),
        });
        if (cat.children && cat.children.length > 0) {
            options = options.concat(flattenCategoryOptions(cat.children, optionLabel));
        }
    }
    return options;
};

const removeSidebarFromConfig = (config: any): any => {
    if (!config) return {};
    const copy = { ...config };
    delete copy.sidebar;
    delete copy.sidebarEnabled;
    return copy;
};

const parseRowsFromValue = (value: any): ProductsByCategoryAdminRow[] => {
    if (Array.isArray(value?.rows) && value.rows.length > 0) {
        return value.rows.map((row: any) => {
            const limit = ensureNumber(row.limit, DEFAULT_ROW_LIMIT);
            const strategy = (['latest', 'featured', 'bestsellers', 'custom'].includes(row.strategy)
                ? row.strategy
                : 'latest') as ProductsByCategoryStrategy;
            const displayStyle = (['grid', 'carousel'].includes(row.displayStyle)
                ? row.displayStyle
                : 'grid') as ProductsByCategoryDisplayStyle;
            const productIds = Array.isArray(row.productIds) ? row.productIds : [];

            return {
                id: row.id || crypto.randomUUID(),
                categoryId: row.categoryId,
                title: row.title || '',
                strategy,
                productIds,
                limit,
                displayStyle,
                showDisplayTitle: row?.showDisplayTitle !== false,
                showCategoryLabel: row?.showCategoryLabel !== false,
                showStrategyLabel: row?.showStrategyLabel !== false,
                headingStyle: (row?.headingStyle as HeadingStyle) || 'default',
                headingBackgroundColor: typeof row?.headingBackgroundColor === 'string' ? row.headingBackgroundColor : undefined,
                headingTextColor: typeof row?.headingTextColor === 'string' ? row.headingTextColor : undefined,
                headingTextTransform: typeof row?.headingTextTransform === 'string' ? (row.headingTextTransform as SectionHeadingTextTransform) : undefined,
                headingTitleSize: typeof row?.headingTitleSize === 'string' ? (row.headingTitleSize as SectionHeadingTitleSize) : undefined,
                headingBarHeight: typeof row?.headingBarHeight === 'number' ? row.headingBarHeight : undefined,
            };
        });
    }

    if (value?.categoryId) {
        const limit = ensureNumber(value.limit, DEFAULT_ROW_LIMIT);
        const strategy = (['latest', 'featured', 'bestsellers', 'custom'].includes(value.strategy)
            ? value.strategy
            : 'latest') as ProductsByCategoryStrategy;
        const displayStyle = (['grid', 'carousel'].includes(value.displayStyle)
            ? value.displayStyle
            : 'grid') as ProductsByCategoryDisplayStyle;
        const productIds = Array.isArray(value.productIds) ? value.productIds : [];

        return [{
            id: crypto.randomUUID(),
            categoryId: value.categoryId,
            title: value.title || '',
            strategy,
            productIds,
            limit,
            displayStyle,
            showDisplayTitle: value?.showDisplayTitle !== false,
            showCategoryLabel: value?.showCategoryLabel !== false,
            showStrategyLabel: value?.showStrategyLabel !== false,
            headingStyle: (value?.headingStyle as HeadingStyle) || 'default',
            headingBackgroundColor: typeof value?.headingBackgroundColor === 'string' ? value.headingBackgroundColor : undefined,
            headingTextColor: typeof value?.headingTextColor === 'string' ? value.headingTextColor : undefined,
            headingTextTransform: typeof value?.headingTextTransform === 'string' ? (value.headingTextTransform as SectionHeadingTextTransform) : undefined,
            headingTitleSize: typeof value?.headingTitleSize === 'string' ? (value.headingTitleSize as SectionHeadingTitleSize) : undefined,
            headingBarHeight: typeof value?.headingBarHeight === 'number' ? value.headingBarHeight : undefined,
        }];
    }

    return [createDefaultRow()];
};

const sanitizeConfigValue = (originalValue: any, rows: ProductsByCategoryAdminRow[]) => {
    const sanitizedRows = rows.map((row) => {
        return {
            id: row.id,
            categoryId: row.categoryId,
            title: row.title,
            strategy: row.strategy,
            limit: row.limit,
            productIds: row.productIds,
            displayStyle: row.displayStyle,
            showDisplayTitle: row.showDisplayTitle,
            showCategoryLabel: row.showCategoryLabel,
            showStrategyLabel: row.showStrategyLabel,
            headingStyle: row.headingStyle,
            headingBackgroundColor: row.headingBackgroundColor,
            headingTextColor: row.headingTextColor,
            headingTextTransform: row.headingTextTransform,
            headingTitleSize: row.headingTitleSize,
            headingBarHeight: row.headingBarHeight,
        };
    });

    return {
        ...originalValue,
        rows: sanitizedRows,
    };
};

const rowsAreEqual = (rows: ProductsByCategoryAdminRow[], otherRows: ProductsByCategoryAdminRow[]): boolean => {
    if (rows.length !== otherRows.length) return false;
    return rows.every((row, index) => {
        const other = otherRows[index];
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
        if (row.headingStyle !== other.headingStyle) return false;
        if (row.headingBackgroundColor !== other.headingBackgroundColor) return false;
        if (row.headingTextColor !== other.headingTextColor) return false;
        if (row.headingTextTransform !== other.headingTextTransform) return false;
        if (row.headingTitleSize !== other.headingTitleSize) return false;
        if (row.headingBarHeight !== other.headingBarHeight) return false;
        return row.productIds.every((id, idx) => id === other.productIds[idx]);
    });
};

interface CategoryRowEditorProps {
    index: number;
    row: ProductsByCategoryAdminRow;
    categoryOptions: CategorySelectOption[];
    categoriesLoading: boolean;
    onChange: (nextRow: ProductsByCategoryAdminRow) => void;
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
    const { addToast } = useToast();
    const selectedCategoryOption = categoryOptions.find((opt) => opt.value === row.categoryId) || null;
    const isCustomStrategy = row.strategy === 'custom';
    const selectedIds = row.productIds || [];

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
                mapped.forEach((option: any) => {
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
            mapped.forEach((option: any) => {
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

    const handleHeadingConfigChange = (data: SectionHeadingConfigData) => {
        onChange({
            ...row,
            ...data,
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

                <SectionHeadingConfig
                    data={{
                        headingStyle: (row.headingStyle as HeadingStyle) || 'default',
                        headingBackgroundColor: row.headingBackgroundColor,
                        headingTextColor: row.headingTextColor,
                        headingTextTransform: row.headingTextTransform,
                        headingTitleSize: row.headingTitleSize,
                        headingBarHeight: row.headingBarHeight,
                    }}
                    onChange={handleHeadingConfigChange}
                />
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

    const sanitizedValue = useMemo(() => removeSidebarFromConfig(value), [value]);

    const [rows, setRows] = useState<ProductsByCategoryAdminRow[]>(() => parseRowsFromValue(sanitizedValue));
    const skipRowsSyncRef = useRef(false);
    const [commonHeadingConfig, setCommonHeadingConfig] = useState<SectionHeadingConfigData>(() =>
        buildHeadingConfigFromRow(parseRowsFromValue(sanitizedValue)[0])
    );
    const headingConfigInitRef = useRef(false);
    const [isCommonHeadingOpen, setIsCommonHeadingOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (skipRowsSyncRef.current) {
            skipRowsSyncRef.current = false;
            return;
        }
        const nextRows = parseRowsFromValue(sanitizedValue);
        setRows((prev) => (rowsAreEqual(prev, nextRows) ? prev : nextRows));
    }, [sanitizedValue]);

    useEffect(() => {
        if (headingConfigInitRef.current) return;
        headingConfigInitRef.current = true;
        setCommonHeadingConfig(buildHeadingConfigFromRow(rows[0]));
    }, [rows]);

    const commitConfig = useCallback(
        (nextRows: ProductsByCategoryAdminRow[]) => {
            const nextValue = sanitizeConfigValue(sanitizedValue, nextRows);
            onChange(nextValue);
        },
        [onChange, sanitizedValue],
    );

    const applyUpdate = useCallback(
        (nextRows: ProductsByCategoryAdminRow[]) => {
            skipRowsSyncRef.current = true;
            setRows(nextRows);
            commitConfig(nextRows);
        },
        [commitConfig],
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

    const handleApplyHeadingConfigToAll = useCallback(() => {
        const nextRows = rows.map((row) => ({
            ...row,
            headingStyle: commonHeadingConfig.headingStyle ?? 'default',
            headingBackgroundColor: commonHeadingConfig.headingBackgroundColor,
            headingTextColor: commonHeadingConfig.headingTextColor,
            headingTextTransform: commonHeadingConfig.headingTextTransform,
            headingTitleSize: commonHeadingConfig.headingTitleSize,
            headingBarHeight: commonHeadingConfig.headingBarHeight,
        }));
        applyUpdate(nextRows);
    }, [applyUpdate, commonHeadingConfig, rows]);

    return (
        <div className="space-y-6">
            <Tabs
                tabs={[
                    {
                        label: t('sections.manager.tabs.categories', 'Categories'),
                        content: (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-gray-700">{t('sections.manager.productsByCategory.displayCategories')}</h4>
                                    <p className="text-xs text-gray-500">{t('sections.manager.productsByCategory.displayCategoriesDescription')}</p>
                                </div>

                                <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm space-y-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold text-gray-700">
                                                {t('sections.manager.productsByCategory.headingConfigAllTitle', 'Heading config (apply to all)')}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {t('sections.manager.productsByCategory.headingConfigAllDescription', 'Update once and apply to every category heading.')}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setIsCommonHeadingOpen((prev) => !prev)}
                                            className={`self-start sm:self-auto border text-gray-700 ${isCommonHeadingOpen ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-transparent hover:bg-gray-50'}`}
                                        >
                                            <FiChevronDown className={`mr-1.5 h-4 w-4 transition-transform ${isCommonHeadingOpen ? 'rotate-180' : ''}`} />
                                            {isCommonHeadingOpen
                                                ? t('sections.manager.productsByCategory.closeHeadingConfigAll', 'Hide common config')
                                                : t('sections.manager.productsByCategory.openHeadingConfigAll', 'Open common config')}
                                        </Button>
                                    </div>
                                    {isCommonHeadingOpen && (
                                        <div className="space-y-3">
                                            <SectionHeadingConfig
                                                data={commonHeadingConfig}
                                                onChange={setCommonHeadingConfig}
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={handleApplyHeadingConfigToAll}
                                                >
                                                    {t('sections.manager.productsByCategory.applyHeadingConfigAll', 'Apply to all')}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
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
                        ),
                    },
                    {
                        label: t('sections.manager.tabs.heading', 'Heading'),
                        content: (
                            <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
                                <p className="text-sm text-gray-600">
                                    {t('sections.manager.productsByCategory.headingConfigAllDescription', 'Update once and apply to every category heading.')}
                                </p>
                            </div>
                        ),
                    },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
        </div>
    );
};
