'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../utils/trpc';
import { SupportedLocale } from '@shared';
import i18nInstance, { getCurrentLocale } from '../i18n';

// Use same types as frontend/schema or define locally if needed
// Assuming SupportedLocale is 'vi' | 'en' from @shared
export type Locale = SupportedLocale;

const FALLBACK_LOCALE: Locale = 'vi';
const STORAGE_KEY = 'admin-locale';
const USER_LOCALE_KEY = 'admin-locale-source';
const USER_LOCALE_VALUE = 'user';

interface I18nContextType {
    currentLocale: Locale;
    supportedLocales: readonly Locale[];
    defaultLocale: Locale;
    changeLocale: (locale: Locale) => void;
    isLoading: boolean;
    error: string | null;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
    children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
    const { i18n } = useTranslation();

    // Initialize with saved locale or browser preference
    // Note: i18next-browser-languagedetector might have already run in i18n/index.ts
    // but we want to ensure we respect the DB default if no local preference exists.
    const getInitialLocale = (): Locale => {
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem(STORAGE_KEY) as Locale;
            if (savedLocale && ['en', 'vi'].includes(savedLocale)) {
                return savedLocale;
            }
            // Rely on config default if no saved locale
        }
        return FALLBACK_LOCALE;
    };

    const [currentLocale, setCurrentLocale] = useState<Locale>(getInitialLocale());
    const [supportedLocales, setSupportedLocales] = useState<readonly Locale[]>(['en', 'vi']);
    const [defaultLocale, setDefaultLocale] = useState<Locale>(FALLBACK_LOCALE);
    // const [isLoading, setIsLoading] = useState(true); // This will be replaced by isLoading from useQuery
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (i18n.language !== currentLocale) {
            i18n.changeLanguage(currentLocale);
        }
    }, [i18n, currentLocale]);

    // Get locale configuration from API
    // Using translation.getLocaleConfig which seems to be available based on frontend analysis
    // If admin has a different router, we might need to adjust.
    // The user prompt said: "load ngôn ngữ mặc định dựa theo config từ api giống như storefront"
    // Fetch locale config from backend
    console.log('[I18nContext] Calling useQuery for getLocaleConfig');
    const { data: localeConfigData, error: localeConfigError, isLoading, isError } = trpc.translation.getLocaleConfig.useQuery(
        undefined,
        {
            retry: 1,
            staleTime: 1000 * 60 * 30, // 30 minutes
        }
    );

    useEffect(() => {
        console.log('[I18nContext] Mounted. localeConfigData:', localeConfigData, 'Error:', localeConfigError);
    }, [localeConfigData, localeConfigError]);

    // We can also fetch translations here if we want to pre-load, 
    // similar to frontend, but admin might rely on the useTranslationWithBackend hook
    // which does it per component/hook usage. 
    // However, frontend context fetches translations globally.
    // checking frontend implementation again: it fetches translations for current locale.
    const { data: translationsData, error: translationsError } = trpc.translation.getTranslations.useQuery(
        { locale: currentLocale },
        {
            enabled: !!currentLocale,
            retry: 1,
            staleTime: 1000 * 60 * 10, // 10 minutes
        }
    );

    // Initialize locale configuration
    useEffect(() => {
        // Cast to any to avoid unknown type errors if types aren't inferred correctly
        const configData = localeConfigData as any;
        const resolvedConfig =
            configData?.data ??
            configData?.result?.data?.data ??
            configData?.result?.data?.data?.data;

        if (configData?.status === 'OK' && resolvedConfig) {
            const config = resolvedConfig;
            // Map frontend config types to admin types if necessary
            // Assuming config.supportedLocales is string[] and matches Locale[]
            setSupportedLocales(config.supportedLocales as Locale[]);
            setDefaultLocale(config.defaultLocale as Locale);

            // Set initial locale logic
            const savedLocale = localStorage.getItem(STORAGE_KEY) as Locale | null;
            const hasUserOverride = localStorage.getItem(USER_LOCALE_KEY) === USER_LOCALE_VALUE;
            let targetLocale = hasUserOverride ? savedLocale : null;

            if (!targetLocale || !config.supportedLocales.includes(targetLocale)) {
                targetLocale = config.defaultLocale as Locale;
                localStorage.setItem(STORAGE_KEY, targetLocale);
                localStorage.setItem(USER_LOCALE_KEY, 'api');
            }

            if (targetLocale !== currentLocale) {
                setCurrentLocale(targetLocale);
                i18n.changeLanguage(targetLocale);
            }
        }

        if (localeConfigError) {
            console.error('Failed to load locale configuration', localeConfigError);
            setError('Failed to load locale configuration');
            // Fallback is already set in state initialization
        }

    }, [localeConfigData, localeConfigError, i18n, currentLocale]);

    // Load translations when they are available
    useEffect(() => {
        const transData = translationsData as any;
        if (transData?.success && transData.data) {
            const { locale, translations } = transData.data;

            // Add translations to i18next resources
            i18n.addResourceBundle(locale as string, 'translation', translations, true, true);
        }
    }, [translationsData, i18n]);


    const changeLocale = (locale: Locale) => {
        // Basic validation
        // In a real app we might check against supportedLocales but let's trust the input for now or check if we have the list

        setCurrentLocale(locale);
        i18n.changeLanguage(locale);
        localStorage.setItem(STORAGE_KEY, locale);
    };

    const contextValue: I18nContextType = {
        currentLocale,
        supportedLocales,
        defaultLocale,
        changeLocale,
        isLoading,
        error,
    };
    return (
        <I18nContext.Provider value={contextValue}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = (): I18nContextType => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};

export default I18nProvider;
