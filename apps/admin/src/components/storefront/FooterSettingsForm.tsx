import React, { useEffect, useMemo, useState, useRef } from 'react';
import { FiArrowDown, FiArrowUp, FiImage, FiInfo, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Button } from '../common/Button';
import { Select, SelectOption } from '../common/Select';
import { Input } from '../common/Input';
import TextareaInput from '../common/TextareaInput';
import { Toggle } from '../common/Toggle';
import { useNavigate } from 'react-router-dom';
import {
  FooterConfig,
  FooterExtraLink,
  FooterSocialLink,
  FooterSocialType,
  FooterWidgetConfig,
  FooterWidgetType,
  VisitorAnalyticsConfig,
  VisitorAnalyticsMetricType,
  DEFAULT_VISITOR_ANALYTICS_CONFIG,
  createFooterConfig,
} from '@shared/types/footer.types';
import { MediaManager } from '../common/MediaManager';

const FOOTER_SETTING_KEY = 'storefront.footer_config';

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `footer-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const clampColumns = (value: number) => Math.min(4, Math.max(1, Math.round(value)));

const sanitizeLinks = <T extends FooterSocialLink | FooterExtraLink>(
  items: T[],
): T[] => items.map((item, index) => ({ ...item, order: index }));

const clampWidgetHeight = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return 280;
  }
  return Math.min(640, Math.max(160, Math.round(value)));
};

const visitorAnalyticsMetricOrder: VisitorAnalyticsMetricType[] =
  DEFAULT_VISITOR_ANALYTICS_CONFIG.cards.map((card) => card.metric);

const createDefaultVisitorAnalytics = (): VisitorAnalyticsConfig => ({
  ...DEFAULT_VISITOR_ANALYTICS_CONFIG,
  cards: DEFAULT_VISITOR_ANALYTICS_CONFIG.cards.map((card) => ({ ...card })),
});

const clampVisitorAnalyticsColumns = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_VISITOR_ANALYTICS_CONFIG.columns;
  }
  return Math.min(4, Math.max(1, Math.round(value)));
};

const ensureVisitorAnalyticsCards = (
  cards: VisitorAnalyticsConfig['cards'] | undefined,
  columns: number
): VisitorAnalyticsConfig['cards'] => {
  const normalizedColumns = clampVisitorAnalyticsColumns(columns);
  const sourceCards = cards && cards.length ? cards : createDefaultVisitorAnalytics().cards;
  const normalized = sourceCards.map((card, index) => ({
    id: card.id || `visitor-card-${index}`,
    metric: visitorAnalyticsMetricOrder.includes(card.metric as VisitorAnalyticsMetricType)
      ? (card.metric as VisitorAnalyticsMetricType)
      : visitorAnalyticsMetricOrder[index % visitorAnalyticsMetricOrder.length],
  }));

  const limited = normalized.slice(0, normalizedColumns);
  const result = [...limited];
  while (result.length < normalizedColumns) {
    const metric = visitorAnalyticsMetricOrder[result.length % visitorAnalyticsMetricOrder.length];
    result.push({
      id: generateId(),
      metric,
    });
  }

  return result;
};

const normalizeVisitorAnalyticsState = (config?: VisitorAnalyticsConfig): VisitorAnalyticsConfig => {
  const base = config ?? createDefaultVisitorAnalytics();
  const columns = clampVisitorAnalyticsColumns(base.columns);
  return {
    enabled: base.enabled ?? DEFAULT_VISITOR_ANALYTICS_CONFIG.enabled,
    columns,
    backgroundColor: base.backgroundColor?.trim() || '',
    cards: ensureVisitorAnalyticsCards(base.cards, columns),
  };
};

const defaultWidgetDraft = (): FooterWidgetConfig => ({
  enabled: false,
  type: 'google_map',
  title: '',
  description: '',
  height: 280,
  googleMapEmbedUrl: '',
  facebookPageUrl: '',
  facebookTabs: 'timeline',
});

const withWidgetDefaults = (widget?: FooterWidgetConfig): FooterWidgetConfig => ({
  ...defaultWidgetDraft(),
  ...widget,
});

const sanitizeWidgetConfig = (widget?: FooterWidgetConfig): FooterWidgetConfig => {
  const merged = withWidgetDefaults(widget);
  return {
    ...merged,
    height: clampWidgetHeight(merged.height),
    googleMapEmbedUrl: merged.googleMapEmbedUrl?.trim() || '',
    facebookPageUrl: merged.facebookPageUrl?.trim() || '',
    facebookTabs: merged.facebookTabs?.trim() || 'timeline',
  };
};

const FooterSettingsForm: React.FC = () => {
  const { settings, isLoading, updateSetting, createSetting } = useSettings({ group: 'storefront-ui' });
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const navigate = useNavigate();
  const footerSetting = useMemo(
    () => settings.find((setting) => setting.key === FOOTER_SETTING_KEY),
    [settings]
  );

  const [draft, setDraft] = useState<FooterConfig>(() => createFooterConfig());
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const initialPreviewOrigin = useMemo(
    () => (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, ''),
    []
  );
  const [previewOrigin, setPreviewOrigin] = useState(initialPreviewOrigin);
  const [previewConfigParam, setPreviewConfigParam] = useState('');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isLogoMediaManagerOpen, setIsLogoMediaManagerOpen] = useState(false);

  useEffect(() => {
    if (!settings) return;
    try {
      const parsedValue = footerSetting?.value ? JSON.parse(footerSetting.value) : undefined;
      setDraft(createFooterConfig(parsedValue));
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to parse footer config', error);
      addToast({
        type: 'error',
        title: t('storefront.footer.messages.load_error', 'Unable to load footer settings'),
        description: error instanceof Error ? error.message : undefined,
      });
      setDraft(createFooterConfig());
    }
  }, [footerSetting?.value, settings, addToast, t]);

  useEffect(() => {
    if (initialPreviewOrigin || typeof window === 'undefined') {
      return;
    }
    setPreviewOrigin(window.location.origin.replace(/\/$/, ''));
  }, [initialPreviewOrigin]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const timeout = window.setTimeout(() => {
      try {
        const json = JSON.stringify(draft);
        setPreviewConfigParam(encodeURIComponent(json));
      } catch (error) {
        console.warn('Failed to serialize footer preview config', error);
        setPreviewConfigParam('');
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [draft]);

  const previewUrl = useMemo(() => {
    if (!previewOrigin) return '';
    const base = previewOrigin.replace(/\/$/, '');
    return previewConfigParam
      ? `${base}/preview/footer?config=${previewConfigParam}`
      : `${base}/preview/footer`;
  }, [previewOrigin, previewConfigParam]);

  const widgetDraft = withWidgetDefaults(draft.widget);
  const visitorAnalyticsDraft = normalizeVisitorAnalyticsState(draft.visitorAnalytics);

  const reloadPreview = () => {
    const frameWindow = iframeRef.current?.contentWindow;
    frameWindow?.location?.reload();
  };

  const handleLogoMediaSelect = (media: any | any[]) => {
    const selected = Array.isArray(media) ? media[0] : media;
    if (!selected || !selected.url) {
      setIsLogoMediaManagerOpen(false);
      return;
    }
    handleUpdate('logoUrl', selected.url);
    setIsLogoMediaManagerOpen(false);
  };

  const variantOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'simple', label: t('storefront.footer.variant.simple', 'Simple bar') },
      { value: 'columns', label: t('storefront.footer.variant.columns', 'Column layout') },
      { value: 'split', label: t('storefront.footer.variant.split', 'Split layout') },
    ],
    [t]
  );

  const themeOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'dark', label: t('storefront.footer.theme.dark', 'Dark') },
      { value: 'light', label: t('storefront.footer.theme.light', 'Light') },
    ],
    [t]
  );

  const menuLayoutOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'columns', label: t('storefront.footer.menu_layout.columns', 'Use column groups') },
      { value: 'inline', label: t('storefront.footer.menu_layout.inline', 'Distribute links evenly') },
    ],
    [t]
  );

  const socialTypeOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'facebook', label: 'Facebook' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'twitter', label: 'Twitter / X' },
      { value: 'youtube', label: 'YouTube' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'tiktok', label: 'TikTok' },
      { value: 'github', label: 'GitHub' },
      { value: 'custom', label: t('storefront.footer.social.custom', 'Custom') },
    ],
    [t]
  );

  const widgetTypeOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'google_map', label: t('storefront.footer.widget.google_map', 'Google Maps embed') },
      { value: 'facebook_page', label: t('storefront.footer.widget.facebook', 'Facebook fanpage') },
    ],
    [t]
  );

  const visitorAnalyticsColumnOptions = useMemo<SelectOption[]>(
    () => [
      { value: '1', label: t('storefront.footer.visitor_analytics.columns.option_1', '1 column') },
      { value: '2', label: t('storefront.footer.visitor_analytics.columns.option_2', '2 columns') },
      { value: '3', label: t('storefront.footer.visitor_analytics.columns.option_3', '3 columns') },
      { value: '4', label: t('storefront.footer.visitor_analytics.columns.option_4', '4 columns') },
    ],
    [t]
  );

  const visitorAnalyticsMetricOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'visitors', label: t('storefront.footer.visitor_analytics.metrics.visitors', 'Total visitors') },
      { value: 'pageViews', label: t('storefront.footer.visitor_analytics.metrics.pageViews', 'Page views') },
      { value: 'topPage', label: t('storefront.footer.visitor_analytics.metrics.topPage', 'Top page') },
      { value: 'lastUpdated', label: t('storefront.footer.visitor_analytics.metrics.lastUpdated', 'Last updated') },
    ],
    [t]
  );

  const handleUpdate = <K extends keyof FooterConfig>(key: K, value: FooterConfig[K]) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  const handleSocialUpdate = (id: string, payload: Partial<FooterSocialLink>) => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link) =>
        link.id === id ? { ...link, ...payload } : link
      ),
    }));
    setIsDirty(true);
  };

  const handleExtraLinkUpdate = (id: string, payload: Partial<FooterExtraLink>) => {
    setDraft((prev) => ({
      ...prev,
      extraLinks: prev.extraLinks.map((link) =>
        link.id === id ? { ...link, ...payload } : link
      ),
    }));
    setIsDirty(true);
  };

  const handleWidgetUpdate = (payload: Partial<FooterWidgetConfig>) => {
    setDraft((prev) => ({
      ...prev,
      widget: {
        ...withWidgetDefaults(prev.widget),
        ...payload,
      },
    }));
    setIsDirty(true);
  };

  const updateVisitorAnalytics = (updater: (current: VisitorAnalyticsConfig) => VisitorAnalyticsConfig) => {
    setDraft((prev) => {
      const current = normalizeVisitorAnalyticsState(prev.visitorAnalytics);
      const next = normalizeVisitorAnalyticsState(updater(current));
      return {
        ...prev,
        visitorAnalytics: next,
      };
    });
    setIsDirty(true);
  };

  const handleVisitorAnalyticsToggle = (enabled: boolean) => {
    updateVisitorAnalytics((current) => ({
      ...current,
      enabled,
    }));
  };

  const handleVisitorAnalyticsBackgroundChange = (value: string) => {
    updateVisitorAnalytics((current) => ({
      ...current,
      backgroundColor: value,
    }));
  };

  const handleVisitorAnalyticsColumnsChange = (value: number) => {
    updateVisitorAnalytics((current) => ({
      ...current,
      columns: clampVisitorAnalyticsColumns(value),
    }));
  };

  const handleVisitorAnalyticsCardMetricChange = (cardId: string, metric: VisitorAnalyticsMetricType) => {
    updateVisitorAnalytics((current) => ({
      ...current,
      cards: current.cards.map((card) => (card.id === cardId ? { ...card, metric } : card)),
    }));
  };

  const moveVisitorAnalyticsCard = (index: number, direction: number) => {
    updateVisitorAnalytics((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.cards.length) {
        return current;
      }
      const cards = [...current.cards];
      [cards[index], cards[targetIndex]] = [cards[targetIndex], cards[index]];
      return {
        ...current,
        cards,
      };
    });
  };

  const addSocialLink = () => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: sanitizeLinks([
        ...prev.socialLinks,
        {
          id: generateId(),
          label: t('storefront.footer.social.new_label', 'New social link'),
          url: '',
          type: 'facebook',
          order: prev.socialLinks.length,
          isActive: true,
        },
      ]),
    }));
    setIsDirty(true);
  };

  const addExtraLink = () => {
    setDraft((prev) => ({
      ...prev,
      extraLinks: sanitizeLinks([
        ...prev.extraLinks,
        {
          id: generateId(),
          label: t('storefront.footer.links.new_label', 'New link'),
          url: '',
          order: prev.extraLinks.length,
          isActive: true,
        },
      ]),
    }));
    setIsDirty(true);
  };

  const moveSocialLink = (index: number, delta: number) => {
    setDraft((prev) => {
      const next = [...prev.socialLinks];
      const target = index + delta;
      if (target < 0 || target >= next.length) {
        return prev;
      }
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, socialLinks: sanitizeLinks(next) };
    });
    setIsDirty(true);
  };

  const moveExtraLink = (index: number, delta: number) => {
    setDraft((prev) => {
      const next = [...prev.extraLinks];
      const target = index + delta;
      if (target < 0 || target >= next.length) {
        return prev;
      }
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, extraLinks: sanitizeLinks(next) };
    });
    setIsDirty(true);
  };

  const removeSocialLink = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: sanitizeLinks(prev.socialLinks.filter((link) => link.id !== id)),
    }));
    setIsDirty(true);
  };

  const removeExtraLink = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      extraLinks: sanitizeLinks(prev.extraLinks.filter((link) => link.id !== id)),
    }));
    setIsDirty(true);
  };

  const handleReset = () => {
    setDraft(createFooterConfig());
    setIsDirty(true);
    addToast({
      type: 'info',
      title: t('storefront.footer.messages.reset', 'Defaults restored'),
      description: t('storefront.footer.messages.reset_description', 'Changes have not been saved yet.'),
    });
  };

  const saveConfig = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const payload: FooterConfig = {
      ...draft,
      columnsPerRow: clampColumns(draft.columnsPerRow),
      socialLinks: sanitizeLinks(
        draft.socialLinks
          .filter((link) => link.label?.trim() || link.url?.trim())
          .map((link) => ({ ...link, url: link.url?.trim() || '', label: link.label?.trim() || '' }))
      ),
      extraLinks: sanitizeLinks(
        draft.extraLinks
          .filter((link) => link.label?.trim() || link.url?.trim())
          .map((link) => ({ ...link, url: link.url?.trim() || '', label: link.label?.trim() || '' }))
      ),
      widget: sanitizeWidgetConfig(draft.widget),
      visitorAnalytics: visitorAnalyticsDraft,
    };
    const normalizedPayload = createFooterConfig(payload);

    try {
      if (footerSetting?.id) {
        await updateSetting(footerSetting.id, { value: JSON.stringify(normalizedPayload) });
      } else {
        await createSetting({
          key: FOOTER_SETTING_KEY,
          value: JSON.stringify(normalizedPayload),
          type: 'json',
          group: 'storefront-ui',
          isPublic: true,
          description: 'Storefront footer configuration',
        });
      }

      addToast({
        type: 'success',
        title: t('storefront.footer.messages.saved', 'Footer updated'),
        description: t('storefront.footer.messages.saved_description', 'Your changes are live on the storefront.'),
      });
      setDraft(normalizedPayload);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save footer config', error);
      addToast({
        type: 'error',
        title: t('storefront.footer.messages.save_error', 'Unable to save changes'),
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !settings.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
        {t('storefront.footer.messages.loading', 'Loading footer settings...')}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/70 p-5 text-indigo-900 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <FiInfo className="h-5 w-5 shrink-0 mt-1" />
          <div>
            <p className="font-medium">
              {t('storefront.footer.menu_hint.title', 'Footer links are powered by the footer menu.')}
            </p>
            <p className="text-sm opacity-80">
              {t('storefront.footer.menu_hint.description', 'Create columns by adding parent menu items with children.')}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/menus/footer')}>
          {t('storefront.footer.menu_hint.btn', 'Open footer menu')}
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {t('storefront.footer.title', 'Storefront footer')}
          </h2>
          <p className="text-sm text-gray-500">
            {t('storefront.footer.description', 'Control layout, branding, social links, and legal information.')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" startIcon={<FiRefreshCw />} onClick={handleReset} disabled={!isDirty || isSaving}>
            {t('storefront.footer.actions.reset', 'Reset')}
          </Button>
          <Button variant="primary" onClick={saveConfig} isLoading={isSaving} disabled={!isDirty}>
            {t('storefront.footer.actions.save', 'Save changes')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('storefront.footer.layout.heading', 'Layout & theme')}</h3>
          <Select
            label={t('storefront.footer.variant.label', 'Layout variant')}
            value={draft.variant}
            onChange={(value) => handleUpdate('variant', value as FooterConfig['variant'])}
            options={variantOptions}
          />
          <Select
            label={t('storefront.footer.theme.label', 'Theme')}
            value={draft.theme}
            onChange={(value) => handleUpdate('theme', value as FooterConfig['theme'])}
            options={themeOptions}
          />
          <Select
            label={t('storefront.footer.menu_layout.label', 'Menu layout')}
            value={draft.menuLayout}
            onChange={(value) => handleUpdate('menuLayout', value as FooterConfig['menuLayout'])}
            options={menuLayoutOptions}
          />
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            {t('storefront.footer.columns.label', 'Columns per row')}
            <Input
              type="number"
              min={1}
              max={4}
              inputSize="md"
              className="text-sm"
              value={draft.columnsPerRow}
              onChange={(event) =>
                handleUpdate('columnsPerRow', clampColumns(Number(event.target.value) || 3))
              }
            />
            <span className="text-xs text-gray-400">
              {t('storefront.footer.columns.helper', 'Choose between 1 and 4 columns.')}
            </span>
          </label>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('storefront.footer.brand.heading', 'Brand & messaging')}</h3>
          <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-gray-900">
                  {t('storefront.footer.brand.logo_label', 'Footer logo')}
                </p>
                <p className="text-xs text-gray-500">
                  {t(
                    'storefront.footer.brand.logo_description',
                    'Upload a version that pairs well with your footer background.'
                  )}
                </p>
              </div>
              {draft.logoUrl ? (
                <img
                  src={draft.logoUrl}
                  alt="Footer logo preview"
                  className="h-14 w-14 rounded-lg border border-gray-200 object-contain bg-white"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-400">
                  <FiImage className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsLogoMediaManagerOpen(true)}>
                {t('storefront.footer.brand.logo_choose', 'Choose logo')}
              </Button>
              {draft.logoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdate('logoUrl', '')}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  {t('storefront.footer.brand.logo_remove', 'Remove')}
                </Button>
              )}
            </div>
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              {t('storefront.footer.brand.logo_url', 'Image URL')}
              <Input
                value={draft.logoUrl || ''}
                onChange={(event) => handleUpdate('logoUrl', event.target.value)}
                placeholder={t(
                  'storefront.footer.brand.logo_url_placeholder',
                  'https://cdn.example.com/footer-logo.svg'
                )}
                className="text-sm"
              />
              <span className="text-xs text-gray-400">
                {t(
                  'storefront.footer.brand.logo_hint',
                  'Paste a link if you host assets elsewhere. Leave blank to reuse your main logo.'
                )}
              </span>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Toggle
              checked={draft.showBrandLogo !== false}
              onChange={(checked) => handleUpdate('showBrandLogo', checked)}
              label={t('storefront.footer.brand.show_logo', 'Show logo')}
              description={t(
                'storefront.footer.brand.show_logo_hint',
                'Hide the logo without deleting the image.'
              )}
            />
            <Toggle
              checked={draft.showBrandTitle !== false}
              onChange={(checked) => handleUpdate('showBrandTitle', checked)}
              label={t('storefront.footer.brand.show_title', 'Show footer title')}
              description={t(
                'storefront.footer.brand.show_title_hint',
                'Toggle the store name that sits next to the logo.'
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              {t('storefront.footer.brand.background_color', 'Background color')}
              <Input
                value={draft.backgroundColor || ''}
                onChange={(event) => handleUpdate('backgroundColor', event.target.value)}
                placeholder="#0F172A or rgb(15,23,42)"
                className="text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              {t('storefront.footer.brand.text_color', 'Text color')}
              <Input
                value={draft.textColor || ''}
                onChange={(event) => handleUpdate('textColor', event.target.value)}
                placeholder="#F8FAFC"
                className="text-sm"
              />
            </label>
          </div>
          <p className="text-xs text-gray-400">
            {t('storefront.footer.brand.color_hint', 'Supports HEX, RGB(a), or CSS color keywords. Clear the field to fall back to the theme.')}
          </p>
          <Toggle
            checked={draft.showBrandDescription}
            onChange={(checked) => handleUpdate('showBrandDescription', checked)}
            label={t('storefront.footer.brand.show_description', 'Show brand description')}
            description={t('storefront.footer.brand.show_description_hint', 'Toggle the paragraph below the logo.')}
          />
          <TextareaInput
            id="brand-description"
            label={t('storefront.footer.brand.description_label', 'Description')}
            value={draft.brandDescription}
            onChange={(event) => handleUpdate('brandDescription', event.target.value)}
            rows={4}
          />
          <TextareaInput
            id="custom-html"
            label={t('storefront.footer.brand.custom_html', 'Custom HTML (optional)')}
            value={draft.customHtml}
            onChange={(event) => handleUpdate('customHtml', event.target.value)}
            rows={4}
            placeholder="<p>Custom HTML block...</p>"
          />
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4">
            <Toggle
              checked={draft.showNewsletter}
              onChange={(checked) => handleUpdate('showNewsletter', checked)}
              label={t('storefront.footer.newsletter.enable', 'Show newsletter signup')}
              description={t('storefront.footer.newsletter.description', 'Displays an email field and button in the brand column.')}
            />
            {draft.showNewsletter && (
              <div className="mt-4 space-y-3">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                  {t('storefront.footer.newsletter.heading_label', 'Newsletter heading')}
                  <Input
                    value={draft.newsletterHeading}
                    onChange={(event) => handleUpdate('newsletterHeading', event.target.value)}
                    className="text-sm"
                  />
                </label>
                <TextareaInput
                  id="newsletter-description"
                  label={t('storefront.footer.newsletter.copy', 'Newsletter copy')}
                  value={draft.newsletterDescription}
                  onChange={(event) => handleUpdate('newsletterDescription', event.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
      </div>
    </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('storefront.footer.visitor_analytics.heading', 'Visitor analytics bar')}
          </h3>
          <p className="text-sm text-gray-500">
            {t('storefront.footer.visitor_analytics.description', 'Control the stat strip shown above the footer.')}
          </p>
        </div>
        <Toggle
          checked={visitorAnalyticsDraft.enabled}
          onChange={(checked) => handleVisitorAnalyticsToggle(checked)}
          label={t('storefront.footer.visitor_analytics.enable', 'Show visitor analytics')}
          description={t('storefront.footer.visitor_analytics.enable_hint', 'Display daily visitors, page views, or other metrics above the footer.')}
        />
        {visitorAnalyticsDraft.enabled && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label={t('storefront.footer.visitor_analytics.columns.label', 'Columns')}
                value={String(visitorAnalyticsDraft.columns)}
                onChange={(value) => handleVisitorAnalyticsColumnsChange(Number(value))}
                options={visitorAnalyticsColumnOptions}
              />
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                {t('storefront.footer.visitor_analytics.background', 'Background color')}
                <Input
                  value={visitorAnalyticsDraft.backgroundColor || ''}
                  onChange={(event) => handleVisitorAnalyticsBackgroundChange(event.target.value)}
                  placeholder="#0F172A or rgba(15,23,42,0.95)"
                  className="text-sm"
                />
                <span className="text-xs text-gray-400">
                  {t('storefront.footer.visitor_analytics.background_hint', 'Leave blank to reuse the footer colors.')}
                </span>
              </label>
            </div>
            <div className="space-y-3">
              {visitorAnalyticsDraft.cards.map((card, index) => (
                <div key={card.id} className="rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900">
                      {t('storefront.footer.visitor_analytics.card_label', 'Column {{index}}', { index: index + 1 })}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveVisitorAnalyticsCard(index, -1)}
                        disabled={index === 0}
                        aria-label={t('common.move_up', 'Move up')}
                      >
                        <FiArrowUp />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveVisitorAnalyticsCard(index, 1)}
                        disabled={index === visitorAnalyticsDraft.cards.length - 1}
                        aria-label={t('common.move_down', 'Move down')}
                      >
                        <FiArrowDown />
                      </Button>
                    </div>
                  </div>
                  <Select
                    label={t('storefront.footer.visitor_analytics.metric_label', 'Metric')}
                    value={card.metric}
                    onChange={(value) =>
                      handleVisitorAnalyticsCardMetricChange(card.id, value as VisitorAnalyticsMetricType)
                    }
                    options={visitorAnalyticsMetricOptions}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('storefront.footer.widget.heading', 'Google Maps & fanpage block')}
          </h3>
          <p className="text-sm text-gray-500">
            {t(
              'storefront.footer.widget.description',
              'Embed a location map or Facebook fanpage directly under your brand column.'
            )}
          </p>
        </div>
        <Toggle
          checked={widgetDraft.enabled}
          onChange={(checked) => handleWidgetUpdate({ enabled: checked })}
          label={t('storefront.footer.widget.enable', 'Show embedded block')}
          description={t('storefront.footer.widget.enable_hint', 'Toggle the extra column with Google Maps or a fanpage.')}
        />
        {widgetDraft.enabled && (
          <div className="space-y-4">
            <Select
              label={t('storefront.footer.widget.type_label', 'Choose content')}
              value={widgetDraft.type}
              onChange={(value) => handleWidgetUpdate({ type: value as FooterWidgetType })}
              options={widgetTypeOptions}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                {t('storefront.footer.widget.title', 'Block title')}
                <Input
                  value={widgetDraft.title || ''}
                  onChange={(event) => handleWidgetUpdate({ title: event.target.value })}
                  placeholder={t('storefront.footer.widget.title_placeholder', 'Visit us')}
                  className="text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                {t('storefront.footer.widget.height', 'Embed height (px)')}
                <Input
                  type="number"
                  min={160}
                  max={640}
                  inputSize="md"
                  value={widgetDraft.height ?? 280}
                  onChange={(event) =>
                    handleWidgetUpdate({ height: Number(event.target.value) || widgetDraft.height })
                  }
                  className="text-sm"
                />
              </label>
            </div>
            <TextareaInput
              id="widget-description"
              label={t('storefront.footer.widget.copy', 'Short description (optional)')}
              value={widgetDraft.description || ''}
              onChange={(event) => handleWidgetUpdate({ description: event.target.value })}
              rows={3}
            />
            {widgetDraft.type === 'google_map' ? (
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                {t('storefront.footer.widget.map_url', 'Google Maps embed URL')}
                <Input
                  value={widgetDraft.googleMapEmbedUrl || ''}
                  onChange={(event) => handleWidgetUpdate({ googleMapEmbedUrl: event.target.value })}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="text-sm"
                />
                <span className="text-xs text-gray-400">
                  {t('storefront.footer.widget.map_hint', 'Use the URL from Google Maps → Share → Embed a map.')}
                </span>
              </label>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600 md:col-span-2">
                  {t('storefront.footer.widget.facebook_url', 'Facebook fanpage URL')}
                  <Input
                    value={widgetDraft.facebookPageUrl || ''}
                    onChange={(event) => handleWidgetUpdate({ facebookPageUrl: event.target.value })}
                    placeholder="https://facebook.com/your-page"
                    className="text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                  {t('storefront.footer.widget.facebook_tabs', 'Tabs (optional)')}
                  <Input
                    value={widgetDraft.facebookTabs || ''}
                    onChange={(event) => handleWidgetUpdate({ facebookTabs: event.target.value })}
                    placeholder="timeline, messages"
                    className="text-sm"
                  />
                  <span className="text-xs text-gray-400">
                    {t('storefront.footer.widget.facebook_tabs_hint', 'Comma-separated list. Default is "timeline".')}
                  </span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('storefront.footer.social.heading', 'Social links')}</h3>
            <p className="text-sm text-gray-500">{t('storefront.footer.social.description', 'Links display as icon buttons. Leave URL blank to hide.')}</p>
          </div>
          <Button variant="outline" size="sm" startIcon={<FiPlus />} onClick={addSocialLink}>
            {t('storefront.footer.social.add', 'Add social link')}
          </Button>
        </div>
        <div className="space-y-4">
          {draft.socialLinks.map((link, index) => (
            <div key={link.id} className="rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-gray-900">
                  {t('storefront.footer.social.item_label', 'Social link {{index}}', { index: index + 1 })}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSocialLink(index, -1)}
                    disabled={index === 0}
                    aria-label={t('common.move_up', 'Move up')}
                  >
                    <FiArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSocialLink(index, 1)}
                    disabled={index === draft.socialLinks.length - 1}
                    aria-label={t('common.move_down', 'Move down')}
                  >
                    <FiArrowDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSocialLink(link.id)}
                    aria-label={t('common.remove', 'Remove')}
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                  {t('storefront.footer.social.label', 'Label')}
                  <Input
                    value={link.label}
                    onChange={(event) => handleSocialUpdate(link.id, { label: event.target.value })}
                    className="text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                  {t('storefront.footer.social.url', 'URL')}
                  <Input
                    value={link.url}
                    onChange={(event) => handleSocialUpdate(link.id, { url: event.target.value })}
                    className="text-sm"
                  />
                </label>
                <Select
                  label={t('storefront.footer.social.type', 'Network')}
                  value={link.type}
                  onChange={(value) => handleSocialUpdate(link.id, { type: value as FooterSocialType })}
                  options={socialTypeOptions}
                />
                <Toggle
                  checked={link.isActive}
                  onChange={(checked) => handleSocialUpdate(link.id, { isActive: checked })}
                  label={t('storefront.footer.social.visible', 'Visible')}
                  description={t('storefront.footer.social.visible_hint', 'Hide without deleting by turning this off.')}
                />
              </div>
            </div>
          ))}
          {draft.socialLinks.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
              {t('storefront.footer.social.empty', 'No social links yet. Add at least one link to show the icon row.')}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('storefront.footer.links.heading', 'Legal & utility links')}</h3>
            <p className="text-sm text-gray-500">{t('storefront.footer.links.description', 'Shown in the bottom row next to the copyright text.')}</p>
          </div>
          <Button variant="outline" size="sm" startIcon={<FiPlus />} onClick={addExtraLink}>
            {t('storefront.footer.links.add', 'Add link')}
          </Button>
        </div>
        <div className="space-y-4">
          {draft.extraLinks.map((link, index) => (
            <div key={link.id} className="rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-gray-900">
                  {t('storefront.footer.links.item_label', 'Link {{index}}', { index: index + 1 })}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveExtraLink(index, -1)}
                    disabled={index === 0}
                    aria-label={t('common.move_up', 'Move up')}
                  >
                    <FiArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveExtraLink(index, 1)}
                    disabled={index === draft.extraLinks.length - 1}
                    aria-label={t('common.move_down', 'Move down')}
                  >
                    <FiArrowDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExtraLink(link.id)}
                    aria-label={t('common.remove', 'Remove')}
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                  {t('storefront.footer.links.label', 'Label')}
                  <Input
                    value={link.label}
                    onChange={(event) => handleExtraLinkUpdate(link.id, { label: event.target.value })}
                    className="text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                  {t('storefront.footer.links.url', 'URL')}
                  <Input
                    value={link.url}
                    onChange={(event) => handleExtraLinkUpdate(link.id, { url: event.target.value })}
                    className="text-sm"
                  />
                </label>
                <Toggle
                  checked={link.isActive}
                  onChange={(checked) => handleExtraLinkUpdate(link.id, { isActive: checked })}
                  label={t('storefront.footer.links.visible', 'Visible')}
                />
              </div>
            </div>
          ))}
          {draft.extraLinks.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
              {t('storefront.footer.links.empty', 'Add at least one link for privacy, terms, or support pages.')}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('storefront.footer.preview.heading', 'Live preview')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('storefront.footer.preview.description', 'See the storefront footer exactly as customers will see it.')}
            </p>
          </div>
          {previewOrigin && (
            <Button variant="ghost" size="sm" onClick={reloadPreview}>
              {t('storefront.footer.preview.reload', 'Reload')}
            </Button>
          )}
        </div>
        {previewOrigin ? (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-inner">
            <iframe
              key={previewUrl}
              ref={iframeRef}
              title="Footer preview"
              src={previewUrl}
              className="w-full h-[520px] border-0"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            {t('storefront.footer.preview.missing_origin', 'Set NEXT_PUBLIC_SITE_URL to enable preview.')}
          </div>
        )}
      </div>

      <MediaManager
        isOpen={isLogoMediaManagerOpen}
        onClose={() => setIsLogoMediaManagerOpen(false)}
        onSelect={handleLogoMediaSelect}
        accept="image/*"
      />
    </div>
  );
};

export default FooterSettingsForm;
