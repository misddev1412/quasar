export enum SectionPage {
  HOME = 'home',
  NEWS = 'news',
  PRODUCT = 'product',
}

export enum SectionType {
  HERO_SLIDER = 'hero_slider',
  FEATURED_PRODUCTS = 'featured_products',
  PRODUCTS_BY_CATEGORY = 'products_by_category',
  NEWS = 'news',
  CUSTOM_HTML = 'custom_html',
}

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  [SectionType.HERO_SLIDER]: 'Hero Slider',
  [SectionType.FEATURED_PRODUCTS]: 'Featured Products',
  [SectionType.PRODUCTS_BY_CATEGORY]: 'Products by Category',
  [SectionType.NEWS]: 'News',
  [SectionType.CUSTOM_HTML]: 'Custom HTML',
};
