import { SectionType } from '@shared/enums/section.enums';
import {
  HeroSliderConfig,
  FeaturedProductsConfig,
  ProductsByCategoryConfig,
  NewsSectionConfig,
  CustomHtmlConfig,
  CTABannerConfig,
  BannerGridConfig,
  FeaturesSectionConfig,
  TestimonialsSectionConfig,
  VideoSectionConfig,
  StatsSectionConfig,
  GallerySectionConfig,
  ContactFormConfig,
  SectionTranslationContent,
  BrandShowcaseConfig,
} from '../components/sections';

export interface SectionTranslation extends SectionTranslationContent {
  locale?: string | null;
  heroDescription?: string | null;
}

export interface SectionListItem {
  id: string;
  page: string;
  type: SectionType;
  position: number;
  config: Record<string, unknown>;
  translation?: SectionTranslation | null;
  version: number;
  updatedAt: string;
}

export type SectionComponentConfigMap = {
  [SectionType.HERO_SLIDER]: HeroSliderConfig;
  [SectionType.FEATURED_PRODUCTS]: FeaturedProductsConfig;
  [SectionType.PRODUCTS_BY_CATEGORY]: ProductsByCategoryConfig;
  [SectionType.NEWS]: NewsSectionConfig;
  [SectionType.CUSTOM_HTML]: CustomHtmlConfig;
  [SectionType.CTA]: CTABannerConfig;
  [SectionType.BANNER]: BannerGridConfig;
  [SectionType.FEATURES]: FeaturesSectionConfig;
  [SectionType.TESTIMONIALS]: TestimonialsSectionConfig;
  [SectionType.VIDEO]: VideoSectionConfig;
  [SectionType.STATS]: StatsSectionConfig;
  [SectionType.GALLERY]: GallerySectionConfig;
  [SectionType.CONTACT_FORM]: ContactFormConfig;
  [SectionType.BRAND_SHOWCASE]: BrandShowcaseConfig;
};

export type SectionConfigByType<T extends SectionType> = SectionComponentConfigMap[T];
