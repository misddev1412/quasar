export enum SectionPage {
  HOME = 'home',
  NEWS = 'news',
  PRODUCT = 'product',
  PRODUCT_DETAIL = 'product_detail',
}

export enum SectionType {
  HERO_SLIDER = 'hero_slider',
  FEATURED_PRODUCTS = 'featured_products',
  PRODUCTS_BY_CATEGORY = 'products_by_category',
  NEWS = 'news',
  CUSTOM_HTML = 'custom_html',
  BANNER = 'banner',
  TESTIMONIALS = 'testimonials',
  CTA = 'cta',
  FEATURES = 'features',
  GALLERY = 'gallery',
  TEAM = 'team',
  CONTACT_FORM = 'contact_form',
  VIDEO = 'video',
  STATS = 'stats',
}

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  [SectionType.HERO_SLIDER]: 'Hero Slider',
  [SectionType.FEATURED_PRODUCTS]: 'Featured Products',
  [SectionType.PRODUCTS_BY_CATEGORY]: 'Products by Category',
  [SectionType.NEWS]: 'News',
  [SectionType.CUSTOM_HTML]: 'Custom HTML',
  [SectionType.BANNER]: 'Banner',
  [SectionType.TESTIMONIALS]: 'Testimonials',
  [SectionType.CTA]: 'Call to Action',
  [SectionType.FEATURES]: 'Features/Services',
  [SectionType.GALLERY]: 'Gallery',
  [SectionType.TEAM]: 'Team',
  [SectionType.CONTACT_FORM]: 'Contact Form',
  [SectionType.VIDEO]: 'Video',
  [SectionType.STATS]: 'Statistics',
};
