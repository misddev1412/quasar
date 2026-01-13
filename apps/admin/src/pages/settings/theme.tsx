import React, { useState, useEffect } from 'react';
import { withAdminSeo } from '../../components/SEO/withAdminSeo';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { FiSettings, FiHome, FiLayout, FiSave } from 'react-icons/fi';
import GlobalThemeSettings from '../../components/settings/GlobalThemeSettings';
import { Button } from '../../components/common/Button';
import { defaultThemeConfig, ThemeConfig } from '../../config/theme.config';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../contexts/ToastContext';

const ThemeSettingsPage: React.FC = () => {
    const { t } = useTranslationWithBackend();
    const { addToast } = useToast();

    // Storefront Theme State
    const [storefrontTheme, setStorefrontTheme] = useState<ThemeConfig>(defaultThemeConfig);
    const [storefrontMode, setStorefrontMode] = useState<'light' | 'dark'>('light');
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Storefront Settings
    const { data: storefrontSettings } = trpc.adminSettings.list.useQuery({
        group: 'storefront_appearance',
        limit: 100
    });

    const bulkUpdateMutation = trpc.adminSettings.bulkUpdate.useMutation();

    useEffect(() => {
        if (storefrontSettings && (storefrontSettings as any).data) { // Check if data wrapper exists
            const responseData = (storefrontSettings as any).data;
            // Handle both old structure (data.data) and new structure (data.items)
            const backendSettings = (responseData.items || responseData.data || []) as { key: string, value: any }[];

            const newTheme = { ...defaultThemeConfig };
            let mode: 'light' | 'dark' = 'light';

            // Helper to safe update nested colors
            const updateColor = (key: keyof ThemeConfig['colors'], value: string) => {
                newTheme.colors = { ...newTheme.colors, [key]: value };
            };

            if (Array.isArray(backendSettings)) {
                backendSettings.forEach(setting => {
                    if (setting.key === 'storefront.theme.font_family') newTheme.fontFamily = setting.value as string;
                    if (setting.key === 'storefront.theme.border_radius') newTheme.borderRadius = setting.value as any;
                    if (setting.key === 'storefront.theme.mode') mode = setting.value as 'light' | 'dark';

                    // Colors
                    if (setting.key === 'storefront.theme.primary_color') updateColor('primary', setting.value);
                    if (setting.key === 'storefront.theme.secondary_color') updateColor('secondary', setting.value);
                    if (setting.key === 'storefront.theme.primary_hover') updateColor('primaryHover', setting.value);
                    if (setting.key === 'storefront.theme.primary_light') updateColor('primaryLight', setting.value);
                    if (setting.key === 'storefront.theme.primary_dark') updateColor('primaryDark', setting.value);
                    if (setting.key === 'storefront.theme.secondary_hover') updateColor('secondaryHover', setting.value);
                    if (setting.key === 'storefront.theme.secondary_light') updateColor('secondaryLight', setting.value);
                    if (setting.key === 'storefront.theme.secondary_dark') updateColor('secondaryDark', setting.value);
                });
                setStorefrontTheme(newTheme);
                setStorefrontMode(mode);
            }
        }
    }, [storefrontSettings]);

    const handleStorefrontThemeChange = (newTheme: Partial<ThemeConfig>) => {
        setStorefrontTheme(prev => ({
            ...prev,
            ...newTheme,
            colors: {
                ...prev.colors,
                ...(newTheme.colors || {})
            }
        }));
    };

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            // Save Storefront Theme
            const updates: { key: string; value: string; group?: string; isPublic?: boolean }[] = [];
            if (storefrontTheme.fontFamily) updates.push({ key: 'storefront.theme.font_family', value: storefrontTheme.fontFamily, group: 'storefront_appearance', isPublic: true });
            if (storefrontTheme.borderRadius) updates.push({ key: 'storefront.theme.border_radius', value: storefrontTheme.borderRadius, group: 'storefront_appearance', isPublic: true });
            updates.push({ key: 'storefront.theme.mode', value: storefrontMode, group: 'storefront_appearance', isPublic: true });

            // Colors
            if (storefrontTheme.colors?.primary) updates.push({ key: 'storefront.theme.primary_color', value: storefrontTheme.colors.primary, group: 'storefront_appearance', isPublic: true });
            if (storefrontTheme.colors?.secondary) updates.push({ key: 'storefront.theme.secondary_color', value: storefrontTheme.colors.secondary, group: 'storefront_appearance', isPublic: true });
            if (storefrontTheme.colors?.primaryHover) updates.push({ key: 'storefront.theme.primary_hover', value: storefrontTheme.colors.primaryHover, group: 'storefront_appearance', isPublic: true });
            if (storefrontTheme.colors?.primaryLight) updates.push({ key: 'storefront.theme.primary_light', value: storefrontTheme.colors.primaryLight, group: 'storefront_appearance', isPublic: true });
            if (storefrontTheme.colors?.primaryDark) updates.push({ key: 'storefront.theme.primary_dark', value: storefrontTheme.colors.primaryDark, group: 'storefront_appearance', isPublic: true });
            if (storefrontTheme.colors?.secondaryHover) updates.push({ key: 'storefront.theme.secondary_hover', value: storefrontTheme.colors.secondaryHover, group: 'storefront_appearance', isPublic: true });
            if (storefrontTheme.colors?.secondaryLight) updates.push({ key: 'storefront.theme.secondary_light', value: storefrontTheme.colors.secondaryLight, group: 'storefront_appearance', isPublic: true });
            if (storefrontTheme.colors?.secondaryDark) updates.push({ key: 'storefront.theme.secondary_dark', value: storefrontTheme.colors.secondaryDark, group: 'storefront_appearance', isPublic: true });

            if (updates.length > 0) {
                await bulkUpdateMutation.mutateAsync({ settings: updates });
            }

            addToast({
                type: 'success',
                title: t('common.saved_successfully', 'Saved successfully'),
                description: t('settings.theme.toast.saved', 'Storefront theme has been updated.'),
            });
        } catch (error) {
            console.error(error);
            addToast({
                type: 'error',
                title: t('common.save_failed', 'Save failed'),
                description: t('settings.theme.toast.save_error', 'We could not update the storefront theme. Please try again.'),
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <BaseLayout
            title={t('navigation.theme_settings', 'Storefront Theme')}
            description={t('settings.theme_desc', 'Customize the look and feel of your storefront.')}
            breadcrumbs={[
                { label: t('navigation.home', 'Home'), href: '/', icon: <FiHome className="h-4 w-4" /> },
                { label: t('admin.system_settings', 'Settings'), href: '/settings', icon: <FiSettings className="h-4 w-4" /> },
                { label: t('navigation.theme_settings', 'Storefront Theme'), icon: <FiLayout className="h-4 w-4" /> }
            ]}
            actions={[
                {
                    label: isSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes'),
                    onClick: handleSave,
                    primary: true,
                    icon: <FiSave />,
                    disabled: isSaving
                }
            ]}
        >
            <div className="space-y-6">

                {/* Content */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 space-y-6">

                            <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {t('settings.theme.storefront_configuration', 'Storefront Appearance')}
                                </h3>
                            </div>
                            <GlobalThemeSettings
                                theme={storefrontTheme}
                                onThemeChange={handleStorefrontThemeChange}
                                currentMode={storefrontMode}
                                onModeChange={setStorefrontMode}
                            />

                        </div>
                    </div>

                    {/* Sidebar / Tips */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                                {t('settings.theme.tips_title', 'Design Tips')}
                            </h3>
                            <div className="space-y-4">
                                <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                                        {t('settings.theme.brand_consistency', 'Brand Consistency')}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('settings.theme.brand_consistency_desc', 'Consistent colors build trust.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};

export default withAdminSeo(ThemeSettingsPage, {
    title: 'Storefront Theme Settings | Quasar Admin',
    description: 'Manage storefront theme.',
    path: '/settings/theme',
});
