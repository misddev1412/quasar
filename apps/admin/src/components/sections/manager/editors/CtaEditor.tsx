import React, { useState } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Select } from '../../../common/Select';
import { MeasurementPresetInput } from '../../../common/MeasurementPresetInput';
import { Input } from '../../../common/Input';
import { MediaManager } from '../../../common/MediaManager';
import { ImageActionButtons } from '../../../common/ImageActionButtons';
import { ConfigChangeHandler } from '../types';

interface CtaEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

export const CtaEditor: React.FC<CtaEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);

    const handleLayoutChange = (layout: 'full-width' | 'container') => {
        onChange({
            ...(value ?? {}),
            layout,
        });
    };

    const handleStyleChange = (style: 'center' | 'left' | 'right') => {
        onChange({
            ...(value ?? {}),
            style,
        });
    };

    const handleBackgroundChange = (background: 'primary' | 'secondary' | 'dark' | 'gradient') => {
        onChange({
            ...(value ?? {}),
            background,
        });
    };

    const handleBorderRadiusChange = (radius: string) => {
        const next = { ...(value ?? {}) };
        const trimmed = radius.trim();
        if (trimmed) {
            next.borderRadius = trimmed;
        } else {
            delete next.borderRadius;
        }
        onChange(next);
    };

    const currentLayout = (value?.layout as string) || 'full-width';
    const currentStyle = (value?.style as string) || 'center';
    const currentBackground = (value?.background as string) || 'primary';
    const currentBorderRadius = (value?.borderRadius as string) || '';
    const currentBackgroundImage = (value?.backgroundImage as string) || '';

    const updateBackgroundImage = (url?: string) => {
        const next = { ...(value ?? {}) };
        if (url && url.trim()) {
            next.backgroundImage = url.trim();
        } else {
            delete next.backgroundImage;
        }
        onChange(next);
    };

    const handleMediaSelect = (selection: any) => {
        const selected = Array.isArray(selection) ? selection[0] : selection;
        if (selected?.url) {
            updateBackgroundImage(selected.url);
        }
        setIsMediaManagerOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.cta.layoutMode')}
                    <Select
                        value={currentLayout}
                        onChange={(layout) => handleLayoutChange(layout as 'full-width' | 'container')}
                        options={[
                            { value: 'full-width', label: t('sections.manager.config.cta.fullWidth') },
                            { value: 'container', label: t('sections.manager.config.cta.container') },
                        ]}
                        className="text-sm"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.cta.layoutDescription')}</span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.cta.textAlign')}
                    <Select
                        value={currentStyle}
                        onChange={(style) => handleStyleChange(style as 'center' | 'left' | 'right')}
                        options={[
                            { value: 'center', label: t('sections.manager.config.cta.centerAligned') },
                            { value: 'left', label: t('sections.manager.config.cta.leftAligned') },
                            { value: 'right', label: t('sections.manager.config.cta.rightAligned') },
                        ]}
                        className="text-sm"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.cta.backgroundStyle')}
                    <Select
                        value={currentBackground}
                        onChange={(background) => handleBackgroundChange(background as 'primary' | 'secondary' | 'dark' | 'gradient')}
                        options={[
                            { value: 'primary', label: t('sections.manager.config.cta.primaryColor') },
                            { value: 'secondary', label: t('sections.manager.config.cta.secondaryColor') },
                            { value: 'dark', label: t('sections.manager.config.cta.darkBackground') },
                            { value: 'gradient', label: t('sections.manager.config.cta.gradientBackground') },
                        ]}
                        className="text-sm"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.cta.borderRadius')}
                    <MeasurementPresetInput
                        value={currentBorderRadius}
                        onChange={(val) => handleBorderRadiusChange(val)}
                        presets={{
                            small: '8px',
                            medium: '16px',
                            large: '32px',
                        }}
                        labels={{
                            default: t('sections.manager.config.cta.borderRadiusDefault', 'Giữ mặc định'),
                            small: t('sections.manager.config.cta.borderRadiusSmall', 'Nhỏ'),
                            medium: t('sections.manager.config.cta.borderRadiusMedium', 'Vừa'),
                            large: t('sections.manager.config.cta.borderRadiusLarge', 'Lớn'),
                            custom: t('sections.manager.config.cta.borderRadiusCustom', 'Tùy chỉnh'),
                        }}
                        selectPlaceholder={t('sections.manager.config.cta.borderRadiusSelect', 'Chọn độ bo góc')}
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.cta.borderRadiusDescription')}</span>
                </label>
            </div>

            <div className="space-y-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.cta.backgroundImage')}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:w-full">
                        <div className="space-y-2 flex-1">
                            <Input
                                value={currentBackgroundImage}
                                placeholder={t('sections.manager.config.cta.backgroundImagePlaceholder')}
                                onChange={(e) => updateBackgroundImage(e.target.value)}
                                className="text-sm"
                            />
                            <span className="text-xs text-gray-500">
                                {t('sections.manager.config.cta.backgroundImageDescription')}
                            </span>
                        </div>
                        <ImageActionButtons
                            className="sm:w-auto sm:min-w-[220px] lg:min-w-[260px]"
                            hasImage={Boolean(currentBackgroundImage)}
                            selectLabel={t('sections.manager.config.cta.selectImage')}
                            changeLabel={t('sections.manager.config.cta.changeImage')}
                            removeLabel={t('sections.manager.config.cta.removeImage')}
                            onSelect={() => setIsMediaManagerOpen(true)}
                            onRemove={() => updateBackgroundImage('')}
                        />
                    </div>
                </label>

                {currentBackgroundImage && (
                    <div className="h-32 w-full overflow-hidden rounded-lg border border-dashed border-gray-200 bg-gray-50">
                        <img
                            src={currentBackgroundImage}
                            alt={t('sections.manager.config.cta.backgroundImageAlt')}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-500">
                {t('sections.manager.config.cta.contentDescription')}
            </p>

            <MediaManager
                isOpen={isMediaManagerOpen}
                onClose={() => setIsMediaManagerOpen(false)}
                onSelect={handleMediaSelect}
                accept="image/*"
                title={t('sections.manager.config.cta.backgroundImageModalTitle')}
            />
        </div>
    );
};
