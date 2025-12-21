import React from 'react';
import { SectionType } from '@shared/enums/section.enums';
import type { ViewMoreButtonConfig } from '@shared/types/component.types';
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
  BrandShowcaseSection,
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
  [SectionType.BRAND_SHOWCASE]: BrandShowcaseSection,
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

async function fetchViewMoreButtonConfig(): Promise<ViewMoreButtonConfig | undefined> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/trpc/clientComponentConfigs.getByKey?input=${encodeURIComponent(JSON.stringify({ componentKey: 'view_more_button' }))}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();
    return data?.result?.data?.defaultConfig?.viewMoreButton as ViewMoreButtonConfig | undefined;
  } catch (error) {
    console.error('Failed to fetch ViewMoreButton config:', error);
    return undefined;
  }
}

export const renderSections = async (sections: SectionListItem[]): Promise<React.ReactNode[]> => {
  const viewMoreButtonConfig = await fetchViewMoreButtonConfig();

  return sections
    .map((section) => {
      const Component = sectionComponentMap[section.type as SectionType];
      if (!Component) {
        return null;
      }

      const translation = buildTranslationPayload(section);

      // Pass viewMoreButtonConfig to sections that support it
      const shouldPassButtonConfig = [
        SectionType.FEATURED_PRODUCTS,
        SectionType.NEWS,
        SectionType.PRODUCTS_BY_CATEGORY,
      ].includes(section.type as SectionType);

      return (
        <Component
          key={section.id}
          config={section.config as Record<string, unknown>}
          translation={translation}
          {...(shouldPassButtonConfig && { viewMoreButtonConfig })}
        />
      );
    })
    .filter(Boolean) as React.ReactNode[];
};

export { sectionComponentMap };
