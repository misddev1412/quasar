import React, { useEffect, useMemo, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  FiArrowDown,
  FiArrowUp,
  FiBarChart2,
  FiEye,
  FiGlobe,
  FiHash,
  FiImage,
  FiLayout,
  FiLink,
  FiPlus,
  FiRefreshCw,
  FiSmartphone,
  FiTrash2
} from 'react-icons/fi';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@admin/components/common/Tabs';
import { useSettings } from '@admin/hooks/useSettings';
import { useToast } from '@admin/contexts/ToastContext';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { Button } from '@admin/components/common/Button';
import { Select, SelectOption } from '@admin/components/common/Select';
import { Input } from '@admin/components/common/Input';
import TextareaInput from '@admin/components/common/TextareaInput';
import { Toggle } from '@admin/components/common/Toggle';
import {
  FooterConfig,
  FooterExtraLink,
  FooterMenuColumnConfig,
  FooterMenuColumnSection,
  FooterMenuLinkConfig,
  FooterMenuLinkType,
  FooterMenuLinkTarget,
  FooterSocialLink,
  FooterSocialType,
  FooterWidgetConfig,
  VisitorAnalyticsConfig,
  VisitorAnalyticsMetricType,
  DEFAULT_VISITOR_ANALYTICS_CONFIG,
  createFooterConfig,
} from '@shared/types/footer.types';
import { MediaManager } from '@admin/components/common/MediaManager';
import { ColorSelector } from '@admin/components/common/ColorSelector';
import { SimpleRichTextEditor } from '@admin/components/common/SimpleRichTextEditor';
import { cn } from '@admin/utils/cn';
import { ProductSelector } from '@admin/components/menus/ProductSelector';
import { CategorySelector } from '@admin/components/menus/CategorySelector';
import { SiteContentSelector } from '@admin/components/site-content/SiteContentSelector';
import { PostSelector } from '@admin/components/posts/PostSelector';

const FOOTER_SETTING_KEY = 'storefront.footer_config';

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `footer-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const clampColumns = (value: number) => Math.min(4, Math.max(1, Math.round(value)));

const clampLogoSize = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return 48;
  }
  return Math.min(640, Math.max(24, Math.round(value)));
};

const sanitizeLinks = <T extends FooterSocialLink | FooterExtraLink>(
  items: T[],
): T[] => items.map((item, index) => ({ ...item, order: index }));

const isValidMenuTarget = (value?: string): value is FooterMenuLinkTarget =>
  value === '_self' || value === '_blank';

const isValidFooterLinkType = (value?: string): value is FooterMenuLinkType =>
  value === 'external' ||
  value === 'product' ||
  value === 'category' ||
  value === 'post' ||
  value === 'site_content';

const DEFAULT_MENU_COLUMN_SECTION_ORDER: FooterMenuColumnSection[] = ['links', 'customHtml', 'widget'];

const normalizeMenuColumnSectionOrder = (order?: FooterMenuColumnSection[]) => {
  if (!Array.isArray(order)) {
    return [...DEFAULT_MENU_COLUMN_SECTION_ORDER];
  }
  const allowed = new Set(DEFAULT_MENU_COLUMN_SECTION_ORDER);
  const unique = Array.from(new Set(order.filter((section) => allowed.has(section))));
  DEFAULT_MENU_COLUMN_SECTION_ORDER.forEach((section) => {
    if (!unique.includes(section)) {
      unique.push(section);
    }
  });
  return unique;
};

const sanitizeMenuColumns = (columns: FooterMenuColumnConfig[]): FooterMenuColumnConfig[] =>
  columns
    .map((column, columnIndex) => {
      const links =
        column.links?.map((link, linkIndex) => ({
          id: link.id || `footer-link-${columnIndex}-${linkIndex}`,
          label: link.label?.trim() || '',
          url: link.url?.trim() || '',
          linkType: isValidFooterLinkType(link.linkType) ? link.linkType : 'external',
          referenceId: link.referenceId?.trim() || '',
          target: isValidMenuTarget(link.target) ? link.target : '_self',
          isActive: link.isActive !== undefined ? Boolean(link.isActive) : true,
        })) ?? [];
      const filteredLinks = links.filter((link) => link.label || link.url || link.referenceId);
      const customHtml = column.customHtml?.trim() || '';
      const widget = sanitizeColumnWidget(column.widget);

      return {
        id: column.id || `footer-column-${columnIndex}`,
        title: column.title?.trim() || '',
        customHtml,
        sectionOrder: normalizeMenuColumnSectionOrder(column.sectionOrder),
        widget,
        isActive: column.isActive !== undefined ? Boolean(column.isActive) : true,
        links: filteredLinks,
      };
    })
    .filter((column) => {
      const widget = column.widget;
      const hasWidget =
        widget?.enabled &&
        ((widget.type === 'facebook_page' && widget.facebookPageUrl) ||
          (widget.type === 'google_map' && widget.googleMapEmbedUrl));
      return column.links.length > 0 || Boolean(column.title) || Boolean(column.customHtml) || Boolean(hasWidget);
    });

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
    cardBackgroundColor: base.cardBackgroundColor?.trim() || '',
    cardTextColor: base.cardTextColor?.trim() || '',
    cards: ensureVisitorAnalyticsCards(base.cards, columns),
  };
};

type BrandLayoutValue = Exclude<FooterConfig['brandLayout'], undefined>;

const normalizeBrandLayout = (layout?: FooterConfig['brandLayout']): BrandLayoutValue =>
  layout === 'stacked' ? 'stacked' : 'inline';

const defaultWidgetDraft = (): FooterWidgetConfig => ({
  enabled: false,
  type: 'google_map',
  showGoogleMap: true,
  showFacebookPage: false,
  title: '',
  description: '',
  height: 280,
  googleMapEmbedUrl: '',
  facebookPageUrl: '',
  facebookTabs: 'timeline',
});

const defaultColumnWidgetDraft = (): NonNullable<FooterMenuColumnConfig['widget']> => ({
  enabled: false,
  type: 'google_map',
  title: '',
  description: '',
  height: 280,
  googleMapEmbedUrl: '',
  facebookPageUrl: '',
  facebookTabs: 'timeline',
});

const withColumnWidgetDefaults = (
  widget?: FooterMenuColumnConfig['widget']
): NonNullable<FooterMenuColumnConfig['widget']> => ({
  ...defaultColumnWidgetDraft(),
  ...widget,
  type: widget?.type === 'facebook_page' ? 'facebook_page' : 'google_map',
});

const withWidgetDefaults = (widget?: FooterWidgetConfig): FooterWidgetConfig => {
  const defaults = defaultWidgetDraft();
  if (!widget) {
    return defaults;
  }
  const resolvedType = widget.type ?? defaults.type;
  return {
    ...defaults,
    ...widget,
    type: resolvedType,
    showGoogleMap:
      typeof widget.showGoogleMap === 'boolean'
        ? widget.showGoogleMap
        : resolvedType === 'facebook_page'
          ? false
          : defaults.showGoogleMap,
    showFacebookPage:
      typeof widget.showFacebookPage === 'boolean'
        ? widget.showFacebookPage
        : resolvedType === 'facebook_page'
          ? true
          : defaults.showFacebookPage,
  };
};

const sanitizeColumnWidget = (
  widget?: FooterMenuColumnConfig['widget']
): FooterMenuColumnConfig['widget'] => {
  if (!widget) {
    return undefined;
  }
  const merged = withColumnWidgetDefaults(widget);
  return {
    ...merged,
    enabled: Boolean(merged.enabled),
    height: clampWidgetHeight(merged.height),
    googleMapEmbedUrl: merged.googleMapEmbedUrl?.trim() || '',
    facebookPageUrl: merged.facebookPageUrl?.trim() || '',
    facebookTabs: merged.facebookTabs?.trim() || 'timeline',
  };
};

const sanitizeWidgetConfig = (widget?: FooterWidgetConfig): FooterWidgetConfig => {
  const merged = withWidgetDefaults(widget);
  return {
    ...merged,
    type:
      merged.showFacebookPage && !merged.showGoogleMap
        ? 'facebook_page'
        : merged.type || 'google_map',
    showGoogleMap: Boolean(merged.showGoogleMap),
    showFacebookPage: Boolean(merged.showFacebookPage),
    height: clampWidgetHeight(merged.height),
    googleMapEmbedUrl: merged.googleMapEmbedUrl?.trim() || '',
    facebookPageUrl: merged.facebookPageUrl?.trim() || '',
    facebookTabs: merged.facebookTabs?.trim() || 'timeline',
  };
};

export interface FooterSettingsFormRef {
  save: () => Promise<void>;
  reset: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

interface FooterSettingsFormProps {
  onDirtyChange?: (isDirty: boolean) => void;
  onSavingChange?: (isSaving: boolean) => void;
}

const FooterSettingsForm = forwardRef<FooterSettingsFormRef, FooterSettingsFormProps>(
  ({ onDirtyChange, onSavingChange }, ref) => {
    const { settings, isLoading, updateSetting, createSetting } = useSettings({ group: 'storefront-ui' });
    const { addToast } = useToast();
    const { t } = useTranslationWithBackend();
    const footerSetting = useMemo(
      () => settings.find((setting) => setting.key === FOOTER_SETTING_KEY),
      [settings]
    );

    const [draft, setDraft] = useState<FooterConfig>(() => createFooterConfig());
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useImperativeHandle(ref, () => ({
      save: saveConfig,
      reset: handleReset,
      isDirty,
      isSaving,
    }));

    const updateIsDirty = (dirty: boolean) => {
      setIsDirty(dirty);
      onDirtyChange?.(dirty);
    };

    const updateIsSaving = (saving: boolean) => {
      setIsSaving(saving);
      onSavingChange?.(saving);
    };

    const initialPreviewOrigin = useMemo(
      () => (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, ''),
      []
    );
    const [previewOrigin, setPreviewOrigin] = useState(initialPreviewOrigin);
    const [previewConfigParam, setPreviewConfigParam] = useState('');
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [isLogoMediaManagerOpen, setIsLogoMediaManagerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('appearance');

    useEffect(() => {
      if (!settings) return;
      try {
        const parsedValue = footerSetting?.value ? JSON.parse(footerSetting.value) : undefined;
        const initialConfig = createFooterConfig(parsedValue);
        setDraft(initialConfig);
        updateIsDirty(false);
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
    const previewLogoSize = clampLogoSize(draft.logoSize);
    const isLogoFullWidth = draft.logoFullWidth === true;
    const normalizedBrandLayout = normalizeBrandLayout(draft.brandLayout);
    const previewBackgroundColor = useMemo(
      () => draft.backgroundColor?.trim() || (draft.theme === 'dark' ? '#0F172A' : '#F8FAFC'),
      [draft.backgroundColor, draft.theme]
    );
    const previewTextColor = useMemo(
      () => draft.textColor?.trim() || (draft.theme === 'dark' ? '#F8FAFC' : '#0F172A'),
      [draft.textColor, draft.theme]
    );
    const previewBrandTitle = useMemo(
      () => draft.brandTitle?.trim() || t('storefront.footer.brand.preview_title', 'Your store name'),
      [draft.brandTitle, t]
    );
    const brandTitleColorValue = draft.brandTitleColor?.trim() || '';
    const previewBrandTitleColor = useMemo(
      () => brandTitleColorValue || previewTextColor,
      [brandTitleColorValue, previewTextColor]
    );
    const hasCustomBrandTitleColor = Boolean(brandTitleColorValue);
    const previewBrandDescription = useMemo(
      () =>
        draft.brandDescription?.trim() ||
        t(
          'storefront.footer.brand.preview_description',
          'Add a short sentence that builds trust with visitors.'
        ),
      [draft.brandDescription, t]
    );
    const brandDescriptionColorValue = draft.brandDescriptionColor?.trim() || '';
    const previewBrandDescriptionColor = useMemo(
      () => brandDescriptionColorValue || previewTextColor,
      [brandDescriptionColorValue, previewTextColor]
    );
    const hasCustomBrandDescriptionColor = Boolean(brandDescriptionColorValue);
    const copyrightColorValue = draft.copyrightColor?.trim() || '';
    const previewCopyrightColor = useMemo(
      () => copyrightColorValue || previewTextColor,
      [copyrightColorValue, previewTextColor]
    );
    const hasCustomCopyrightColor = Boolean(copyrightColorValue);
    const previewLogoSizeLabel = isLogoFullWidth
      ? t('storefront.footer.brand.logo_full_width_badge', 'Full width (100%)')
      : `${previewLogoSize}px`;
    const previewLogoWrapperClass = cn(
      'flex items-center justify-center rounded-2xl border border-white/30 bg-white/5 backdrop-blur-sm p-6',
      isLogoFullWidth ? 'w-full' : 'flex-shrink-0'
    );
    const previewLogoWrapperStyle: React.CSSProperties = isLogoFullWidth
      ? { minHeight: 140 }
      : { width: previewLogoSize, minHeight: previewLogoSize };
    const previewLogoImageStyle: React.CSSProperties = isLogoFullWidth
      ? { width: '100%', height: 'auto' }
      : { width: previewLogoSize, height: 'auto', maxHeight: previewLogoSize };
    const previewNewsletterHeading = useMemo(
      () =>
        draft.newsletterHeading?.trim() ||
        t('storefront.footer.brand.preview_newsletter_heading', 'Stay in the loop'),
      [draft.newsletterHeading, t]
    );
    const previewNewsletterDescription = useMemo(
      () =>
        draft.newsletterDescription?.trim() ||
        t(
          'storefront.footer.brand.preview_newsletter_description',
          'Share launch announcements, offers, or community updates.'
        ),
      [draft.newsletterDescription, t]
    );

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

    const brandLayoutOptions = useMemo<SelectOption[]>(
      () => [
        { value: 'inline', label: t('storefront.footer.brand.layout.inline', 'Inline (logo + title)') },
        { value: 'stacked', label: t('storefront.footer.brand.layout.stacked', 'Stacked (logo above title)') },
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

    const menuFontSizeOptions = useMemo<SelectOption[]>(
      () => [
        { value: 'xs', label: t('storefront.footer.menu_typography.font_size.xs', 'Extra small') },
        { value: 'sm', label: t('storefront.footer.menu_typography.font_size.sm', 'Small') },
        { value: 'md', label: t('storefront.footer.menu_typography.font_size.md', 'Medium') },
        { value: 'lg', label: t('storefront.footer.menu_typography.font_size.lg', 'Large') },
      ],
      [t]
    );

    const menuFontWeightOptions = useMemo<SelectOption[]>(
      () => [
        { value: 'normal', label: t('storefront.footer.menu_typography.font_weight.normal', 'Regular') },
        { value: 'medium', label: t('storefront.footer.menu_typography.font_weight.medium', 'Medium') },
        { value: 'semibold', label: t('storefront.footer.menu_typography.font_weight.semibold', 'Semibold') },
        { value: 'bold', label: t('storefront.footer.menu_typography.font_weight.bold', 'Bold') },
      ],
      [t]
    );

    const menuTextTransformOptions = useMemo<SelectOption[]>(
      () => [
        { value: 'none', label: t('storefront.footer.menu_typography.case.none', 'Keep original') },
        { value: 'uppercase', label: t('storefront.footer.menu_typography.case.uppercase', 'Uppercase (VIẾT HOA)') },
        { value: 'capitalize', label: t('storefront.footer.menu_typography.case.capitalize', 'Capitalize Words (Viết Hoa)') },
        { value: 'sentence', label: t('storefront.footer.menu_typography.case.sentence', 'Sentence case (Viết hoa)') },
      ],
      [t]
    );

    const menuLinkTypeOptions = useMemo<SelectOption[]>(
      () => [
        { value: 'external', label: t('storefront.footer.menu_links.type.external', 'External URL') },
        { value: 'product', label: t('storefront.footer.menu_links.type.product', 'Product') },
        { value: 'category', label: t('storefront.footer.menu_links.type.category', 'Category') },
        { value: 'post', label: t('storefront.footer.menu_links.type.post', 'Post') },
        { value: 'site_content', label: t('storefront.footer.menu_links.type.site_content', 'Site content') },
      ],
      [t]
    );

    const menuLinkTargetOptions = useMemo<SelectOption[]>(
      () => [
        { value: '_self', label: t('storefront.footer.menu_links.target.self', 'Same tab') },
        { value: '_blank', label: t('storefront.footer.menu_links.target.blank', 'New tab') },
      ],
      [t]
    );

    const columnWidgetOptions = useMemo<SelectOption[]>(
      () => [
        { value: 'none', label: t('storefront.footer.menu_columns.widget.none', 'No embed') },
        { value: 'google_map', label: t('storefront.footer.menu_columns.widget.google', 'Google Maps') },
        { value: 'facebook_page', label: t('storefront.footer.menu_columns.widget.facebook', 'Facebook fanpage') },
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

    const defaultMenuLinkLabel = t('storefront.footer.menu_links.new_label', 'New link');
    const isDefaultMenuLinkLabel = (label?: string) => {
      const normalized = (label || '').trim();
      return normalized.length === 0 || normalized === defaultMenuLinkLabel || normalized === 'New link';
    };

    const handleUpdate = <K extends keyof FooterConfig>(key: K, value: FooterConfig[K]) => {
      setDraft((prev) => ({
        ...prev,
        [key]: value,
      }));
      updateIsDirty(true);
    };

    const handleSocialUpdate = (id: string, payload: Partial<FooterSocialLink>) => {
      setDraft((prev) => ({
        ...prev,
        socialLinks: prev.socialLinks.map((link) =>
          link.id === id ? { ...link, ...payload } : link
        ),
      }));
      updateIsDirty(true);
    };

    const handleExtraLinkUpdate = (id: string, payload: Partial<FooterExtraLink>) => {
      setDraft((prev) => ({
        ...prev,
        extraLinks: prev.extraLinks.map((link) =>
          link.id === id ? { ...link, ...payload } : link
        ),
      }));
      updateIsDirty(true);
    };

    const handleMenuColumnUpdate = (id: string, payload: Partial<FooterMenuColumnConfig>) => {
      setDraft((prev) => ({
        ...prev,
        menuColumns: prev.menuColumns.map((column) =>
          column.id === id ? { ...column, ...payload } : column
        ),
      }));
      updateIsDirty(true);
    };

    const moveMenuColumnSection = (columnId: string, section: FooterMenuColumnSection, delta: number) => {
      setDraft((prev) => ({
        ...prev,
        menuColumns: prev.menuColumns.map((column) => {
          if (column.id !== columnId) {
            return column;
          }
          const order = normalizeMenuColumnSectionOrder(column.sectionOrder);
          const index = order.indexOf(section);
          const targetIndex = index + delta;
          if (index === -1 || targetIndex < 0 || targetIndex >= order.length) {
            return column;
          }
          const next = [...order];
          [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
          return { ...column, sectionOrder: next };
        }),
      }));
      updateIsDirty(true);
    };

    const handleMenuColumnWidgetUpdate = (
      id: string,
      payload: Partial<NonNullable<FooterMenuColumnConfig['widget']>>
    ) => {
      setDraft((prev) => ({
        ...prev,
        menuColumns: prev.menuColumns.map((column) => {
          if (column.id !== id) {
            return column;
          }
          return {
            ...column,
            widget: {
              ...withColumnWidgetDefaults(column.widget),
              ...payload,
            },
          };
        }),
      }));
      updateIsDirty(true);
    };

    const handleMenuLinkUpdate = (
      columnId: string,
      linkId: string,
      payload: Partial<FooterMenuLinkConfig>
    ) => {
      setDraft((prev) => ({
        ...prev,
        menuColumns: prev.menuColumns.map((column) => {
          if (column.id !== columnId) {
            return column;
          }
          return {
            ...column,
            links: (column.links || []).map((link) =>
              link.id === linkId ? { ...link, ...payload } : link
            ),
          };
        }),
      }));
      updateIsDirty(true);
    };

    const handleMenuLinkReferenceUpdate = (
      columnId: string,
      linkId: string,
      currentLabel: string | undefined,
      referenceId: string | undefined,
      optionLabel?: string
    ) => {
      const payload: Partial<FooterMenuLinkConfig> = {
        referenceId: referenceId || '',
      };
      if (optionLabel && isDefaultMenuLinkLabel(currentLabel)) {
        payload.label = optionLabel;
      }
      handleMenuLinkUpdate(columnId, linkId, payload);
    };

    const handleWidgetUpdate = (payload: Partial<FooterWidgetConfig>) => {
      setDraft((prev) => ({
        ...prev,
        widget: {
          ...withWidgetDefaults(prev.widget),
          ...payload,
        },
      }));
      updateIsDirty(true);
    };

    const handleMenuTypographyChange = <K extends keyof FooterConfig['menuTypography']>(
      key: K,
      value: FooterConfig['menuTypography'][K]
    ) => {
      setDraft((prev) => ({
        ...prev,
        menuTypography: {
          ...prev.menuTypography,
          [key]: value,
        },
      }));
      updateIsDirty(true);
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
      updateIsDirty(true);
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

    const handleVisitorAnalyticsCardBackgroundChange = (value: string) => {
      updateVisitorAnalytics((current) => ({
        ...current,
        cardBackgroundColor: value,
      }));
    };

    const handleVisitorAnalyticsCardTextChange = (value: string) => {
      updateVisitorAnalytics((current) => ({
        ...current,
        cardTextColor: value,
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
      updateIsDirty(true);
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
      updateIsDirty(true);
    };

    const addMenuColumn = () => {
      setDraft((prev) => ({
        ...prev,
        menuColumns: [
          ...prev.menuColumns,
          {
            id: generateId(),
            title: '',
            customHtml: '',
            widget: defaultColumnWidgetDraft(),
            sectionOrder: [...DEFAULT_MENU_COLUMN_SECTION_ORDER],
            links: [],
            isActive: true,
          },
        ],
      }));
      updateIsDirty(true);
    };

    const addMenuLink = (columnId: string) => {
      setDraft((prev) => ({
        ...prev,
        menuColumns: prev.menuColumns.map((column) =>
          column.id === columnId
            ? {
              ...column,
              links: [
                ...(column.links || []),
                {
                  id: generateId(),
                  label: t('storefront.footer.menu_links.new_label', 'New link'),
                  url: '',
                  linkType: 'external',
                  referenceId: '',
                  target: '_self',
                  isActive: true,
                },
              ],
            }
            : column
        ),
      }));
      updateIsDirty(true);
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
      updateIsDirty(true);
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
      updateIsDirty(true);
    };

    const moveMenuColumn = (index: number, delta: number) => {
      setDraft((prev) => {
        const next = [...prev.menuColumns];
        const target = index + delta;
        if (target < 0 || target >= next.length) {
          return prev;
        }
        const [item] = next.splice(index, 1);
        next.splice(target, 0, item);
        return { ...prev, menuColumns: next };
      });
      updateIsDirty(true);
    };

    const moveMenuLink = (columnId: string, index: number, delta: number) => {
      setDraft((prev) => {
        const nextColumns = prev.menuColumns.map((column) => {
          if (column.id !== columnId) {
            return column;
          }
          const links = [...(column.links || [])];
          const target = index + delta;
          if (target < 0 || target >= links.length) {
            return column;
          }
          const [item] = links.splice(index, 1);
          links.splice(target, 0, item);
          return { ...column, links };
        });
        return { ...prev, menuColumns: nextColumns };
      });
      updateIsDirty(true);
    };

    const removeSocialLink = (id: string) => {
      setDraft((prev) => ({
        ...prev,
        socialLinks: sanitizeLinks(prev.socialLinks.filter((link) => link.id !== id)),
      }));
      updateIsDirty(true);
    };

    const removeExtraLink = (id: string) => {
      setDraft((prev) => ({
        ...prev,
        extraLinks: sanitizeLinks(prev.extraLinks.filter((link) => link.id !== id)),
      }));
      updateIsDirty(true);
    };

    const removeMenuColumn = (id: string) => {
      setDraft((prev) => ({
        ...prev,
        menuColumns: prev.menuColumns.filter((column) => column.id !== id),
      }));
      updateIsDirty(true);
    };

    const removeMenuLink = (columnId: string, linkId: string) => {
      setDraft((prev) => ({
        ...prev,
        menuColumns: prev.menuColumns.map((column) => {
          if (column.id !== columnId) {
            return column;
          }
          return {
            ...column,
            links: (column.links || []).filter((link) => link.id !== linkId),
          };
        }),
      }));
      updateIsDirty(true);
    };

    const handleReset = () => {
      try {
        const parsedValue = footerSetting?.value ? JSON.parse(footerSetting.value) : undefined;
        setDraft(createFooterConfig(parsedValue));
        updateIsDirty(false);
        addToast({
          type: 'success',
          title: t('storefront.footer.messages.reset', 'Settings reset'),
          description: t('storefront.footer.messages.reset_description', 'The form has been reverted to the last saved state.'),
        });
      } catch (error) {
        console.error('Failed to reset footer config', error);
      }
    };

    const saveConfig = async () => {
      if (isSaving) return;
      updateIsSaving(true);
      const payload: FooterConfig = {
        ...draft,
        brandLayout: normalizedBrandLayout,
        brandTitle: draft.brandTitle?.trim() || '',
        logoSize: clampLogoSize(draft.logoSize),
        columnsPerRow: clampColumns(draft.columnsPerRow),
        menuColumns: sanitizeMenuColumns(draft.menuColumns || []),
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
        copyrightText: draft.copyrightText?.trim() || '',
        copyrightColor: draft.copyrightColor?.trim() || '',
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
        updateIsDirty(false);
      } catch (error) {
        console.error('Failed to save footer config', error);
        addToast({
          type: 'error',
          title: t('storefront.footer.messages.save_error', 'Unable to save changes'),
          description: error instanceof Error ? error.message : undefined,
        });
      } finally {
        updateIsSaving(false);
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
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto p-0 bg-blue-500 border border-blue-500 rounded-xl overflow-hidden shadow-sm divide-x divide-blue-500">
            <TabsTrigger
              value="appearance"
              className={cn(
                "flex-1 py-3 px-4 gap-2 rounded-none first:rounded-l-[11px] last:rounded-r-[11px] transition-all focus:ring-0",
                activeTab === "appearance"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-50 hover:bg-white text-gray-600"
              )}
            >
              <FiLayout className="h-4 w-4" />
              <span className="hidden sm:inline">{t('storefront.footer.tabs.appearance', 'Appearance')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="branding"
              className={cn(
                "flex-1 py-3 px-4 gap-2 rounded-none first:rounded-l-[11px] last:rounded-r-[11px] transition-all focus:ring-0",
                activeTab === "branding"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-50 hover:bg-white text-gray-600"
              )}
            >
              <FiGlobe className="h-4 w-4" />
              <span className="hidden sm:inline">{t('storefront.footer.tabs.branding', 'Branding')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="navigation"
              className={cn(
                "flex-1 py-3 px-4 gap-2 rounded-none first:rounded-l-[11px] last:rounded-r-[11px] transition-all focus:ring-0",
                activeTab === "navigation"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-50 hover:bg-white text-gray-600"
              )}
            >
              <FiLink className="h-4 w-4" />
              <span className="hidden sm:inline">{t('storefront.footer.tabs.navigation', 'Navigation')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="social_widgets"
              className={cn(
                "flex-1 py-3 px-4 gap-2 rounded-none first:rounded-l-[11px] last:rounded-r-[11px] transition-all focus:ring-0",
                activeTab === "social_widgets"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-50 hover:bg-white text-gray-600"
              )}
            >
              <FiHash className="h-4 w-4" />
              <span className="hidden sm:inline">{t('storefront.footer.tabs.social', 'Social & Widgets')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className={cn(
                "flex-1 py-3 px-4 gap-2 rounded-none first:rounded-l-[11px] last:rounded-r-[11px] transition-all focus:ring-0",
                activeTab === "analytics"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-50 hover:bg-white text-gray-600"
              )}
            >
              <FiBarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('storefront.footer.tabs.analytics', 'Analytics')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className={cn(
                "flex-1 py-3 px-4 gap-2 rounded-none first:rounded-l-[11px] last:rounded-r-[11px] transition-all focus:ring-0",
                activeTab === "preview"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-50 hover:bg-white text-gray-600"
              )}
            >
              <FiEye className="h-4 w-4" />
              <span className="hidden sm:inline">{t('storefront.footer.tabs.preview', 'Preview')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6 mt-0">
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
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t('storefront.footer.menu_typography.heading', 'Menu typography')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t(
                        'storefront.footer.menu_typography.description',
                        'Set the font size, weight, and casing for footer menu items.'
                      )}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label={t('storefront.footer.menu_typography.font_size.label', 'Font size')}
                      value={draft.menuTypography.fontSize}
                      onChange={(value) =>
                        handleMenuTypographyChange('fontSize', value as FooterConfig['menuTypography']['fontSize'])
                      }
                      options={menuFontSizeOptions}
                    />
                    <Select
                      label={t('storefront.footer.menu_typography.font_weight.label', 'Font weight')}
                      value={draft.menuTypography.fontWeight}
                      onChange={(value) =>
                        handleMenuTypographyChange('fontWeight', value as FooterConfig['menuTypography']['fontWeight'])
                      }
                      options={menuFontWeightOptions}
                    />
                  </div>
                  <Select
                    label={t('storefront.footer.menu_typography.case.label', 'Letter casing')}
                    value={draft.menuTypography.textTransform}
                    onChange={(value) =>
                      handleMenuTypographyChange(
                        'textTransform',
                        value as FooterConfig['menuTypography']['textTransform']
                      )
                    }
                    options={menuTextTransformOptions}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('storefront.footer.colors.heading', 'Colors')}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorSelector
                    label={t('storefront.footer.brand.background_color', 'Background color')}
                    value={draft.backgroundColor || ''}
                    onChange={(color) => handleUpdate('backgroundColor', color || '')}
                    placeholder="#0F172A or rgb(15,23,42)"
                  />
                  <ColorSelector
                    label={t('storefront.footer.brand.text_color', 'Text color')}
                    value={draft.textColor || ''}
                    onChange={(color) => handleUpdate('textColor', color || '')}
                    placeholder="#F8FAFC"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {t('storefront.footer.brand.color_hint', 'Supports HEX, RGB(a), or CSS color keywords. Clear the field to fall back to the theme.')}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6 mt-0">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('storefront.footer.brand.heading', 'Brand & messaging')}</h3>
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t('storefront.footer.brand.live_preview_label', 'Storefront preview')}
                    </p>
                    <div
                      className="rounded-2xl border border-gray-200 shadow-inner w-full"
                      style={{ backgroundColor: previewBackgroundColor }}
                    >
                      <div className="relative flex flex-col gap-6 px-6 py-8">
                        <div
                          className={cn(
                            'flex flex-wrap items-start gap-6',
                            normalizedBrandLayout === 'inline' ? 'md:flex-row md:items-center' : 'flex-col'
                          )}
                        >
                          {draft.showBrandLogo !== false && (
                            <div className={previewLogoWrapperClass} style={previewLogoWrapperStyle}>
                              {draft.logoUrl ? (
                                <img
                                  src={draft.logoUrl}
                                  alt="Footer logo preview"
                                  className="object-contain"
                                  style={previewLogoImageStyle}
                                />
                              ) : (
                                <div className="flex items-center justify-center text-white/60 h-16 w-full">
                                  <FiImage className="h-10 w-10" />
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex flex-1 flex-col gap-2 min-w-0">
                            <span
                              className="text-xs font-semibold uppercase tracking-wide"
                              style={{ color: previewTextColor, opacity: 0.8 }}
                            >
                              {t('storefront.footer.brand.preview_badge', 'Live footer preview')}
                            </span>
                            {draft.showBrandTitle !== false && (
                              <p
                                className="text-lg font-semibold break-words"
                                style={{
                                  color: previewBrandTitleColor,
                                  opacity: hasCustomBrandTitleColor ? 1 : 1,
                                }}
                              >
                                {previewBrandTitle}
                              </p>
                            )}
                            {draft.showBrandDescription && (
                              <p
                                className="text-sm"
                                style={{
                                  color: previewBrandDescriptionColor,
                                  opacity: hasCustomBrandDescriptionColor ? 1 : 0.85,
                                }}
                              >
                                {previewBrandDescription}
                              </p>
                            )}
                            {draft.showNewsletter && (
                              <div className="mt-4 space-y-2">
                                <p className="text-sm font-semibold" style={{ color: previewTextColor }}>
                                  {previewNewsletterHeading}
                                </p>
                                <p className="text-xs" style={{ color: previewTextColor, opacity: 0.8 }}>
                                  {previewNewsletterDescription}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <div className="flex-1 min-w-[200px] rounded-full bg-white/15 px-4 py-2 text-xs" style={{ color: previewTextColor }}>
                                    email@example.com
                                  </div>
                                  <div className="rounded-full bg-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: previewBackgroundColor }}>
                                    {t('storefront.footer.brand.preview_subscribe', 'Subscribe')}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className="w-full border-t border-white/20 pt-4 text-[11px] font-semibold uppercase tracking-wide flex justify-between"
                          style={{ color: previewTextColor, opacity: 0.75 }}
                        >
                          <span>{t('storefront.footer.brand.logo_preview_hint', 'Preview size')}</span>
                          <span>{previewLogoSizeLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
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
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setIsLogoMediaManagerOpen(true)}>
                        {t('storefront.footer.brand.logo_choose', 'Choose logo')}
                      </Button>
                      {draft.logoUrl && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                window.open(draft.logoUrl, '_blank', 'noopener,noreferrer');
                              }
                            }}
                          >
                            {t('storefront.footer.brand.logo_open', 'Open in new tab')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdate('logoUrl', '')}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            {t('storefront.footer.brand.logo_remove', 'Remove')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <label className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white/70 p-4 text-sm text-gray-700 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t('storefront.footer.brand.logo_url', 'Image URL')}
                    </span>
                    <Input
                      value={draft.logoUrl || ''}
                      onChange={(event) => handleUpdate('logoUrl', event.target.value)}
                      placeholder={t(
                        'storefront.footer.brand.logo_url_placeholder',
                        'https://cdn.example.com/footer-logo.svg'
                      )}
                      className="text-sm"
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('storefront.footer.brand.logo_width', 'Logo width (px)')}
                    <Input
                      type="number"
                      min={24}
                      max={640}
                      inputSize="md"
                      className="text-sm"
                      disabled={draft.logoFullWidth === true}
                      value={draft.logoSize ?? 48}
                      onChange={(event) =>
                        handleUpdate('logoSize', clampLogoSize(Number(event.target.value) || draft.logoSize || 48))
                      }
                    />
                  </label>
                  <Toggle
                    checked={draft.logoFullWidth === true}
                    onChange={(checked) => handleUpdate('logoFullWidth', checked)}
                    label={t('storefront.footer.brand.logo_full_width', 'Use full width (100%)')}
                    description={t(
                      'storefront.footer.brand.logo_full_width_hint',
                      'Fill the available column width and keep the height automatic.'
                    )}
                  />
                </div>
                <Select
                  label={t('storefront.footer.brand.layout.label', 'Logo & title layout')}
                  value={normalizedBrandLayout}
                  onChange={(value) => handleUpdate('brandLayout', value as FooterConfig['brandLayout'])}
                  options={brandLayoutOptions}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Toggle
                    checked={draft.showBrandLogo !== false}
                    onChange={(checked) => handleUpdate('showBrandLogo', checked)}
                    label={t('storefront.footer.brand.show_logo', 'Show logo')}
                  />
                  <Toggle
                    checked={draft.showBrandTitle !== false}
                    onChange={(checked) => handleUpdate('showBrandTitle', checked)}
                    label={t('storefront.footer.brand.show_title', 'Show footer title')}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('storefront.footer.brand.messaging_heading', 'Messaging')}</h3>
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                  {t('storefront.footer.brand.title_override', 'Footer site name')}
                  <Input
                    value={draft.brandTitle || ''}
                    onChange={(event) => handleUpdate('brandTitle', event.target.value)}
                    placeholder={t('storefront.footer.brand.title_override_placeholder', 'Overrides the default store name.')}
                    className="text-sm"
                  />
                </label>
                <ColorSelector
                  label={t('storefront.footer.brand.title_color', 'Brand title color')}
                  value={draft.brandTitleColor || ''}
                  onChange={(color) => handleUpdate('brandTitleColor', color || '')}
                  placeholder="#FFFFFF"
                />
                <Toggle
                  checked={draft.showBrandDescription}
                  onChange={(checked) => handleUpdate('showBrandDescription', checked)}
                  label={t('storefront.footer.brand.show_description', 'Show brand description')}
                />
                <TextareaInput
                  id="brand-description"
                  label={t('storefront.footer.brand.description_label', 'Description')}
                  value={draft.brandDescription}
                  onChange={(event) => handleUpdate('brandDescription', event.target.value)}
                  rows={4}
                />
                <ColorSelector
                  label={t('storefront.footer.brand.description_color', 'Description color')}
                  value={draft.brandDescriptionColor || ''}
                  onChange={(color) => handleUpdate('brandDescriptionColor', color || '')}
                  placeholder="#94A3B8"
                />
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4">
                  <Toggle
                    checked={draft.showNewsletter}
                    onChange={(checked) => handleUpdate('showNewsletter', checked)}
                    label={t('storefront.footer.newsletter.enable', 'Show newsletter signup')}
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
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-900">{t('storefront.footer.brand.custom_html', 'Custom HTML')}</span>
                    <span className="text-xs text-gray-500">{t('storefront.footer.brand.custom_html_hint', 'Basic formatting only.')}</span>
                  </div>
                  <SimpleRichTextEditor
                    value={draft.customHtml}
                    onChange={(value) => handleUpdate('customHtml', value)}
                    placeholder="<p>Custom HTML block...</p>"
                    minHeight={140}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-6 mt-0">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('storefront.footer.menu_columns.heading', 'Footer menu columns')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t(
                      'storefront.footer.menu_columns.description',
                      'Configure which links appear in each footer column.'
                    )}
                  </p>
                </div>
                <Button variant="outline" size="sm" startIcon={<FiPlus />} onClick={addMenuColumn}>
                  {t('storefront.footer.menu_columns.add_column', 'Add column')}
                </Button>
              </div>
              <div className="space-y-4">
                {draft.menuColumns.map((column, columnIndex) => {
                  const columnWidget = withColumnWidgetDefaults(column.widget);
                  const widgetMode = columnWidget.enabled ? columnWidget.type : 'none';
                  const sectionOrder = normalizeMenuColumnSectionOrder(column.sectionOrder);
                  const sectionLabels: Record<FooterMenuColumnSection, string> = {
                    links: t('storefront.footer.menu_columns.section_order.links', 'Links'),
                    customHtml: t('storefront.footer.menu_columns.section_order.custom_html', 'Custom HTML'),
                    widget: t('storefront.footer.menu_columns.section_order.widget', 'Embed'),
                  };
                  return (
                    <div key={column.id} className="rounded-xl border border-gray-100 p-4 shadow-sm space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {t('storefront.footer.menu_columns.column_label', 'Column {{index}}', {
                              index: columnIndex + 1,
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t('storefront.footer.menu_columns.column_hint', 'Add a heading and a list of links.')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveMenuColumn(columnIndex, -1)}
                            disabled={columnIndex === 0}
                            aria-label={t('common.move_up', 'Move up')}
                          >
                            <FiArrowUp />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveMenuColumn(columnIndex, 1)}
                            disabled={columnIndex === draft.menuColumns.length - 1}
                            aria-label={t('common.move_down', 'Move down')}
                          >
                            <FiArrowDown />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMenuColumn(column.id)}
                            aria-label={t('common.remove', 'Remove')}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1 text-sm text-gray-600">
                          {t('storefront.footer.menu_columns.title', 'Column title')}
                          <Input
                            value={column.title || ''}
                            onChange={(event) => handleMenuColumnUpdate(column.id, { title: event.target.value })}
                            className="text-sm"
                            placeholder={t('storefront.footer.menu_columns.title_placeholder', 'Customer service')}
                          />
                        </label>
                        <Toggle
                          checked={column.isActive !== false}
                          onChange={(checked) => handleMenuColumnUpdate(column.id, { isActive: checked })}
                          label={t('storefront.footer.menu_columns.visible', 'Visible')}
                          description={t('storefront.footer.menu_columns.visible_hint', 'Hide the column without deleting it.')}
                        />
                      </div>
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4 space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {t('storefront.footer.menu_columns.section_order.heading', 'Section order')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t(
                              'storefront.footer.menu_columns.section_order.description',
                              'Reorder the links, custom HTML, and embed blocks inside this column.'
                            )}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {sectionOrder.map((section, index) => (
                            <div key={section} className="flex items-center justify-between gap-2">
                              <span className="text-sm text-gray-700">{sectionLabels[section]}</span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveMenuColumnSection(column.id, section, -1)}
                                  disabled={index === 0}
                                  aria-label={t('common.move_up', 'Move up')}
                                >
                                  <FiArrowUp />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveMenuColumnSection(column.id, section, 1)}
                                  disabled={index === sectionOrder.length - 1}
                                  aria-label={t('common.move_down', 'Move down')}
                                >
                                  <FiArrowDown />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                          <span className="font-medium">
                            {t('storefront.footer.menu_columns.custom_html', 'Custom HTML (optional)')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {t(
                              'storefront.footer.menu_columns.custom_html_description',
                              'Add a small HTML block below the column links.'
                            )}
                          </span>
                        </div>
                        <SimpleRichTextEditor
                          value={column.customHtml || ''}
                          onChange={(value) => handleMenuColumnUpdate(column.id, { customHtml: value })}
                          placeholder="<p>Custom HTML block...</p>"
                          minHeight={140}
                        />
                        <p className="text-xs text-gray-400">
                          {t(
                            'storefront.footer.menu_columns.custom_html_hint',
                            'Basic formatting only. For full control, use the Code view.'
                          )}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                          {t('storefront.footer.menu_links.heading', 'Links')}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          startIcon={<FiPlus />}
                          onClick={() => addMenuLink(column.id)}
                        >
                          {t('storefront.footer.menu_links.add', 'Add link')}
                        </Button>
                      </div>
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4 space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {t('storefront.footer.menu_columns.widget.heading', 'Embedded content')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t(
                              'storefront.footer.menu_columns.widget.description',
                              'Show a Google Map or Facebook fanpage inside this column.'
                            )}
                          </p>
                        </div>
                        <Select
                          label={t('storefront.footer.menu_columns.widget.label', 'Embed type')}
                          value={widgetMode}
                          onChange={(value) => {
                            if (value === 'none') {
                              handleMenuColumnWidgetUpdate(column.id, { enabled: false });
                            } else {
                              handleMenuColumnWidgetUpdate(column.id, {
                                enabled: true,
                                type: value as FooterWidgetConfig['type'],
                              });
                            }
                          }}
                          options={columnWidgetOptions}
                        />
                        {columnWidget.enabled && (
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1 text-sm text-gray-600">
                              {t('storefront.footer.menu_columns.widget.height', 'Embed height (px)')}
                              <Input
                                type="number"
                                min={160}
                                max={640}
                                inputSize="md"
                                value={columnWidget.height ?? 280}
                                onChange={(event) =>
                                  handleMenuColumnWidgetUpdate(column.id, {
                                    height: Number(event.target.value) || columnWidget.height,
                                  })
                                }
                                className="text-sm"
                              />
                            </label>
                            {columnWidget.type === 'google_map' && (
                              <label className="flex flex-col gap-1 text-sm text-gray-600 md:col-span-2">
                                {t('storefront.footer.menu_columns.widget.map_url', 'Google Maps embed URL')}
                                <Input
                                  value={columnWidget.googleMapEmbedUrl || ''}
                                  onChange={(event) =>
                                    handleMenuColumnWidgetUpdate(column.id, {
                                      googleMapEmbedUrl: event.target.value,
                                    })
                                  }
                                  placeholder="https://www.google.com/maps/embed?pb=..."
                                  className="text-sm"
                                />
                              </label>
                            )}
                            {columnWidget.type === 'facebook_page' && (
                              <>
                                <label className="flex flex-col gap-1 text-sm text-gray-600 md:col-span-2">
                                  {t('storefront.footer.menu_columns.widget.facebook_url', 'Facebook fanpage URL')}
                                  <Input
                                    value={columnWidget.facebookPageUrl || ''}
                                    onChange={(event) =>
                                      handleMenuColumnWidgetUpdate(column.id, {
                                        facebookPageUrl: event.target.value,
                                      })
                                    }
                                    placeholder="https://facebook.com/your-page"
                                    className="text-sm"
                                  />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-gray-600">
                                  {t('storefront.footer.menu_columns.widget.facebook_tabs', 'Tabs (optional)')}
                                  <Input
                                    value={columnWidget.facebookTabs || ''}
                                    onChange={(event) =>
                                      handleMenuColumnWidgetUpdate(column.id, {
                                        facebookTabs: event.target.value,
                                      })
                                    }
                                    placeholder="timeline, messages"
                                    className="text-sm"
                                  />
                                </label>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {column.links && column.links.length > 0 ? (
                          column.links.map((link, linkIndex) => {
                            const linkType = link.linkType || 'external';
                            return (
                              <div key={link.id} className="rounded-lg border border-gray-100 p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium text-gray-900">
                                    {t('storefront.footer.menu_links.item_label', 'Link {{index}}', {
                                      index: linkIndex + 1,
                                    })}
                                  </p>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveMenuLink(column.id, linkIndex, -1)}
                                      disabled={linkIndex === 0}
                                      aria-label={t('common.move_up', 'Move up')}
                                    >
                                      <FiArrowUp />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveMenuLink(column.id, linkIndex, 1)}
                                      disabled={linkIndex === (column.links?.length || 0) - 1}
                                      aria-label={t('common.move_down', 'Move down')}
                                    >
                                      <FiArrowDown />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeMenuLink(column.id, link.id)}
                                      aria-label={t('common.remove', 'Remove')}
                                    >
                                      <FiTrash2 />
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                  <Select
                                    label={t('storefront.footer.menu_links.type_label', 'Link type')}
                                    value={linkType}
                                    onChange={(value) =>
                                      handleMenuLinkUpdate(column.id, link.id, { linkType: value as FooterMenuLinkType })
                                    }
                                    options={menuLinkTypeOptions}
                                  />
                                  <label className="flex flex-col gap-1 text-sm text-gray-600">
                                    {t('storefront.footer.menu_links.label', 'Label')}
                                    <Input
                                      value={link.label}
                                      onChange={(event) =>
                                        handleMenuLinkUpdate(column.id, link.id, { label: event.target.value })
                                      }
                                      className="text-sm"
                                    />
                                  </label>
                                  {linkType === 'external' && (
                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                      {t('storefront.footer.menu_links.url', 'URL')}
                                      <Input
                                        value={link.url}
                                        onChange={(event) =>
                                          handleMenuLinkUpdate(column.id, link.id, { url: event.target.value })
                                        }
                                        className="text-sm"
                                      />
                                    </label>
                                  )}
                                  {linkType === 'product' && (
                                    <div className="md:col-span-2">
                                      <ProductSelector
                                        value={link.referenceId || undefined}
                                        onChange={(value, option) =>
                                          handleMenuLinkReferenceUpdate(
                                            column.id,
                                            link.id,
                                            link.label,
                                            value,
                                            option?.label
                                          )
                                        }
                                      />
                                    </div>
                                  )}
                                  {linkType === 'category' && (
                                    <div className="md:col-span-2">
                                      <CategorySelector
                                        value={link.referenceId || undefined}
                                        onChange={(value, option) =>
                                          handleMenuLinkReferenceUpdate(
                                            column.id,
                                            link.id,
                                            link.label,
                                            value,
                                            option?.label
                                          )
                                        }
                                      />
                                    </div>
                                  )}
                                  {linkType === 'post' && (
                                    <div className="md:col-span-2">
                                      <PostSelector
                                        value={link.referenceId || undefined}
                                        onChange={(value, option) =>
                                          handleMenuLinkReferenceUpdate(
                                            column.id,
                                            link.id,
                                            link.label,
                                            value,
                                            option?.label
                                          )
                                        }
                                      />
                                    </div>
                                  )}
                                  {linkType === 'site_content' && (
                                    <div className="md:col-span-2">
                                      <SiteContentSelector
                                        value={link.referenceId || undefined}
                                        onChange={(value, option) =>
                                          handleMenuLinkReferenceUpdate(
                                            column.id,
                                            link.id,
                                            link.label,
                                            value,
                                            option?.label
                                          )
                                        }
                                        valueType="slug"
                                      />
                                    </div>
                                  )}
                                  <Select
                                    label={t('storefront.footer.menu_links.target_label', 'Target')}
                                    value={link.target || '_self'}
                                    onChange={(value) =>
                                      handleMenuLinkUpdate(column.id, link.id, { target: value as FooterMenuLinkTarget })
                                    }
                                    options={menuLinkTargetOptions}
                                  />
                                  <Toggle
                                    checked={link.isActive !== false}
                                    onChange={(checked) =>
                                      handleMenuLinkUpdate(column.id, link.id, { isActive: checked })
                                    }
                                    label={t('storefront.footer.menu_links.visible', 'Visible')}
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                            {t(
                              'storefront.footer.menu_links.empty',
                              'Add at least one link to display this column.'
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {draft.menuColumns.length === 0 && (
                  <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                    {t(
                      'storefront.footer.menu_columns.empty',
                      'No footer columns yet. Add your first column to start building the footer menu.'
                    )}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social_widgets" className="space-y-6 mt-0">
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
                {draft.socialLinks.length > 0 ? (
                  draft.socialLinks.map((link, index) => (
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
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 text-center">
                    {t('storefront.footer.social.empty', 'No social links added yet.')}
                  </p>
                )}
              </div>
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
              />
              {widgetDraft.enabled && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                      {t('storefront.footer.widget.title', 'Block title')}
                      <Input
                        value={widgetDraft.title || ''}
                        onChange={(event) => handleWidgetUpdate({ title: event.target.value })}
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
                  <Toggle
                    checked={widgetDraft.showGoogleMap}
                    onChange={(checked) => handleWidgetUpdate({ showGoogleMap: checked })}
                    label={t('storefront.footer.widget.show_google', 'Show Google Maps embed')}
                  />
                  {widgetDraft.showGoogleMap && (
                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                      {t('storefront.footer.widget.map_url', 'Google Maps embed URL')}
                      <Input
                        value={widgetDraft.googleMapEmbedUrl || ''}
                        onChange={(event) => handleWidgetUpdate({ googleMapEmbedUrl: event.target.value })}
                        placeholder="https://www.google.com/maps/embed?pb=..."
                        className="text-sm"
                      />
                    </label>
                  )}
                  <Toggle
                    checked={widgetDraft.showFacebookPage}
                    onChange={(checked) => handleWidgetUpdate({ showFacebookPage: checked })}
                    label={t('storefront.footer.widget.show_facebook', 'Show Facebook fanpage')}
                  />
                  {widgetDraft.showFacebookPage && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex flex-col gap-1 text-sm text-gray-600 md:col-span-2">
                        {t('storefront.footer.widget.facebook_url', 'Facebook fanpage URL')}
                        <Input
                          value={widgetDraft.facebookPageUrl || ''}
                          onChange={(event) => handleWidgetUpdate({ facebookPageUrl: event.target.value })}
                          className="text-sm"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm text-gray-600">
                        {t('storefront.footer.widget.facebook_tabs', 'Tabs (optional)')}
                        <Input
                          value={widgetDraft.facebookTabs || ''}
                          onChange={(event) => handleWidgetUpdate({ facebookTabs: event.target.value })}
                          className="text-sm"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-0">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('storefront.footer.visitor_analytics.heading', 'Visitor analytics bar')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('storefront.footer.visitor_analytics.enable_hint', 'Display daily visitors, page views, or other metrics above the footer.')}
                </p>
              </div>
              <Toggle
                checked={visitorAnalyticsDraft.enabled}
                onChange={(checked) => handleVisitorAnalyticsToggle(checked)}
                label={t('storefront.footer.visitor_analytics.enable', 'Show visitor analytics')}
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
                    <div className="space-y-1">
                      <ColorSelector
                        label={t('storefront.footer.visitor_analytics.background', 'Background color')}
                        value={visitorAnalyticsDraft.backgroundColor || ''}
                        onChange={handleVisitorAnalyticsBackgroundChange}
                        placeholder="#0F172A or rgba(15,23,42,0.95)"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <ColorSelector
                      label={t('storefront.footer.visitor_analytics.card_bg', 'Card background color')}
                      value={visitorAnalyticsDraft.cardBackgroundColor || ''}
                      onChange={handleVisitorAnalyticsCardBackgroundChange}
                      placeholder="#1E293B or rgba(30,41,59,0.5)"
                    />
                    <ColorSelector
                      label={t('storefront.footer.visitor_analytics.card_text', 'Card text color')}
                      value={visitorAnalyticsDraft.cardTextColor || ''}
                      onChange={handleVisitorAnalyticsCardTextChange}
                      placeholder="#FFFFFF"
                    />
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
                            >
                              <FiArrowUp />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveVisitorAnalyticsCard(index, 1)}
                              disabled={index === visitorAnalyticsDraft.cards.length - 1}
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
          </TabsContent>

          <TabsContent value="preview" className="space-y-6 mt-0">
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
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 text-center">
                  {t('storefront.footer.preview.missing_origin', 'Set NEXT_PUBLIC_SITE_URL to enable preview.')}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <MediaManager
          isOpen={isLogoMediaManagerOpen}
          onClose={() => setIsLogoMediaManagerOpen(false)}
          onSelect={handleLogoMediaSelect}
          accept="image/*"
        />
      </div>
    );
  }
);

export default FooterSettingsForm;
