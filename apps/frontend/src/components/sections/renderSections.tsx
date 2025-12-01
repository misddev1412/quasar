import React from 'react';
import { SectionType } from '@shared/enums/section.enums';
import {
  HeroSlider,
  FeaturedProducts,
  ProductsByCategory,
  NewsSection,
  CustomHtmlSection,
  CTABannerSection,
} from '.';
import type { SectionListItem } from '../../types/sections';

const sectionComponentMap: Record<SectionType, React.ComponentType<any>> = {
  [SectionType.HERO_SLIDER]: HeroSlider,
  [SectionType.FEATURED_PRODUCTS]: FeaturedProducts,
  [SectionType.PRODUCTS_BY_CATEGORY]: ProductsByCategory,
  [SectionType.NEWS]: NewsSection,
  [SectionType.CUSTOM_HTML]: CustomHtmlSection,
  [SectionType.CTA]: CTABannerSection,
};

const buildTranslationPayload = (section: SectionListItem) => {
  if (!section.translation) {
    return undefined;
  }

  const { title, subtitle, description, heroDescription } = section.translation;
  return {
    title: title ?? undefined,
    subtitle: subtitle ?? undefined,
    description: description ?? undefined,
    heroDescription: heroDescription ?? undefined,
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
