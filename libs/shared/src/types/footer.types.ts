export type FooterVariant = 'simple' | 'columns' | 'split';
export type FooterTheme = 'light' | 'dark';
export type FooterMenuLayout = 'inline' | 'columns';
export type FooterBrandLayout = 'inline' | 'stacked';

export type FooterSocialType =
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'tiktok'
  | 'github'
  | 'custom';

export type FooterWidgetType = 'google_map' | 'facebook_page';

export interface FooterSocialLink {
  id: string;
  label: string;
  url: string;
  type: FooterSocialType;
  order: number;
  isActive: boolean;
}

export interface FooterWidgetConfig {
  enabled: boolean;
  type: FooterWidgetType;
  title?: string;
  description?: string;
  height?: number;
  googleMapEmbedUrl?: string;
  facebookPageUrl?: string;
  facebookTabs?: string;
}

export interface FooterExtraLink {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
}

export type VisitorAnalyticsMetricType = 'visitors' | 'pageViews' | 'topPage' | 'lastUpdated';

export interface VisitorAnalyticsCardConfig {
  id: string;
  metric: VisitorAnalyticsMetricType;
}

export interface VisitorAnalyticsConfig {
  enabled: boolean;
  columns: number;
  backgroundColor?: string;
  cards: VisitorAnalyticsCardConfig[];
}

export interface FooterConfig {
  variant: FooterVariant;
  theme: FooterTheme;
  brandDescription: string;
  brandTitle?: string;
  showBrandLogo: boolean;
  showBrandTitle: boolean;
  showBrandDescription: boolean;
  brandLayout?: FooterBrandLayout;
  menuLayout: FooterMenuLayout;
  columnsPerRow: number;
  socialLinks: FooterSocialLink[];
  extraLinks: FooterExtraLink[];
  showNewsletter: boolean;
  newsletterHeading?: string;
  newsletterDescription?: string;
  customHtml?: string;
  logoUrl?: string;
  logoSize?: number;
  backgroundColor?: string;
  textColor?: string;
  widget?: FooterWidgetConfig;
  visitorAnalytics?: VisitorAnalyticsConfig;
}

const DEFAULT_WIDGET_CONFIG: FooterWidgetConfig = {
  enabled: false,
  type: 'google_map',
  title: '',
  description: '',
  height: 280,
  googleMapEmbedUrl: '',
  facebookPageUrl: '',
  facebookTabs: 'timeline',
};

const DEFAULT_VISITOR_ANALYTICS_CARDS: VisitorAnalyticsCardConfig[] = [
  { id: 'visitors', metric: 'visitors' },
  { id: 'pageViews', metric: 'pageViews' },
  { id: 'topPage', metric: 'topPage' },
  { id: 'lastUpdated', metric: 'lastUpdated' },
];

export const DEFAULT_VISITOR_ANALYTICS_CONFIG: VisitorAnalyticsConfig = {
  enabled: true,
  columns: 4,
  backgroundColor: '',
  cards: DEFAULT_VISITOR_ANALYTICS_CARDS,
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  variant: 'columns',
  theme: 'dark',
  brandDescription: 'Discover curated products, helpful resources, and dedicated support from our team.',
  brandTitle: '',
  showBrandLogo: true,
  showBrandTitle: true,
  showBrandDescription: true,
  brandLayout: 'inline',
  menuLayout: 'columns',
  columnsPerRow: 3,
  socialLinks: [
    {
      id: 'facebook',
      label: 'Facebook',
      url: 'https://facebook.com',
      type: 'facebook',
      order: 0,
      isActive: true,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      url: 'https://instagram.com',
      type: 'instagram',
      order: 1,
      isActive: true,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      url: 'https://linkedin.com',
      type: 'linkedin',
      order: 2,
      isActive: true,
    },
  ],
  extraLinks: [
    {
      id: 'privacy',
      label: 'Privacy Policy',
      url: '/privacy',
      order: 0,
      isActive: true,
    },
    {
      id: 'terms',
      label: 'Terms of Service',
      url: '/terms',
      order: 1,
      isActive: true,
    },
    {
      id: 'cookies',
      label: 'Cookie Policy',
      url: '/cookies',
      order: 2,
      isActive: true,
    },
  ],
  showNewsletter: false,
  newsletterHeading: 'Stay in the loop',
  newsletterDescription: 'Join our newsletter to get updates about new products and special offers.',
  customHtml: '',
  logoUrl: '',
  logoSize: 48,
  backgroundColor: '',
  textColor: '',
  widget: DEFAULT_WIDGET_CONFIG,
  visitorAnalytics: DEFAULT_VISITOR_ANALYTICS_CONFIG,
};

const VISITOR_ANALYTICS_METRICS: VisitorAnalyticsMetricType[] = [
  'visitors',
  'pageViews',
  'topPage',
  'lastUpdated',
];

const clampVisitorAnalyticsColumns = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return 4;
  }
  return Math.min(4, Math.max(1, Math.round(value)));
};

const clampLogoSize = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return 48;
  }
  return Math.min(160, Math.max(24, Math.round(value)));
};

const isValidBrandLayout = (value?: string): value is FooterBrandLayout => {
  if (!value) {
    return false;
  }
  return value === 'inline' || value === 'stacked';
};

const sanitizeVisitorAnalyticsCards = (
  cards: VisitorAnalyticsCardConfig[] | undefined,
  desiredColumns: number
): VisitorAnalyticsCardConfig[] => {
  const normalized =
    cards && Array.isArray(cards)
      ? cards
          .filter((card): card is VisitorAnalyticsCardConfig => Boolean(card))
          .map((card, index) => ({
            id: card.id || `visitor-card-${index}`,
            metric: VISITOR_ANALYTICS_METRICS.includes(card.metric) ? card.metric : 'visitors',
          }))
      : [];

  const trimmed = normalized.slice(0, desiredColumns);
  if (trimmed.length === desiredColumns) {
    return trimmed;
  }

  const result = [...trimmed];
  for (let index = result.length; index < desiredColumns; index += 1) {
    const metric = VISITOR_ANALYTICS_METRICS[index % VISITOR_ANALYTICS_METRICS.length];
    result.push({
      id: `visitor-card-${index}`,
      metric,
    });
  }
  return result;
};

const withVisitorAnalyticsDefaults = (config?: VisitorAnalyticsConfig): VisitorAnalyticsConfig => {
  const columns = clampVisitorAnalyticsColumns(config?.columns);
  return {
    enabled: config?.enabled !== undefined ? Boolean(config.enabled) : DEFAULT_VISITOR_ANALYTICS_CONFIG.enabled,
    columns,
    backgroundColor: (config?.backgroundColor || '').trim(),
    cards: sanitizeVisitorAnalyticsCards(config?.cards, columns),
  };
};

export const createFooterConfig = (override?: Partial<FooterConfig>): FooterConfig => {
  const base: FooterConfig = {
    ...DEFAULT_FOOTER_CONFIG,
    socialLinks: DEFAULT_FOOTER_CONFIG.socialLinks.map((link) => ({ ...link })),
    extraLinks: DEFAULT_FOOTER_CONFIG.extraLinks.map((link) => ({ ...link })),
    widget: DEFAULT_WIDGET_CONFIG ? { ...DEFAULT_WIDGET_CONFIG } : undefined,
    visitorAnalytics: {
      ...DEFAULT_VISITOR_ANALYTICS_CONFIG,
      cards: DEFAULT_VISITOR_ANALYTICS_CONFIG.cards.map((card) => ({ ...card })),
    },
  };

  if (!override) {
    return base;
  }

  return {
    ...base,
    ...override,
    brandTitle:
      override.brandTitle !== undefined
        ? (override.brandTitle || '').trim()
        : base.brandTitle,
    brandLayout: isValidBrandLayout(override.brandLayout) ? override.brandLayout : base.brandLayout,
    logoSize:
      typeof override.logoSize === 'number'
        ? clampLogoSize(override.logoSize)
        : clampLogoSize(base.logoSize),
    socialLinks: Array.isArray(override.socialLinks)
      ? override.socialLinks
          .filter((link): link is FooterSocialLink => Boolean(link) && typeof link.id === 'string')
          .map((link, index) => ({
            ...link,
            order: typeof link.order === 'number' ? link.order : index,
          }))
      : base.socialLinks,
    extraLinks: Array.isArray(override.extraLinks)
      ? override.extraLinks
          .filter((link): link is FooterExtraLink => Boolean(link) && typeof link.id === 'string')
          .map((link, index) => ({
            ...link,
            order: typeof link.order === 'number' ? link.order : index,
          }))
      : base.extraLinks,
    widget: override.widget
      ? {
          ...DEFAULT_WIDGET_CONFIG,
          ...override.widget,
          height:
            typeof override.widget.height === 'number'
              ? Math.max(160, Math.min(640, Math.round(override.widget.height)))
              : DEFAULT_WIDGET_CONFIG.height,
          googleMapEmbedUrl: override.widget.googleMapEmbedUrl?.trim() || '',
          facebookPageUrl: override.widget.facebookPageUrl?.trim() || '',
          facebookTabs: override.widget.facebookTabs?.trim() || DEFAULT_WIDGET_CONFIG.facebookTabs,
        }
      : base.widget,
    visitorAnalytics: withVisitorAnalyticsDefaults(override.visitorAnalytics ?? base.visitorAnalytics),
  };
};
