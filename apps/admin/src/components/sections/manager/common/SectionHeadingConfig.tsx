import React from 'react';
import { ColorSelector } from '@admin/components/common/ColorSelector';
import { Select } from '@admin/components/common/Select';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';

export type SectionHeadingStyle = 'default' | 'banner' | 'curved';
export type SectionHeadingTextTransform = 'none' | 'uppercase' | 'capitalize' | 'lowercase';
export type SectionHeadingTitleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SectionHeadingConfigData {
    headingStyle?: SectionHeadingStyle;
    headingBackgroundColor?: string;
    headingTextColor?: string;
    headingBackgroundImage?: string;
    headingTextTransform?: SectionHeadingTextTransform;
    headingTitleSize?: SectionHeadingTitleSize;
    headingBarHeight?: number;
    headingBorderRadius?: number;
    headingPaddingY?: number;
}

interface SectionHeadingConfigProps {
    data: SectionHeadingConfigData;
    onChange: (data: SectionHeadingConfigData) => void;
}

export const SectionHeadingConfig: React.FC<SectionHeadingConfigProps> = ({ data, onChange }) => {
    const { t } = useTranslationWithBackend();
    const sizePresets: Array<{ value: string; label: string; size: SectionHeadingTitleSize; barHeight: number }> = [
        { value: 'mini', label: t('sections.manager.headingConfig.sizePresets.mini', 'Mini (XS / 40px)'), size: 'xs', barHeight: 40 },
        { value: 'compact', label: t('sections.manager.headingConfig.sizePresets.compact', 'Compact (SM / 48px)'), size: 'sm', barHeight: 48 },
        { value: 'standard', label: t('sections.manager.headingConfig.sizePresets.standard', 'Standard (MD / 56px)'), size: 'md', barHeight: 56 },
        { value: 'spacious', label: t('sections.manager.headingConfig.sizePresets.spacious', 'Spacious (LG / 72px)'), size: 'lg', barHeight: 72 },
        { value: 'hero', label: t('sections.manager.headingConfig.sizePresets.hero', 'Hero (XL / 88px)'), size: 'xl', barHeight: 88 },
    ];

    const handleStyleChange = (style: SectionHeadingStyle) => {
        onChange({ ...data, headingStyle: style });
    };

    const handleBackgroundColorChange = (color: string) => {
        onChange({ ...data, headingBackgroundColor: color });
    };

    const handleTextColorChange = (color: string) => {
        onChange({ ...data, headingTextColor: color });
    };

    const handleTextTransformChange = (value: string) => {
        onChange({ ...data, headingTextTransform: value ? (value as SectionHeadingTextTransform) : undefined });
    };

    const resolveSizePreset = () => {
        if (data.headingTitleSize && typeof data.headingBarHeight === 'number') {
            const exact = sizePresets.find(
                (preset) => preset.size === data.headingTitleSize && preset.barHeight === data.headingBarHeight
            );
            if (exact) return exact.value;
        }
        if (data.headingTitleSize) {
            const bySize = sizePresets.find((preset) => preset.size === data.headingTitleSize);
            if (bySize) return bySize.value;
        }
        return 'standard';
    };

    const handleSizePresetChange = (value: string) => {
        const preset = sizePresets.find((item) => item.value === value) || sizePresets[1];
        onChange({
            ...data,
            headingTitleSize: preset.size,
            headingBarHeight: preset.barHeight,
        });
    };

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
            <label className="flex flex-col gap-1 text-sm text-gray-600">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('sections.manager.headingConfig.headingStyle', 'Heading Style')}
                </span>
                <Select
                    value={data.headingStyle || 'default'}
                    onChange={(val) => handleStyleChange((val as SectionHeadingStyle) || 'default')}
                    options={[
                        { value: 'default', label: t('sections.manager.headingConfig.headingStyleDefault', 'Default') },
                        { value: 'banner', label: t('sections.manager.headingConfig.headingStyleBanner', 'Color Bar') },
                        { value: 'curved', label: t('sections.manager.headingConfig.headingStyleCurved', 'Curved') },
                    ]}
                    className="text-sm"
                />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t('sections.manager.headingConfig.titleCase', 'Title Case')}
                    </span>
                    <Select
                        value={data.headingTextTransform || ''}
                        onChange={handleTextTransformChange}
                        options={[
                            { value: 'none', label: t('sections.manager.headingConfig.titleCaseOptions.normal', 'Normal') },
                            { value: 'uppercase', label: t('sections.manager.headingConfig.titleCaseOptions.uppercase', 'Uppercase') },
                            { value: 'capitalize', label: t('sections.manager.headingConfig.titleCaseOptions.capitalize', 'Capitalize') },
                            { value: 'lowercase', label: t('sections.manager.headingConfig.titleCaseOptions.lowercase', 'Lowercase') },
                        ]}
                        placeholder={t('sections.manager.headingConfig.defaultPlaceholder', 'Default')}
                        className="text-sm"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t('sections.manager.headingConfig.titleSize', 'Title Size & Bar Height')}
                    </span>
                    <Select
                        value={resolveSizePreset()}
                        onChange={handleSizePresetChange}
                        options={sizePresets.map(({ value, label }) => ({ value, label }))}
                        className="text-sm"
                    />
                </label>
            </div>

            {data.headingStyle === 'banner' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <ColorSelector
                            value={data.headingBackgroundColor || ''}
                            onChange={handleBackgroundColorChange}
                            placeholder="#ffffff"
                            label={t('sections.manager.headingConfig.headingBackground', 'Heading Background')}
                            className="w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <ColorSelector
                            value={data.headingTextColor || ''}
                            onChange={handleTextColorChange}
                            placeholder="#111827"
                            label={t('sections.manager.headingConfig.headingText', 'Heading Text')}
                            className="w-full"
                        />
                    </div>
                </div>
            )}

            {(data.headingStyle === 'banner' || data.headingStyle === 'curved') && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {t('sections.manager.headingConfig.borderRadius', 'Border Radius')}
                        </span>
                        <Select
                            value={String(data.headingBorderRadius ?? '')}
                            onChange={(val) => onChange({ ...data, headingBorderRadius: val ? Number(val) : undefined })}
                            options={[
                                { value: '', label: t('sections.manager.headingConfig.default', 'Default') },
                                { value: '0', label: '0px' },
                                { value: '4', label: '4px' },
                                { value: '8', label: '8px' },
                                { value: '12', label: '12px' },
                                { value: '16', label: '16px' },
                                { value: '20', label: '20px' },
                                { value: '24', label: '24px' },
                                { value: '32', label: '32px' },
                                { value: '9999', label: 'Full' },
                            ]}
                            className="text-sm"
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {t('sections.manager.headingConfig.paddingY', 'Padding Y (px)')}
                        </span>
                        <Select
                            value={String(data.headingPaddingY ?? '')}
                            onChange={(val) => onChange({ ...data, headingPaddingY: val ? Number(val) : undefined })}
                            options={[
                                { value: '', label: t('sections.manager.headingConfig.default', 'Default') },
                                { value: '0', label: '0px' },
                                { value: '4', label: '4px' },
                                { value: '8', label: '8px' },
                                { value: '12', label: '12px' },
                                { value: '16', label: '16px' },
                                { value: '20', label: '20px' },
                                { value: '24', label: '24px' },
                                { value: '28', label: '28px' },
                                { value: '32', label: '32px' },
                                { value: '40', label: '40px' },
                                { value: '48', label: '48px' },
                            ]}
                            className="text-sm"
                        />
                    </label>
                </div>
            )}
        </div>
    );
};
