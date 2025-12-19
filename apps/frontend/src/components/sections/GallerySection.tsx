'use client';

import React from 'react';
import type { SectionTranslationContent } from './HeroSlider';
import { useTranslation } from 'react-i18next';
import SectionContainer from './SectionContainer';

export interface GalleryLinkConfig {
  label?: string;
  href?: string;
}

export interface GalleryImageConfig {
  id?: string;
  imageUrl?: string;
  label?: string;
  description?: string;
  link?: GalleryLinkConfig;
}

export interface GallerySectionConfig {
  layout?: 'grid' | 'masonry' | 'slider';
  columns?: number;
  gutter?: string;
  images?: GalleryImageConfig[];
}

interface GallerySectionProps {
  config: GallerySectionConfig;
  translation?: SectionTranslationContent | null;
}

const fallbackImages: GalleryImageConfig[] = [
  {
    id: 'gallery-1',
    imageUrl: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1200&q=80',
    label: 'Editorial drop',
  },
  {
    id: 'gallery-2',
    imageUrl: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80',
    label: 'Tailored classics',
  },
  {
    id: 'gallery-3',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    label: 'Accessory edit',
  },
];

const clampColumns = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 3;
  }
  return Math.min(Math.max(Math.round(value), 1), 4);
};

const GalleryCard: React.FC<{ image: GalleryImageConfig; gutter?: string }> = ({ image, gutter }) => (
  <figure className="group relative overflow-hidden rounded-3xl shadow-2xl">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={image.imageUrl} alt={image.label || 'Lookbook image'} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
    <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-6 text-white">
      {image.label && <p className="text-lg font-semibold">{image.label}</p>}
      {image.description && <p className="text-sm text-white/80">{image.description}</p>}
      {image.link?.label && image.link.href && (
        <a href={image.link.href} className="mt-3 inline-flex items-center text-sm font-semibold text-white/90">
          {image.link.label}
        </a>
      )}
    </figcaption>
  </figure>
);

export const GallerySection: React.FC<GallerySectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const layout = config.layout === 'masonry' || config.layout === 'slider' ? config.layout : 'grid';
  const columns = clampColumns(config.columns);
  const images = Array.isArray(config.images) && config.images.length > 0 ? config.images : fallbackImages;
  const gutter = config.gutter || '1.25rem';

  const title = translation?.title === null ? '' : (translation?.title || t('sections.gallery.title'));
  const subtitle = translation?.subtitle === null ? '' : (translation?.subtitle || t('sections.gallery.subtitle'));
  const description = translation?.description === null ? '' : (translation?.description || t('sections.gallery.description'));

  return (
    <section className="bg-white py-16 dark:bg-gray-950">
      <SectionContainer>
        <div className="mb-12 max-w-4xl">
          {subtitle && <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-300">{subtitle}</p>}
          {title && <h2 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>}
          {description && <p className="mt-4 text-base text-gray-600 dark:text-gray-400">{description}</p>}
        </div>

        {layout === 'slider' ? (
          <div className="overflow-hidden">
            <div className="flex gap-6 overflow-x-auto pb-4">
              {images.map((image) => (
                <div key={image.id || image.imageUrl} className="min-w-[280px] flex-1">
                  <GalleryCard image={image} gutter={gutter} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${layout === 'grid' ? `lg:grid-cols-${columns}` : 'lg:grid-cols-3 lg:auto-rows-[320px]'}`}
            style={{ gap: gutter }}
          >
            {images.map((image) => (
              <GalleryCard key={image.id || image.imageUrl} image={image} gutter={gutter} />
            ))}
          </div>
        )}
      </SectionContainer>
    </section>
  );
};

export default GallerySection;
