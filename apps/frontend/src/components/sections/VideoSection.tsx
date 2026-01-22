'use client';

import React, { type CSSProperties } from 'react';
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
  cta?: {
    label?: string;
    href?: string;
    openInNewTab?: boolean;
  };
}

export interface VideoSectionConfig {
  embedUrl?: string;
  videoUrl?: string;
  posterImage?: string;
  autoplay?: boolean;
  caption?: string;
  backgroundColor?: string;
  backgroundColorDark?: string;
  cta?: {
    label?: string;
    href?: string;
    openInNewTab?: boolean;
  };
  layout?: 'featured' | 'carousel';
  videos?: VideoSlideConfig[];
}

interface VideoSectionProps {
  config: VideoSectionConfig;
  translation?: SectionTranslationContent | null;
}

const ensureProtocol = (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  return `https://${url}`;
};

const buildYoutubeEmbed = (videoId: string, params?: URLSearchParams) => {
  const query = params && Array.from(params.keys()).length > 0 ? `?${params.toString()}` : '';
  return `https://www.youtube.com/embed/${videoId}${query}`;
};

const normalizeEmbedUrl = (url?: string) => {
  if (!url) {
    return undefined;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return undefined;
  }

  const withProtocol = ensureProtocol(trimmed);

  try {
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.replace(/^www\./i, '');
    const pathSegments = parsed.pathname.split('/').filter(Boolean);

    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (parsed.pathname === '/watch') {
        const videoId = parsed.searchParams.get('v');
        if (videoId) {
          const params = new URLSearchParams(parsed.searchParams);
          params.delete('v');
          return buildYoutubeEmbed(videoId, params);
        }
      }

      if (pathSegments[0] === 'shorts' && pathSegments[1]) {
        const params = new URLSearchParams(parsed.searchParams);
        return buildYoutubeEmbed(pathSegments[1], params);
      }

      if (pathSegments[0] === 'live' && pathSegments[1]) {
        const params = new URLSearchParams(parsed.searchParams);
        return buildYoutubeEmbed(pathSegments[1], params);
      }
    }

    if (host === 'youtu.be' && pathSegments[0]) {
      const params = new URLSearchParams(parsed.searchParams);
      return buildYoutubeEmbed(pathSegments[0], params);
    }

    return parsed.toString();
  } catch {
    return withProtocol;
  }
};

const normalizeSlides = (slides: VideoSlideConfig[]) =>
  slides.map((slide) => ({
    ...slide,
    embedUrl: normalizeEmbedUrl(slide.embedUrl),
  }));

const parseColor = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim().toLowerCase();

  const hexMatch = trimmed.match(/^#([\da-f]{3,8})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
  }

  const rgbMatch = trimmed.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((part) => Number(part.trim()));
    if (parts.length >= 3 && parts.slice(0, 3).every((num) => Number.isFinite(num))) {
      return { r: parts[0], g: parts[1], b: parts[2] };
    }
  }

  return undefined;
};

const getLuminance = (color?: { r: number; g: number; b: number }) => {
  if (!color) {
    return undefined;
  }
  const toLinear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  const r = toLinear(Math.min(255, Math.max(0, color.r)));
  const g = toLinear(Math.min(255, Math.max(0, color.g)));
  const b = toLinear(Math.min(255, Math.max(0, color.b)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getCtaColors = (background: string, lightFallback: string, darkFallback: string) => {
  const luminance = getLuminance(parseColor(background));
  if (typeof luminance === 'number') {
    if (luminance > 0.7) {
      return { background: '#0f172a', text: '#f8fafc' };
    }
    if (luminance < 0.2) {
      return { background: '#f8fafc', text: '#0f172a' };
    }
  }
  return { background: lightFallback, text: darkFallback };
};

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
        type: video.type || 'embed',
      })) || [];
    const validSlides = providedSlides.filter((video) => Boolean(video.embedUrl || video.videoUrl));

    if (validSlides.length > 0) {
      return normalizeSlides(validSlides);
    }

    if (config.embedUrl || config.videoUrl) {
      return normalizeSlides([
        {
          id: 'primary-video',
          type: 'embed',
          title: translation?.title || fallbackSlides[0].title,
          description: translation?.description || fallbackSlides[0].description,
          embedUrl: config.embedUrl,
          videoUrl: config.videoUrl,
          posterImage: config.posterImage || fallbackSlides[0].posterImage,
          autoplay: config.autoplay,
          caption: config.caption,
          cta: config.cta,
        },
      ]);
    }

    return normalizeSlides(fallbackSlides);
  }, [config, translation]);

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [carouselIndex, setCarouselIndex] = React.useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  const activeSlide = slides[activeIndex] || slides[0];
  const isEmbed = (activeSlide?.type || 'embed') !== 'upload';
  const firstSlide = slides[0];
  const fallbackTitle = activeSlide?.title || firstSlide?.title || '';
  const fallbackSubtitle = activeSlide?.description || '';
  const fallbackDescription = '';

  const title =
    translation?.title === null
      ? ''
      : translation?.title?.trim()
        ? translation.title
        : config.layout === 'carousel' ? '' : (fallbackTitle || t('sections.video.title'));

  const subtitle =
    translation?.subtitle === null
      ? ''
      : translation?.subtitle?.trim()
        ? translation.subtitle
        : config.layout === 'carousel' ? '' : (fallbackSubtitle || t('sections.video.subtitle'));

  const description =
    translation?.description === null
      ? ''
      : translation?.description?.trim()
        ? translation.description
        : config.layout === 'carousel' ? '' : (fallbackDescription || t('sections.video.description'));

  const slideCta = activeSlide?.cta || config.cta;
  const backgroundLight = (config.backgroundColor || '').trim() || '#0f172a';
  const backgroundDark = (config.backgroundColorDark || '').trim() || backgroundLight || '#030712';

  const sectionStyle = React.useMemo(
    () => {
      const ctaLight = getCtaColors(backgroundLight, '#f8fafc', '#0f172a');
      const ctaDark = getCtaColors(backgroundDark, '#f8fafc', '#0f172a');
      return {
        '--video-bg-light': backgroundLight,
        '--video-bg-dark': backgroundDark,
        '--video-cta-bg-light': ctaLight.background,
        '--video-cta-text-light': ctaLight.text,
        '--video-cta-bg-dark': ctaDark.background,
        '--video-cta-text-dark': ctaDark.text,
      } as CSSProperties;
    },
    [backgroundLight, backgroundDark],
  );

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth;
      const newScrollLeft = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (config.layout === 'carousel') {
    return (
      <section className="bg-[var(--video-bg-light)] py-8 lg:py-16 text-white dark:bg-[var(--video-bg-dark)]" style={sectionStyle}>
        <SectionContainer>
          {(translation?.title || translation?.description) && (
            <div className="mb-10 text-center">
              {translation?.title && <h2 className="text-3xl font-semibold text-white mb-4">{translation.title}</h2>}
              {translation?.description && <p className="text-base text-blue-100 max-w-2xl mx-auto">{translation.description}</p>}
            </div>
          )}

          <div className="relative group">
            {/* Navigation Buttons */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-0 -ml-4 lg:-ml-12"
              aria-label="Previous videos"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>

            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-0 -mr-4 lg:-mr-12"
              aria-label="Next videos"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>

            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {slides.map((slide, index) => {
                const isSlideEmbed = (slide?.type || 'embed') !== 'upload';
                return (
                  <div key={slide.id || index} className="min-w-[85vw] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] snap-center flex flex-col bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-transform duration-300 hover:-translate-y-1">
                    <div className="relative aspect-video w-full bg-black">
                      {isSlideEmbed ? (
                        <iframe
                          src={slide.embedUrl}
                          title={slide.title || 'Video'}
                          className="w-full h-full"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={slide.videoUrl}
                          poster={slide.posterImage}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                      {/* Overlay Play Button for non-iframe if needed, but standard controls used above */}
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={slide.title}>
                        {slide.title || t('sections.video.untitledVideo')}
                      </h3>
                      {slide.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 flex-grow">
                          {slide.description}
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        {/* Example CTA button based on user request image */}
                        <a
                          href={slide.cta?.href || slide.embedUrl || slide.videoUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                          {t('sections.video.watchOnYoutube', 'Watch on YouTube')}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                        </a>

                        {/* Time or other metadata can go here if available */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${idx === carouselIndex ? 'bg-white' : 'bg-white/30'}`} // Note: real active index tracking requires scroll listener, omitting for simplicity or implementing scroll listener
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => {
                    if (carouselRef.current) {
                      const itemWidth = carouselRef.current.clientWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
                      carouselRef.current.scrollTo({ left: idx * itemWidth, behavior: 'smooth' });
                    }
                  }}
                />
              ))}
            </div>

          </div>
        </SectionContainer>
      </section>
    );
  }

  // Fallback to original layout
  return (
    <section className="bg-[var(--video-bg-light)] py-4 lg:py-16 text-white dark:bg-[var(--video-bg-dark)]" style={sectionStyle}>
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
          {slideCta?.label && slideCta.href && (
            <div className="mt-6 flex justify-center">
              <a
                href={slideCta.href}
                target={slideCta.openInNewTab ? '_blank' : undefined}
                rel={slideCta.openInNewTab ? 'noreferrer' : undefined}
                className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold shadow-lg ring-1 ring-black/5 transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 bg-[var(--video-cta-bg-light)] text-[var(--video-cta-text-light)] dark:bg-[var(--video-cta-bg-dark)] dark:text-[var(--video-cta-text-dark)] dark:ring-white/10"
              >
                {slideCta.label}
              </a>
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
                    className={`h-2.5 rounded-full transition-all duration-200 ${isActive ? 'w-10 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/60'
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
        <div className="text-center">
          {subtitle && <p className="text-base font-medium text-blue-200">{subtitle}</p>}
          {title && <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>}
          {description && <p className="mt-4 text-base text-blue-100">{description}</p>}

        </div>
      </SectionContainer>
    </section>
  );
};

export default VideoSection;
