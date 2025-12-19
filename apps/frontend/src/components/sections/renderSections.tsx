import React from 'react';
import { SectionType } from '@shared/enums/section.enums';
import {
  HeroSlider,
  FeaturedProducts,
  ProductsByCategory,
  NewsSection,
  CustomHtmlSection,
  CTABannerSection,
  BannerGridSection,
  FeaturesSection,
  TestimonialsSection,
  VideoSection,
  StatsSection,
  GallerySection,
  ContactFormSection,
} from '.';
import type { SectionListItem } from '../../types/sections';

const sectionComponentMap: Record<SectionType, React.ComponentType<any>> = {
  [SectionType.HERO_SLIDER]: HeroSlider,
  [SectionType.FEATURED_PRODUCTS]: FeaturedProducts,
  [SectionType.PRODUCTS_BY_CATEGORY]: ProductsByCategory,
  [SectionType.NEWS]: NewsSection,
  [SectionType.CUSTOM_HTML]: CustomHtmlSection,
  [SectionType.BANNER]: BannerGridSection,
  [SectionType.CTA]: CTABannerSection,
  [SectionType.FEATURES]: FeaturesSection,
  [SectionType.TESTIMONIALS]: TestimonialsSection,
  [SectionType.VIDEO]: VideoSection,
  [SectionType.STATS]: StatsSection,
  [SectionType.GALLERY]: GallerySection,
  [SectionType.CONTACT_FORM]: ContactFormSection,
};

const buildTranslationPayload = (section: SectionListItem) => {
  if (!section.translation) {
    return undefined;
  }

  const { title, subtitle, description, heroDescription } = section.translation;
  const fieldVisibility = (section.config as Record<string, unknown>)?.fieldVisibility as Record<string, boolean> | undefined;

  return {
    title: fieldVisibility?.title === false ? null : (title ?? undefined),
    subtitle: fieldVisibility?.subtitle === false ? null : (subtitle ?? undefined),
    description: fieldVisibility?.description === false ? null : (description ?? undefined),
    heroDescription: fieldVisibility?.heroDescription === false ? null : (heroDescription ?? undefined),
  };
};

export const renderSections = (sections: SectionListItem[]): React.ReactNode[] =>
  sections
    .map((section) => {
      const Component = sectionComponentMap[section.type as SectionType];
      if (!Component) {
        return null;
      }

      const translation = buildTranslationPayload(section);

      return (
        <Component
          key={section.id}
          config={section.config as Record<string, unknown>}
          translation={translation}
        />
      );
    })
    .filter(Boolean) as React.ReactNode[];

export { sectionComponentMap };
