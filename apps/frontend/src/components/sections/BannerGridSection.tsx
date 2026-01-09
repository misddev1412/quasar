'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { SectionTranslationContent } from './HeroSlider';
import SectionContainer from './SectionContainer';

type BannerLinkType = 'custom' | 'category' | 'product';

export interface BannerCardLink {
  href?: string;
  label?: string;
  target?: '_self' | '_blank';
  type?: BannerLinkType;
  referenceId?: string;
}

export type BannerLabelTextTransform = 'none' | 'uppercase' | 'capitalize' | 'lowercase';

export interface BannerCardConfig {
  id?: string;
  imageUrl?: string;
  link?: BannerCardLink;
}

export interface BannerGridConfig {
  cardCount?: number;
  cards?: BannerCardConfig[];
  cardBorderRadius?: string;
  cardGap?: string;
  labelBgColorLight?: string;
  labelBgColorDark?: string;
  labelTextColorLight?: string;
  labelTextColorDark?: string;
  labelTextTransform?: BannerLabelTextTransform;
}

interface BannerGridSectionProps {
  config: BannerGridConfig;
  translation?: SectionTranslationContent | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getGridClass = (count: number) => {
  switch (count) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-1 sm:grid-cols-2';
    case 3:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    default:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  }
};

const DEFAULT_CARD_RADIUS = '1.5rem';
const DEFAULT_CARD_GAP = '1.5rem';

const sanitizeDimension = (value?: string, fallback?: string) => {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const sanitizeColorValue = (value?: string) => {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '';
};

const isLabelTextTransform = (value?: string): value is BannerLabelTextTransform => {
  return value === 'none' || value === 'uppercase' || value === 'capitalize' || value === 'lowercase';
};

const LABEL_TEXT_TRANSFORM_CLASSES: Record<BannerLabelTextTransform, string> = {
  none: '',
  uppercase: 'uppercase tracking-wide',
  capitalize: 'capitalize',
  lowercase: 'lowercase',
};

const buildHrefForLink = (link?: BannerCardLink): string | null => {
  if (!link) {
    return null;
  }
  const directHref = typeof link.href === 'string' ? link.href.trim() : '';
  if (directHref) {
    return directHref;
  }
  const referenceId = typeof link.referenceId === 'string' ? link.referenceId.trim() : '';
  if (!referenceId) {
    return null;
  }
  switch (link.type) {
    case 'category':
      return `/categories/${referenceId}`;
    case 'product':
      return `/products/${referenceId}`;
    default:
      return referenceId || null;
  }
};

export const BannerGridSection: React.FC<BannerGridSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const cards = Array.isArray(config.cards) ? config.cards : [];
  const cardCount = clamp(config.cardCount ?? (cards.length || 1), 1, 4);
  const cardsToRender = cards.slice(0, cardCount);
  const validCards = cardsToRender.filter((card) => typeof card?.imageUrl === 'string' && card.imageUrl.trim().length > 0);
  const hasCards = validCards.length > 0;
  const cardBorderRadius = sanitizeDimension(config.cardBorderRadius, DEFAULT_CARD_RADIUS);
  const gridGap = sanitizeDimension(config.cardGap, DEFAULT_CARD_GAP);
  const labelBgColorLight = sanitizeColorValue(config.labelBgColorLight);
  const labelBgColorDark = sanitizeColorValue(config.labelBgColorDark);
  const labelTextColorLight = sanitizeColorValue(config.labelTextColorLight);
  const labelTextColorDark = sanitizeColorValue(config.labelTextColorDark);
  const labelTextTransform = isLabelTextTransform(config.labelTextTransform) ? config.labelTextTransform : 'none';

  const labelBadgeStyleVars: React.CSSProperties & { [key: `--${string}`]: string } = {};
  if (labelBgColorLight) {
    labelBadgeStyleVars['--banner-label-bg-light'] = labelBgColorLight;
  }
  if (labelBgColorDark) {
    labelBadgeStyleVars['--banner-label-bg-dark'] = labelBgColorDark;
  }
  if (labelTextColorLight) {
    labelBadgeStyleVars['--banner-label-text-light'] = labelTextColorLight;
  }
  if (labelTextColorDark) {
    labelBadgeStyleVars['--banner-label-text-dark'] = labelTextColorDark;
  }

  const labelBadgeClassName = [
    'inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold shadow',
    labelBgColorLight ? 'bg-[var(--banner-label-bg-light)]' : 'bg-white/90',
    labelBgColorDark ? 'dark:bg-[var(--banner-label-bg-dark)]' : '',
    labelTextColorLight ? 'text-[var(--banner-label-text-light)]' : 'text-gray-900',
    labelTextColorDark ? 'dark:text-[var(--banner-label-text-dark)]' : '',
    LABEL_TEXT_TRANSFORM_CLASSES[labelTextTransform],
  ]
    .filter(Boolean)
    .join(' ');

  // null means field is hidden by admin, undefined/empty means visible but no value
  const sectionTitle = translation?.title === null ? '' : (translation?.title || t('sections.banner.title'));
  const sectionSubtitle = translation?.subtitle === null ? '' : (translation?.subtitle || t('sections.banner.subtitle'));
  const sectionDescription = translation?.description === null ? '' : (translation?.description || t('sections.banner.description'));
  const hasHeaderContent = sectionTitle || sectionSubtitle || sectionDescription;

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-950">
      <SectionContainer>
        {hasHeaderContent && (
          <div className="mb-10 max-w-3xl">
            {sectionSubtitle && <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">{sectionSubtitle}</p>}
            {sectionTitle && <h2 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">{sectionTitle}</h2>}
            {sectionDescription && <p className="mt-3 text-base text-gray-600 dark:text-gray-400">{sectionDescription}</p>}
          </div>
        )}

        {!hasCards ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('sections.banner.empty')}
          </div>
        ) : (
          <div
            className={`
              flex flex-nowrap overflow-x-auto snap-mandatory snap-x -mx-4 px-4 pb-6 gap-4
              [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']
              lg:grid lg:mx-0 lg:px-0 lg:pb-0 lg:gap-6
              ${getGridClass(validCards.length)}
            `}
            style={{ gap: gridGap }}
          >
            {validCards.map((card, idx) => {
              const imageUrl = (card.imageUrl || '').trim();
              const link = card.link;
              const href = buildHrefForLink(link);
              const label = link?.label && link.label.trim().length > 0 ? link.label.trim() : t('sections.banner.cta');
              const target = link?.target === '_blank' ? '_blank' : '_self';

              const imageElement = (
                <div
                  className="relative aspect-[3/1] lg:aspect-[4/3] w-full overflow-hidden bg-gray-900 shadow-xl"
                  style={{ borderRadius: cardBorderRadius }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
                    <span className={labelBadgeClassName} style={labelBadgeStyleVars}>
                      {label}
                    </span>
                  </div>
                </div>
              );

              return (
                <article
                  key={card.id || `banner-card-${idx}`}
                  className="w-full min-w-full snap-center flex-shrink-0"
                >
                  {href ? (
                    target === '_blank' ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
                        {imageElement}
                      </a>
                    ) : (
                      <Link href={href} className="block h-full">
                        {imageElement}
                      </Link>
                    )
                  ) : (
                    imageElement
                  )}
                </article>
              );
            })}
          </div>
        )}
      </SectionContainer>
    </section>
  );
};

export default BannerGridSection;
