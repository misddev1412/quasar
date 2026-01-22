import React from 'react';
import { SectionType } from '@shared/enums/section.enums';
import type { ViewMoreButtonConfig } from '@shared/types/component.types';
import type { ApiResponse } from '../../types/api';
import { serverTrpc } from '../../utils/trpc-server';
import {
  HeroSlider,
  ProductListSection,
  FeaturedProducts,
  ProductsByCategory,
  NewsSection,
  CustomHtmlSection,
  CTABannerSection,
  BannerGridSection,
  SideBannersSection,
  FeaturesSection,
  TestimonialsSection,
  VideoSection,
  StatsSection,
  GallerySection,
  ContactFormSection,
  BrandShowcaseSection,
  WhyChooseUsSection,
  ServiceListSection,
  TeamSection,
  ProductDetailsSection,
  NewsDetailsSection,
  IntroductionSection,
} from '.';
import type { SectionListItem } from '../../types/sections';
import type { ProductsByCategorySidebarConfig } from './ProductsByCategory';

const sectionComponentMap: Record<SectionType, React.ComponentType<any>> = {
  [SectionType.HERO_SLIDER]: HeroSlider,
  [SectionType.PRODUCT_LIST]: ProductListSection,
  [SectionType.FEATURED_PRODUCTS]: FeaturedProducts,
  [SectionType.PRODUCTS_BY_CATEGORY]: ProductsByCategory,
  [SectionType.NEWS]: NewsSection,
  [SectionType.CUSTOM_HTML]: CustomHtmlSection,
  [SectionType.BANNER]: BannerGridSection,
  [SectionType.SIDE_BANNERS]: SideBannersSection,
  [SectionType.CTA]: CTABannerSection,
  [SectionType.FEATURES]: FeaturesSection,
  [SectionType.TESTIMONIALS]: TestimonialsSection,
  [SectionType.VIDEO]: VideoSection,
  [SectionType.STATS]: StatsSection,
  [SectionType.GALLERY]: GallerySection,
  [SectionType.CONTACT_FORM]: ContactFormSection,
  [SectionType.BRAND_SHOWCASE]: BrandShowcaseSection,
  [SectionType.WHY_CHOOSE_US]: WhyChooseUsSection,
  [SectionType.SERVICE_LIST]: ServiceListSection,
  [SectionType.TEAM]: TeamSection,
  [SectionType.PRODUCT_DETAILS]: ProductDetailsSection,
  [SectionType.NEWS_DETAILS]: NewsDetailsSection,
  [SectionType.INTRODUCTION]: IntroductionSection,
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

async function fetchProductsByCategorySidebarConfig(): Promise<ProductsByCategorySidebarConfig | undefined> {
  try {
    const apiResponse = (await serverTrpc.clientComponentConfigs.listByKeys.query({
      componentKeys: ['products_by_category'],
    })) as ApiResponse<ComponentConfigResponse[]> | undefined;
    const items = apiResponse?.data ?? [];
    const config = items.find((item) => item.componentKey === 'products_by_category');
    const rawDefault = config?.defaultConfig ?? null;

    if (rawDefault && typeof rawDefault === 'object') {
      const sidebar = (rawDefault as { sidebar?: ProductsByCategorySidebarConfig | null }).sidebar;
      if (sidebar && typeof sidebar === 'object') {
        return sidebar;
      }
    }

    return undefined;
  } catch (error) {
    console.error('Failed to fetch ProductsByCategory sidebar config:', error);
    return undefined;
  }
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
  const [viewMoreButtonConfig, productsByCategorySidebarConfig] = await Promise.all([
    fetchViewMoreButtonConfig(),
    fetchProductsByCategorySidebarConfig(),
  ]);

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
          {...(section.type === SectionType.PRODUCTS_BY_CATEGORY && {
            sidebarConfigOverride: productsByCategorySidebarConfig,
          })}
        />
      );
    })
    .filter(Boolean) as React.ReactNode[];
};

export { sectionComponentMap };
