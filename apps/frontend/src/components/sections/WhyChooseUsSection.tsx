'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SectionTranslationContent } from './HeroSlider';
import SectionContainer from './SectionContainer';
import { SectionHeader, type SectionHeadingStyle, type SectionHeadingTextTransform, type SectionHeadingTitleSize } from './SectionHeader';
import UnifiedIcon from '../common/UnifiedIcon';

export interface WhyChooseUsItemConfig {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  accentColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  iconColor?: string;
  backgroundLight?: string;
  backgroundDark?: string;
}

export interface WhyChooseUsConfig {
  layout?: 'grid';
  columns?: number;
  gap?: string;
  cardPadding?: string;
  uppercaseTitles?: boolean;
  titleClamp?: number;
  descriptionClamp?: number;
  hexagonSize?: string;
  hexagonBorderWidth?: number;
  cardBackground?: string;
  cardBorderColor?: string;
  headingStyle?: SectionHeadingStyle;
  headingBackgroundColor?: string;
  headingTextColor?: string;
  headingTextTransform?: SectionHeadingTextTransform;
  headingTitleSize?: SectionHeadingTitleSize;
  headingBarHeight?: number;
  items?: WhyChooseUsItemConfig[];
}

interface WhyChooseUsSectionProps {
  config: WhyChooseUsConfig;
  translation?: SectionTranslationContent | null;
}

const hexagonShape = 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)';

const parseSizeToPx = (value?: string, fallback = 192) => {
  if (!value) {
    return fallback;
  }
  const numericValue = parseFloat(value);
  if (Number.isNaN(numericValue)) {
    return fallback;
  }
  if (value.includes('rem') || value.includes('em')) {
    return numericValue * 16;
  }
  if (value.includes('px')) {
    return numericValue;
  }
  return numericValue;
};

const fallbackItems: WhyChooseUsItemConfig[] = [
  {
    id: 'why-experience-fallback',
    title: '30+ years of craft',
    description: 'Automotive experts that have shipped fleets for retailers, hospitality, and logistics partners nationwide.',
    icon: 'history',
    accentColor: '#00A0DC',
  },
  {
    id: 'why-sla-fallback',
    title: 'Fastest handovers',
    description: 'Streamlined paperwork plus concierge delivery to keep your team moving.',
    icon: 'timer',
    accentColor: '#00A0DC',
  },
  {
    id: 'why-warranty-fallback',
    title: 'On-site warranty',
    description: 'Certified technicians cover 24/7 support with OEM-grade parts.',
    icon: 'wrench',
    accentColor: '#00A0DC',
  },
  {
    id: 'why-price-fallback',
    title: 'Flexible pricing',
    description: 'Transparent pricing tables and loyalty incentives tailored to your volume.',
    icon: 'piggy-bank',
    accentColor: '#00A0DC',
  },
  {
    id: 'why-engine-fallback',
    title: 'Japanese engines',
    description: 'High-efficiency engines that deliver smooth power and lower maintenance costs.',
    icon: 'gauge',
    accentColor: '#00A0DC',
  },
];

const clampColumns = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 5;
  }
  return Math.min(Math.max(Math.round(value), 1), 6);
};

const sanitizeItems = (items?: WhyChooseUsItemConfig[]) => {
  if (!Array.isArray(items)) {
    return fallbackItems;
  }
  const filtered = items.filter((item) => Boolean(item?.title || item?.description));
  return filtered.length > 0 ? filtered : fallbackItems;
};

const buildGridClass = (columns: number) => {
  if (columns <= 1) {
    return 'grid grid-cols-1';
  }
  if (columns === 2) {
    return 'grid grid-cols-1 sm:grid-cols-2';
  }
  if (columns === 3) {
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }
  if (columns === 4) {
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  }
  if (columns === 5) {
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
  }
  return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
};

const HexagonIcon: React.FC<{
  item: WhyChooseUsItemConfig;
  hexagonSize: string;
  borderWidth: number;
}> = ({ item, hexagonSize, borderWidth }) => {
  const gradientFrom = item.gradientFrom || '#017399';
  const gradientTo = item.gradientTo || '#00A0DC';
  const innerBackground = item.backgroundLight || '#ffffff';
  const iconColor = item.iconColor || item.accentColor || '#00A0DC';

  const hexagonPixelSize = parseSizeToPx(hexagonSize, 192);
  const iconSize = Math.max(32, Math.floor(hexagonPixelSize * 0.3));

  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: hexagonSize, height: hexagonSize }}>
      <div
        className="h-full w-full"
        style={{
          clipPath: hexagonShape,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          padding: borderWidth,
        }}
      >
        <div
          className="flex h-full w-full items-center justify-center dark:bg-slate-900"
          style={{
            clipPath: hexagonShape,
            background: innerBackground,
          }}
        >
          <UnifiedIcon
            icon={item.icon}
            variant="floating"
            size={iconSize}
            color={iconColor}
            style={{ width: '30%', height: '30%' }}
          />
        </div>
      </div>
    </div>
  );
};

const getTitleMinHeight = (shouldUppercase: boolean, clamp: number) => {
  const lineHeightRem = shouldUppercase ? 1.5 : 2;
  const lines = Math.min(Math.max(clamp, 1), 3);
  return `${lineHeightRem * lines}rem`;
};

const WhyChooseUsCard: React.FC<{
  item: WhyChooseUsItemConfig;
  config: WhyChooseUsConfig;
  titleClamp: number;
  descriptionClamp: number;
}> = ({ item, config, titleClamp, descriptionClamp }) => {
  const accentColor = item.accentColor || config.cardBorderColor || '#00A0DC';
  const cardStyles: React.CSSProperties = {
    padding: config.cardPadding || '2rem 1.5rem',
  };

  if (config.cardBackground) {
    cardStyles.background = config.cardBackground;
  }
  if (config.cardBorderColor) {
    cardStyles.borderColor = config.cardBorderColor;
  }

  const titleClampClass = titleClamp > 0 ? `line-clamp-${Math.min(titleClamp, 3)}` : '';
  const clampClass = descriptionClamp > 0 ? `line-clamp-${Math.min(descriptionClamp, 3)}` : '';

  return (
    <article
      className="group relative flex h-full flex-col items-center rounded-[32px] border border-slate-100 bg-white/80 text-center transition hover:-translate-y-2 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60"
      style={cardStyles}
    >
      <div className="flex flex-1 flex-col items-center text-center">
        <HexagonIcon item={item} hexagonSize={config.hexagonSize || '12rem'} borderWidth={config.hexagonBorderWidth ?? 6} />
        {item.title && (
          <h3
            className={`mt-8 text-2xl font-bold tracking-tight text-sky-500 ${config.uppercaseTitles !== false ? 'uppercase tracking-[0.18em] text-base' : ''} ${titleClampClass}`}
            style={{
              color: accentColor,
              minHeight: titleClamp > 0 ? getTitleMinHeight(config.uppercaseTitles !== false, titleClamp) : undefined,
            }}
          >
            {item.title}
          </h3>
        )}
        {item.description && (
          <p className={`mt-4 text-lg text-slate-700 dark:text-slate-300 ${clampClass}`}>
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
};

export const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const columns = clampColumns(config.columns);
  const items = useMemo(() => sanitizeItems(config.items), [config.items]);
  const titleClamp = typeof config.titleClamp === 'number' ? Math.max(0, config.titleClamp) : 2;
  const descriptionClamp = typeof config.descriptionClamp === 'number' ? Math.max(0, config.descriptionClamp) : 3;
  const gridClass = buildGridClass(columns);
  const gridStyle: React.CSSProperties = {};
  if (config.gap) {
    gridStyle.gap = config.gap;
  }

  const sectionTitle = translation?.title === null ? '' : (translation?.title || t('sections.whyChooseUs.title'));
  const sectionSubtitle = translation?.subtitle === null ? '' : (translation?.subtitle || t('sections.whyChooseUs.subtitle'));
  const sectionDescription = translation?.description === null ? '' : (translation?.description || t('sections.whyChooseUs.description'));
  const hasHeaderContent = sectionTitle || sectionSubtitle || sectionDescription;

  return (
    <section className="py-20">
      <SectionContainer>
        {hasHeaderContent && (
          <SectionHeader
            title={sectionTitle}
            subtitle={sectionSubtitle}
            description={sectionDescription}
            headingStyle={config.headingStyle}
            headingBackgroundColor={config.headingBackgroundColor}
            headingTextColor={config.headingTextColor}
            headingTextTransform={config.headingTextTransform}
            headingTitleSize={config.headingTitleSize}
            headingBarHeight={config.headingBarHeight}
            className="mb-12"
          />
        )}

        <div className={`
          flex flex-nowrap overflow-x-auto snap-mandatory snap-x -mx-4 px-4 pb-8 gap-4
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']
          lg:grid lg:mx-0 lg:px-0 lg:pb-0 lg:gap-6
          ${gridClass.replace('grid ', '')}
        `} style={gridStyle}>
          {items.map((item, index) => (
            <div key={item.id || `why-${index}`} className="min-w-[85vw] sm:min-w-[45vw] lg:min-w-0 lg:w-auto snap-center">
              <WhyChooseUsCard item={item} config={config} titleClamp={titleClamp} descriptionClamp={descriptionClamp} />
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
};

export default WhyChooseUsSection;
