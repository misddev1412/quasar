export interface OgMetaField {
  metaKey: string;
  labelKey: string;
  fallbackLabel: string;
}

export const OG_META_FIELDS: OgMetaField[] = [
  { metaKey: 'og:title', labelKey: 'ogTitle', fallbackLabel: 'OG Title' },
  { metaKey: 'og:description', labelKey: 'ogDescription', fallbackLabel: 'OG Description' },
  { metaKey: 'og:image', labelKey: 'ogImage', fallbackLabel: 'OG Image URL' },
  { metaKey: 'og:url', labelKey: 'ogUrl', fallbackLabel: 'OG URL' },
  { metaKey: 'og:type', labelKey: 'ogType', fallbackLabel: 'OG Type' },
  { metaKey: 'og:locale', labelKey: 'ogLocale', fallbackLabel: 'OG Locale' },
];
