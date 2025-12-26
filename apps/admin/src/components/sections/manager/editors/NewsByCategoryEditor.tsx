import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Toggle } from '../../../common/Toggle';
import { Input } from '../../../common/Input';
import { Button } from '../../../common/Button';
import { SearchSelect } from '../../../common/SearchSelect';
import { trpc } from '../../../../utils/trpc';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { ConfigChangeHandler, SelectOption } from '../types';
import { ensureNumber } from '../utils';

interface NewsByCategoryConfigEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

type NewsByCategoryStrategy = 'latest' | 'most_viewed' | 'featured';
type NewsByCategoryDisplayStyle = 'grid' | 'carousel';

interface NewsByCategoryAdminRow {
    id: string;
    categoryId?: string;
    title: string;
    strategy: NewsByCategoryStrategy;
    limit: number;
    displayStyle: NewsByCategoryDisplayStyle;
}

interface NewsCategorySelectOption extends SelectOption {
    searchText: string;
    categoryName: string;
}

const DEFAULT_NEWS_LIMIT = 3;

const createNewsRowId = () => `news-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createDefaultNewsRow = (): NewsByCategoryAdminRow => ({
    id: createNewsRowId(),
    categoryId: undefined,
    title: '',
    strategy: 'latest',
    limit: DEFAULT_NEWS_LIMIT,
    displayStyle: 'grid',
});

const normalizeNewsStrategy = (value: unknown): NewsByCategoryStrategy => {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (raw === 'most_viewed' || raw === 'featured') {
        return raw;
    }
    return 'latest';
};

const flattenNewsCategoryOptions = (categories: any[], prefix = ''): NewsCategorySelectOption[] => {
    if (!Array.isArray(categories)) {
        return [];
    }
    return categories.flatMap((category: any) => {
        const label = prefix ? `${prefix} › ${category.name}` : category.name;
        const searchPieces = [category?.name, category?.id, category?.slug, prefix]
            .map((piece) => (typeof piece === 'string' ? piece.trim().toLowerCase() : ''))
            .filter(Boolean);

        const currentOption: NewsCategorySelectOption = {
            value: category.id,
            label,
            searchText: searchPieces.join(' '),
            categoryName: typeof category?.name === 'string' ? category.name : label,
        };

        const children = flattenNewsCategoryOptions(category.children, label);
        return [currentOption, ...children];
    });
};

const parseNewsRowsFromValue = (raw: Record<string, unknown>): NewsByCategoryAdminRow[] => {
    const rawRows = Array.isArray(raw?.rows) ? (raw.rows as any[]) : [];
    if (rawRows.length > 0) {
        return rawRows.map((row, index) => {
            const id = typeof row?.id === 'string' && row.id.trim().length > 0 ? row.id : createNewsRowId();
            return {
                id: index === 0 ? id : `${id}-${index}`,
                categoryId: typeof row?.categoryId === 'string' ? row.categoryId : undefined,
                title: typeof row?.title === 'string' ? row.title : '',
                strategy: normalizeNewsStrategy(row?.strategy),
                limit: ensureNumber(row?.limit, DEFAULT_NEWS_LIMIT),
                displayStyle: row?.displayStyle === 'carousel' ? 'carousel' : 'grid',
            };
        });
    }

    const legacyCategoryId = typeof raw?.categoryId === 'string' ? raw.categoryId : undefined;
    return [{
        id: createNewsRowId(),
        categoryId: legacyCategoryId,
        title: '',
        strategy: normalizeNewsStrategy(raw?.sort),
        limit: ensureNumber(raw?.limit, DEFAULT_NEWS_LIMIT),
        displayStyle: raw?.displayStyle === 'carousel' ? 'carousel' : 'grid',
    }];
};

const sanitizeNewsConfigValue = (base: Record<string, unknown>, rows: NewsByCategoryAdminRow[]): Record<string, unknown> => {
    const sanitizedRows = rows.map((row) => ({
        id: row.id,
        categoryId: row.categoryId,
        title: row.title,
        strategy: row.strategy,
        limit: row.limit,
        displayStyle: row.displayStyle,
    }));

    const next: Record<string, unknown> = { ...(base ?? {}) };
    delete next.categoryId;
    delete next.sort;
    delete next.limit;
    delete next.displayStyle;
    next.rows = sanitizedRows;
    return next;
};

const newsRowsAreEqual = (a: NewsByCategoryAdminRow[], b: NewsByCategoryAdminRow[]): boolean => {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    return a.every((row, index) => {
        const other = b[index];
        if (!other) return false;
        return (
            row.id === other.id &&
            row.categoryId === other.categoryId &&
            row.title === other.title &&
            row.strategy === other.strategy &&
            row.limit === other.limit &&
            row.displayStyle === other.displayStyle
        );
    });
};

interface NewsCategoryRowEditorProps {
    index: number;
    row: NewsByCategoryAdminRow;
    categoryOptions: NewsCategorySelectOption[];
    categoriesLoading: boolean;
    onChange: (row: NewsByCategoryAdminRow) => void;
    onRemove: () => void;
    canRemove: boolean;
}

const NewsCategoryRowEditor: React.FC<NewsCategoryRowEditorProps> = ({
    index,
    row,
    categoryOptions,
    categoriesLoading,
    onChange,
    onRemove,
    canRemove,
}) => {
    const { t } = useTranslationWithBackend();

    const STRATEGY_OPTIONS = useMemo(() => [
        { value: 'latest', label: t('sections.manager.newsByCategory.latest') },
        { value: 'most_viewed', label: t('sections.manager.newsByCategory.mostViewed') },
        { value: 'featured', label: t('sections.manager.newsByCategory.featured') },
    ], [t]);

    const selectedCategoryOption = useMemo<NewsCategorySelectOption | null>(() => {
        if (!row.categoryId) return null;
        const existing = categoryOptions.find((opt) => opt.value === row.categoryId);
        if (existing) return existing;
        return {
            value: row.categoryId,
            label: `ID: ${row.categoryId}`,
            searchText: row.categoryId,
            categoryName: `ID: ${row.categoryId}`,
        };
    }, [categoryOptions, row.categoryId]);

    const handleChange = (field: keyof NewsByCategoryAdminRow, value: any) => {
        onChange({
            ...row,
            [field]: value,
        });
    };

    const handleCategoryChange = (option: NewsCategorySelectOption | null) => {
        const newCategoryId = option?.value;
        const categoryName = option?.categoryName || '';
        const shouldAutofillTitle = Boolean(newCategoryId) && (!row.title || row.categoryId !== newCategoryId);
        onChange({
            ...row,
            categoryId: newCategoryId,
            title: shouldAutofillTitle ? categoryName : row.title,
        });
    };

    return (
        <div className="rounded-xl border border-gray-200/80 bg-white/90 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{t('sections.manager.newsByCategory.blockIndex', { index: index + 1 })}</p>
                </div>
                <div className="flex flex-wrap items-start gap-3">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t('sections.manager.newsByCategory.strategy')}
                        <select
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            value={row.strategy}
                            onChange={(e) => handleChange('strategy', e.target.value)}
                        >
                            {STRATEGY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t('sections.manager.newsByCategory.displayStyle')}
                        <select
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            value={row.displayStyle}
                            onChange={(e) => handleChange('displayStyle', e.target.value)}
                        >
                            <option value="grid">Grid</option>
                            <option value="carousel">Carousel</option>
                        </select>
                    </label>
                    {canRemove && (
                        <div className="flex flex-col items-start gap-1">
                            <span className="invisible text-xs font-semibold uppercase tracking-wide text-gray-500 select-none">placeholder</span>
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

            <div className="space-y-5 px-5 py-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <label className="lg:col-span-12 flex flex-col gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('sections.manager.newsByCategory.title')}</span>
                        <Input
                            value={row.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder={t('sections.manager.newsByCategory.titlePlaceholder')}
                            className="text-sm"
                            inputSize="md"
                        />
                    </label>
                    <label className="lg:col-span-8 flex flex-col gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('sections.manager.newsByCategory.category')}</span>
                        <SearchSelect<NewsCategorySelectOption>
                            isClearable
                            isSearchable
                            isDisabled={categoriesLoading}
                            isLoading={categoriesLoading}
                            options={categoryOptions}
                            value={selectedCategoryOption}
                            onChange={(option) => handleCategoryChange(option as NewsCategorySelectOption | null)}
                            placeholder={categoriesLoading ? t('sections.manager.newsByCategory.loading') : t('sections.manager.newsByCategory.selectCategory')}
                            menuPlacement="auto"
                            size="md"
                        />
                    </label>
                    <label className="lg:col-span-4 flex flex-col gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('sections.manager.newsByCategory.limit')}</span>
                        <Input
                            type="number"
                            min={1}
                            value={row.limit}
                            onChange={(e) => handleChange('limit', Math.max(1, Number(e.target.value)))}
                            className="text-sm"
                            inputSize="md"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export const NewsByCategoryConfigEditor: React.FC<NewsByCategoryConfigEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const { data: categoriesData, isLoading: categoriesLoading } = trpc.adminPostCategories.getCategories.useQuery();

    const categoryOptions = useMemo<NewsCategorySelectOption[]>(() => {
        const categories = (categoriesData as any)?.data;
        return flattenNewsCategoryOptions(categories);
    }, [categoriesData]);

    const [rows, setRows] = useState<NewsByCategoryAdminRow[]>(() => parseNewsRowsFromValue(value));
    const skipRowsSyncRef = useRef(false);

    useEffect(() => {
        if (skipRowsSyncRef.current) {
            skipRowsSyncRef.current = false;
            return;
        }
        const nextRows = parseNewsRowsFromValue(value);
        setRows((prev) => (newsRowsAreEqual(prev, nextRows) ? prev : nextRows));
    }, [value]);

    const commitConfig = useCallback(
        (nextRows: NewsByCategoryAdminRow[]) => {
            const nextValue = sanitizeNewsConfigValue(value, nextRows);
            onChange(nextValue);
        },
        [onChange, value],
    );

    const applyUpdate = useCallback(
        (nextRows: NewsByCategoryAdminRow[]) => {
            skipRowsSyncRef.current = true;
            setRows(nextRows);
            commitConfig(nextRows);
        },
        [commitConfig],
    );

    const handleAddRow = useCallback(() => {
        applyUpdate([...rows, createDefaultNewsRow()]);
    }, [applyUpdate, rows]);

    const handleRemoveRow = useCallback(
        (rowId: string) => {
            const filtered = rows.filter((row) => row.id !== rowId);
            applyUpdate(filtered.length > 0 ? filtered : [createDefaultNewsRow()]);
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

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h4 className="text-sm font-semibold text-gray-700">{t('sections.manager.newsByCategory.configureBlocks')}</h4>
                <p className="text-xs text-gray-500">{t('sections.manager.newsByCategory.description')}</p>
            </div>

            <div className="space-y-4">
                {rows.map((row, index) => (
                    <NewsCategoryRowEditor
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
                {t('sections.manager.newsByCategory.addBlock')}
            </button>
        </div>
    );
};
