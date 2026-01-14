import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Toggle } from '../../../common/Toggle';
import { SearchSelect } from '../../../common/SearchSelect';
import { Button } from '../../../common/Button';
import { trpc } from '../../../../utils/trpc';
import { ConfigChangeHandler } from '../types';
import { ensureNumber } from '../utils';
import {
    SectionHeadingConfig,
    SectionHeadingConfigData,
    SectionHeadingTextTransform,
    SectionHeadingTitleSize,
} from '../common/SectionHeadingConfig';

interface NewsByCategoryConfigEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

type NewsStrategy = 'latest' | 'most_viewed' | 'featured';
type HeadingStyle = 'default' | 'banner';
type NewsCardLayout = 'grid' | 'horizontal' | 'compact';
type NewsCardBadgeTone = 'primary' | 'neutral' | 'emphasis';

interface NewsCardConfig {
    layout?: NewsCardLayout;
    badgeTone?: NewsCardBadgeTone;
    ctaText?: string;
    showCategory?: boolean;
    showPublishDate?: boolean;
    showExcerpt?: boolean;
    showReadMore?: boolean;
}

interface NewsByCategoryAdminRow {
    id: string;
    categoryId?: string;
    title: string;
    strategy: NewsStrategy;
    limit: number;
    columns: number;
    card: NewsCardConfig;
    headingStyle?: HeadingStyle;
    headingBackgroundColor?: string;
    headingTextColor?: string;
    headingTextTransform?: SectionHeadingTextTransform;
    headingTitleSize?: SectionHeadingTitleSize;
    headingBarHeight?: number;
}

interface CategoryOption {
    value: string;
    label: string;
}

const DEFAULT_ROW_LIMIT = 4;
const DEFAULT_COLUMNS = 3;
const MIN_COLUMNS = 1;
const MAX_COLUMNS = 6;

const DEFAULT_CARD_CONFIG: NewsCardConfig = {
    layout: 'grid',
    badgeTone: 'primary',
    ctaText: '',
    showCategory: true,
    showPublishDate: true,
    showExcerpt: true,
    showReadMore: true,
};

const clampColumns = (value: unknown): number => {
    const sanitized = ensureNumber(value, DEFAULT_COLUMNS);
    return Math.max(MIN_COLUMNS, Math.min(MAX_COLUMNS, sanitized));
};

const normalizeCardConfig = (raw?: Record<string, unknown>): NewsCardConfig => {
    if (!raw || typeof raw !== 'object') {
        return { ...DEFAULT_CARD_CONFIG };
    }

    return {
        layout: (['grid', 'horizontal', 'compact'].includes(String(raw.layout)) ? raw.layout : DEFAULT_CARD_CONFIG.layout) as NewsCardLayout,
        badgeTone: (['primary', 'neutral', 'emphasis'].includes(String(raw.badgeTone)) ? raw.badgeTone : DEFAULT_CARD_CONFIG.badgeTone) as NewsCardBadgeTone,
        ctaText: typeof raw.ctaText === 'string' ? raw.ctaText : DEFAULT_CARD_CONFIG.ctaText,
        showCategory: raw.showCategory !== false,
        showPublishDate: raw.showPublishDate !== false,
        showExcerpt: raw.showExcerpt !== false,
        showReadMore: raw.showReadMore !== false,
    };
};

const normalizeStrategy = (value: unknown): NewsStrategy => {
    const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (normalized === 'most_viewed') return 'most_viewed';
    if (normalized === 'featured') return 'featured';
    return 'latest';
};

const getHeadingConfigFromRow = (row?: NewsByCategoryAdminRow): SectionHeadingConfigData => ({
    headingStyle: row?.headingStyle ?? 'default',
    headingBackgroundColor: row?.headingBackgroundColor,
    headingTextColor: row?.headingTextColor,
    headingTextTransform: row?.headingTextTransform,
    headingTitleSize: row?.headingTitleSize,
    headingBarHeight: row?.headingBarHeight,
});

const createDefaultRow = (): NewsByCategoryAdminRow => ({
    id: crypto.randomUUID(),
    categoryId: undefined,
    title: '',
    strategy: 'latest',
    limit: DEFAULT_ROW_LIMIT,
    columns: DEFAULT_COLUMNS,
    card: { ...DEFAULT_CARD_CONFIG },
    headingStyle: 'default',
});

const parseRowsFromValue = (value: Record<string, unknown>): NewsByCategoryAdminRow[] => {
    const baseCard = normalizeCardConfig(value?.card as Record<string, unknown> | undefined);
    const baseStrategy = normalizeStrategy(value?.strategy);
    const baseLimit = ensureNumber(value?.limit, DEFAULT_ROW_LIMIT);
    const baseColumns = clampColumns((value as any)?.columns ?? DEFAULT_COLUMNS);
    const baseHeadingConfig: SectionHeadingConfigData = {
        headingStyle: (value?.headingStyle as HeadingStyle) || 'default',
        headingBackgroundColor: typeof value?.headingBackgroundColor === 'string' ? value.headingBackgroundColor : undefined,
        headingTextColor: typeof value?.headingTextColor === 'string' ? value.headingTextColor : undefined,
        headingTextTransform: typeof value?.headingTextTransform === 'string'
            ? (value.headingTextTransform as SectionHeadingTextTransform)
            : undefined,
        headingTitleSize: typeof value?.headingTitleSize === 'string'
            ? (value.headingTitleSize as SectionHeadingTitleSize)
            : undefined,
        headingBarHeight: typeof value?.headingBarHeight === 'number' ? value.headingBarHeight : undefined,
    };

    if (Array.isArray(value?.rows) && value.rows.length > 0) {
        return value.rows.map((row: any, index: number) => ({
            id: row.id || `news-row-${index}`,
            categoryId: typeof row.categoryId === 'string' ? row.categoryId : undefined,
            title: typeof row.title === 'string' ? row.title : '',
            strategy: normalizeStrategy(row.strategy ?? baseStrategy),
            limit: ensureNumber(row.limit, baseLimit),
            columns: clampColumns(row.columns ?? baseColumns),
            card: { ...baseCard, ...normalizeCardConfig(row.card) },
            headingStyle: (row?.headingStyle as HeadingStyle) || baseHeadingConfig.headingStyle,
            headingBackgroundColor: typeof row?.headingBackgroundColor === 'string' ? row.headingBackgroundColor : baseHeadingConfig.headingBackgroundColor,
            headingTextColor: typeof row?.headingTextColor === 'string' ? row.headingTextColor : baseHeadingConfig.headingTextColor,
            headingTextTransform: typeof row?.headingTextTransform === 'string'
                ? (row.headingTextTransform as SectionHeadingTextTransform)
                : baseHeadingConfig.headingTextTransform,
            headingTitleSize: typeof row?.headingTitleSize === 'string'
                ? (row.headingTitleSize as SectionHeadingTitleSize)
                : baseHeadingConfig.headingTitleSize,
            headingBarHeight: typeof row?.headingBarHeight === 'number'
                ? row.headingBarHeight
                : baseHeadingConfig.headingBarHeight,
        }));
    }

    if (Array.isArray(value?.categories) && value.categories.length > 0) {
        return value.categories.map((categoryId: string, index: number) => ({
            id: `news-row-${index}`,
            categoryId,
            title: '',
            strategy: baseStrategy,
            limit: baseLimit,
            columns: baseColumns,
            card: { ...baseCard },
            headingStyle: baseHeadingConfig.headingStyle,
            headingBackgroundColor: baseHeadingConfig.headingBackgroundColor,
            headingTextColor: baseHeadingConfig.headingTextColor,
            headingTextTransform: baseHeadingConfig.headingTextTransform,
            headingTitleSize: baseHeadingConfig.headingTitleSize,
            headingBarHeight: baseHeadingConfig.headingBarHeight,
        }));
    }

    if (typeof value?.categoryId === 'string' && value.categoryId.trim().length > 0) {
        return [{
            id: 'news-row-single',
            categoryId: value.categoryId,
            title: typeof value?.title === 'string' ? value.title : '',
            strategy: baseStrategy,
            limit: baseLimit,
            columns: baseColumns,
            card: { ...baseCard },
            headingStyle: baseHeadingConfig.headingStyle,
            headingBackgroundColor: baseHeadingConfig.headingBackgroundColor,
            headingTextColor: baseHeadingConfig.headingTextColor,
            headingTextTransform: baseHeadingConfig.headingTextTransform,
            headingTitleSize: baseHeadingConfig.headingTitleSize,
            headingBarHeight: baseHeadingConfig.headingBarHeight,
        }];
    }

    return [createDefaultRow()];
};

const sanitizeConfigValue = (originalValue: Record<string, unknown>, rows: NewsByCategoryAdminRow[]) => {
    const sanitizedRows = rows.map((row) => ({
        id: row.id,
        categoryId: row.categoryId,
        title: row.title,
        strategy: row.strategy,
        limit: row.limit,
        columns: row.columns,
        card: {
            layout: row.card.layout,
            badgeTone: row.card.badgeTone,
            ctaText: row.card.ctaText,
            showCategory: row.card.showCategory,
            showPublishDate: row.card.showPublishDate,
            showExcerpt: row.card.showExcerpt,
            showReadMore: row.card.showReadMore,
        },
        headingStyle: row.headingStyle,
        headingBackgroundColor: row.headingBackgroundColor,
        headingTextColor: row.headingTextColor,
        headingTextTransform: row.headingTextTransform,
        headingTitleSize: row.headingTitleSize,
        headingBarHeight: row.headingBarHeight,
    }));

    return {
        ...originalValue,
        rows: sanitizedRows,
    };
};

const rowsAreEqual = (rows: NewsByCategoryAdminRow[], otherRows: NewsByCategoryAdminRow[]): boolean => {
    if (rows.length !== otherRows.length) return false;
    return rows.every((row, index) => {
        const other = otherRows[index];
        if (!other) return false;
        return row.id === other.id
            && row.categoryId === other.categoryId
            && row.title === other.title
            && row.strategy === other.strategy
            && row.limit === other.limit
            && row.columns === other.columns
            && row.headingStyle === other.headingStyle
            && row.headingBackgroundColor === other.headingBackgroundColor
            && row.headingTextColor === other.headingTextColor
            && row.headingTextTransform === other.headingTextTransform
            && row.headingTitleSize === other.headingTitleSize
            && row.headingBarHeight === other.headingBarHeight
            && row.card.layout === other.card.layout
            && row.card.badgeTone === other.card.badgeTone
            && row.card.ctaText === other.card.ctaText
            && row.card.showCategory === other.card.showCategory
            && row.card.showPublishDate === other.card.showPublishDate
            && row.card.showExcerpt === other.card.showExcerpt
            && row.card.showReadMore === other.card.showReadMore;
    });
};

interface NewsRowEditorProps {
    row: NewsByCategoryAdminRow;
    index: number;
    categoriesLoading: boolean;
    categoryOptions: CategoryOption[];
    onChange: (nextRow: NewsByCategoryAdminRow) => void;
    onRemove: () => void;
    canRemove: boolean;
}

const NewsRowEditor: React.FC<NewsRowEditorProps> = ({
    row,
    index,
    categoriesLoading,
    categoryOptions,
    onChange,
    onRemove,
    canRemove,
}) => {
    const { t } = useTranslationWithBackend();
    const selectedCategoryOption = categoryOptions.find((opt) => opt.value === row.categoryId) || null;

    const handleRowChange = (updates: Partial<NewsByCategoryAdminRow>) => {
        onChange({
            ...row,
            ...updates,
        });
    };

    const handleCardChange = (updates: Partial<NewsCardConfig>) => {
        onChange({
            ...row,
            card: {
                ...row.card,
                ...updates,
            },
        });
    };

    const handleHeadingConfigChange = (data: SectionHeadingConfigData) => {
        onChange({
            ...row,
            ...data,
        });
    };

    return (
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                        {t('sections.manager.newsByCategory.blockIndex', { index: index + 1 })}
                    </p>
                    <p className="text-xs text-gray-500">{t('sections.manager.newsByCategory.rowDescription')}</p>
                </div>
                <div className="flex flex-wrap items-start gap-3">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t('sections.manager.newsByCategory.fetchStrategy')}
                        <select
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            value={row.strategy}
                            onChange={(event) => handleRowChange({ strategy: event.target.value as NewsStrategy })}
                        >
                            <option value="latest">{t('sections.manager.newsByCategory.latest')}</option>
                            <option value="most_viewed">{t('sections.manager.newsByCategory.mostViewed')}</option>
                            <option value="featured">{t('sections.manager.newsByCategory.featured')}</option>
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
                                {t('sections.manager.newsByCategory.remove')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6 px-5 py-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <label className="lg:col-span-12 flex flex-col gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {t('sections.manager.newsByCategory.displayTitle')}
                        </span>
                        <Input
                            value={row.title}
                            onChange={(event) => handleRowChange({ title: event.target.value })}
                            placeholder={t('sections.manager.newsByCategory.titlePlaceholder')}
                            inputSize="md"
                            className="text-sm"
                        />
                    </label>
                    <label className="lg:col-span-6 flex flex-col gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {t('sections.manager.newsByCategory.category')}
                        </span>
                        <SearchSelect<CategoryOption>
                            isClearable
                            isSearchable
                            isDisabled={categoriesLoading}
                            isLoading={categoriesLoading}
                            options={categoryOptions}
                            value={selectedCategoryOption}
                            onChange={(option) => handleRowChange({ categoryId: (option as CategoryOption | null)?.value })}
                            placeholder={t('sections.manager.newsByCategory.selectCategory')}
                            size="md"
                        />
                    </label>
                    <label className="lg:col-span-3 flex flex-col gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {t('sections.manager.newsByCategory.limit')}
                        </span>
                        <Input
                            type="number"
                            min={1}
                            max={12}
                            value={row.limit}
                            onChange={(event) => handleRowChange({ limit: Math.max(1, Number(event.target.value) || DEFAULT_ROW_LIMIT) })}
                            inputSize="md"
                            className="text-sm"
                        />
                    </label>
                    <label className="lg:col-span-3 flex flex-col gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {t('sections.manager.newsByCategory.columns')}
                        </span>
                        <Input
                            type="number"
                            min={MIN_COLUMNS}
                            max={MAX_COLUMNS}
                            value={row.columns}
                            onChange={(event) => handleRowChange({ columns: clampColumns(event.target.value) })}
                            inputSize="md"
                            className="text-sm"
                        />
                        <span className="text-xs text-gray-500">
                            {t('sections.manager.newsByCategory.columnsDescription', { min: MIN_COLUMNS, max: MAX_COLUMNS })}
                        </span>
                    </label>
                </div>

                <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-gray-900">{t('sections.manager.newsByCategory.card.title')}</h4>
                        <p className="text-xs text-gray-500">{t('sections.manager.newsByCategory.card.description')}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm text-gray-700">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {t('sections.manager.newsByCategory.card.layout')}
                            </span>
                            <select
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                value={row.card.layout}
                                onChange={(event) => handleCardChange({ layout: event.target.value as NewsCardLayout })}
                            >
                                <option value="grid">{t('sections.manager.newsByCategory.card.layoutOptions.grid')}</option>
                                <option value="horizontal">{t('sections.manager.newsByCategory.card.layoutOptions.horizontal')}</option>
                                <option value="compact">{t('sections.manager.newsByCategory.card.layoutOptions.compact')}</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-gray-700">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {t('sections.manager.newsByCategory.card.badgeTone')}
                            </span>
                            <select
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                value={row.card.badgeTone}
                                onChange={(event) => handleCardChange({ badgeTone: event.target.value as NewsCardBadgeTone })}
                            >
                                <option value="primary">{t('sections.manager.newsByCategory.card.badgeToneOptions.primary')}</option>
                                <option value="neutral">{t('sections.manager.newsByCategory.card.badgeToneOptions.neutral')}</option>
                                <option value="emphasis">{t('sections.manager.newsByCategory.card.badgeToneOptions.emphasis')}</option>
                            </select>
                        </label>
                    </div>

                    <label className="flex flex-col gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {t('sections.manager.newsByCategory.card.ctaText')}
                        </span>
                        <Input
                            value={row.card.ctaText || ''}
                            onChange={(event) => handleCardChange({ ctaText: event.target.value })}
                            placeholder={t('sections.manager.newsByCategory.card.ctaPlaceholder')}
                            inputSize="md"
                            className="text-sm"
                        />
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Toggle
                            label={t('sections.manager.newsByCategory.card.showCategory')}
                            checked={row.card.showCategory ?? true}
                            onChange={(checked) => handleCardChange({ showCategory: checked })}
                        />
                        <Toggle
                            label={t('sections.manager.newsByCategory.card.showPublishDate')}
                            checked={row.card.showPublishDate ?? true}
                            onChange={(checked) => handleCardChange({ showPublishDate: checked })}
                        />
                        <Toggle
                            label={t('sections.manager.newsByCategory.card.showExcerpt')}
                            checked={row.card.showExcerpt ?? true}
                            onChange={(checked) => handleCardChange({ showExcerpt: checked })}
                        />
                        <Toggle
                            label={t('sections.manager.newsByCategory.card.showReadMore')}
                            checked={row.card.showReadMore ?? true}
                            onChange={(checked) => handleCardChange({ showReadMore: checked })}
                        />
                    </div>
                </div>

                <SectionHeadingConfig
                    data={{
                        headingStyle: row.headingStyle || 'default',
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

export const NewsByCategoryEditor: React.FC<NewsByCategoryConfigEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const { data: categoriesData, isLoading: categoriesLoading } = trpc.adminPostCategories.getCategories.useQuery();
    const categoryOptions = useMemo<CategoryOption[]>(() => {
        const categories = (categoriesData as any)?.data || [];
        return categories.map((cat: any) => ({
            value: cat.id,
            label: cat.name,
        }));
    }, [categoriesData]);

    const [rows, setRows] = useState<NewsByCategoryAdminRow[]>(() => parseRowsFromValue(value));
    const skipSyncRef = useRef(false);
    const [commonHeadingConfig, setCommonHeadingConfig] = useState<SectionHeadingConfigData>(() =>
        getHeadingConfigFromRow(parseRowsFromValue(value)[0])
    );
    const headingConfigInitRef = useRef(false);
    const [isCommonHeadingOpen, setIsCommonHeadingOpen] = useState(false);

    useEffect(() => {
        if (skipSyncRef.current) {
            skipSyncRef.current = false;
            return;
        }
        const nextRows = parseRowsFromValue(value);
        setRows((prev) => (rowsAreEqual(prev, nextRows) ? prev : nextRows));
    }, [value]);

    useEffect(() => {
        if (headingConfigInitRef.current) return;
        headingConfigInitRef.current = true;
        setCommonHeadingConfig(getHeadingConfigFromRow(parseRowsFromValue(value)[0]));
    }, [value]);

    const commitConfig = useCallback(
        (nextRows: NewsByCategoryAdminRow[]) => {
            const nextValue = sanitizeConfigValue(value, nextRows);
            onChange(nextValue);
        },
        [onChange, value],
    );

    const applyUpdate = useCallback(
        (nextRows: NewsByCategoryAdminRow[]) => {
            skipSyncRef.current = true;
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
        (rowId: string, nextRow: NewsByCategoryAdminRow) => {
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
            <div className="space-y-1">
                <h4 className="text-sm font-semibold text-gray-700">{t('sections.manager.newsByCategory.title')}</h4>
                <p className="text-xs text-gray-500">{t('sections.manager.newsByCategory.description')}</p>
            </div>

            <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-gray-700">
                            {t('sections.manager.newsByCategory.headingConfigAllTitle', 'Heading config (apply to all)')}
                        </h4>
                        <p className="text-xs text-gray-500">
                            {t('sections.manager.newsByCategory.headingConfigAllDescription', 'Update once and apply to every category heading.')}
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
                            ? t('sections.manager.newsByCategory.closeHeadingConfigAll', 'Hide common config')
                            : t('sections.manager.newsByCategory.openHeadingConfigAll', 'Open common config')}
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
                                {t('sections.manager.newsByCategory.applyHeadingConfigAll', 'Apply to all')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h5 className="text-sm font-semibold text-gray-700">{t('sections.manager.newsByCategory.configureBlocks')}</h5>
                    <p className="text-xs text-gray-500">{t('sections.manager.newsByCategory.rowDescription')}</p>
                </div>
                <Button size="sm" onClick={handleAddRow} startIcon={<FiPlus className="h-4 w-4" />}>
                    {t('sections.manager.newsByCategory.addBlock')}
                </Button>
            </div>

            <div className="space-y-6">
                {rows.map((row, index) => (
                    <NewsRowEditor
                        key={row.id}
                        row={row}
                        index={index}
                        categoriesLoading={categoriesLoading}
                        categoryOptions={categoryOptions}
                        onChange={(nextRow) => handleRowChange(row.id, nextRow)}
                        onRemove={() => handleRemoveRow(row.id)}
                        canRemove={rows.length > 1}
                    />
                ))}
            </div>
        </div>
    );
};
