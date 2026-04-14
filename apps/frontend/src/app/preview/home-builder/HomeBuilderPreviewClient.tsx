'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Layout from '../../../components/layout/Layout';
import { trpc } from '../../../utils/trpc';
import { SectionType } from '@shared/enums/section.enums';
import type { ViewMoreButtonConfig } from '@shared/types/component.types';
import type { BuilderSelectSectionMessage, DraftSectionState } from '@shared/types/storefront-builder.types';
import type { ApiResponse } from '../../../types/api';
import type { SectionListItem } from '../../../types/sections';
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
  VideoGridSection,
} from '../../../components/sections';
import type { ProductsByCategorySidebarConfig } from '../../../components/sections/ProductsByCategory';
import { isAllowedOrigin, parseBuilderSyncDraftMessage } from '../../../utils/storefront-home-builder';

type ComponentConfigResponse = {
  componentKey: string;
  defaultConfig?: Record<string, unknown> | null;
};

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
  [SectionType.VIDEO_GRID]: VideoGridSection,
};

const parseNonNegativeInteger = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return null;
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

const toSectionFromDraft = (section: DraftSectionState, locale: string): SectionListItem => {
  const translationByLocale = section.translations || {};
  const translation = translationByLocale[locale] || translationByLocale.en || translationByLocale.vi || undefined;
  return {
    id: section.id,
    page: section.page,
    type: section.type,
    position: section.position,
    config: section.config || {},
    version: 0,
    updatedAt: '',
    translation: translation ? {
      locale,
      title: translation.title ?? null,
      subtitle: translation.subtitle ?? null,
      description: translation.description ?? null,
      heroDescription: translation.heroDescription ?? null,
    } : null,
  };
};

const HomeBuilderPreviewClient: React.FC = () => {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const adminOriginParam = searchParams?.get('adminOrigin') || '';

  const [draftSections, setDraftSections] = useState<DraftSectionState[] | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const sectionsQuery = trpc.sections.list.useQuery<ApiResponse<SectionListItem[]>>({
    page: 'home',
    locale,
  });

  const componentConfigQuery = trpc.clientComponentConfigs.listByKeys.useQuery<ApiResponse<ComponentConfigResponse[]>>({
    componentKeys: ['view_more_button', 'products_by_category'],
  });

  const componentConfigData = componentConfigQuery.data?.data || [];
  const viewMoreButtonConfig = useMemo(() => {
    const viewMore = componentConfigData.find((item) => item.componentKey === 'view_more_button');
    const rawDefault = viewMore?.defaultConfig ?? null;
    if (!rawDefault || typeof rawDefault !== 'object') {
      return undefined;
    }
    const nested = (rawDefault as { viewMoreButton?: ViewMoreButtonConfig | null }).viewMoreButton;
    return (nested && typeof nested === 'object' ? nested : rawDefault) as ViewMoreButtonConfig;
  }, [componentConfigData]);

  const productsByCategorySidebarConfig = useMemo(() => {
    const productsByCategory = componentConfigData.find((item) => item.componentKey === 'products_by_category');
    const rawDefault = productsByCategory?.defaultConfig ?? null;
    if (!rawDefault || typeof rawDefault !== 'object') {
      return undefined;
    }
    const sidebar = (rawDefault as { sidebar?: ProductsByCategorySidebarConfig | null }).sidebar;
    if (!sidebar || typeof sidebar !== 'object') {
      return undefined;
    }
    return sidebar;
  }, [componentConfigData]);

  const liveSections = useMemo(() => {
    const items = sectionsQuery.data?.data || [];
    return [...items].sort((a, b) => a.position - b.position);
  }, [sectionsQuery.data?.data]);

  const sections = useMemo(() => {
    if (!draftSections || draftSections.length === 0) {
      return liveSections;
    }
    return [...draftSections]
      .sort((a, b) => a.position - b.position)
      .map((item) => toSectionFromDraft(item, locale));
  }, [draftSections, liveSections, locale]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!adminOriginParam || !isAllowedOrigin(event.origin, adminOriginParam)) {
        return;
      }
      const message = parseBuilderSyncDraftMessage(event.data);
      if (!message || message.payload.page !== 'home') {
        return;
      }
      setDraftSections(message.payload.draft.sections);
      setSelectedSectionId(message.payload.selectedSectionId || null);
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [adminOriginParam]);

  const notifySectionSelected = (sectionId: string | null) => {
    const message: BuilderSelectSectionMessage = {
      type: 'BUILDER_SELECT_SECTION',
      payload: { page: 'home', sectionId },
    };
    const targetOrigin = adminOriginParam || '*';
    window.parent.postMessage(message, targetOrigin);
  };

  return (
    <Layout>
      <div className="flex flex-col">
        {sections.map((section, index) => {
          const Component = sectionComponentMap[section.type as SectionType];
          if (!Component) {
            return null;
          }

          const translation = buildTranslationPayload(section);
          const shouldPassButtonConfig = [
            SectionType.FEATURED_PRODUCTS,
            SectionType.NEWS,
            SectionType.PRODUCTS_BY_CATEGORY,
          ].includes(section.type as SectionType);

          const spacing = parseNonNegativeInteger((section.config as Record<string, unknown>)?.sectionSpacing);
          const isLastSection = index === sections.length - 1;
          const wrapperStyle: React.CSSProperties | undefined = !isLastSection && spacing !== null
            ? { paddingBottom: `${spacing}px` }
            : undefined;

          return (
            <div
              key={section.id}
              data-section-id={section.id}
              style={wrapperStyle}
              onClickCapture={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSelectedSectionId(section.id);
                notifySectionSelected(section.id);
              }}
              className={selectedSectionId === section.id ? 'ring-2 ring-primary-500 ring-offset-2' : undefined}
            >
              <Component
                config={section.config as Record<string, unknown>}
                translation={translation}
                {...(shouldPassButtonConfig && { viewMoreButtonConfig })}
                {...(section.type === SectionType.PRODUCTS_BY_CATEGORY && {
                  sidebarConfigOverride: productsByCategorySidebarConfig,
                })}
              />
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default HomeBuilderPreviewClient;
