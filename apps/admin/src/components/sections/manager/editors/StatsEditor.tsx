import React from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Select } from '../../../common/Select';
import { ConfigChangeHandler } from '../types';
import { ensureNumber } from '../utils';

interface StatsEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

export const StatsEditor: React.FC<StatsEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();

    const handleLayoutChange = (layout: 'grid' | 'counter') => {
        onChange({
            ...(value ?? {}),
            layout,
        });
    };

    const handleColumnsChange = (columns: number) => {
        onChange({
            ...(value ?? {}),
            columns,
        });
    };

    const currentLayout = (value?.layout as string) || 'grid';
    const currentColumns = ensureNumber(value?.columns, 4);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.stats.layoutStyle')}
                    <Select
                        value={currentLayout}
                        onChange={(layout) => handleLayoutChange(layout as 'grid' | 'counter')}
                        options={[
                            { value: 'grid', label: t('sections.manager.config.stats.gridLayout') },
                            { value: 'counter', label: t('sections.manager.config.stats.animatedCounter') },
                        ]}
                        className="text-sm"
                    />
                </label>

                {currentLayout === 'grid' && (
                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                        {t('sections.manager.config.stats.numberOfColumns')}
                        <Input
                            type="number"
                            min={1}
                            max={6}
                            value={currentColumns}
                            onChange={(e) => handleColumnsChange(Number(e.target.value))}
                            className="text-sm"
                            inputSize="md"
                        />
                        <span className="text-xs text-gray-500">{t('sections.manager.config.stats.columnsDescription')}</span>
                    </label>
                )}
            </div>

            <p className="text-xs text-gray-500">
                {t('sections.manager.config.stats.contentDescription')}
            </p>
        </div>
    );
};
