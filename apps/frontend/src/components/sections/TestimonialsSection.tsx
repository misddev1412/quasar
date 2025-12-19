'use client';

import React from 'react';
import type { SectionTranslationContent } from './HeroSlider';
import { useTranslation } from 'react-i18next';
import SectionContainer from './SectionContainer';

export interface TestimonialConfig {
  id?: string;
  quote?: string;
  customerName?: string;
  customerTitle?: string;
  avatarUrl?: string;
  rating?: number;
  orderValue?: string;
  location?: string;
}

export interface TestimonialsSectionConfig {
  layout?: 'grid' | 'slider';
  columns?: number;
  autoplay?: boolean;
  interval?: number;
  testimonials?: TestimonialConfig[];
}

interface TestimonialsSectionProps {
  config: TestimonialsSectionConfig;
  translation?: SectionTranslationContent | null;
}

const fallbackTestimonials: TestimonialConfig[] = [
  {
    id: 'default-1',
    quote: 'These drops sold out faster than any campaign we have ever run.',
    customerName: 'Lena Nguyen',
    customerTitle: 'Creative Director, Studio L',
    rating: 5,
  },
  {
    id: 'default-2',
    quote: 'Localization plus merchandising controls let us launch in record time.',
    customerName: 'Bao Tran',
    customerTitle: 'Merch Lead, North Market',
    rating: 4.5,
  },
];

const clampColumns = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 3;
  }
  return Math.min(Math.max(Math.round(value), 1), 4);
};

const sanitizeTestimonials = (testimonials?: TestimonialConfig[]) => {
  if (!Array.isArray(testimonials) || testimonials.length === 0) {
    return fallbackTestimonials;
  }
  const filtered = testimonials.filter((entry) => Boolean(entry?.quote));
  return filtered.length > 0 ? filtered : fallbackTestimonials;
};

const TestimonialCard: React.FC<{ item: TestimonialConfig }> = ({ item }) => (
  <figure className="flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
    <blockquote className="text-lg font-medium text-gray-900 dark:text-gray-100">
      “{item.quote}”
    </blockquote>
    <figcaption className="mt-6 flex items-center gap-4">
      {item.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.avatarUrl}
          alt={item.customerName || 'Customer avatar'}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {item.customerName?.[0] || '★'}
        </div>
      )}
      <div>
        {item.customerName && <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{item.customerName}</p>}
        {item.customerTitle && <p className="text-sm text-gray-500 dark:text-gray-400">{item.customerTitle}</p>}
        {item.orderValue && <p className="text-xs text-gray-400 dark:text-gray-500">{item.orderValue}</p>}
      </div>
    </figcaption>
  </figure>
);

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const layout = config.layout === 'slider' ? 'slider' : 'grid';
  const columns = clampColumns(config.columns);
  const testimonials = sanitizeTestimonials(config.testimonials);

  const sectionTitle = translation?.title === null ? '' : (translation?.title || t('sections.testimonials.title'));
  const sectionSubtitle = translation?.subtitle === null ? '' : (translation?.subtitle || t('sections.testimonials.subtitle'));
  const sectionDescription = translation?.description === null ? '' : (translation?.description || t('sections.testimonials.description'));

  const trackAutoplay = config.autoplay !== false;
  const interval = config.interval ?? 9000;

  const gridClass = (() => {
    switch (columns) {
      case 1:
        return 'lg:grid-cols-1';
      case 2:
        return 'lg:grid-cols-2';
      case 4:
        return 'lg:grid-cols-4';
      default:
        return 'lg:grid-cols-3';
    }
  })();

  return (
    <section className="bg-gray-950/90 py-20 text-white">
      <SectionContainer>
        <div className="mb-12 max-w-3xl">
          {sectionSubtitle && <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">{sectionSubtitle}</p>}
          {sectionTitle && <h2 className="mt-3 text-3xl font-semibold text-white">{sectionTitle}</h2>}
          {sectionDescription && <p className="mt-4 text-base text-blue-100">{sectionDescription}</p>}
        </div>

        {layout === 'grid' ? (
          <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${gridClass}`}>
            {testimonials.map((item) => (
              <TestimonialCard key={item.id || item.customerName} item={item} />
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
              <div
                className="animate-slide flex gap-6"
                style={{
                  animationDuration: `${interval}ms`,
                  animationPlayState: trackAutoplay ? 'running' : 'paused',
                }}
              >
                {testimonials.concat(testimonials).map((item, idx) => (
                  <div key={`${item.id || item.customerName}-${idx}`} className="min-w-[320px] flex-1">
                    <TestimonialCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SectionContainer>
    </section>
  );
};

export default TestimonialsSection;
