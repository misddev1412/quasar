import { SectionType } from '@shared/enums/section.enums';
import {
  HeroSliderConfig,
  ProductListSectionConfig,
  FeaturedProductsConfig,
  ProductsByCategoryConfig,
  NewsSectionConfig,
  CustomHtmlConfig,
  CTABannerConfig,
  BannerGridConfig,
  SideBannersConfig,
  FeaturesSectionConfig,
  TestimonialsSectionConfig,
  VideoSectionConfig,
  StatsSectionConfig,
  GallerySectionConfig,
  ContactFormConfig,
  SectionTranslationContent,
  BrandShowcaseConfig,
  WhyChooseUsConfig,
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
  [SectionType.PRODUCT_LIST]: ProductListSectionConfig;
  [SectionType.FEATURED_PRODUCTS]: FeaturedProductsConfig;
  [SectionType.PRODUCTS_BY_CATEGORY]: ProductsByCategoryConfig;
  [SectionType.NEWS]: NewsSectionConfig;
  [SectionType.CUSTOM_HTML]: CustomHtmlConfig;
  [SectionType.CTA]: CTABannerConfig;
  [SectionType.BANNER]: BannerGridConfig;
  [SectionType.SIDE_BANNERS]: SideBannersConfig;
  [SectionType.FEATURES]: FeaturesSectionConfig;
  [SectionType.TESTIMONIALS]: TestimonialsSectionConfig;
  [SectionType.VIDEO]: VideoSectionConfig;
  [SectionType.STATS]: StatsSectionConfig;
  [SectionType.GALLERY]: GallerySectionConfig;
  [SectionType.CONTACT_FORM]: ContactFormConfig;
  [SectionType.BRAND_SHOWCASE]: BrandShowcaseConfig;
  [SectionType.WHY_CHOOSE_US]: WhyChooseUsConfig;
};

export type SectionConfigByType<T extends SectionType> = SectionComponentConfigMap[T];
