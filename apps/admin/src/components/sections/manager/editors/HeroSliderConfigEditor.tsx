import React from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Select } from '../../../common/Select';
import { Toggle } from '../../../common/Toggle';
import { ConfigChangeHandler } from '../types';
import { ensureNumber } from '../utils';

interface HeroSliderConfigEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

export const HeroSliderConfigEditor: React.FC<HeroSliderConfigEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();

    const handleValueChange = (path: string, newValue: unknown) => {
        // Simple top-level update for now as expected by current usage
        onChange({
            ...(value ?? {}),
            [path]: newValue,
        });
    };

    const handleLayoutChange = (layout: 'full-width' | 'container') => {
        onChange({
            ...(value ?? {}),
            layout,
        });
    };

    const handleOverlayToggle = (checked: boolean) => {
        const existingOverlay = ((value?.overlay as Record<string, unknown>) || {}) as Record<string, unknown>;
        const existingOpacity = typeof existingOverlay.opacity === 'number'
            ? existingOverlay.opacity
            : typeof existingOverlay.opacityPercent === 'number'
                ? existingOverlay.opacityPercent
                : 60;
        const nextOverlay = checked
            ? {
                ...existingOverlay,
                enabled: true,
                color: (existingOverlay.color as string) || '#00000080',
                opacity: existingOpacity,
                opacityPercent: existingOpacity,
            }
            : {
                ...existingOverlay,
                enabled: false,
            };

        onChange({
            ...(value ?? {}),
            overlay: nextOverlay,
        });
    };

    const handleOverlayColorChange = (colorValue: string) => {
        const existingOverlay = ((value?.overlay as Record<string, unknown>) || {}) as Record<string, unknown>;
        onChange({
            ...(value ?? {}),
            overlay: {
                ...existingOverlay,
                color: colorValue,
            },
        });
    };

    const handleOverlayOpacityChange = (nextValue: number) => {
        const clamped = Math.max(0, Math.min(100, Number.isFinite(nextValue) ? nextValue : 0));
        const existingOverlay = ((value?.overlay as Record<string, unknown>) || {}) as Record<string, unknown>;
        onChange({
            ...(value ?? {}),
            overlay: {
                ...existingOverlay,
                opacity: clamped,
                opacityPercent: clamped,
            },
        });
    };

    const overlayConfig = (value?.overlay as { enabled?: boolean; color?: string; opacity?: number; opacityPercent?: number }) || {};
    const overlayEnabled = Boolean(overlayConfig.enabled);
    const overlayColor = typeof overlayConfig.color === 'string' && overlayConfig.color.trim() !== ''
        ? overlayConfig.color
        : '#00000080';
    const overlayOpacity = typeof (overlayConfig as { opacity?: number; opacityPercent?: number }).opacity === 'number'
        ? (overlayConfig as { opacity?: number; opacityPercent?: number }).opacity
        : typeof (overlayConfig as { opacity?: number; opacityPercent?: number }).opacityPercent === 'number'
            ? (overlayConfig as { opacity?: number; opacityPercent?: number }).opacityPercent
            : 60;
    const overlayColorPickerValue = /^#([0-9a-fA-F]{6})$/.test(overlayColor)
        ? overlayColor
        : overlayColor.startsWith('#') && overlayColor.length >= 7
            ? overlayColor.slice(0, 7)
            : '#000000';
    const currentLayout = value?.layout === 'full-width' ? 'full-width' : 'container';
    const buttonVisibility = (value?.buttonVisibility as { primary?: boolean; secondary?: boolean }) || {};
    const handleButtonVisibilityChange = (field: 'primary' | 'secondary', visible: boolean) => {
        const existing = (value?.buttonVisibility as Record<string, boolean>) || {};
        onChange({
            ...(value ?? {}),
            buttonVisibility: {
                ...existing,
                [field]: visible,
            },
        });
    };

    return (
        <div className="space-y-4">
            <p className="text-xs text-gray-500">
                Slides are configured per language in the translation panel. Use this section to manage shared behaviour like autoplay and overlays.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.heroSlider.autoplayInterval')}
                    <Input
                        type="number"
                        min={1000}
                        value={ensureNumber(value?.interval, 5000)}
                        onChange={(e) => handleValueChange('interval', Number(e.target.value))}
                        className="text-sm"
                        inputSize="md"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.heroSlider.layoutType')}
                    <Select
                        value={currentLayout}
                        onChange={(layout) => handleLayoutChange(layout as 'full-width' | 'container')}
                        options={[
                            { value: 'full-width', label: t('sections.manager.heroSlider.fullWidth') },
                            { value: 'container', label: t('sections.manager.heroSlider.container') },
                        ]}
                        className="text-sm"
                    />
                    <span className="text-xs text-gray-500">
                        {currentLayout === 'full-width'
                            ? t('sections.manager.heroSlider.fullWidthDescription')
                            : t('sections.manager.heroSlider.containerDescription')}
                    </span>
                </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                    type="checkbox"
                    checked={Boolean(value?.autoplay ?? true)}
                    onChange={(e) => handleValueChange('autoplay', e.target.checked)}
                />
                {t('sections.manager.heroSlider.autoplayEnabled')}
            </label>
            <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={overlayEnabled}
                        onChange={(e) => handleOverlayToggle(e.target.checked)}
                    />
                    {t('sections.manager.heroSlider.enableOverlay')}
                </label>
                {overlayEnabled && (
                    <div className="space-y-2">
                        <label className="flex flex-col gap-1 text-sm text-gray-600">
                            {t('sections.manager.heroSlider.overlayColor')}
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                <Input
                                    type="color"
                                    value={overlayColorPickerValue}
                                    onChange={(e) => handleOverlayColorChange(e.target.value)}
                                    className="w-16 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={overlayColor}
                                    onChange={(e) => handleOverlayColorChange(e.target.value)}
                                    placeholder="#00000080 or rgba(0,0,0,0.6)"
                                    className="text-sm"
                                    inputSize="md"
                                />
                            </div>
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-gray-600">
                            {t('sections.manager.heroSlider.overlayOpacity')}
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={overlayOpacity}
                                    onChange={(e) => handleOverlayOpacityChange(Number(e.target.value))}
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={overlayOpacity}
                                    onChange={(e) => handleOverlayOpacityChange(Number(e.target.value))}
                                    className="w-20 text-sm"
                                />
                            </div>
                            <span className="text-xs text-gray-500">{t('sections.manager.heroSlider.overlayOpacityHelp')}</span>
                        </label>
                        <p className="text-xs text-gray-500">{t('sections.manager.heroSlider.overlayColorHelp')}</p>
                    </div>
                )}
            </div>
            <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                <div>
                    <h5 className="text-sm font-semibold text-gray-700">{t('sections.manager.heroSlider.buttonVisibility')}</h5>
                    <p className="text-xs text-gray-500">{t('sections.manager.heroSlider.buttonVisibilityDescription')}</p>
                </div>
                <Toggle
                    checked={buttonVisibility.primary !== false}
                    onChange={(checked) => handleButtonVisibilityChange('primary', checked)}
                    label={t('sections.manager.heroSlider.primaryButton')}
                    description={t('sections.manager.heroSlider.primaryButtonDescription')}
                />
                <Toggle
                    checked={buttonVisibility.secondary !== false}
                    onChange={(checked) => handleButtonVisibilityChange('secondary', checked)}
                    label={t('sections.manager.heroSlider.secondaryButton')}
                    description={t('sections.manager.heroSlider.secondaryButtonDescription')}
                />
            </div>
        </div>
    );
};
