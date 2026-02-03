import React, { useCallback, useMemo, useState } from 'react';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { Input } from '@admin/components/common/Input';
import { Toggle } from '@admin/components/common/Toggle';
import Tabs from '@admin/components/common/Tabs';
import { ConfigChangeHandler } from '@admin/components/sections/manager/types';
import { ensureNumber } from '@admin/components/sections/manager/utils';
import { trpc } from '@admin/utils/trpc';
import SelectComponent, { components as selectComponents, type MenuListProps } from 'react-select';
import { Image as ImageIcon } from 'lucide-react';
import { SectionHeadingConfig, SectionHeadingConfigData, SectionHeadingTextTransform, SectionHeadingTitleSize } from '@admin/components/sections/manager/common/SectionHeadingConfig';

interface BrandShowcaseEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

type HeadingStyle = 'default' | 'banner';
type BrandShowcaseStrategy = 'newest' | 'alphabetical' | 'custom';

type BrandSource = 'all' | 'custom';

interface BrandOption {
    value: string;
    label: string;
    logo?: string | null;
    isActive?: boolean;
}

interface BrandShowcaseConfig {
    title: string;
    description: string;
    showTitle: boolean;
    columns: number;
    strategy?: BrandShowcaseStrategy;
    brandIds?: string[];
    limit?: number;
    headingStyle?: HeadingStyle;
    headingBackgroundColor?: string;
    headingTextColor?: string;
    headingTextTransform?: SectionHeadingTextTransform;
    headingTitleSize?: SectionHeadingTitleSize;
    headingBarHeight?: number;
    headingBorderRadius?: number;
    headingPaddingY?: number;
}

const DEFAULT_COLUMNS = 6;
const DEFAULT_LIMIT = 8;

export const BrandShowcaseEditor: React.FC<BrandShowcaseEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [activeTab, setActiveTab] = useState(0);

    const brandIds = useMemo(() => {
        if (Array.isArray(value?.brandIds)) {
            return (value.brandIds as unknown[])
                .filter((id): id is string => typeof id === 'string' && Boolean(id));
        }

        if (Array.isArray(value?.brands)) {
            return (value.brands as any[])
                .map((brand) => brand?.id)
                .filter((id): id is string => typeof id === 'string' && Boolean(id));
        }

        return [];
    }, [value?.brandIds, value?.brands]);

    const config = useMemo<BrandShowcaseConfig>(() => ({
        title: typeof value?.title === 'string' ? value.title : '',
        description: typeof value?.description === 'string' ? value.description : '',
        showTitle: value?.showTitle !== false,
        columns: ensureNumber(value?.columns, DEFAULT_COLUMNS),
        strategy: (value?.strategy as BrandShowcaseStrategy) || 'newest',
        brandIds,
        limit: ensureNumber(value?.limit, DEFAULT_LIMIT),
        headingStyle: (value?.headingStyle as HeadingStyle) || 'default',
        headingBackgroundColor: typeof value?.headingBackgroundColor === 'string' ? value.headingBackgroundColor : undefined,
        headingTextColor: typeof value?.headingTextColor === 'string' ? value.headingTextColor : undefined,
        headingTextTransform: typeof value?.headingTextTransform === 'string' ? (value.headingTextTransform as SectionHeadingTextTransform) : undefined,
        headingTitleSize: typeof value?.headingTitleSize === 'string' ? (value.headingTitleSize as SectionHeadingTitleSize) : undefined,
        headingBarHeight: typeof value?.headingBarHeight === 'number' ? value.headingBarHeight : undefined,
        headingBorderRadius: typeof value?.headingBorderRadius === 'number' ? value.headingBorderRadius : undefined,
        headingPaddingY: typeof value?.headingPaddingY === 'number' ? value.headingPaddingY : undefined,
    }), [value, brandIds]);

    const handleChange = (updates: Partial<BrandShowcaseConfig>) => {
        onChange({
            ...value,
            ...updates,
        });
    };

    const handleHeadingConfigChange = (data: SectionHeadingConfigData) => {
        onChange({
            ...value,
            ...data,
        });
    };

    const brandSource: BrandSource = config.strategy === 'custom' ? 'custom' : 'all';
    const selectedIds = config.brandIds || [];
    const [optionsMap, setOptionsMap] = useState<Record<string, BrandOption>>({});
    const [searchOptions, setSearchOptions] = useState<BrandOption[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    React.useEffect(() => {
        setPage(1);
        setSearchOptions([]);
    }, [debouncedSearch]);

    const brandsQuery = trpc.adminProductBrands.getAll.useQuery({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        isActive: true,
        sortBy: 'name',
        sortOrder: 'ASC',
    });

    const mapBrandToOption = useCallback((brand: any): BrandOption => ({
        value: brand?.id || '',
        label: brand?.name || t('sections.manager.brands.untitled', 'Untitled brand'),
        logo: brand?.logo || null,
        isActive: brand?.isActive !== false,
    }), [t]);

    React.useEffect(() => {
        if (!brandsQuery.data || typeof brandsQuery.data !== 'object') {
            if (!brandsQuery.isFetching && !brandsQuery.isLoading) {
                setSearchOptions((prev) => (page === 1 ? [] : prev));
                setHasMore(false);
            }
            return;
        }

        const data = brandsQuery.data as any;
        let items: any[] = [];
        let currentPage = 1;
        let totalPages = 1;

        if (data?.result?.data?.data?.items && Array.isArray(data.result.data.data.items)) {
            items = data.result.data.data.items;
            currentPage = data.result.data.data.page ?? 1;
            totalPages = data.result.data.data.totalPages ?? 1;
        } else if (data?.data?.data?.items && Array.isArray(data.data.data.items)) {
            items = data.data.data.items;
            currentPage = data.data.data.page ?? 1;
            totalPages = data.data.data.totalPages ?? 1;
        } else if (data?.data?.items && Array.isArray(data.data.items)) {
            items = data.data.items;
            currentPage = data.data.page ?? 1;
            totalPages = data.data.totalPages ?? 1;
        } else if (data?.items && Array.isArray(data.items)) {
            items = data.items;
            currentPage = data.page ?? 1;
            totalPages = data.totalPages ?? 1;
        } else if (Array.isArray(data?.data)) {
            items = data.data;
        }

        const mapped = items.map(mapBrandToOption).filter((option: BrandOption) => option.value);

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

        setHasMore(currentPage < totalPages);
    }, [brandsQuery.data, brandsQuery.isFetching, brandsQuery.isLoading, mapBrandToOption, page]);

    React.useEffect(() => {
        const missing = selectedIds.filter((id) => !optionsMap[id]);
        if (missing.length === 0) return;

        let cancelled = false;
        (async () => {
            try {
                const { trpcClient } = await import('../../../../utils/trpc');
                const results = await Promise.all(
                    missing.map(async (id) => {
                        try {
                            const response = await trpcClient.adminProductBrands.getById.query({ id });
                            const brand = (response as any)?.data;
                            if (!brand) return null;
                            return mapBrandToOption(brand);
                        } catch (error) {
                            console.error('Failed to fetch brand detail', error);
                            return null;
                        }
                    })
                );
                if (cancelled) return;
                const filtered = results.filter(Boolean) as BrandOption[];
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
                console.error('Failed to load selected brands', error);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedIds.join(','), optionsMap, mapBrandToOption]);

    const allOptions = useMemo(() => {
        const map = new Map<string, BrandOption>();
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
        return selectedIds.map((id) => optionsMap[id] || { value: id, label: `Brand ${id}` });
    }, [optionsMap, selectedIds]);

    const handleBrandSelectionChange = (items: readonly BrandOption[] | null) => {
        const ids = (items ?? []).map((item) => item.value);
        handleChange({ brandIds: ids, strategy: 'custom' });
    };

    const handleSourceChange = (nextSource: BrandSource) => {
        if (nextSource === 'custom') {
            handleChange({ strategy: 'custom' });
            return;
        }
        handleChange({ strategy: config.strategy === 'custom' ? 'newest' : config.strategy });
    };

    const loadMore = useCallback(() => {
        if (hasMore && !brandsQuery.isFetching) {
            setPage((prev) => prev + 1);
        }
    }, [hasMore, brandsQuery.isFetching]);

    const brandSelectStyles = useMemo(
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

    const MenuList = (props: MenuListProps<BrandOption>) => (
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
                        disabled={brandsQuery.isFetching}
                    >
                        {brandsQuery.isFetching ? t('common.loading', 'Loading...') : t('sections.manager.brands.loadMore', 'Load more brands')}
                    </button>
                </div>
            )}
        </selectComponents.MenuList>
    );

    const formatOptionLabel = (option: BrandOption, { context }: { context: 'menu' | 'value' }) => {
        const logo = option.logo;
        if (context === 'menu') {
            return (
                <div className="flex items-center gap-3 text-inherit">
                    {logo ? (
                        <img src={logo} alt={option.label} className="w-10 h-10 rounded-md object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{option.label}</span>
                        <span className="text-xs opacity-80">
                            {option.isActive === false ? t('sections.manager.brands.inactive', 'Inactive') : t('sections.manager.brands.active', 'Active')}
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2">
                {logo ? (
                    <img src={logo} alt={option.label} className="w-6 h-6 rounded object-cover" />
                ) : (
                    <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-500">
                        <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                )}
                <span>{option.label}</span>
            </div>
        );
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const menuPortalTarget = typeof window !== 'undefined' ? window.document.body : undefined;

    return (
        <div className="space-y-6">
            <Tabs
                tabs={[
                    {
                        label: t('sections.manager.tabs.content', 'Content'),
                        content: (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="flex flex-col gap-2 text-sm text-gray-700">
                                        <span className="font-medium">{t('sections.manager.brands.title', 'Section Title')}</span>
                                        <Input
                                            value={config.title}
                                            onChange={(e) => handleChange({ title: e.target.value })}
                                        />
                                    </label>
                                    <label className="flex flex-col gap-2 text-sm text-gray-700">
                                        <span className="font-medium">{t('sections.manager.brands.description', 'Description')}</span>
                                        <Input
                                            value={config.description}
                                            onChange={(e) => handleChange({ description: e.target.value })}
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm text-gray-700">
                                        <span className="font-medium">{t('sections.manager.config.brandShowcase.background', 'Background')}</span>
                                        <select
                                            className="border rounded-md px-3.5 py-2.5 text-sm !h-11 bg-white"
                                            value={(value?.backgroundStyle as string) || 'surface'}
                                            onChange={(e) => onChange({ ...value, backgroundStyle: e.target.value })}
                                        >
                                            <option value="surface">{t('sections.manager.config.brandShowcase.backgroundSurface', 'Surface')}</option>
                                            <option value="muted">{t('sections.manager.config.brandShowcase.backgroundMuted', 'Muted')}</option>
                                            <option value="contrast">{t('sections.manager.config.brandShowcase.backgroundContrast', 'Contrast')}</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <Toggle
                                        label={t('sections.manager.brands.showTitle', 'Show Title')}
                                        checked={config.showTitle}
                                        onChange={(checked) => handleChange({ showTitle: checked })}
                                    />
                                    <label className="flex flex-col gap-2 text-sm text-gray-700">
                                        <span className="font-medium">{t('sections.manager.brands.columns', 'Columns')}</span>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={12}
                                            value={config.columns}
                                            onChange={(e) => handleChange({ columns: Number(e.target.value) || DEFAULT_COLUMNS })}
                                        />
                                    </label>
                                    {brandSource === 'all' && (
                                        <label className="flex flex-col gap-2 text-sm text-gray-700">
                                            <span className="font-medium">{t('sections.manager.brands.limit', 'Limit')}</span>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={30}
                                                value={config.limit}
                                                onChange={(e) => handleChange({ limit: Number(e.target.value) || DEFAULT_LIMIT })}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        ),
                    },
                    {
                        label: t('sections.manager.tabs.heading', 'Heading'),
                        content: (
                            <SectionHeadingConfig
                                data={{
                                    headingStyle: config.headingStyle,
                                    headingBackgroundColor: config.headingBackgroundColor,
                                    headingTextColor: config.headingTextColor,
                                    headingTextTransform: config.headingTextTransform,
                                    headingTitleSize: config.headingTitleSize,
                                    headingBarHeight: config.headingBarHeight,
                                    headingBorderRadius: config.headingBorderRadius,
                                    headingPaddingY: config.headingPaddingY,
                                }}
                                onChange={handleHeadingConfigChange}
                            />
                        ),
                    },
                    {
                        label: t('sections.manager.tabs.brands', 'Brands'),
                        content: (
                            <div className="space-y-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <label className="flex flex-col gap-2 text-sm text-gray-700">
                                        <span className="font-medium">{t('sections.manager.brands.source', 'Brand source')}</span>
                                        <select
                                            className="border rounded-md px-3.5 py-2.5 text-sm !h-11 bg-white"
                                            value={brandSource}
                                            onChange={(e) => handleSourceChange(e.target.value as BrandSource)}
                                        >
                                            <option value="all">{t('sections.manager.brands.sourceAll', 'All active brands')}</option>
                                            <option value="custom">{t('sections.manager.brands.sourceCustom', 'Specify brands')}</option>
                                        </select>
                                    </label>

                                    {brandSource === 'all' && (
                                        <label className="flex flex-col gap-2 text-sm text-gray-700">
                                            <span className="font-medium">{t('sections.manager.brands.sort', 'Sort by')}</span>
                                            <select
                                                className="border rounded-md px-3.5 py-2.5 text-sm !h-11 bg-white"
                                                value={config.strategy === 'alphabetical' ? 'alphabetical' : 'newest'}
                                                onChange={(e) => handleChange({ strategy: e.target.value as BrandShowcaseStrategy })}
                                            >
                                                <option value="newest">{t('sections.manager.brands.sortNewest', 'Newest')}</option>
                                                <option value="alphabetical">{t('sections.manager.brands.sortAlphabetical', 'Alphabetical')}</option>
                                            </select>
                                        </label>
                                    )}
                                </div>

                                {brandSource === 'custom' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t('sections.manager.brands.selectBrands', 'Select brands')}
                                        </label>
                                        <SelectComponent<BrandOption, true>
                                            isMulti
                                            placeholder={t('sections.manager.brands.searchPlaceholder', 'Search brands...')}
                                            value={selectedOptions}
                                            onChange={(items) => handleBrandSelectionChange(items as BrandOption[])}
                                            options={allOptions}
                                            inputValue={searchTerm}
                                            onInputChange={(val, actionMeta) => {
                                                if (actionMeta.action === 'input-change') {
                                                    setSearchTerm(val);
                                                }
                                            }}
                                            closeMenuOnSelect={false}
                                            hideSelectedOptions={false}
                                            isLoading={brandsQuery.isLoading && page === 1}
                                            isClearable={false}
                                            loadingMessage={() => t('sections.manager.brands.loading', 'Loading brands...')}
                                            noOptionsMessage={() => (debouncedSearch ? t('sections.manager.brands.noResults', 'No brands found') : t('sections.manager.brands.startTyping', 'Start typing to search'))}
                                            styles={brandSelectStyles}
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
                                    </div>
                                )}
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
