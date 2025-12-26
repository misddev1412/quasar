import React from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Select } from '../../../common/Select';
import { ConfigChangeHandler } from '../types';
import { ensureNumber } from '../utils';

interface FeaturesEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

export const FeaturesEditor: React.FC<FeaturesEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();

    const handleLayoutChange = (layout: 'grid' | 'list' | 'tabs') => {
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
    const currentColumns = ensureNumber(value?.columns, 3);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.features.layoutStyle')}
                    <Select
                        value={currentLayout}
                        onChange={(layout) => handleLayoutChange(layout as 'grid' | 'list' | 'tabs')}
                        options={[
                            { value: 'grid', label: t('sections.manager.config.features.gridLayout') },
                            { value: 'list', label: t('sections.manager.config.features.listLayout') },
                            { value: 'tabs', label: t('sections.manager.config.features.tabbedLayout') },
                        ]}
                        className="text-sm"
                    />
                </label>

                {currentLayout === 'grid' && (
                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                        {t('sections.manager.config.features.numberOfColumns')}
                        <Input
                            type="number"
                            min={1}
                            max={4}
                            value={currentColumns}
                            onChange={(e) => handleColumnsChange(Number(e.target.value))}
                            className="text-sm"
                            inputSize="md"
                        />
                        <span className="text-xs text-gray-500">{t('sections.manager.config.features.columnsDescription')}</span>
                    </label>
                )}
            </div>

            <p className="text-xs text-gray-500">
                {t('sections.manager.config.features.contentDescription')}
            </p>
        </div>
    );
};
