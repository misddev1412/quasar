import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { SectionType, SECTION_TYPE_LABELS } from '@shared/enums/section.enums';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { Toggle } from '../../common/Toggle';
import { Button } from '../../common/Button';
import { TextArea } from './common';
import { JsonEditor } from '../../common/JsonEditor';
import { SectionConfigEditor } from './SectionConfigEditor';
import { SectionFormState, SectionTranslationForm } from './types';
import { ActiveLanguage, AdminSection } from '../../../hooks/useSectionsManager';
import { cn } from '@admin/lib/utils';
import { HeroSliderLocaleEditor } from './editors/HeroSliderLocaleEditor';

interface SectionFormProps {
    languages: ActiveLanguage[];
    initialState: SectionFormState;
    onSubmit: (payload: SectionFormState) => Promise<void>;
    onCancel: () => void;
    submitLabel: string;
    isSubmitting: boolean;
}

export const SectionForm: React.FC<SectionFormProps> = ({ languages, initialState, onSubmit, onCancel, submitLabel, isSubmitting }) => {
    const { t } = useTranslationWithBackend();
    const navigate = useNavigate();

    const pageOptions = useMemo(() => [
        { value: 'home', label: t('sections.pages.home') },
        { value: 'news', label: t('sections.pages.news') },
        { value: 'product', label: t('sections.pages.product') },
        { value: 'product_detail', label: t('sections.pages.product_detail') },
        { value: 'news_detail', label: t('sections.pages.news_detail') },
    ], [t]);

    const sectionTypeOptions = useMemo(() => (Object.entries(SECTION_TYPE_LABELS) as Array<[SectionType, string]>).map(([value]) => ({
        value,
        label: t(`sections.types.${value}`),
    })), [t]);

    const [formState, setFormState] = useState<SectionFormState>(initialState);
    const [activeLocale, setActiveLocale] = useState<string>(() => {
        const defaultLanguage = languages.find((language) => language.isDefault);
        return defaultLanguage?.code || languages[0]?.code || 'en';
    });

    useEffect(() => {
        setFormState(initialState);
    }, [initialState]);

    const translationLocales = languages.length > 0 ? languages.map((language) => language.code) : ['en'];

    const ensureTranslation = (locale: string) => {
        if (!formState.translations[locale]) {
            setFormState((prev) => ({
                ...prev,
                translations: {
                    ...prev.translations,
                    [locale]: {
                        title: '',
                        subtitle: '',
                        description: '',
                        configOverride: '',
                    },
                },
            }));
        }
    };

    useEffect(() => {
        translationLocales.forEach(ensureTranslation);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translationLocales.join(',')]);

    const handleTranslationChange = (locale: string, field: keyof SectionTranslationForm, value: string) => {
        setFormState((prev) => ({
            ...prev,
            translations: {
                ...prev.translations,
                [locale]: {
                    ...prev.translations[locale],
                    [field]: value,
                },
            },
        }));
    };

    const parseTranslationConfig = (override?: string): { config: Record<string, unknown>; hasError: boolean } => {
        if (!override) {
            return { config: {}, hasError: false };
        }
        try {
            const parsed = JSON.parse(override);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return { config: parsed as Record<string, unknown>, hasError: false };
            }
            return { config: {}, hasError: false };
        } catch (error) {
            return { config: {}, hasError: true };
        }
    };

    const stringifyConfig = (config: Record<string, unknown>) => {
        if (!config || Object.keys(config).length === 0) {
            return '';
        }
        return JSON.stringify(config, null, 2);
    };

    const handleTranslationConfigChange = (locale: string, nextConfig: Record<string, unknown>) => {
        setFormState((prev) => {
            const existing = prev.translations[locale] || {
                title: '',
                subtitle: '',
                description: '',
                heroDescription: '',
                configOverride: '',
            };

            return {
                ...prev,
                translations: {
                    ...prev.translations,
                    [locale]: {
                        ...existing,
                        configOverride: stringifyConfig(nextConfig),
                    },
                },
            };
        });
    };

    const activeTranslationEntry = formState.translations[activeLocale];
    const { config: activeLocaleConfig, hasError: activeLocaleConfigError } = parseTranslationConfig(activeTranslationEntry?.configOverride);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await onSubmit(formState);
    };

    const activeTranslation = formState.translations[activeLocale] || {
        title: '',
        subtitle: '',
        description: '',
        heroDescription: '',
        configOverride: '',
    };

    const fieldVisibility = (formState.config?.fieldVisibility as Record<string, boolean>) || {
        title: true,
        subtitle: true,
        description: true,
        heroDescription: true,
    };

    const handleFieldVisibilityChange = (field: string, visible: boolean) => {
        setFormState((prev) => ({
            ...prev,
            config: {
                ...prev.config,
                fieldVisibility: {
                    ...(prev.config?.fieldVisibility as Record<string, boolean> || {}),
                    [field]: visible,
                },
            },
        }));
    };

    const isMultiBlockSection =
        formState.type === SectionType.NEWS
        || formState.type === SectionType.PRODUCTS_BY_CATEGORY;

    const searchParams = new URLSearchParams(window.location.search);
    const isConfigOverrideVisible = searchParams.get('showConfig') === 'true';

    const toggleConfigOverrideVisibility = () => {
        const currentParams = new URLSearchParams(window.location.search);
        const visible = currentParams.get('showConfig') === 'true';
        if (visible) {
            currentParams.delete('showConfig');
        } else {
            currentParams.set('showConfig', 'true');
        }
        navigate(`?${currentParams.toString()}`);
    };

    const translationFields = (
        <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
            <label className="flex flex-col gap-1 text-sm text-gray-600">
                {t('sections.manager.form.title')}
                <Input
                    value={activeTranslation.title || ''}
                    onChange={(e) => handleTranslationChange(activeLocale, 'title', e.target.value)}
                    className="text-sm"
                    inputSize="md"
                />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-600">
                {t('sections.manager.form.subtitle')}
                <Input
                    value={activeTranslation.subtitle || ''}
                    onChange={(e) => handleTranslationChange(activeLocale, 'subtitle', e.target.value)}
                    className="text-sm"
                    inputSize="md"
                />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-600">
                {t('sections.manager.form.description')}
                <TextArea
                    rows={4}
                    value={activeTranslation.description || ''}
                    onChange={(e) => handleTranslationChange(activeLocale, 'description', e.target.value)}
                />
            </label>
            {formState.type === SectionType.HERO_SLIDER && (
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.form.heroDescription')}
                    <TextArea
                        rows={4}
                        value={activeTranslation.heroDescription || ''}
                        onChange={(e) => handleTranslationChange(activeLocale, 'heroDescription', e.target.value)}
                        placeholder={t('sections.manager.form.heroDescriptionPlaceholder')}
                    />
                </label>
            )}
            <label className="flex flex-col gap-1 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                    <span>{t('sections.manager.form.configOverride')}</span>
                    <Button variant="ghost" size="sm" type="button" onClick={toggleConfigOverrideVisibility}>
                        {isConfigOverrideVisible
                            ? t('sections.manager.form.hideConfig', 'Hide Config')
                            : t('sections.manager.form.showConfig', 'Show Config')}
                    </Button>
                </div>
                {isConfigOverrideVisible && (
                    <JsonEditor
                        value={activeTranslation.configOverride || ''}
                        onChange={(value) => handleTranslationChange(activeLocale, 'configOverride', value)}
                        height="300px"
                        placeholder={t('sections.manager.form.configOverridePlaceholder')}
                    />
                )}
                {!isConfigOverrideVisible && activeTranslation.configOverride && (
                    <p className="text-xs text-gray-500 italic">
                        {t('sections.manager.form.configHidden', 'Configuration is set. Click "Show Config" to edit.')}
                    </p>
                )}
            </label>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label={t('sections.manager.form.page')}
                    value={formState.page}
                    onChange={(value) => setFormState((prev) => ({ ...prev, page: value }))}
                    options={[...pageOptions, { value: formState.page, label: formState.page.toUpperCase() }].filter(
                        (option, index, arr) => arr.findIndex((opt) => opt.value === option.value) === index,
                    )}
                    required
                />
                <Select
                    label={t('sections.manager.form.sectionType')}
                    value={formState.type}
                    onChange={(value) => setFormState((prev) => ({ ...prev, type: value as SectionType }))}
                    options={sectionTypeOptions}
                    required
                />
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-700">{t('sections.manager.form.position')}</span>
                    <Input
                        type="number"
                        min={0}
                        value={formState.position ?? ''}
                        onChange={(e) => setFormState((prev) => ({ ...prev, position: e.target.value ? Number(e.target.value) : undefined }))}
                        placeholder={t('sections.manager.form.autoAssign')}
                        className="text-sm w-24"
                        inputSize="md"
                    />
                </label>
                <div className="flex flex-col justify-end">
                    <Toggle
                        checked={formState.isEnabled}
                        onChange={(checked) => setFormState((prev) => ({ ...prev, isEnabled: checked }))}
                        label={t('sections.manager.form.sectionEnabled')}
                        description={t('sections.manager.form.sectionEnabledDescription')}
                    />
                </div>
            </div>

            <SectionConfigEditor
                type={formState.type}
                value={formState.config || {}}
                onChange={(config) => setFormState((prev) => ({ ...prev, config }))}
            />

            {!isMultiBlockSection && (
                <div className="space-y-3 border rounded-lg p-4 bg-white">
                    <h4 className="text-sm font-semibold text-gray-700">{t('sections.manager.form.fieldVisibility', 'Field Visibility')}</h4>
                    <p className="text-xs text-gray-500">{t('sections.manager.form.fieldVisibilityDescription', 'Control which fields are visible in the translation section')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Toggle
                            checked={fieldVisibility.title ?? true}
                            onChange={(checked) => handleFieldVisibilityChange('title', checked)}
                            label={t('sections.manager.form.showTitle', 'Show Title')}
                            description={t('sections.manager.form.showTitleDescription', 'Display title field in translations')}
                        />
                        <Toggle
                            checked={fieldVisibility.subtitle ?? true}
                            onChange={(checked) => handleFieldVisibilityChange('subtitle', checked)}
                            label={t('sections.manager.form.showSubtitle', 'Show Subtitle')}
                            description={t('sections.manager.form.showSubtitleDescription', 'Display subtitle field in translations')}
                        />
                        <Toggle
                            checked={fieldVisibility.description ?? true}
                            onChange={(checked) => handleFieldVisibilityChange('description', checked)}
                            label={t('sections.manager.form.showDescription', 'Show Description')}
                            description={t('sections.manager.form.showDescriptionDescription', 'Display description field in translations')}
                        />
                        {formState.type === SectionType.HERO_SLIDER && (
                            <Toggle
                                checked={fieldVisibility.heroDescription ?? true}
                                onChange={(checked) => handleFieldVisibilityChange('heroDescription', checked)}
                                label={t('sections.manager.form.showHeroDescription', 'Show Hero Description')}
                                description={t('sections.manager.form.showHeroDescriptionDescription', 'Display hero description field in translations')}
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">{t('sections.manager.form.translations')}</h4>
                    <div className="flex items-center gap-2">
                        {translationLocales.map((locale) => (
                            <button
                                key={locale}
                                type="button"
                                onClick={() => setActiveLocale(locale)}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                                    activeLocale === locale
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100',
                                )}
                            >
                                {locale.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {translationFields}

                {formState.type === SectionType.HERO_SLIDER && (
                    <HeroSliderLocaleEditor
                        locale={activeLocale}
                        config={activeLocaleConfig}
                        onConfigChange={(nextConfig) => handleTranslationConfigChange(activeLocale, nextConfig)}
                        hasParseError={activeLocaleConfigError}
                    />
                )}
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={onCancel} type="button">{t('sections.manager.form.cancel')}</Button>
                <Button type="submit" isLoading={isSubmitting}>{submitLabel}</Button>
            </div>
        </form>
    );
};

export const safeParseJson = (value: string) => {
    if (!value) return undefined;
    try {
        return JSON.parse(value);
    } catch (error) {
        return undefined;
    }
};

const sanitizeSectionConfig = (type: SectionType, config?: Record<string, unknown>) => {
    if (!config || typeof config !== 'object') {
        return {};
    }
    if (type !== SectionType.PRODUCTS_BY_CATEGORY) {
        return config;
    }
    const sanitized = { ...config };
    delete sanitized.sidebar;
    delete sanitized.sidebarEnabled;
    return sanitized;
};

export const buildSectionPayload = (state: SectionFormState) => ({
    page: state.page,
    type: state.type,
    isEnabled: state.isEnabled,
    position: state.position,
    config: sanitizeSectionConfig(state.type, state.config),
    translations: Object.entries(state.translations).map(([locale, translation]) => ({
        locale,
        title: translation.title || undefined,
        subtitle: translation.subtitle || undefined,
        description: translation.description || undefined,
        heroDescription: translation.heroDescription || undefined,
        configOverride: translation.configOverride ? safeParseJson(translation.configOverride) : undefined,
    })),
});

export const sectionToFormState = (section: AdminSection): SectionFormState => ({
    page: section.page,
    type: section.type,
    isEnabled: section.isEnabled,
    position: section.position,
    config: sanitizeSectionConfig(section.type, section.config || {}),
    translations: section.translations.reduce<Record<string, SectionTranslationForm>>((acc, translation) => {
        acc[translation.locale] = {
            title: translation.title || '',
            subtitle: translation.subtitle || '',
            description: translation.description || '',
            heroDescription: translation.heroDescription || '',
            configOverride: translation.configOverride ? JSON.stringify(translation.configOverride, null, 2) : '',
        };
        return acc;
    }, {}),
});
