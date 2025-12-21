'use client';

import React from 'react';
import type { SectionTranslationContent } from './HeroSlider';
import { useTranslation } from 'react-i18next';
import SectionContainer from './SectionContainer';

export interface VideoSlideConfig {
  id?: string;
  type?: 'embed' | 'upload';
  title?: string;
  description?: string;
  embedUrl?: string;
  videoUrl?: string;
  posterImage?: string;
  autoplay?: boolean;
  caption?: string;
}

export interface VideoSectionConfig {
  type?: 'embed' | 'upload';
  embedUrl?: string;
  videoUrl?: string;
  posterImage?: string;
  autoplay?: boolean;
  caption?: string;
  cta?: {
    label?: string;
    href?: string;
    openInNewTab?: boolean;
  };
  videos?: VideoSlideConfig[];
}

interface VideoSectionProps {
  config: VideoSectionConfig;
  translation?: SectionTranslationContent | null;
}

const fallbackSlides: VideoSlideConfig[] = [
  {
    id: 'atelier-film',
    type: 'embed',
    title: 'Behind the Atelier',
    description: 'Walk through the Saigon studio and watch how each piece is constructed.',
    embedUrl: 'https://www.youtube.com/embed/mNFVvHxkNNM?rel=0&showinfo=0',
    posterImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
    caption: 'Filmed on-site with the atelier team',
  },
  {
    id: 'showroom-tour',
    type: 'embed',
    title: 'Lookbook in Motion',
    description: 'Styling team showcases how to layer key looks for the season.',
    embedUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    posterImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
    caption: 'Captured during the private showroom preview',
  },
  {
    id: 'material-story',
    type: 'embed',
    title: 'Material Origins',
    description: 'Take a closer look at the fabrics and trims sourced for this collection.',
    embedUrl: 'https://www.youtube.com/embed/oUFJJNQGwhk',
    posterImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
    caption: 'Shot with partners across Hanoi and Da Lat',
  },
];

export const VideoSection: React.FC<VideoSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const slides = React.useMemo(() => {
    const providedSlides =
      config.videos?.map((video, index) => ({
        ...video,
        id: video.id || `video-${index + 1}`,
        type: video.type || config.type || 'embed',
      })) || [];
    const validSlides = providedSlides.filter((video) => Boolean(video.embedUrl || video.videoUrl));

    if (validSlides.length > 0) {
      return validSlides;
    }

    if (config.embedUrl || config.videoUrl) {
      return [
        {
          id: 'primary-video',
          type: config.type || 'embed',
          title: translation?.title || fallbackSlides[0].title,
          description: translation?.description || fallbackSlides[0].description,
          embedUrl: config.embedUrl,
          videoUrl: config.videoUrl,
          posterImage: config.posterImage || fallbackSlides[0].posterImage,
          autoplay: config.autoplay,
          caption: config.caption,
        },
      ];
    }

    return fallbackSlides;
  }, [config, translation]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  React.useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);
  const activeSlide = slides[activeIndex] || slides[0];
  const isEmbed = (activeSlide?.type || 'embed') !== 'upload';
  const title = translation?.title === null ? '' : (translation?.title || t('sections.video.title'));
  const subtitle = translation?.subtitle === null ? '' : (translation?.subtitle || t('sections.video.subtitle'));
  const description = translation?.description === null ? '' : (translation?.description || t('sections.video.description'));
  const hasTextContent = title || subtitle || description;
  const cta = config.cta;

  return (
    <section className="bg-gray-900 py-20 text-white">
      <SectionContainer className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            {isEmbed ? (
              <div className="aspect-video w-full">
                <iframe
                  title={activeSlide?.title || title || 'Embedded video'}
                  src={activeSlide?.embedUrl || fallbackSlides[0].embedUrl}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                className="h-full w-full"
                controls
                autoPlay={Boolean(activeSlide?.autoplay ?? config.autoplay)}
                poster={activeSlide?.posterImage || config.posterImage || fallbackSlides[0].posterImage}
              >
                <source src={activeSlide?.videoUrl} />
              </video>
            )}
          </div>
          {(activeSlide?.caption || config.caption) && (
            <p className="mt-4 text-sm text-blue-100">{activeSlide?.caption || config.caption}</p>
          )}

          {(activeSlide?.title || activeSlide?.description) && (
            <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-5 text-left">
              {activeSlide?.title && <h3 className="text-xl font-semibold text-white">{activeSlide.title}</h3>}
              {activeSlide?.description && <p className="mt-2 text-sm text-blue-100">{activeSlide.description}</p>}
            </div>
          )}

          {slides.length > 1 && (
            <div className="mt-6 flex justify-center gap-3">
              {slides.map((slide, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={slide.id || `slide-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition-all duration-200 ${
                      isActive ? 'w-10 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={t('sections.video.pagination_label', { index: index + 1 })}
                    aria-current={isActive}
                  >
                    <span className="sr-only">{slide.title || `${t('sections.video.pagination_label', { index: index + 1 })}`}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div>
          {subtitle && <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">{subtitle}</p>}
          {title && <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>}
          {description && <p className="mt-4 text-base text-blue-100">{description}</p>}

          {cta?.label && cta.href && (
            <a
              href={cta.href}
              target={cta.openInNewTab ? '_blank' : undefined}
              rel={cta.openInNewTab ? 'noreferrer' : undefined}
              className="mt-8 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              {cta.label}
            </a>
          )}
        </div>
      </SectionContainer>
    </section>
  );
};

export default VideoSection;
