import React from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { ConfigChangeHandler } from '../types';
import { ColorSelector } from '../../../common/ColorSelector';
import { Input } from '../../../common/Input';
import { IntroductionStatItem } from '@frontend/components/sections/IntroductionSection';

interface IntroductionEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

export const IntroductionEditor: React.FC<IntroductionEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();

    const currentTitleColor = (value?.titleColor as string) || '';
    const currentStatsColor = (value?.statsColor as string) || '';
    const currentCtaLabel = (value?.ctaLabel as string) || '';
    const currentCtaUrl = (value?.ctaUrl as string) || '';
    const currentStats = (value?.stats as IntroductionStatItem[]) || [];

    const handleConfigChange = (key: string, val: any) => {
        onChange({
            ...(value ?? {}),
            [key]: val,
        });
    };

    const handleStatChange = (index: number, field: keyof IntroductionStatItem, val: string) => {
        const newStats = [...currentStats];
        if (!newStats[index]) {
            newStats[index] = { value: '', label: '' };
        }
        newStats[index] = { ...newStats[index], [field]: val };
        handleConfigChange('stats', newStats);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorSelector
                    label={t('sections.manager.config.introduction.titleColor', 'Title Color')}
                    value={currentTitleColor}
                    onChange={(color) => handleConfigChange('titleColor', color)}
                    placeholder="#F97316"
                />
                <ColorSelector
                    label={t('sections.manager.config.introduction.statsColor', 'Stats Color')}
                    value={currentStatsColor}
                    onChange={(color) => handleConfigChange('statsColor', color)}
                    placeholder="#FB923C"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.introduction.ctaLabel', 'CTA Label')}
                    <Input
                        value={currentCtaLabel}
                        onChange={(e) => handleConfigChange('ctaLabel', e.target.value)}
                        placeholder="e.g., Learn More"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.introduction.ctaUrl', 'CTA URL')}
                    <Input
                        value={currentCtaUrl}
                        onChange={(e) => handleConfigChange('ctaUrl', e.target.value)}
                        placeholder="e.g., /about"
                    />
                </label>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">{t('sections.manager.config.introduction.stats', 'Statistics')}</h4>
                <div className="grid gap-4">
                    {[0, 1, 2, 3].map((index) => {
                        const stat = currentStats[index] || { value: '', label: '' };
                        return (
                            <div key={index} className="flex gap-3 items-start border p-3 rounded-md bg-gray-50">
                                <span className="text-xs font-medium text-gray-500 mt-2 w-4">{index + 1}.</span>
                                <div className="flex-1 space-y-2">
                                    <Input
                                        placeholder={t('sections.manager.config.introduction.statValue', 'Value (e.g. 30+)')}
                                        value={stat.value}
                                        onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                                        className="text-sm"
                                    />
                                    <Input
                                        placeholder={t('sections.manager.config.introduction.statLabel', 'Label')}
                                        value={stat.label}
                                        onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
