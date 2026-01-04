import React from 'react';
import { SectionType } from '@shared/enums/section.enums';
import type { ViewMoreButtonConfig } from '@shared/types/component.types';
import type { ApiResponse } from '../../types/api';
import { serverTrpc } from '../../utils/trpc-server';
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
  WhyChooseUsSection,
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
  [SectionType.WHY_CHOOSE_US]: WhyChooseUsSection,
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

interface ComponentConfigResponse {
  componentKey: string;
  defaultConfig?: Record<string, unknown> | null;
}

async function fetchViewMoreButtonConfig(): Promise<ViewMoreButtonConfig | undefined> {
  try {
    const apiResponse = (await serverTrpc.clientComponentConfigs.listByKeys.query({
      componentKeys: ['view_more_button'],
    })) as ApiResponse<ComponentConfigResponse[]> | undefined;
    const items = apiResponse?.data ?? [];
    const viewMoreConfig = items.find((item) => item.componentKey === 'view_more_button');
    const rawDefault = viewMoreConfig?.defaultConfig ?? null;

    if (rawDefault && typeof rawDefault === 'object') {
      const nestedConfig = (rawDefault as { viewMoreButton?: ViewMoreButtonConfig | null }).viewMoreButton;
      if (nestedConfig && typeof nestedConfig === 'object') {
        return nestedConfig;
      }
      return rawDefault as ViewMoreButtonConfig;
    }

    return undefined;
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
