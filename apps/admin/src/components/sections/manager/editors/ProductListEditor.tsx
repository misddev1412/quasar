import React, { useMemo } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Toggle } from '../../../common/Toggle';
import { Select } from '../../../common/Select';
import { ConfigChangeHandler } from '../types';
import { ensureNumber } from '../utils';

interface ProductListEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

interface ProductListConfig {
    showSidebar?: boolean;
    stickySidebar?: boolean;
    pageSize?: number;
    gridColumns?: number;
    showSort?: boolean;
    showHeader?: boolean;
}

const GRID_COLUMN_OPTIONS = [
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
];

export const ProductListEditor: React.FC<ProductListEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();

    const config = useMemo<ProductListConfig>(() => ({
        showSidebar: value?.showSidebar !== false,
        stickySidebar: value?.stickySidebar !== false,
        pageSize: ensureNumber(value?.pageSize, 12),
        gridColumns: ensureNumber(value?.gridColumns, 3),
        showSort: value?.showSort !== false,
        showHeader: value?.showHeader !== false,
    }), [value]);

    const handleChange = (next: Partial<ProductListConfig>) => {
        onChange({
            ...value,
            ...next,
        });
    };

    return (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.productList.pageSize')}
                    <Input
                        type="number"
                        min={1}
                        value={config.pageSize}
                        onChange={(event) => handleChange({ pageSize: Number(event.target.value) || 12 })}
                    />
                </label>

                <Select
                    label={t('sections.manager.config.productList.gridColumns')}
                    value={String(config.gridColumns)}
                    options={GRID_COLUMN_OPTIONS.map((option) => ({
                        ...option,
                        label: t('sections.manager.config.productList.gridColumnsOption', { count: option.label }),
                    }))}
                    onChange={(value) => handleChange({ gridColumns: Number(value) })}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                    <span>{t('sections.manager.config.productList.showSidebar')}</span>
                    <Toggle
                        checked={config.showSidebar !== false}
                        onChange={(checked) => handleChange({ showSidebar: checked })}
                        size="sm"
                    />
                </label>

                <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                    <span>{t('sections.manager.config.productList.stickySidebar')}</span>
                    <Toggle
                        checked={config.stickySidebar !== false}
                        onChange={(checked) => handleChange({ stickySidebar: checked })}
                        size="sm"
                        disabled={config.showSidebar === false}
                    />
                </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                    <span>{t('sections.manager.config.productList.showSort')}</span>
                    <Toggle
                        checked={config.showSort !== false}
                        onChange={(checked) => handleChange({ showSort: checked })}
                        size="sm"
                    />
                </label>

                <label className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                    <span>{t('sections.manager.config.productList.showHeader')}</span>
                    <Toggle
                        checked={config.showHeader !== false}
                        onChange={(checked) => handleChange({ showHeader: checked })}
                        size="sm"
                    />
                </label>
            </div>
        </div>
    );
};

export default ProductListEditor;
